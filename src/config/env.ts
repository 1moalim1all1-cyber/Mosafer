export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

// App Configuration
export const APP_CONFIG = {
  appName: 'Mosafer',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  environment: import.meta.env.MODE || 'development',
};

// Map Configuration
export const MAP_CONFIG = {
  defaultZoom: 13,
  centerLat: 30.0444,
  centerLng: 31.2357,
  maxZoom: 19,
};

// Pagination
export const PAGINATION = {
  defaultPageSize: 10,
  maxPageSize: 100,
};

// Cache Duration (in minutes)
export const CACHE_DURATION = {
  short: 5,
  medium: 30,
  long: 60,
};
