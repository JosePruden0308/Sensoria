import { useState } from 'react'
import { formatMoney, isWompiConfigured } from '../config.js'
import { startWompiCheckout } from '../wompi.js'

export default function Checkout({ cart, total, onPaid }) {
  const [customer, setCustomer] = useState('')
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)

  const wompiOn = isWompiConfigured()

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  function localItems() {
    return cart.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price }))
  }

  async function pagar(method) {
    setFeedback(null)
    const cleanEmail = email.trim()
    if (wompiOn && !EMAIL_RE.test(cleanEmail)) {
      setFeedback({ type: 'error', msg: 'Ingresa un email válido para pagar con Wompi.' })
      return
    }
    if (wompiOn) {
      // Pago real: redirige a Wompi. El pedido se registra al volver (ver App.jsx).
      setLoading(true)
      try {
        await startWompiCheckout({
          amountCop: total,
          customerEmail: cleanEmail,
          method,
          items: localItems(),
          customer: customer.trim() || 'Cliente anónimo'
        })
      } catch {
        setLoading(false)
        setFeedback({ type: 'error', msg: 'No se pudo iniciar el pago con Wompi.' })
      }
      return
    }
    // Respaldo (sin llaves): registra localmente para la demo.
    onPaid({
      method,
      customer: customer.trim() || 'Cliente anónimo',
      email: cleanEmail,
      amount: total,
      items: localItems(),
      raw: null
    })
    setFeedback({ type: 'ok', msg: `Pago con ${method} registrado (modo demo).` })
  }

  if (cart.length === 0) {
    return <p className="muted">Agrega productos al carrito para pagar.</p>
  }

  return (
    <div className="checkout">
      <h3>Finalizar compra</h3>
      {feedback && <p className={feedback.type === 'ok' ? 'success' : 'error'}>{feedback.msg}</p>}

      <label>
        Nombre del cliente
        <input value={customer} onChange={(e) => setCustomer(e.target.value)} />
      </label>
      <label>
        Email {wompiOn ? '(requerido para Wompi)' : '(opcional)'}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>

      <div className="total-line">
        <span>Total a pagar</span>
        <strong>{formatMoney(total)}</strong>
      </div>

      <h4>Elige tu método de pago</h4>
      {!wompiOn && (
        <p className="muted small">
          Modo demo: define <code>VITE_WOMPI_PUBLIC_KEY</code> y{' '}
          <code>VITE_WOMPI_INTEGRITY</code> para cobros reales con Wompi.
        </p>
      )}
      <div className="pay-methods">
        <button
          className="btn pay-bancolombia"
          disabled={loading}
          onClick={() => pagar('Botón Bancolombia')}
        >
          {loading ? 'Redirigiendo…' : 'Botón Bancolombia'}
        </button>
        <button className="btn pay-pse" disabled={loading} onClick={() => pagar('PSE')}>
          {loading ? 'Redirigiendo…' : 'PSE'}
        </button>
      </div>
    </div>
  )
}
