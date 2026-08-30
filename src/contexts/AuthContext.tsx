import { useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, collection, query, where, limit, getDocs, Timestamp, writeBatch } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { AppUser, Gender, UserRole } from '../types/user'
import { AuthContext } from './authContextInstance'

interface RegisterInput {
  fullName: string
  phone: string
  password: string
  role: UserRole
  gender: Gender
  referralCode?: string
}

export interface AuthContextValue {
  user: AppUser | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput & { email: string }) => Promise<void>
  logout: () => Promise<void>
}

/** ترجمة أكواد أخطاء Firebase لرسائل عربية مفهومة */
function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'رقم الهاتف ده مسجّل بحساب بالفعل، جرّب تسجّل الدخول'
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة، لازم تكون 6 حروف على الأقل'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'رقم الهاتف أو كلمة المرور غلط'
    case 'auth/too-many-requests':
      return 'محاولات كتير، حاول تاني بعد شوية'
    case 'auth/network-request-failed':
      return 'تأكد من اتصال الإنترنت وحاول تاني'
    default:
      return 'حصل خطأ غير متوقع، حاول تاني'
  }
}

function mapUserDoc(uid: string, data: Record<string, unknown>): AppUser {
  return {
    uid,
    role: (data.role as UserRole) ?? 'passenger',
    fullName: (data.fullName as string) ?? '',
    phone: (data.phone as string) ?? '',
    email: (data.email as string) ?? '',
    gender: (data.gender as Gender) ?? 'male',
    profileImageUrl: (data.profileImageUrl as string) ?? null,
    isPhoneVerified: Boolean(data.isPhoneVerified),
    isEmailVerified: Boolean(data.isEmailVerified),
    trustScore: Number(data.trustScore ?? 0),
    totalTrips: Number(data.totalTrips ?? 0),
    avgRating: Number(data.avgRating ?? 0),
    status: (data.status as AppUser['status']) ?? 'active',
    language: (data.language as string) ?? 'ar',
    favoriteTrips: (data.favoriteTrips as string[]) ?? [],
    referralCode: (data.referralCode as string) ?? '',
    referredByUid: (data.referredByUid as string) ?? null,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (!fbUser) {
        setUser(null)
        setLoading(false)
        return
      }
      const snap = await getDoc(doc(db, 'users', fbUser.uid))
      setUser(snap.exists() ? mapUserDoc(fbUser.uid, snap.data()) : null)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      throw new Error(mapFirebaseError(code))
    }
  }

  async function register(input: RegisterInput & { email: string }) {
    try {
      const credential = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password)
      const uid = credential.user.uid
      const myReferralCode = uid.substring(0, 8).toUpperCase()

      // لو دخل كود دعوة، ندوّر على صاحبه (مسموح لأن المستخدم بقى مسجّل دخول)
      let referredByUid: string | null = null
      if (input.referralCode && input.referralCode.trim().length > 0) {
        const code = input.referralCode.trim().toUpperCase()
        if (code !== myReferralCode) {
          const q = query(collection(db, 'users'), where('referralCode', '==', code), limit(1))
          const results = await getDocs(q)
          if (!results.empty) referredByUid = results.docs[0].id
        }
      }

      const now = Timestamp.now()
      let welcomeBonus = 20
      try {
        const settingsSnap = await getDoc(doc(db, 'appSettings', 'general'))
        if (settingsSnap.exists()) {
          welcomeBonus = Number(settingsSnap.data().welcomeBonusAmount ?? 20)
        }
      } catch {
        welcomeBonus = 20
      }
      welcomeBonus = Math.min(Math.max(welcomeBonus, 0), 200)

      const batch = writeBatch(db)
      batch.set(doc(db, 'users', uid), {
        role: input.role,
        fullName: input.fullName.trim(),
        phone: input.phone.trim(),
        email: input.email.trim(),
        gender: input.gender,
        isPhoneVerified: false,
        isEmailVerified: false,
        trustScore: 0,
        totalTrips: 0,
        avgRating: 0,
        status: 'active',
        language: 'ar',
        favoriteTrips: [],
        referralCode: myReferralCode,
        referredByUid,
        createdAt: now,
      })
      batch.set(doc(db, 'wallets', uid), { balance: welcomeBonus, currency: 'EGP', createdAt: now })
      await batch.commit()

      await updateProfile(credential.user, { displayName: input.fullName.trim() })

      // مهم جدًا: بنحط بيانات المستخدم في الحالة المحلية هنا مباشرة، بدل
      // ما نستنى onAuthStateChanged يعيد قراءتها من Firestore - لأنه ممكن
      // يكون شغّل ده قبل ما batch.commit() فوق يخلص فعليًا (سباق بين
      // العمليتين)، وده كان بيخلي صفحة السائق الجديد أو البروفايل تفضل
      // فاضية أو ترفضه بالغلط فور التسجيل مباشرة.
      setUser({
        uid,
        role: input.role,
        fullName: input.fullName.trim(),
        phone: input.phone.trim(),
        email: input.email.trim(),
        gender: input.gender,
        profileImageUrl: null,
        isPhoneVerified: false,
        isEmailVerified: false,
        trustScore: 0,
        totalTrips: 0,
        avgRating: 0,
        status: 'active',
        language: 'ar',
        favoriteTrips: [],
        referralCode: myReferralCode,
        referredByUid,
        createdAt: now.toDate(),
      })
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      throw new Error(mapFirebaseError(code))
    }
  }

  async function logout() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
