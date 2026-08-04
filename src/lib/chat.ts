import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  limit,
  getDocs,
  setDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export interface ChatMessage {
  id: string
  senderId: string
  text: string
  createdAt: Date
}

/** إيجاد أو إنشاء محادثة بين راكب وسائق - نفس منطق نسخة Flutter */
export async function getOrCreateChat(passengerId: string, driverId: string): Promise<string> {
  const q = query(
    collection(db, 'chats'),
    where('passengerId', '==', passengerId),
    where('driverId', '==', driverId),
    limit(1),
  )
  const existing = await getDocs(q)
  if (!existing.empty) return existing.docs[0].id

  const chatRef = doc(collection(db, 'chats'))
  await setDoc(chatRef, {
    passengerId,
    driverId,
    createdAt: Timestamp.now(),
    lastMessage: '',
    lastMessageAt: Timestamp.now(),
  })
  return chatRef.id
}

export function subscribeChatMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => {
        const data = d.data()
        const created = data.createdAt as { toDate?: () => Date }
        return {
          id: d.id,
          senderId: data.senderId,
          text: data.text ?? '',
          createdAt: created?.toDate ? created.toDate() : new Date(),
        }
      }),
    )
  })
}

export async function sendMessage(chatId: string, senderId: string, text: string) {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text,
    type: 'text',
    createdAt: Timestamp.now(),
  })
  await setDoc(
    doc(db, 'chats', chatId),
    { lastMessage: text, lastMessageAt: Timestamp.now() },
    { merge: true },
  )
}
