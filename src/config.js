// ============================================================
// Configuración de pagos — Wompi (Bancolombia)
// ------------------------------------------------------------
// Wompi es la pasarela de Bancolombia. Soporta Botón Bancolombia y PSE.
// Opera SOLO en pesos colombianos (COP).
//
// 1. Crea una cuenta en https://comercios.wompi.co y obtén tus llaves.
// 2. Define estas variables en el hosting (o en un archivo .env local):
//      VITE_WOMPI_PUBLIC_KEY   -> Llave pública (pub_test_... o pub_prod_...)
//      VITE_WOMPI_INTEGRITY    -> Secreto de integridad (firma la transacción)
//      VITE_WOMPI_ENV          -> 'test' (sandbox) o 'prod' (producción)
//
// NOTA DE SEGURIDAD: aquí la firma de integridad se genera en el navegador.
// Para producción seria, esa firma debe generarse en un backend y la
// confirmación del pago debe validarse con el webhook de Wompi.
// ============================================================

export const WOMPI = {
  publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY || '',
  integritySecret: import.meta.env.VITE_WOMPI_INTEGRITY || '',
  environment: import.meta.env.VITE_WOMPI_ENV || 'test', // 'test' | 'prod'
  checkoutUrl: 'https://checkout.wompi.co/p/'
}

// URL del backend que firma la transacción de forma segura (recomendado).
// Si está definida, el frontend delega la firma al servidor (el secreto no se expone).
export const API_BASE = import.meta.env.VITE_API_BASE || ''

// Base del API de Wompi según el entorno (para consultar el estado de la transacción).
export const WOMPI_API_BASE =
  WOMPI.environment === 'prod'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1'

export function isWompiConfigured() {
  // Con backend basta su URL; sin backend, se necesitan las llaves en el cliente.
  return API_BASE.length > 0 || (WOMPI.publicKey.startsWith('pub_') && WOMPI.integritySecret.length > 0)
}

// Moneda usada en toda la tienda (Wompi solo acepta COP).
export const CURRENCY = 'COP'

// Símbolo mostrado junto a los precios.
export const CURRENCY_SYMBOL = '$'

// Formatea un monto COP con separador de miles y sin decimales.
export function formatMoney(amount) {
  return '$' + Math.round(amount).toLocaleString('es-CO')
}

// ============================================================
// Formulario de contacto (envío de correo sin backend)
// ------------------------------------------------------------
// Usamos FormSubmit (https://formsubmit.co). Define el correo de
// destino en VITE_CONTACT_EMAIL. La PRIMERA vez que llegue un mensaje,
// FormSubmit enviará un email de confirmación para activar el buzón.
// ============================================================
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || ''

// Número de WhatsApp con código de país, solo dígitos (ej. 573001234567).
// Define VITE_WHATSAPP_CONTACT_NUMBER. Vacío = botón oculto.
const WHATSAPP_CONTACT_NUMBER = (import.meta.env.VITE_WHATSAPP_CONTACT_NUMBER || '').replace(/\D/g, '')

export const WHATSAPP_URL = WHATSAPP_CONTACT_NUMBER ? `https://wa.me/${WHATSAPP_CONTACT_NUMBER}` : ''

// Perfiles de redes sociales (define VITE_INSTAGRAM_URL y VITE_FACEBOOK_URL).
export const SOCIAL_LINKS = {
  instagram: import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/',
  facebook: import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com/'
}

// ============================================================
// Información corporativa (sección "Quiénes somos")
// Personaliza estos valores o define las variables VITE_* en tu .env.
// ============================================================
export const STORE_INFO = {
  legalName: import.meta.env.VITE_STORE_LEGAL_NAME || 'Sensoria S.A.S.',
  taxId: import.meta.env.VITE_STORE_TAX_ID || 'NIT 900.000.000-0',
  address: import.meta.env.VITE_STORE_ADDRESS || 'Cra 00 #00-00, Bogotá, Colombia',
  phone: import.meta.env.VITE_STORE_PHONE || '+57 300 000 0000',
  email: CONTACT_EMAIL || import.meta.env.VITE_STORE_EMAIL || 'contacto@sensoria.co',
  foundedYear: import.meta.env.VITE_STORE_FOUNDED_YEAR || '2023'
}

// Monto (COP) a partir del cual el envío es gratis.
export const FREE_SHIPPING_THRESHOLD = Number(
  import.meta.env.VITE_FREE_SHIPPING_THRESHOLD || 150000
)

// Tarifas de envío por zona (flete según ubicación).
export const SHIPPING_RATES = [
  { zone: 'Bogotá y alrededores', cost: 8000, eta: '1-2 días hábiles' },
  { zone: 'Ciudades principales', cost: 12000, eta: '2-4 días hábiles' },
  { zone: 'Resto del país', cost: 18000, eta: '4-7 días hábiles' }
]
