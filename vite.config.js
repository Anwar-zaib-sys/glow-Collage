import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5171,
    strictPort: true,
  },
  preview: {
    port: 5171,
    strictPort: true,
  },
})
