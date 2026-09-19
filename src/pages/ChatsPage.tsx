import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/useAuth'
import { subscribeUserChats, type ChatThread } from '../lib/chat'
import { fetchUserProfile } from '../lib/users'
import { BottomNav } from '../components/BottomNav'

function ChatRow({ chat, uid }: { chat: ChatThread; uid: string }) {
  const navigate = useNavigate()
  const otherId = chat.passengerId === uid ? chat.driverId : chat.passengerId
  const [name, setName] = useState(otherId)
  const [photo, setPhoto] = useState<string | null>(null)

  useEffect(() => {
    fetchUserProfile(otherId).then((u) => {
      if (u?.fullName) setName(u.fullName)
      setPhoto(u?.profileImageUrl ?? null)
    })
  }, [otherId])

  return (
    <button
      onClick={() => navigate(`/chat/${chat.id}`)}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-right transition hover:border-primary"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-primary-light text-lg">
        {photo ? <img src={photo} alt={name} className="h-full w-full object-cover" /> : '👤'}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-text-primary">{name}</span>
        <span className="block truncate text-sm text-text-secondary">{chat.lastMessage || 'ابدأ المحادثة'}</span>
      </span>
    </button>
  )
}

export default function ChatsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [chats, setChats] = useState<ChatThread[]>([])

  useEffect(() => {
    if (!user) return
    return subscribeUserChats(user.uid, setChats)
  }, [user])

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">{t('common.chats')}</h1>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        {chats.length === 0 && <p className="py-12 text-center text-text-secondary">{t('common.noChats')}</p>}
        {user && <div className="grid gap-3 lg:grid-cols-2">{chats.map((chat) => <ChatRow key={chat.id} chat={chat} uid={user.uid} />)}</div>}
      </main>
      <BottomNav />
    </div>
  )
}
