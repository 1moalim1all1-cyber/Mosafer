import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // المسار النسبي يخلي نسخة الويب تشتغل على الدومين الخاص وعلى رابط
  // GitHub Pages القديم في نفس الوقت. نسخة Capacitor تفضل على الجذر.
  base: mode === 'capacitor' ? '/' : './',
  plugins: [react(), tailwindcss()],
}))
