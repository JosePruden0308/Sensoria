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

// Números de WhatsApp con código de país, solo dígitos (ej. 573001234567).
// Define VITE_WHATSAPP_NUMBER y, opcionalmente, VITE_WHATSAPP_NUMBER_2.
export const WHATSAPP_NUMBERS = [
  import.meta.env.VITE_WHATSAPP_NUMBER,
  import.meta.env.VITE_WHATSAPP_NUMBER_2,
]
  .map((n) => (n || '').replace(/\D/g, ''))
  .filter(Boolean)

// Enlace de invitación a un grupo de WhatsApp con ambos números.
// wa.me solo puede abrir un chat con un número, por eso se usa un grupo.
export const WHATSAPP_GROUP_URL = import.meta.env.VITE_WHATSAPP_GROUP_URL || 'https://wa.me/'

// Perfiles de redes sociales (define VITE_INSTAGRAM_URL y VITE_FACEBOOK_URL).
export const SOCIAL_LINKS = {
  instagram: import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/',
  facebook: import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com/'
}
