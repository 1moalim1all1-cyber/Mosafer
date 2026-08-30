import { doc, collection, addDoc, onSnapshot, orderBy, query, limit, Timestamp, getDoc, getDocs, where } from 'firebase/firestore'
import { db } from './firebase'

export interface WalletTransaction {
  id: string
  type: 'deposit' | 'withdraw' | 'payment' | 'refund' | 'commission'
  amount: number
  balanceAfter?: number | null
  status: 'pending' | 'completed' | 'rejected'
  method?: string | null
  accountNumber?: string | null
  senderNumber?: string | null
  createdAt: Date
}

export function subscribeWalletBalance(uid: string, callback: (balance: number) => void) {
  return onSnapshot(doc(db, 'wallets', uid), (snap) => {
    callback(snap.exists() ? (snap.data().balance ?? 0) : 0)
  })
}

export function subscribeWalletTransactions(uid: string, callback: (txs: WalletTransaction[]) => void) {
  const q = query(collection(db, 'wallets', uid, 'walletTransactions'), orderBy('createdAt', 'desc'), limit(50))
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => {
        const data = d.data()
        const created = data.createdAt as { toDate?: () => Date }
        return {
          id: d.id,
          type: data.type,
          amount: data.amount ?? 0,
          balanceAfter: data.balanceAfter ?? null,
          status: data.status ?? 'pending',
          method: data.method ?? null,
          accountNumber: data.accountNumber ?? null,
          senderNumber: data.senderNumber ?? null,
          createdAt: created?.toDate ? created.toDate() : new Date(),
        }
      }),
    )
  })
}

/**
 * طلب إيداع - المستخدم بيكون حوّل الفلوس بالفعل بره التطبيق (فودافون
 * كاش/إنستاباي) على رقم الإدارة، وبيسجّل هنا المبلغ ورقمه هو (اللي
 * حوّل منه) عشان الإدارة تتأكد وتقفل الطلب.
 */
export async function requestDeposit(uid: string, amount: number, senderNumber: string) {
  await addDoc(collection(db, 'wallets', uid, 'walletTransactions'), {
    type: 'deposit',
    amount,
    senderNumber,
    status: 'pending',
    createdAt: Timestamp.now(),
  })
}

/**
 * طلب سحب - المستخدم بيحدد الطريقة والرقم/الحساب اللي عايز يستلم عليه،
 * عشان الإدارة تقدر تبعتله الفلوس مباشرة من غير ما تدوّر عليه.
 */
export async function requestWithdraw(uid: string, amount: number, method: string, accountNumber: string) {
  if (amount <= 0) throw new Error('أدخل مبلغ صحيح')

  const walletRef = doc(db, 'wallets', uid)
  const walletSnap = await getDoc(walletRef)
  const balance = (walletSnap.data()?.balance ?? 0) as number

  const pendingSnap = await getDocs(
    query(collection(db, 'wallets', uid, 'walletTransactions'), where('status', '==', 'pending')),
  )
  const pendingWithdrawals = pendingSnap.docs
    .filter((d) => d.data().type === 'withdraw')
    .reduce((sum, d) => sum + Number(d.data().amount ?? 0), 0)

  if (amount + pendingWithdrawals > balance) {
    throw new Error('المبلغ أكبر من الرصيد المتاح بعد خصم طلبات السحب المعلّقة')
  }

  await addDoc(collection(db, 'wallets', uid, 'walletTransactions'), {
    type: 'withdraw',
    amount,
    method,
    accountNumber,
    status: 'pending',
    createdAt: Timestamp.now(),
  })
}
