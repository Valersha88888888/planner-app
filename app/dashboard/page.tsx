'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

type WorkOrder = {
  id: number
  car_name: string | null
  title: string | null
  worker_name: string | null
  status: string | null
  price: number | null
  completed_at?: string | null
}

type Profile = {
  id: string
  email: string | null
  full_name: string | null
}

type Plan = {
  id: string
  title: string
  date: string
}

export default function DashboardPage() {
  const router = useRouter()

  const [userEmail, setUserEmail] = useState('')
  const [carName, setCarName] = useState('')
  const [title, setTitle] = useState('')
  const [workerName, setWorkerName] = useState('Kenon')
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [priceInputs, setPriceInputs] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  const [plans, setPlans] = useState<Plan[]>([])
  const [planText, setPlanText] = useState('')
  const [planDate, setPlanDate] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      setUserEmail(data.user.email || '')

      await Promise.all([
        fetchOrders(),
        fetchProfiles(),
        fetchPlans()
      ])

      setLoading(false)
    }

    init()
  }, [router])

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setOrders(data || [])
  }

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')

    if (!error) setProfiles(data || [])
  }

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('date', { ascending: true })

    if (!error) setPlans(data || [])
  }

  const addOrder = async () => {
    if (!carName.trim() || !title.trim()) return

    await supabase.from('work_orders').insert([{
      car_name: carName.trim(),
      title: title.trim(),
      worker_name: workerName,
      status: 'planned'
    }])

    setCarName('')
    setTitle('')
    await fetchOrders()
  }

  const finishOrder = async (id: number) => {
    const priceValue = Number(priceInputs[id] || '0')
    if (!priceValue || priceValue <= 0) return

    await supabase
      .from('work_orders')
      .update({
        status: 'done',
        price: priceValue,
        completed_at: new Date().toISOString()
      })
      .eq('id', id)

    setPriceInputs(prev => ({ ...prev, [id]: '' }))
    await fetchOrders()
  }

  const deleteOrder = async (id: number) => {
    await supabase.from('work_orders').delete().eq('id', id)
    await fetchOrders()
  }

  const addPlan = async () => {
    if (!planText.trim() || !planDate) return

    await supabase.from('plans').insert([{
      title: planText.trim(),
      date: planDate
    }])

    setPlanText('')
    setPlanDate('')
    await fetchPlans()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const totals = useMemo(() => {
    const done = orders.filter(o => o.status === 'done')

    const kenon = done
      .filter(o => o.worker_name === 'Kenon')
      .reduce((s, o) => s + (o.price || 0), 0)

    const rostik = done
      .filter(o => o.worker_name === 'Rostik')
      .reduce((s, o) => s + (o.price || 0), 0)

    return { kenon, rostik, total: kenon + rostik }
  }, [orders])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">

      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/5 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold">🚗 Bilservice</h1>
          <p className="text-sm text-white/50">Панель управления</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-white/70">{userEmail}</span>
          <button
            onClick={logout}
            className="rounded-md border border-white/20 px-4 py-2 hover:bg-white/10"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-3">

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-semibold">Доход</h2>
          <p>Kenon: {totals.kenon}</p>
          <p>Rostik: {totals.rostik}</p>
          <p className="font-bold">Итого: {totals.total}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:col-span-2">

          <h2 className="mb-4 text-xl font-semibold">Добавить работу</h2>

          <label htmlFor="carName">Машина</label>
          <input
            id="carName"
            className="mb-2 w-full rounded-md p-2 text-black"
            value={carName}
            onChange={(e) => setCarName(e.target.value)}
          />

          <label htmlFor="title">Работа</label>
          <input
            id="title"
            className="mb-2 w-full rounded-md p-2 text-black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label htmlFor="worker">Работник</label>
          <select
            id="worker"
            className="mb-3 w-full rounded-md p-2 text-black"
            value={workerName}
            onChange={(e) => setWorkerName(e.target.value)}
          >
            <option value="Kenon">Kenon</option>
            <option value="Rostik">Rostik</option>
          </select>

          <button
            onClick={addOrder}
            className="w-full rounded-md bg-white py-2 text-black"
          >
            Добавить
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

          <h2 className="mb-4 text-xl font-semibold">Планировщик</h2>

          <label htmlFor="planText">Что сделать</label>
          <input
            id="planText"
            className="mb-2 w-full rounded-md p-2 text-black"
            value={planText}
            onChange={(e) => setPlanText(e.target.value)}
          />

          <label htmlFor="planDate">Дата</label>
          <input
            id="planDate"
            type="date"
            className="mb-2 w-full rounded-md p-2 text-black"
            value={planDate}
            onChange={(e) => setPlanDate(e.target.value)}
          />

          <button
            onClick={addPlan}
            className="w-full rounded-md bg-white py-2 text-black"
          >
            Добавить
          </button>

          <div className="mt-4 space-y-2">
            {plans.map(p => (
              <div key={p.id} className="border p-2 rounded">
                {p.date} — {p.title}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}