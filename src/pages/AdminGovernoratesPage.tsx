import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeGovernorates, addGovernorate, toggleGovernorateActive, deleteGovernorate } from '../lib/admin'
import { Button } from '../components/ui/Button'

export default function AdminGovernoratesPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<{ id: string; name: string; isActive: boolean }[]>([])
  const [newName, setNewName] = useState('')

  useEffect(() => subscribeGovernorates(setItems), [])

  async function handleAdd() {
    if (!newName.trim()) return
    await addGovernorate(newName.trim())
    setNewName('')
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold text-text-primary">إدارة المحافظات</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6 flex gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="اسم المحافظة الجديدة"
            className="flex-1 rounded-xl border-2 border-border px-4 py-2.5 focus:border-primary focus:outline-none"
          />
          <Button onClick={handleAdd} fullWidth={false}>
            إضافة
          </Button>
        </div>

        {items.map((g) => (
          <div key={g.id} className="mb-2 flex items-center justify-between rounded-xl border border-border bg-white p-4">
            <span className="font-semibold text-text-primary">{g.name}</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={g.isActive}
                  onChange={(e) => toggleGovernorateActive(g.id, e.target.checked)}
                />
                فعّالة
              </label>
              <button onClick={() => deleteGovernorate(g.id)} className="text-danger">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
