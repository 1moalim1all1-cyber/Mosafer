import { doc, collection, addDoc, onSnapshot, orderBy, query, limit, Timestamp } from 'firebase/firestore'
import { db } from './firebase'

export interface WalletTransaction {
  id: string
  type: 'deposit' | 'withdraw' | 'payment' | 'refund' | 'commission'
  amount: number
  balanceAfter?: number | null
  status: 'pending' | 'completed' | 'rejected'
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
          createdAt: created?.toDate ? created.toDate() : new Date(),
        }
      }),
    )
  })
}

export async function requestDeposit(uid: string, amount: number) {
  await addDoc(collection(db, 'wallets', uid, 'walletTransactions'), {
    type: 'deposit',
    amount,
    status: 'pending',
    createdAt: Timestamp.now(),
  })
}

export async function requestWithdraw(uid: string, amount: number) {
  await addDoc(collection(db, 'wallets', uid, 'walletTransactions'), {
    type: 'withdraw',
    amount,
    status: 'pending',
    createdAt: Timestamp.now(),
  })
}
