import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // لما نبني نسخة التطبيق (Capacitor) بنستخدم مسار جذر عادي "/"،
  // ولما نبني نسخة الموقع (GitHub Pages) بنستخدم اسم الـ Repository.
  // الأمر بيتحكم فيها عن طريق: npm run build:app بدل npm run build
  base: mode === 'capacitor' ? '/' : '/Mosafer/',
  plugins: [react(), tailwindcss()],
}))
