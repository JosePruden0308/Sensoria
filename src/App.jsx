import { useEffect, useMemo, useState } from 'react'
import {
  getProducts,
  saveProducts,
  getPayments,
  savePayments,
  uid
} from './store.js'
import { formatMoney, API_BASE, WHATSAPP_NUMBERS, SOCIAL_LINKS } from './config.js'
import { finalizeWompiRedirect } from './wompi.js'
import ProductForm from './components/ProductForm.jsx'
import Checkout from './components/Checkout.jsx'
import Payments from './components/Payments.jsx'
import ContactModal from './components/ContactModal.jsx'

const PAGE_SIZE = 4

// Minúsculas y sin tildes para comparar búsquedas.
function normalizeText(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export default function App() {
  const [tab, setTab] = useState('tienda')
  const [products, setProducts] = useState(() => getProducts())
  const [payments, setPayments] = useState(() => getPayments())
  const [serverOrders, setServerOrders] = useState([])
  const [cart, setCart] = useState([]) // [{ id, name, price, qty }]
  const [notice, setNotice] = useState('')
  const [showContact, setShowContact] = useState(false)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [page, setPage] = useState(0)

  const hasBackend = Boolean(API_BASE)

  async function fetchServerOrders() {
    if (!API_BASE) return
    try {
      const res = await fetch(`${API_BASE}/api/orders`)
      if (res.ok) {
        const data = await res.json()
        setServerOrders(
          data.map((o) => ({
            id: o.reference,
            reference: o.reference,
            date: o.paidAt || o.createdAt,
            customer: o.customer,
            email: o.email,
            method: o.method,
            status: o.status,
            amount: o.amountInCents ? o.amountInCents / 100 : 0,
            items: o.items || []
          }))
        )
      }
    } catch {
      /* fallback a payments locales */
    }
  }

  useEffect(() => {
    fetchServerOrders()
  }, [])

  useEffect(() => saveProducts(products), [products])
  useEffect(() => savePayments(payments), [payments])

  // Al volver de Wompi (?id=...), consulta el estado y registra el pago si fue aprobado.
  useEffect(() => {
    finalizeWompiRedirect().then((result) => {
      if (!result) return
      if (result.status === 'APPROVED') {
        registerPayment({
          method: result.method,
          customer: result.customer,
          email: result.email,
          amount: result.amountCop,
          items: result.items,
          raw: { transactionId: result.transactionId, reference: result.reference }
        })
      } else {
        setTab('pagos')
        setNotice(`El pago ${result.reference || ''} quedó en estado: ${result.status}.`)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const displayedPayments = hasBackend && serverOrders.length > 0 ? serverOrders : payments

  const normalizedQuery = normalizeText(query.trim())
  const filteredProducts = useMemo(
    () =>
      normalizedQuery
        ? products.filter((p) =>
            normalizeText(`${p.name} ${p.description || ''}`).includes(normalizedQuery)
          )
        : products,
    [products, normalizedQuery]
  )

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const visibleProducts = filteredProducts.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  )

  const cartTotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.qty, 0),
    [cart]
  )
  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.qty, 0), [cart])

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      const inCart = existing ? existing.qty : 0
      if (inCart >= product.stock) return prev // no superar el stock
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }]
    })
  }

  function changeQty(id, delta) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    )
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  function addProduct(data) {
    setProducts((prev) => [...prev, { id: uid(), ...data }])
  }

  function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  function registerPayment(payment) {
    // Descontar stock de los productos vendidos.
    setProducts((prev) =>
      prev.map((p) => {
        const item = payment.items.find((i) => i.id === p.id)
        return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p
      })
    )
    setPayments((prev) => [
      ...prev,
      { id: uid(), date: new Date().toISOString(), ...payment }
    ])
    setCart([])
    setTab('pagos')
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="brand">
          <img src="/logo.jpg" alt="Sensoria" className="brand-logo" />
          <span>Sensoria</span>
        </h1>
        <nav className="tabs">
          <button className={tab === 'tienda' ? 'active' : ''} onClick={() => setTab('tienda')}>
            Tienda
          </button>
          <button
            className={tab === 'productos' ? 'active' : ''}
            onClick={() => setTab('productos')}
          >
            Productos
          </button>
          <button className={tab === 'pagos' ? 'active' : ''} onClick={() => setTab('pagos')}>
            Pagos {displayedPayments.length > 0 && <span className="pill">{displayedPayments.length}</span>}
          </button>
          <button onClick={() => setShowContact(true)}>Contáctenos</button>
          <div className="search-dropdown">
            <button
              className={`search-toggle${searchOpen ? ' active' : ''}`}
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Buscar productos"
              aria-expanded={searchOpen}
              title="Buscar productos"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
            {searchOpen && (
              <div className="search-panel">
                <input
                  type="search"
                  placeholder="Buscar productos..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setPage(0)
                    if (tab !== 'tienda') setTab('tienda')
                  }}
                  aria-label="Buscar productos"
                  autoFocus
                />
              </div>
            )}
          </div>
          {WHATSAPP_NUMBERS.map((number) => (
            <a
              key={number}
              className="whatsapp-link"
              href={`https://wa.me/${number}?text=${encodeURIComponent('Hola Sensoria, quiero más información')}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Escribir por WhatsApp al ${number}`}
            >
              <span className="whatsapp-icon" aria-hidden="true" />
              WhatsApp
            </a>
          ))}
        </nav>
      </header>

      <main className={searchOpen ? 'search-open' : ''}>
        {tab === 'tienda' && (
          <div className="grid-2">
            <section>
              <h2>Catálogo</h2>
              <div className="catalog-carousel">
                <button
                  className="arrow-btn"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  aria-label="Productos anteriores"
                >
                  ‹
                </button>
              <div className="catalog">
                {products.length === 0 && <p className="muted">No hay productos.</p>}
                {products.length > 0 && filteredProducts.length === 0 && (
                  <p className="muted">No se encontraron productos para "{query}".</p>
                )}
                {visibleProducts.map((p) => (
                  <article key={p.id} className="card product">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = `https://picsum.photos/seed/${p.id}/800/600`
                        }}
                      />
                    ) : (
                      <div className="img-placeholder">Sin imagen</div>
                    )}
                    <h3>{p.name}</h3>
                    <p className="muted small">{p.description}</p>
                    <div className="price-row">
                      <strong>{formatMoney(p.price)}</strong>
                      <span className={p.stock > 0 ? 'muted small' : 'error small'}>
                        {p.stock > 0 ? `Stock: ${p.stock}` : 'Agotado'}
                      </span>
                    </div>
                    <button
                      className="btn primary"
                      disabled={p.stock === 0}
                      onClick={() => addToCart(p)}
                    >
                      Agregar al carrito
                    </button>
                  </article>
                ))}
              </div>
                <button
                  className="arrow-btn"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= pageCount - 1}
                  aria-label="Más productos"
                >
                  ›
                </button>
              </div>
            </section>

            <aside>
              <h2>Carrito {cartCount > 0 && <span className="pill">{cartCount}</span>}</h2>
              <div className="card">
                {cart.length === 0 && <p className="muted">El carrito está vacío.</p>}
                {cart.map((i) => (
                  <div key={i.id} className="cart-item">
                    <div>
                      <strong>{i.name}</strong>
                      <div className="muted small">{formatMoney(i.price)} c/u</div>
                    </div>
                    <div className="qty">
                      <button onClick={() => changeQty(i.id, -1)}>−</button>
                      <span>{i.qty}</span>
                      <button onClick={() => changeQty(i.id, 1)}>+</button>
                    </div>
                    <div className="line-total">{formatMoney(i.price * i.qty)}</div>
                    <button className="link-btn" onClick={() => removeFromCart(i.id)}>
                      ✕
                    </button>
                  </div>
                ))}
                {cart.length > 0 && (
                  <div className="total-line">
                    <span>Total</span>
                    <strong>{formatMoney(cartTotal)}</strong>
                  </div>
                )}
              </div>

              <div className="card">
                <Checkout cart={cart} total={cartTotal} onPaid={registerPayment} />
              </div>
            </aside>
          </div>
        )}

        {tab === 'productos' && (
          <div className="grid-2">
            <section>
              <h2>Inventario</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="right">Precio</th>
                    <th className="right">Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td className="right">{formatMoney(p.price)}</td>
                      <td className="right">{p.stock}</td>
                      <td className="right">
                        <button className="link-btn danger" onClick={() => deleteProduct(p.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <aside>
              <ProductForm onSave={addProduct} />
            </aside>
          </div>
        )}

        {tab === 'pagos' && (
          <section>
            <h2>Historial de pagos</h2>
            {notice && <p className="error">{notice}</p>}
            <Payments
              payments={displayedPayments}
              isBackend={hasBackend && serverOrders.length > 0}
              onRefresh={hasBackend ? fetchServerOrders : null}
            />
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="social-links">
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="social-btn instagram">
            Instagram
          </a>
          <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="social-btn facebook">
            Facebook
          </a>
        </div>
        <span className="muted small">
          Datos guardados localmente en tu navegador (localStorage).
        </span>
      </footer>

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </div>
  )
}
