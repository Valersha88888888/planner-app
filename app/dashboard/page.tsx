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
    <div className="min-h-screen bg-black p-6 text-white">
      <h1 className="text-3xl font-bold">Kenon & Rostik</h1>
      <p className="text-white/70">Панель автосервиса</p>
      <p className="mb-4 text-white/50">Вы вошли как: {userEmail}</p>

      <button
        onClick={logout}
        className="mb-6 rounded-md border border-white/20 px-4 py-2"
      >
        Выйти
      </button>

      <div className="mb-8 rounded-2xl border border-white/10 p-6">
        <h2 className="mb-4 text-2xl font-bold">Добавить работу</h2>

        <label htmlFor="carName" className="mb-2 block text-white/70">
          Машина
        </label>
        <input
          id="carName"
          type="text"
          placeholder="Машина"
          className="mb-3 w-full rounded-md bg-white p-3 text-black"
          value={carName}
          onChange={(e) => setCarName(e.target.value)}
        />

        <label htmlFor="title" className="mb-2 block text-white/70">
          Что нужно сделать
        </label>
        <input
          id="title"
          type="text"
          placeholder="Что нужно сделать"
          className="mb-3 w-full rounded-md bg-white p-3 text-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="workerName" className="mb-2 block text-white/70">
          Кто выполняет работу
        </label>
        <select
          id="workerName"
          className="mb-3 w-full rounded-md bg-white p-3 text-black"
          value={workerName}
          onChange={(e) => setWorkerName(e.target.value)}
        >
          <option value="Kenon">Kenon</option>
          <option value="Rostik">Rostik</option>
        </select>

        <button
          onClick={addOrder}
          className="w-full rounded-md bg-white p-3 text-black"
        >
          Добавить
        </button>

        {message && <p className="mt-3 text-white/70">{message}</p>}
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 p-6">
        <h2 className="mb-4 text-2xl font-bold">Доход за месяц</h2>

        <div className="space-y-2 text-lg">
          <p>Kenon: {totals.kenonTotal}</p>
          <p>Rostik: {totals.rostikTotal}</p>
          <p className="font-bold">Итого: {totals.total}</p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 p-6">
        <h2 className="mb-4 text-2xl font-bold">Пользователи системы</h2>

        {profiles.length === 0 ? (
          <p className="text-white/50">Пока нет зарегистрированных пользователей</p>
        ) : (
          <div className="flex flex-col gap-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="rounded-xl border border-white/10 p-4"
              >
                <p className="font-semibold">
                  {profile.full_name || 'Без имени'}
                </p>
                <p className="text-sm text-white/50">{profile.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 p-6">
        <h2 className="mb-4 text-2xl font-bold">Список работ</h2>

        {orders.length === 0 ? (
          <p className="text-white/50">Пока нет работ</p>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-white/10 p-4"
              >
                <p className="text-lg font-semibold">
                  {order.car_name || 'Без названия машины'}
                </p>
                <p className="text-white/70">{order.title}</p>
                <p className="text-sm text-white/50">
                  Работник: {order.worker_name || 'не указан'}
                </p>
                <p className="text-sm text-white/50">
                  Статус: {order.status || 'не указан'}
                </p>
                <p className="text-sm text-white/50">
                  Сумма: {order.price || 0}
                </p>

                {order.status !== 'done' && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="number"
                      placeholder="Введите сумму"
                      className="rounded-md bg-white p-3 text-black"
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
                      className="rounded-md bg-green-600 px-4 py-3 text-white"
                    >
                      Завершить
                    </button>
                  </div>
                )}

                <button
                  onClick={() => deleteOrder(order.id)}
                  className="mt-3 rounded-md border border-red-500 px-4 py-2 text-red-400"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}