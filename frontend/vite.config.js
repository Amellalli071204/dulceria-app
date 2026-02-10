import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
  },
  preview: {
    host: true,
    port: 3000, // O el puerto que configuraste en Railway
    allowedHosts: [
      'humorous-nourishment-production.up.railway.app' // AGREGA TU LINK AQUÍ
    ]
  }
})