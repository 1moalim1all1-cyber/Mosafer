import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

// بيانات مشروع Firebase - نفس المشروع اللي استخدمناه في نسخة Flutter،
// نفس قاعدة البيانات والمستخدمين والحجوزات، من غير أي فقدان بيانات.
const firebaseConfig = {
  apiKey: 'AIzaSyDbrbDg3z9IDn_o6rxWkVQH3Z0oIlDDgXM',
  authDomain: 'mosafer-c43be.firebaseapp.com',
  projectId: 'mosafer-c43be',
  storageBucket: 'mosafer-c43be.firebasestorage.app',
  messagingSenderId: '506602326195',
  appId: '1:506602326195:web:d84d1a8b0e072bd92308c6',
  measurementId: 'G-201F285L1N',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)
