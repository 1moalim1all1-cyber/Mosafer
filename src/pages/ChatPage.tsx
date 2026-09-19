import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import { subscribeChat, subscribeChatMessages, sendMessage, type ChatMessage, type ChatThread } from '../lib/chat'
import { fetchUserProfile } from '../lib/users'
import type { AppUser } from '../types/user'

export default function ChatPage() {
  const { t } = useTranslation()
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [chat, setChat] = useState<ChatThread | null>(null)
  const [otherUser, setOtherUser] = useState<AppUser | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chatId) return
    return subscribeChatMessages(chatId, setMessages)
  }, [chatId])

  useEffect(() => {
    if (!chatId) return
    return subscribeChat(chatId, setChat)
  }, [chatId])

  useEffect(() => {
    if (!chat || !user) return
    const otherId = chat.passengerId === user.uid ? chat.driverId : chat.passengerId
    fetchUserProfile(otherId).then(setOtherUser).catch(() => setOtherUser(null))
  }, [chat, user])

  const phone = otherUser?.phone.replace(/[^0-9]/g, '') ?? ''

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!text.trim() || !chatId || !user) return
    const value = text
    setText('')
    await sendMessage(chatId, user.uid, value)
  }

  return (
    <div className="flex h-screen flex-col bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-primary-light text-lg text-primary">
          {otherUser?.profileImageUrl ? <img src={otherUser.profileImageUrl} alt={otherUser.fullName} className="h-full w-full object-cover" /> : '👤'}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-text-primary">{otherUser?.fullName || t('common.chat')}</h1>
          {otherUser && <p className="text-xs text-text-secondary">تم فتح التواصل بعد الاتفاق على الرحلة</p>}
        </div>
        {phone && (
          <div className="flex gap-2">
            <a href={`tel:${otherUser?.phone}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg" aria-label="اتصال">📞</a>
            <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15" aria-label="واتساب">🟢</a>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && <p className="py-12 text-center text-text-secondary">{t('common.chatEmpty')}</p>}
        {messages.map((m) => {
          const isMe = m.senderId === user?.uid
          return (
            <div key={m.id} dir="ltr" className={`mb-2 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe ? 'bg-primary text-white' : 'border border-border bg-card text-text-primary'
                }`}
              >
                <p>{m.text}</p>
                <p className={`mt-1 text-xs ${isMe ? 'text-white/70' : 'text-text-secondary'}`}>
                  {new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit' }).format(m.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </main>

      <form onSubmit={handleSend} className="mx-auto flex w-full max-w-4xl gap-3 border-t border-border bg-card p-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('common.typeMessage')}
          className="flex-1 rounded-full border-2 border-border px-4 py-2.5 focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white disabled:bg-disabled"
        >
          ➤
        </button>
      </form>
    </div>
  )
}
