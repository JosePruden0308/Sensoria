import { useState } from 'react'
import { CURRENCY_SYMBOL } from '../config.js'

const empty = { name: '', description: '', price: '', stock: '', image: '' }

export default function ProductForm({ onSave }) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function submit(e) {
    e.preventDefault()
    const price = parseFloat(form.price)
    const stock = parseInt(form.stock, 10)
    const image = form.image.trim()
    if (!form.name.trim()) return setError('El nombre es obligatorio.')
    if (isNaN(price) || price < 0) return setError('Precio inválido.')
    if (isNaN(stock) || stock < 0) return setError('Stock inválido.')
    if (image && !/^https?:\/\/.+/i.test(image)) {
      return setError('La URL de imagen debe empezar por http:// o https://')
    }

    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      stock,
      image
    })
    setForm(empty)
    setError('')
  }

  return (
    <form className="card product-form" onSubmit={submit}>
      <h3>Agregar producto</h3>
      {error && <p className="error">{error}</p>}
      <label>
        Nombre
        <input value={form.name} onChange={(e) => update('name', e.target.value)} />
      </label>
      <label>
        Descripción
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </label>
      <div className="row">
        <label>
          Precio ({CURRENCY_SYMBOL})
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
          />
        </label>
        <label>
          Stock
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => update('stock', e.target.value)}
          />
        </label>
      </div>
      <label>
        URL de imagen (opcional)
        <input
          placeholder="https://…"
          value={form.image}
          onChange={(e) => update('image', e.target.value)}
        />
      </label>
      <button type="submit" className="btn primary">
        Guardar producto
      </button>
    </form>
  )
}
