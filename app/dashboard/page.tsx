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
  first_name: string | null
  last_name: string | null
  full_name: string | null
}

export default function DashboardPage() {
  const router = useRouter()

  const [userEmail, setUserEmail] = useState('')
  const [carName, setCarName] = useState('')
  const [title, setTitle] = useState('')
  const [workerName, setWorkerName] = useState('Kenon')
  const [message, setMessage] = useState('')
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [priceInputs, setPriceInputs] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initPage = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        router.push('/login')
        return
      }

      setUserEmail(data.user.email || '')

      await Promise.all([fetchOrders(), fetchProfiles()])
      setLoading(false)
    }

    initPage()
  }, [router])

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage('Ошибка загрузки работ: ' + error.message)
      return
    }

    setOrders((data as WorkOrder[]) || [])
  }

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage('Ошибка загрузки пользователей: ' + error.message)
      return
    }

    setProfiles((data as Profile[]) || [])
  }

  const addOrder = async () => {
    if (!carName.trim() || !title.trim()) {
      setMessage('Заполните все поля')
      return
    }

    setMessage('')

    const { error } = await supabase.from('work_orders').insert([
      {
        car_name: carName.trim(),
        title: title.trim(),
        worker_name: workerName,
        status: 'planned',
      },
    ])

    if (error) {
      setMessage('Ошибка: ' + error.message)
      return
    }

    setCarName('')
    setTitle('')
    setWorkerName('Kenon')
    setMessage('Работа добавлена')

    await fetchOrders()
  }

  const finishOrder = async (id: number) => {
    const priceValue = Number(priceInputs[id] || '0')

    if (!priceValue || priceValue <= 0) {
      setMessage('Введите сумму больше 0')
      return
    }

    setMessage('')

    const { error } = await supabase
      .from('work_orders')
      .update({
        status: 'done',
        price: priceValue,
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setMessage('Ошибка: ' + error.message)
      return
    }

    setPriceInputs((prev) => ({
      ...prev,
      [id]: '',
    }))
    setMessage('Работа завершена')

    await fetchOrders()
  }

  const deleteOrder = async (id: number) => {
    setMessage('')

    const { error } = await supabase.from('work_orders').delete().eq('id', id)

    if (error) {
      setMessage('Ошибка: ' + error.message)
      return
    }

    setMessage('Работа удалена')
    await fetchOrders()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const totals = useMemo(() => {
    const doneOrders = orders.filter((order) => order.status === 'done')

    const kenonTotal = doneOrders
      .filter((order) => order.worker_name === 'Kenon')
      .reduce((sum, order) => sum + (order.price || 0), 0)

    const rostikTotal = doneOrders
      .filter((order) => order.worker_name === 'Rostik')
      .reduce((sum, order) => sum + (order.price || 0), 0)

    const total = kenonTotal + rostikTotal

    return {
      kenonTotal,
      rostikTotal,
      total,
    }
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

```
{/* HEADER */}
<div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
  <div>
    <h1 className="text-2xl font-bold">🚗 Bilservice</h1>
    <p className="text-sm text-white/50">Панель управления</p>
  </div>

  <div className="flex items-center gap-4">
    <span className="text-sm text-white/60">{userEmail}</span>

    <button
      onClick={logout}
      className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10"
    >
      Выйти
    </button>
  </div>
</div>

<div className="grid gap-6 p-6 md:grid-cols-3">

  {/* ДОХОД */}
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
    <h2 className="mb-4 text-xl font-semibold">💰 Доход</h2>

    <div className="space-y-2 text-lg">
      <p>Kenon: {totals.kenonTotal}</p>
      <p>Rostik: {totals.rostikTotal}</p>
      <p className="font-bold text-green-400">
        Итого: {totals.total}
      </p>
    </div>
  </div>

  {/* ДОБАВИТЬ РАБОТУ */}
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:col-span-2">
    <h2 className="mb-4 text-xl font-semibold">➕ Добавить работу</h2>

    <div className="grid gap-3 md:grid-cols-3">

      <div>
        <label htmlFor="carName" className="mb-1 block text-sm text-white/60">
          Машина
        </label>
        <input
          id="carName"
          type="text"
          placeholder="BMW X5"
          className="w-full rounded-lg border border-white/20 bg-black/40 p-3"
          value={carName}
          onChange={(e) => setCarName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm text-white/60">
          Что сделать
        </label>
        <input
          id="title"
          type="text"
          placeholder="Замена масла"
          className="w-full rounded-lg border border-white/20 bg-black/40 p-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="workerName" className="mb-1 block text-sm text-white/60">
          Работник
        </label>
        <select
          id="workerName"
          className="w-full rounded-lg border border-white/20 bg-black/40 p-3"
          value={workerName}
          onChange={(e) => setWorkerName(e.target.value)}
        >
          <option value="Kenon">Kenon</option>
          <option value="Rostik">Rostik</option>
        </select>
      </div>

    </div>

    <button
      onClick={addOrder}
      className="mt-4 w-full rounded-lg bg-white py-3 font-semibold text-black hover:opacity-80"
    >
      Добавить работу
    </button>

    {message && (
      <p className="mt-3 text-sm text-white/60">{message}</p>
    )}
  </div>

  {/* СПИСОК РАБОТ */}
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:col-span-2">
    <h2 className="mb-4 text-xl font-semibold">📋 Работы</h2>

    {orders.length === 0 ? (
      <p className="text-white/50">Пока нет работ</p>
    ) : (
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-white/10 bg-black/40 p-4"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-lg font-semibold">
                  {order.car_name || 'Без машины'}
                </p>
                <p className="text-white/70">
                  {order.title}
                </p>
                <p className="text-sm text-white/50">
                  {order.worker_name}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-white/60">
                  {order.status}
                </p>
                <p className="font-semibold text-green-400">
                  {order.price || 0}
                </p>
              </div>
            </div>

            {order.status !== 'done' && (
              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  placeholder="Сумма"
                  className="rounded-md bg-white p-2 text-black"
                  value={priceInputs[order.id] || ''}
                  onChange={(e) =>
                    setPriceInputs((prev) => ({
                      ...prev,
                      [order.id]: e.target.value,
                    }))
                  }
                />

                <button
                  onClick={() => finishOrder(order.id)}
                  className="rounded-md bg-green-600 px-4 py-2 text-white"
                >
                  ✔
                </button>
              </div>
            )}

            <button
              onClick={() => deleteOrder(order.id)}
              className="mt-3 text-sm text-red-400 hover:underline"
            >
              удалить
            </button>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* ПОЛЬЗОВАТЕЛИ */}
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
    <h2 className="mb-4 text-xl font-semibold">👤 Пользователи</h2>

    {profiles.length === 0 ? (
      <p className="text-white/50">Нет пользователей</p>
    ) : (
      <div className="flex flex-col gap-3">
        {profiles.map((p) => (
          <div key={p.id} className="text-sm">
            <p>{p.full_name || 'Без имени'}</p>
            <p className="text-white/40">{p.email}</p>
          </div>
        ))}
      </div>
    )}
  </div>

</div>
```

  </div>
  )
}
