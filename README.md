# Mi Tienda — Ventas y Pagos

Aplicación web (React + Vite) para vender productos y registrar pagos. Los datos se
guardan en el navegador (`localStorage`), sin necesidad de servidor ni base de datos.

## Funcionalidades

- **Tienda**: catálogo de productos, carrito de compras y checkout.
- **Productos**: alta y baja de productos con precio, stock e imagen (inventario).
- **Pagos**: pago real con **PayPal** (SDK JS) o registro manual (efectivo/transferencia),
  descuento automático de stock e historial con total recaudado.

## Requisitos

- Node.js 18 o superior.

## Puesta en marcha

```bash
npm install
npm run dev
```

Se abrirá automáticamente en http://localhost:5173

## Configurar PayPal (cobros reales)

1. Crea una app en https://developer.paypal.com (modo Sandbox o Live).
2. Copia el **Client ID**.
3. Pégalo en `src/config.js` en la constante `PAYPAL_CLIENT_ID`.

Con el valor por defecto `test` los botones se muestran en modo demo pero no cobran.

## Compilar para producción

```bash
npm run build
npm run preview
```
