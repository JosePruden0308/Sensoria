import { useState } from 'react'
import { CONTACT_EMAIL } from '../config.js'

export default function ContactModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | ok | error
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Completa todos los campos.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Ingresa un email válido.')
      return
    }
    setError('')

    if (!CONTACT_EMAIL) {
      // Sin correo configurado: abre el cliente de correo del usuario.
      const subject = encodeURIComponent('Contacto desde Sensorial')
      const body = encodeURIComponent(
        `Nombre: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
      )
      window.location.href = `mailto:?subject=${subject}&body=${body}`
      setStatus('ok')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_EMAIL)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          _subject: 'Nuevo mensaje de contacto — Sensorial'
        })
      })
      if (!res.ok) throw new Error('fallo')
      setStatus('ok')
    } catch {
      setStatus('error')
      setError('No se pudo enviar el mensaje. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
        <h3>Contáctenos</h3>

        {status === 'ok' ? (
          <div>
            <p className="success">¡Gracias! Tu mensaje fue enviado.</p>
            <button className="btn primary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            {error && <p className="error">{error}</p>}
            <label>
              Nombre
              <input value={form.name} onChange={(e) => update('name', e.target.value)} />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </label>
            <label>
              Mensaje
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
              />
            </label>
            <button type="submit" className="btn primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
