// Capa de persistencia simple sobre localStorage.

const PRODUCTS_KEY = 'tienda.products.v3'
const PAYMENTS_KEY = 'tienda.payments'

const SEED_PRODUCTS = [
  {
    id: 'p1',
    name: 'Desayuno continental',
    description: 'Café o jugo, pan artesanal, mantequilla y mermelada.',
    price: 12000,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80'
  },
  {
    id: 'p2',
    name: 'Huevos revueltos con tostadas',
    description: 'Dos huevos revueltos, tostadas integrales y aguacate.',
    price: 15000,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80'
  },
  {
    id: 'p3',
    name: 'Panqueques con frutas',
    description: 'Torre de panqueques con miel, fresas y arándanos.',
    price: 16000,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80'
  },
  {
    id: 'p4',
    name: 'Bowl de avena y frutas',
    description: 'Avena cremosa con banana, frutos rojos y granola.',
    price: 11000,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&q=80'
  },
  {
    id: 'p5',
    name: 'Sándwich de jamón y queso',
    description: 'Pan tostado con jamón, queso derretido y huevo.',
    price: 13000,
    stock: 16,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80'
  },
  {
    id: 'p6',
    name: 'Café con leche',
    description: 'Café espresso con leche vaporizada, 250 ml.',
    price: 6000,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&q=80'
  }
]

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getProducts() {
  const existing = read(PRODUCTS_KEY, null)
  if (existing === null) {
    write(PRODUCTS_KEY, SEED_PRODUCTS)
    return SEED_PRODUCTS
  }
  return existing
}

export function saveProducts(products) {
  write(PRODUCTS_KEY, products)
}

export function getPayments() {
  return read(PAYMENTS_KEY, [])
}

export function savePayments(payments) {
  write(PAYMENTS_KEY, payments)
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
