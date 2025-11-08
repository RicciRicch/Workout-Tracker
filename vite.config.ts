import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  publicDir: 'public', // Omogući da service worker i manifest budu dostupni
  server: {
    host: true, // Omogući pristup sa drugih uređaja u mreži
    port: 4173, // Port za preview (ili 5173 za dev)
  },
})
