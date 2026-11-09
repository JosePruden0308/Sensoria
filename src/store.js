// Capa de persistencia simple sobre localStorage.

const PRODUCTS_KEY = 'tienda.products.v4'
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
    image: 'https://cocinemosjuntos.com.co/media/catalog/product/cache/f29d083d6129e9377996bf7643a9c4af/b/o/bowl-de-banano-con-avena-alpina-acompanado-de-frutas.jpg'
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
  },
  { id: 'p7', name: 'Tostadas francesas', description: 'Pan brioche con canela, azúcar glass y frutos rojos.', price: 14000, stock: 14, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80' },
  { id: 'p8', name: 'Arepa con huevo', description: 'Arepa asada rellena de huevo frito y queso.', price: 9000, stock: 25, image: 'https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480/img/recipe/ras/Assets/E4DC1A1E-D95A-469C-8E08-D1F244463A93/Derivates/51bd25db-8198-4fd0-8b5b-41bb771a0109.jpg' },
  { id: 'p9', name: 'Waffles con crema', description: 'Waffles belgas con crema batida y fresas.', price: 15000, stock: 12, image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&q=80' },
  { id: 'p10', name: 'Omelette de verduras', description: 'Omelette de tres huevos con espinaca, tomate y cebolla.', price: 14500, stock: 13, image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&q=80' },
  { id: 'p11', name: 'Croissant de mantequilla', description: 'Croissant horneado recién hecho, con mantequilla.', price: 7000, stock: 30, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
  { id: 'p12', name: 'Tamal con chocolate', description: 'Tamal de maíz con pollo, acompañado de chocolate caliente.', price: 12500, stock: 10, image: 'https://radionacional-v3.s3.amazonaws.com/s3fs-public/inline-images/COLP_EXT_117732.jpg' },
  { id: 'p13', name: 'Jugo natural de naranja', description: 'Jugo de naranja recién exprimido, 350 ml.', price: 5500, stock: 45, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80' },
  { id: 'p14', name: 'Chocolate caliente', description: 'Chocolate espeso con leche, 300 ml.', price: 6500, stock: 35, image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&q=80' },
  { id: 'p15', name: 'Yogur con granola', description: 'Yogur natural con granola, miel y frutas de temporada.', price: 8500, stock: 20, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80' },
  { id: 'p16', name: 'Pancakes de banana', description: 'Pancakes esponjosos de banano con mantequilla de maní.', price: 13500, stock: 16, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80' },
  { id: 'p17', name: 'Hot cakes con mantequilla', description: 'Tres hot cakes con mantequilla y miel de abejas.', price: 11500, stock: 18, image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&q=80' },
  { id: 'p18', name: 'Tostada de aguacate', description: 'Pan de masa madre con aguacate, limón y semillas.', price: 10500, stock: 17, image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&q=80' },
  { id: 'p19', name: 'Té de hierbas', description: 'Infusión de hierbas aromáticas, 250 ml.', price: 4500, stock: 50, image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&q=80' },
  { id: 'p20', name: 'Changua', description: 'Sopa tradicional de agua, leche, cebolla y huevo.', price: 12000, stock: 11, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80' }
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
  const filled = existing.map((p) => {
    const isBroken = !p.image || p.image.includes('picsum.photos') || p.image.includes('loremflickr.com') || p.image.includes('photo-1619740455993') || p.image.includes('photo-1626200419199') || p.image.includes('Arepa_de_huevo') || p.image.includes('photo-1517673132405') || p.image.includes('photo-1631292784640')
    if (!isBroken) return p
    const seed = SEED_PRODUCTS.find((s) => s.id === p.id)
    return seed?.image ? { ...p, image: seed.image } : p
  })
  if (filled.some((p, i) => p !== existing[i])) write(PRODUCTS_KEY, filled)
  return filled
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
