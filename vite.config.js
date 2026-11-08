import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Evita que el navegador (incluido Simple Browser de VS Code) cachee los módulos en desarrollo.
    headers: {
      'Cache-Control': 'no-store'
    },
    // Polling: el watcher nativo falla en rutas de OneDrive con acentos; así sí detecta cambios.
    watch: {
      usePolling: true,
      interval: 300
    }
  }
})
