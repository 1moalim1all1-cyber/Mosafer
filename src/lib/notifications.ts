import { collection, doc, query, orderBy, limit, onSnapshot, updateDoc, writeBatch, where, getDocs } from 'firebase/firestore'
import { db } from './firebase'

export interface AppNotification {
  id: string
  type: string
  title: string
  body: string
  relatedId?: string | null
  isRead: boolean
  createdAt: Date
}

export function subscribeNotifications(uid: string, callback: (notifications: AppNotification[]) => void) {
  const q = query(collection(db, 'users', uid, 'notifications'), orderBy('createdAt', 'desc'), limit(50))
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => {
        const data = d.data()
        const created = data.createdAt as { toDate?: () => Date }
        return {
          id: d.id,
          type: data.type,
          title: data.title,
          body: data.body,
          relatedId: data.relatedId ?? null,
          isRead: Boolean(data.isRead),
          createdAt: created?.toDate ? created.toDate() : new Date(),
        }
      }),
    )
  })
}

export function subscribeUnreadCount(uid: string, callback: (count: number) => void) {
  const q = query(collection(db, 'users', uid, 'notifications'), where('isRead', '==', false))
  return onSnapshot(q, (snap) => callback(snap.size))
}

export async function markNotificationRead(uid: string, notificationId: string) {
  await updateDoc(doc(db, 'users', uid, 'notifications', notificationId), { isRead: true })
}

export async function markAllNotificationsRead(uid: string) {
  const q = query(collection(db, 'users', uid, 'notifications'), where('isRead', '==', false))
  const snap = await getDocs(q)
  if (snap.empty) return
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.update(d.ref, { isRead: true }))
  await batch.commit()
}
