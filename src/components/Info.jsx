import { useState } from 'react'
import {
  formatMoney,
  STORE_INFO,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_RATES
} from '../config.js'

const REVIEWS = []

const FAQS = [
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos Botón Bancolombia y PSE a través de Wompi. Todos los pagos se procesan de forma segura en pesos colombianos (COP).'
  },
  {
    q: '¿Cuánto tarda en llegar mi pedido?',
    a: 'El tiempo depende de tu ubicación: entre 1 y 7 días hábiles. Consulta la sección de envíos para ver el detalle por zona.'
  },
  {
    q: '¿Puedo cambiar o devolver un producto?',
    a: 'Sí. Tienes hasta 5 días calendario después de recibir tu pedido para solicitar un cambio o devolución, siempre que el producto esté en su estado original.'
  },
  {
    q: '¿Cómo uso los productos de forma segura?',
    a: 'Cada producto incluye instrucciones de uso. Si tienes dudas, escríbenos por WhatsApp o al correo de contacto y te asesoramos.'
  },
  {
    q: '¿El envío tiene algún costo?',
    a: `El flete se calcula según tu ubicación. En compras iguales o superiores a ${formatMoney(
      FREE_SHIPPING_THRESHOLD
    )} el envío es gratis.`
  }
]

function Stars({ rating }) {
  return (
    <span className="stars" aria-label={`${rating} de 5 estrellas`}>
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  )
}

function StarPicker({ value, onChange }) {
  return (
    <div className="star-picker" role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn${star <= value ? ' filled' : ''}`}
          onClick={() => onChange(star)}
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
        >
          {star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}

export default function Info() {
  const [openFaq, setOpenFaq] = useState(0)
  const [reviews, setReviews] = useState(REVIEWS)
  const [reviewName, setReviewName] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const selectedRate = SHIPPING_RATES[0]

  function publishReview(e) {
    e.preventDefault()
    const text = reviewText.trim()
    if (!text) return
    const name = reviewName.trim() || 'Anónimo'
    setReviews((prev) => [{ name, rating: reviewRating, text }, ...prev])
    setReviewName('')
    setReviewText('')
    setReviewRating(5)
  }

  return (
    <div className="info-page">
      {/* Políticas claras */}
      <section id="politicas" className="card info-section">
        <h2>Políticas claras</h2>
        <p className="muted">
          Compra con confianza: estas son nuestras condiciones de servicio.
        </p>
        <div className="info-grid">
          <article>
            <h3>Términos y condiciones</h3>
            <p>
              Al realizar una compra aceptas nuestras condiciones de uso, precios en pesos
              colombianos (COP) y la disponibilidad sujeta a inventario.
            </p>
          </article>
          <article>
            <h3>Política de devoluciones</h3>
            <p>
              Tienes hasta <strong>5 días calendario</strong> tras recibir tu pedido para
              solicitar una devolución, con el producto en su estado y empaque originales.
            </p>
          </article>
          <article>
            <h3>Cambios</h3>
            <p>
              Realizamos cambios por talla, referencia o defecto de fábrica dentro de los
              primeros <strong>5 días</strong> de recibido el producto.
            </p>
          </article>
          <article>
            <h3>Garantías</h3>
            <p>
              Todos nuestros productos cuentan con garantía por defectos de fabricación según
              la ley colombiana de protección al consumidor.
            </p>
          </article>
          <article>
            <h3>Tiempos de entrega</h3>
            <p>
              Despachamos en 24-48 horas hábiles. La entrega tarda entre 1 y 7 días hábiles
              según tu ubicación.
            </p>
          </article>
        </div>
      </section>

      {/* Opciones y costos de envío */}
      <section id="envios" className="card info-section">
        <h2>Opciones y costos de envío</h2>
        <p className="muted">
          Envío <strong>gratis</strong> en compras iguales o superiores a{' '}
          {formatMoney(FREE_SHIPPING_THRESHOLD)}.
        </p>

        <div className="shipping-calc">
          <div className="shipping-result">
            <div>
              <span className="muted small">Costo de envío</span>
              <strong>{formatMoney(selectedRate.cost)}</strong>
            </div>
            <div>
              <span className="muted small">Tiempo estimado</span>
              <strong>{selectedRate.eta}</strong>
            </div>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>¿Dónde tenemos cobertura?</th>
              <th className="right">Costo</th>
              <th className="right">Tiempo estimado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Valle de Aburrá</td>
              <td className="right">{formatMoney(selectedRate.cost)}</td>
              <td className="right">{selectedRate.eta}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Quiénes somos */}
      <section id="quienes-somos" className="card info-section">
        <h2>¿Quiénes somos?</h2>
        <p>
          En <strong>{STORE_INFO.legalName}</strong> nacimos en {STORE_INFO.foundedYear} con la
          misión de ofrecer productos de calidad y una experiencia de compra cercana y
          confiable. Cada pedido se prepara con cuidado para que vivas una experiencia
          sensorial única.
        </p>
        <ul className="corp-info">
          <li>
            <span className="muted small">Razón social</span>
            <strong>{STORE_INFO.legalName}</strong>
          </li>
          <li>
            <span className="muted small">{STORE_INFO.taxId.split(' ')[0] || 'NIT'}</span>
            <strong>{STORE_INFO.taxId}</strong>
          </li>
          <li>
            <span className="muted small">Dirección</span>
            <strong>{STORE_INFO.address}</strong>
          </li>
          <li>
            <span className="muted small">Teléfono</span>
            <strong>
              <a href={`tel:${STORE_INFO.phone.replace(/\s/g, '')}`}>{STORE_INFO.phone}</a>
            </strong>
          </li>
          <li>
            <span className="muted small">Correo</span>
            <strong>
              <a href={`mailto:${STORE_INFO.email}`}>{STORE_INFO.email}</a>
            </strong>
          </li>
        </ul>
      </section>

      {/* Reseñas y testimonios */}
      <section id="resenas" className="card info-section">
        <h2>Reseñas y testimonios</h2>
        <p className="muted">Lo que opinan quienes ya compraron con nosotros.</p>

        <form className="review-form" onSubmit={publishReview}>
          <h3>Deja tu opinión</h3>
          <label>
            Tu nombre (opcional)
            <input
              type="text"
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              placeholder="Ej. María P."
            />
          </label>
          <label>
            Tu calificación
            <StarPicker value={reviewRating} onChange={setReviewRating} />
          </label>
          <label>
            Tu opinión
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Cuéntanos tu experiencia..."
              rows={3}
            />
          </label>
          <button type="submit" className="btn primary" disabled={!reviewText.trim()}>
            Publicar
          </button>
        </form>

        <div className="reviews-grid">
          {reviews.map((review, i) => (
            <article key={`${review.name}-${i}`} className="review-card">
              <Stars rating={review.rating} />
              <p>“{review.text}”</p>
              <span className="muted small">— {review.name}</span>
            </article>
          ))}
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section id="faq" className="card info-section">
        <h2>Preguntas frecuentes (FAQ)</h2>
        <div className="faq-list">
          {FAQS.map((item, i) => {
            const isOpen = openFaq === i
            return (
              <div key={item.q} className={`faq-item${isOpen ? ' open' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && <p className="faq-answer">{item.a}</p>}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
