import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.mosafer.egypt',
  appName: 'مسافر',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    // مطلوب لاستمرار قناة التتبع الأصلية عند تصغير التطبيق لفترة طويلة.
    useLegacyBridge: true,
  },
}

export default config
