import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import 'dotenv/config'

const {
  PORT = 3001,
  WOMPI_PUBLIC_KEY = '',
  WOMPI_INTEGRITY_SECRET = '',
  WOMPI_EVENTS_SECRET = '',
  WOMPI_ENV = 'test',
  ALLOWED_ORIGIN = '*'
} = process.env

const WOMPI_API_BASE =
  WOMPI_ENV === 'prod' ? 'https://production.wompi.co/v1' : 'https://sandbox.wompi.co/v1'

const ORDERS_FILE = new URL('./orders.json', import.meta.url)

const app = express()
app.disable('x-powered-by')
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  next()
})
app.use(cors({ origin: ALLOWED_ORIGIN }))
app.use(express.json({ limit: '32kb' }))

// Rechaza JSON malformado sin tumbar el proceso.
app.use((err, _req, res, next) => {
  if (err?.type === 'entity.parse.failed' || err?.type === 'entity.too.large') {
    return res.status(400).json({ error: 'Cuerpo de la solicitud inválido.' })
  }
  next(err)
})

// ---- Persistencia simple en archivo JSON ----
async function loadOrders() {
  if (!existsSync(ORDERS_FILE)) return {}
  try {
    return JSON.parse(await readFile(ORDERS_FILE, 'utf8'))
  } catch {
    return {}
  }
}
async function saveOrders(orders) {
  await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2))
}

function sha256hex(text) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Recorta y limita la longitud de un texto proveniente del cliente.
function clean(value, max) {
  return String(value ?? '').trim().slice(0, max)
}

// Valida y normaliza el pedido recibido; lanza Error con mensaje si es inválido.
function sanitizeCheckout(body) {
  const amountInCents = Math.round(Number(body?.amountCop) * 100)
  if (!Number.isFinite(amountInCents) || amountInCents < 150000) {
    throw new Error('Monto inválido (mínimo 1.500 COP).')
  }
  if (amountInCents > 1_000_000_00) {
    throw new Error('Monto demasiado alto.')
  }
  const email = clean(body?.email, 120)
  if (email && !EMAIL_RE.test(email)) {
    throw new Error('Email inválido.')
  }
  const rawItems = Array.isArray(body?.items) ? body.items.slice(0, 100) : []
  const items = rawItems.map((i) => ({
    id: clean(i?.id, 40),
    name: clean(i?.name, 120),
    qty: Math.max(0, Math.min(10000, Math.trunc(Number(i?.qty) || 0))),
    price: Math.max(0, Number(i?.price) || 0)
  }))
  return {
    amountInCents,
    email,
    items,
    method: clean(body?.method, 40) || 'Wompi',
    customer: clean(body?.customer, 120) || 'Cliente anónimo'
  }
}

// ============================================================
// 1) Firmar la transacción (el secreto nunca sale al cliente)
//    El frontend envía el monto y los datos del pedido; aquí
//    generamos la referencia + firma de integridad y guardamos
//    el pedido como "PENDING".
// ============================================================
app.post('/api/checkout', async (req, res) => {
  try {
    let data
    try {
      data = sanitizeCheckout(req.body)
    } catch (validationErr) {
      return res.status(400).json({ error: validationErr.message })
    }
    const { amountInCents, customer, email, items, method } = data

    const reference = `SENS-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`
    const currency = 'COP'
    const signature = sha256hex(`${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_SECRET}`)

    const orders = await loadOrders()
    orders[reference] = {
      reference,
      amountInCents,
      currency,
      method,
      customer,
      email,
      items,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }
    await saveOrders(orders)

    res.json({
      reference,
      amountInCents,
      currency,
      signature,
      publicKey: WOMPI_PUBLIC_KEY,
      checkoutUrl: 'https://checkout.wompi.co/p/'
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'No se pudo iniciar el checkout.' })
  }
})

// ============================================================
// 2) Webhook de Wompi: Wompi notifica el estado final del pago.
//    Validamos la firma (checksum) con el secreto de eventos y
//    actualizamos el pedido. Esta es la confirmación CONFIABLE.
// ============================================================
app.post('/api/wompi/webhook', async (req, res) => {
  try {
    const body = req.body || {}
    const { signature, timestamp, data } = body
    if (!signature?.properties || !signature?.checksum) {
      return res.status(400).json({ error: 'Evento inválido.' })
    }

    // Concatena los valores indicados por Wompi + timestamp + secreto.
    let concat = ''
    for (const prop of signature.properties) {
      const value = prop.split('.').reduce((acc, key) => acc?.[key], data)
      concat += value
    }
    concat += timestamp
    concat += WOMPI_EVENTS_SECRET

    const checksum = sha256hex(concat).toUpperCase()
    if (checksum !== signature.checksum) {
      return res.status(401).json({ error: 'Firma inválida.' })
    }

    const tx = data?.transaction
    if (tx?.reference) {
      const orders = await loadOrders()
      const order = orders[tx.reference] || { reference: tx.reference, items: [] }
      order.status = tx.status // APPROVED | DECLINED | VOIDED | ERROR
      order.transactionId = tx.id
      order.paidAt = new Date().toISOString()
      orders[tx.reference] = order
      await saveOrders(orders)
      console.log(`Pedido ${tx.reference} -> ${tx.status}`)
    }

    res.json({ received: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error procesando el webhook.' })
  }
})

// ============================================================
// 3) Consultar pedidos (para el panel de administración).
//    Verifica el estado real contra el API de Wompi por si el
//    webhook aún no ha llegado.
// ============================================================
app.get('/api/orders', async (_req, res) => {
  const orders = await loadOrders()
  res.json(Object.values(orders).sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
})

app.get('/api/orders/:reference/status', async (req, res) => {
  const orders = await loadOrders()
  const order = orders[req.params.reference]
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' })

  // Si sigue pendiente, consulta a Wompi por referencia.
  if (order.status === 'PENDING') {
    try {
      const r = await fetch(
        `${WOMPI_API_BASE}/transactions?reference=${encodeURIComponent(order.reference)}`
      )
      const json = await r.json()
      const tx = json?.data?.[0]
      if (tx) {
        order.status = tx.status
        order.transactionId = tx.id
        orders[order.reference] = order
        await saveOrders(orders)
      }
    } catch {
      /* se devuelve el estado conocido */
    }
  }
  res.json(order)
})

app.get('/health', (_req, res) => res.json({ ok: true, env: WOMPI_ENV }))

app.listen(PORT, () => {
  console.log(`Backend Sensorial escuchando en http://localhost:${PORT} (${WOMPI_ENV})`)
})
