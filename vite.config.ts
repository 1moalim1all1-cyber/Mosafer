import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // نفس اسم الـ Repository القديم على GitHub
  base: '/Mosafer/',
  plugins: [react(), tailwindcss()],
})
