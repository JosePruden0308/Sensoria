// Integración con Wompi (Web Checkout por redirección).
// Flujo: firmamos la transacción -> redirigimos a checkout.wompi.co ->
// Wompi cobra (Botón Bancolombia / PSE) -> vuelve a la app con ?id=<txId> ->
// consultamos el estado por el API y registramos el pago.

import { WOMPI, WOMPI_API_BASE, API_BASE } from './config.js'

const PENDING_KEY = 'tienda.wompi.pending'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// Firma de integridad: SHA256(reference + amountInCents + currency + secret).
async function buildSignature(reference, amountInCents, currency) {
  const data = `${reference}${amountInCents}${currency}${WOMPI.integritySecret}`
  const bytes = new TextEncoder().encode(data)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Inicia el pago: guarda el pedido pendiente y redirige al Web Checkout de Wompi.
 * amountCop: monto en pesos (no en centavos). method: 'Botón Bancolombia' | 'PSE'.
 * Si hay backend (API_BASE), la firma la genera el servidor de forma segura.
 */
export async function startWompiCheckout({ amountCop, customerEmail, method, items, customer }) {
  const currency = 'COP'
  let reference, amountInCents, signature, publicKey, checkoutUrl

  if (API_BASE) {
    // Firma segura en el backend.
    const res = await fetch(`${API_BASE}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountCop, customer, email: customerEmail, items, method })
    })
    if (!res.ok) throw new Error('checkout backend falló')
    const data = await res.json()
    reference = data.reference
    amountInCents = data.amountInCents
    signature = data.signature
    publicKey = data.publicKey
    checkoutUrl = data.checkoutUrl || WOMPI.checkoutUrl
  } else {
    // Firma en el cliente (solo para demos: expone el secreto de integridad).
    reference = `SENS-${uid()}`
    amountInCents = Math.round(amountCop * 100)
    signature = await buildSignature(reference, amountInCents, currency)
    publicKey = WOMPI.publicKey
    checkoutUrl = WOMPI.checkoutUrl
  }

  // Guardamos el pedido para reconstruirlo al volver de la redirección.
  localStorage.setItem(
    PENDING_KEY,
    JSON.stringify({ reference, amountCop, method, items, customer, email: customerEmail })
  )

  const redirectUrl = window.location.origin + window.location.pathname

  // Enviamos por GET mediante un formulario al Web Checkout.
  const form = document.createElement('form')
  form.method = 'GET'
  form.action = checkoutUrl

  const fields = {
    'public-key': publicKey,
    currency,
    'amount-in-cents': String(amountInCents),
    reference,
    'signature:integrity': signature,
    'redirect-url': redirectUrl
  }
  if (customerEmail) fields['customer-data:email'] = customerEmail
  // Preselecciona el método de pago en el checkout.
  if (method === 'PSE') fields['payment-method-type'] = 'PSE'
  if (method === 'Botón Bancolombia') fields['payment-method-type'] = 'BANCOLOMBIA_TRANSFER'

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }

  document.body.appendChild(form)
  form.submit()
}

/**
 * Al cargar la app, detecta el regreso desde Wompi (?id=...), consulta el
 * estado real de la transacción y devuelve el pago a registrar (o null).
 */
export async function finalizeWompiRedirect() {
  const params = new URLSearchParams(window.location.search)
  const txId = params.get('id')
  if (!txId) return null

  const pendingRaw = localStorage.getItem(PENDING_KEY)
  const pending = pendingRaw ? JSON.parse(pendingRaw) : null

  // Limpia la URL para no reprocesar al recargar.
  window.history.replaceState({}, '', window.location.pathname)
  localStorage.removeItem(PENDING_KEY)

  let status = 'UNKNOWN'
  let transaction = null
  try {
    const res = await fetch(`${WOMPI_API_BASE}/transactions/${txId}`)
    const json = await res.json()
    transaction = json.data
    status = transaction?.status || 'UNKNOWN'
  } catch {
    status = 'ERROR'
  }

  return {
    status, // APPROVED | DECLINED | VOIDED | ERROR | PENDING
    transactionId: txId,
    reference: transaction?.reference || pending?.reference,
    amountCop:
      (transaction?.amount_in_cents ? transaction.amount_in_cents / 100 : pending?.amountCop) || 0,
    method: pending?.method || 'Wompi',
    customer: pending?.customer || 'Cliente anónimo',
    email: pending?.email || '',
    items: pending?.items || []
  }
}
