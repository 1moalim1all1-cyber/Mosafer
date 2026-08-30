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

  useEffect(() => {
    fetchUserProfile(otherId).then((u) => {
      if (u?.fullName) setName(u.fullName)
    })
  }, [otherId])

  return (
    <button
      onClick={() => navigate(`/chat/${chat.id}`)}
      className="mb-2 flex w-full flex-col rounded-2xl border border-border bg-card p-4 text-right"
    >
      <span className="font-semibold text-text-primary">{name}</span>
      <span className="truncate text-sm text-text-secondary">{chat.lastMessage || '—'}</span>
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
      <main className="mx-auto max-w-lg px-4 py-6">
        {chats.length === 0 && <p className="py-12 text-center text-text-secondary">{t('common.noChats')}</p>}
        {user && chats.map((chat) => <ChatRow key={chat.id} chat={chat} uid={user.uid} />)}
      </main>
      <BottomNav />
    </div>
  )
}
