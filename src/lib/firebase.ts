import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { FIREBASE_CONFIG } from '../config/env'

const fallbackConfig = {
  apiKey: 'AIzaSyDbrbDg3z9IDn_o6rxWkVQH3Z0oIlDDgXM',
  authDomain: 'mosafer-c43be.firebaseapp.com',
  projectId: 'mosafer-c43be',
  storageBucket: 'mosafer-c43be.firebasestorage.app',
  messagingSenderId: '506602326195',
  appId: '1:506602326195:web:d84d1a8b0e072bd92308c6',
}

const firebaseConfig = FIREBASE_CONFIG.apiKey ? FIREBASE_CONFIG : fallbackConfig

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
