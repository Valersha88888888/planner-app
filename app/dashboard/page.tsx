'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

type WorkOrder = {
  id: number
  car_name: string | null
  title: string | null
  assigned_to: string | null
  contact_name: string | null
  contact_phone: string | null
  license_plate: string | null
  model: string | null
  color: string | null
  status: string | null
  price: number | null
  completed_at?: string | null
  before_images?: string[] | null
  after_images?: string[] | null
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
  assigned_to: string | null
  contact_name: string | null
  contact_phone: string | null
  license_plate: string | null
  model: string | null
  color: string | null
}

export default function DashboardPage() {
  const router = useRouter()

  const beforeInputRef = useRef<HTMLInputElement | null>(null)
  const afterInputRef = useRef<HTMLInputElement | null>(null)

  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [priceInputs, setPriceInputs] = useState<Record<number, string>>({})

  const [carName, setCarName] = useState('')
  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState('Kanan')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [model, setModel] = useState('')
  const [color, setColor] = useState('')

  const [beforeFiles, setBeforeFiles] = useState<FileList | null>(null)
  const [afterFiles, setAfterFiles] = useState<FileList | null>(null)

  const [planText, setPlanText] = useState('')
  const [planDate, setPlanDate] = useState('')
  const [planAssignedTo, setPlanAssignedTo] = useState('Kanan')
  const [planContactName, setPlanContactName] = useState('')
  const [planContactPhone, setPlanContactPhone] = useState('')
  const [planLicensePlate, setPlanLicensePlate] = useState('')
  const [planModel, setPlanModel] = useState('')
  const [planColor, setPlanColor] = useState('')

  const [search, setSearch] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        router.push('/login')
        return
      }

      setUserEmail(data.user.email || '')

      await Promise.all([fetchOrders(), fetchProfiles(), fetchPlans()])
      setLoading(false)
    }

    init()
  }, [router])

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('ORDERS:', data)

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
      .order('email', { ascending: true })

    console.log('PROFILES:', data)

    if (error) {
      setMessage('Ошибка загрузки пользователей: ' + error.message)
      return
    }

    setProfiles((data as Profile[]) || [])
  }

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('date', { ascending: true })

    console.log('PLANS:', data)

    if (error) {
      setMessage('Ошибка загрузки планов: ' + error.message)
      return
    }

    setPlans((data as Plan[]) || [])
  }

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return []

    const urls: string[] = []

    for (const file of Array.from(files)) {
      const originalName = file.name.toLowerCase()
      const extension = originalName.includes('.')
        ? originalName.split('.').pop()
        : 'jpg'

      const safeBaseName = originalName
        .replace(/\.[^/.]+$/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeBaseName || 'image'}.${extension}`

      const { error } = await supabase.storage
        .from('car-images')
        .upload(fileName, file)

      if (error) {
        throw new Error('Ошибка загрузки изображения: ' + error.message)
      }

      const { data } = supabase.storage.from('car-images').getPublicUrl(fileName)
      urls.push(data.publicUrl)
    }

    return urls
  }

  const addOrder = async () => {
    if (!carName.trim() || !title.trim()) {
      setMessage('Заполните обязательные поля')
      return
    }

    try {
      setMessage('')

      const beforeUrls = await uploadImages(beforeFiles)
      const afterUrls = await uploadImages(afterFiles)

      console.log('beforeUrls:', beforeUrls)
      console.log('afterUrls:', afterUrls)

      const payload = {
        car_name: carName.trim(),
        title: title.trim(),
        assigned_to: assignedTo,
        contact_name: contactName.trim(),
        contact_phone: contactPhone.trim(),
        license_plate: licensePlate.trim(),
        model: model.trim(),
        color: color.trim(),
        status: 'planned',
        before_images: beforeUrls,
        after_images: afterUrls,
      }

      console.log('INSERT PAYLOAD:', payload)

      const { data, error } = await supabase
        .from('work_orders')
        .insert([payload])
        .select()

      console.log('INSERT DATA:', data)
      console.log('INSERT ERROR:', error)

      if (error) {
        setMessage('Ошибка добавления работы: ' + error.message)
        return
      }

      setCarName('')
      setTitle('')
      setAssignedTo('Kanon')
      setContactName('')
      setContactPhone('')
      setLicensePlate('')
      setModel('')
      setColor('')
      setBeforeFiles(null)
      setAfterFiles(null)

      if (beforeInputRef.current) {
        beforeInputRef.current.value = ''
      }

      if (afterInputRef.current) {
        afterInputRef.current.value = ''
      }

      setMessage('Работа добавлена')
      await fetchOrders()
    } catch (err) {
      console.log('ADD ORDER CATCH:', err)
      setMessage(err instanceof Error ? err.message : 'Ошибка загрузки изображений')
    }
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
      setMessage('Ошибка завершения работы: ' + error.message)
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
      setMessage('Ошибка удаления: ' + error.message)
      return
    }

    setMessage('Работа удалена')
    await fetchOrders()
  }

  const deletePlan = async (id: string) => {
    setMessage('')

    const { error } = await supabase.from('plans').delete().eq('id', id)

    if (error) {
      setMessage('Ошибка удаления плана: ' + error.message)
      return
    }

    setMessage('План удален')
    await fetchPlans()
  }

  const addPlan = async () => {
    if (!planText.trim() || !planDate) {
      setMessage('Заполните план и дату')
      return
    }

    setMessage('')

    const { error } = await supabase.from('plans').insert([
      {
        title: planText.trim(),
        date: planDate,
        assigned_to: planAssignedTo,
        contact_name: planContactName.trim(),
        contact_phone: planContactPhone.trim(),
        license_plate: planLicensePlate.trim(),
        model: planModel.trim(),
        color: planColor.trim(),
      },
    ])

    console.log('PLAN INSERT ERROR:', error)

    if (error) {
      setMessage('Ошибка добавления плана: ' + error.message)
      return
    }

    setPlanText('')
    setPlanDate('')
    setPlanAssignedTo('Kanan')
    setPlanContactName('')
    setPlanContactPhone('')
    setPlanLicensePlate('')
    setPlanModel('')
    setPlanColor('')
    setMessage('План добавлен')
    await fetchPlans()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const totals = useMemo(() => {
    const doneOrders = orders.filter((o) => o.status === 'done')

    const kenon = doneOrders
      .filter((o) => o.assigned_to === 'Kanan')
      .reduce((sum, o) => sum + (o.price || 0), 0)

    const rostik = doneOrders
      .filter((o) => o.assigned_to === 'Rostik')
      .reduce((sum, o) => sum + (o.price || 0), 0)

    return {
      kenon,
      rostik,
      total: kenon + rostik,
    }
  }, [orders])

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return orders

    return orders.filter((order) => {
      return (
        (order.car_name || '').toLowerCase().includes(q) ||
        (order.title || '').toLowerCase().includes(q) ||
        (order.assigned_to || '').toLowerCase().includes(q) ||
        (order.contact_name || '').toLowerCase().includes(q) ||
        (order.contact_phone || '').toLowerCase().includes(q) ||
        (order.license_plate || '').toLowerCase().includes(q) ||
        (order.model || '').toLowerCase().includes(q) ||
        (order.color || '').toLowerCase().includes(q) ||
        (order.status || '').toLowerCase().includes(q)
      )
    })
  }, [orders, search])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">🚗 Bilservice</h1>
            <p className="text-xs text-white/30">Панель управления автосервисом</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-white/70 md:block">{userEmail}</span>
            <button
              onClick={logout}
              className="rounded-xl border border-white/20 px-5 py-3 font-semibold transition hover:bg-white/10"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 p-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="mb-6 text-2xl font-bold">Доход</h2>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-white/50">Kanan</p>
              <p className="mt-1 text-2xl font-bold">{totals.kenon}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-white/50">Rostik</p>
              <p className="mt-1 text-2xl font-bold">{totals.rostik}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-white/50">Итого</p>
              <p className="mt-1 text-3xl font-bold text-green-400">{totals.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:col-span-2">
          <h2 className="mb-6 text-2xl font-bold">Добавить работу</h2>
          <p className="mb-4 text-sm text-white/50">
            Заполните информацию о машине, работе и клиенте
          </p>

          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Информация о машине</h3>

            <div className="grid gap-4 md:grid-cols-2">
               
              <div>
                <label htmlFor="carName" className="mb-2 block text-sm text-white/70">
                  Машина
                </label>
                <input
                  id="carName"
                  type="text"
                  value={carName}
                  onChange={(e) => setCarName(e.target.value)}
                  className="block w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
                />
              </div>
              

              <div>
                <label htmlFor="licensePlate" className="mb-2 block text-sm text-white/70">
                  Номер машины
                </label>
                <input
                  id="licensePlate"
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  className="w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
                />
              </div>

              <div>
                <label htmlFor="model" className="mb-2 block text-sm text-white/70">
                  Модель
                </label>
                <input
                  id="model"
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
                />
              </div>

              <div>
                <label htmlFor="color" className="mb-2 block text-sm text-white/70">
                  Цвет
                </label>
                <input
                  id="color"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Информация о работе</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="title" className="mb-2 block text-sm text-white/70">
                  Работа
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
                />
              </div>
              <div>
                <label htmlFor="color" className="mb-2 block text-sm text-white/70">
                  Цена за запчасти
                </label>
                <input
                  id="color"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
                />
              </div>

              <div>
                <label htmlFor="assignedTo" className="mb-2 block text-sm text-white/70">
                  Кто делает работу
                </label>
                <select
                  id="assignedTo"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full rounded-xl bg-white p-4 text-black outline-none"
                >
                  <option value="Kenon">Kanan</option>
                  <option value="Rostik">Rostik</option>
                </select>
              </div>

              <div>
                <label htmlFor="contactName" className="mb-2 block text-sm text-white/70">
                  Контактное лицо
                </label>
                <input
                  id="contactName"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="mb-2 block text-sm text-white/70">
                  Телефон
                </label>
                <input
                  id="contactPhone"
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Фото до и после сервиса</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-dashed border-white/20 bg-black/20 p-4">
                <label htmlFor="beforeImages" className="mb-2 block text-sm text-white/70">
                  Фото до сервиса
                </label>
                <input
                  ref={beforeInputRef}
                  id="beforeImages"
                  type="file"
                  multiple
                  onChange={(e) => setBeforeFiles(e.target.files)}
                  className="w-full rounded-xl bg-white p-4 text-black outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-white"
                />
              </div>

              <div className="rounded-2xl border border-dashed border-white/20 bg-black/20 p-4">
                <label htmlFor="afterImages" className="mb-2 block text-sm text-white/70">
                  Фото после сервиса
                </label>
                <input
                  ref={afterInputRef}
                  id="afterImages"
                  type="file"
                  multiple
                  onChange={(e) => setAfterFiles(e.target.files)}
                  className="w-full rounded-xl bg-white p-4 text-black outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-white"
                />
              </div>
            </div>
          </div>

          <button
            onClick={addOrder}
            className="mt-2 w-full rounded-2xl bg-white py-4 text-lg font-semibold text-black transition hover:opacity-90"
          >
            Добавить
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:col-span-3">
          <h2 className="mb-4 text-2xl font-bold">Поиск машины</h2>
          <p className="mb-4 text-sm text-white/50">
            Поиск по номеру, модели, цвету, названию машины, контакту или работе
          </p>

          <input
            id="search"
            type="text"
            placeholder="Например: ABC123, BMW, черный, замена масла"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-white p-4 text-black outline-none placeholder:text-black/50"
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="mb-6 text-2xl font-bold">Планировщик</h2>

          <div className="grid gap-4">
            <div>
              <label htmlFor="planText" className="mb-2 block text-sm text-white/70">
                Что сделать
              </label>
              <input
                id="planText"
                type="text"
                value={planText}
                onChange={(e) => setPlanText(e.target.value)}
                className="w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
              />
            </div>

            <div>
              <label htmlFor="planDate" className="mb-2 block text-sm text-white/70">
                Дата
              </label>
              <input
                id="planDate"
                type="date"
                value={planDate}
                onChange={(e) => setPlanDate(e.target.value)}
                className="w-full rounded-xl bg-white p-4 text-black outline-none"
              />
            </div>

            <div>
              <label htmlFor="planAssignedTo" className="mb-2 block text-sm text-white/70">
                Кто делает
              </label>
              <select
                id="planAssignedTo"
                value={planAssignedTo}
                onChange={(e) => setPlanAssignedTo(e.target.value)}
                className="w-full rounded-xl bg-white p-4 text-black outline-none"
              >
                <option value="Kenon">Kanan</option>
                <option value="Rostik">Rostik</option>
              </select>
            </div>

            <div>
              <label htmlFor="planContactName" className="mb-2 block text-sm text-white/70">
                Контактное лицо
              </label>
              <input
                id="planContactName"
                type="text"
                value={planContactName}
                onChange={(e) => setPlanContactName(e.target.value)}
                className="w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
              />
            </div>

            <div>
              <label htmlFor="planContactPhone" className="mb-2 block text-sm text-white/70">
                Телефон
              </label>
              <input
                id="planContactPhone"
                type="text"
                value={planContactPhone}
                onChange={(e) => setPlanContactPhone(e.target.value)}
                className="w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
              />
            </div>

            <div>
              <label htmlFor="planLicensePlate" className="mb-2 block text-sm text-white/70">
                Номер машины
              </label>
              <input
                id="planLicensePlate"
                type="text"
                value={planLicensePlate}
                onChange={(e) => setPlanLicensePlate(e.target.value)}
                className="w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
              />
            </div>

            <div>
              <label htmlFor="planModel" className="mb-2 block text-sm text-white/70">
                Модель
              </label>
              <input
                id="planModel"
                type="text"
                value={planModel}
                onChange={(e) => setPlanModel(e.target.value)}
                className="w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
              />
            </div>

            <div>
              <label htmlFor="planColor" className="mb-2 block text-sm text-white/70">
                Цвет
              </label>
              <input
                id="planColor"
                type="text"
                value={planColor}
                onChange={(e) => setPlanColor(e.target.value)}
                className="w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
              />
            </div>
          </div>

          <button
            onClick={addPlan}
            className="mt-6 w-full rounded-2xl bg-white py-4 text-lg font-semibold text-black transition hover:opacity-90"
          >
            Добавить
          </button>

          <div className="mt-6 space-y-3">
            {plans.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/50">
                Планов пока нет
              </p>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <p className="font-semibold">{plan.title}</p>
                  <p className="text-sm text-white/60">{plan.date}</p>
                  <p className="text-sm text-white/60">
                    Кто делает: {plan.assigned_to || 'не указано'}
                  </p>
                  <p className="text-sm text-white/60">
                    Контакт: {plan.contact_name || 'не указан'}
                  </p>
                  <p className="text-sm text-white/60">
                    Телефон: {plan.contact_phone || 'не указан'}
                  </p>
                  <p className="text-sm text-white/60">
                    Номер: {plan.license_plate || 'не указан'}
                  </p>
                  <p className="text-sm text-white/60">
                    Модель: {plan.model || 'не указана'}
                  </p>
                  <p className="text-sm text-white/60">
                    Цвет: {plan.color || 'не указан'}
                  </p>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="mt-4 rounded-2xl border border-red-500 px-4 py-2 text-red-400 transition hover:bg-red-500/10"
                  >
                    Удалить
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:col-span-2">
          <h2 className="mb-6 text-2xl font-bold">Список работ</h2>

          {filteredOrders.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/50">
              Работы пока не найдены
            </p>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold">
                        {order.car_name || 'Без названия'}
                      </p>
                      <p className="text-white/70">{order.title || 'Без описания'}</p>
                      <p className="text-sm text-white/50">
                        Кто делает: {order.assigned_to || 'не указано'}
                      </p>
                      <p className="text-sm text-white/50">
                        Контакт: {order.contact_name || 'не указан'}
                      </p>
                      <p className="text-sm text-white/50">
                        Телефон: {order.contact_phone || 'не указан'}
                      </p>
                      <p className="text-sm text-white/50">
                        Номер: {order.license_plate || 'не указан'}
                      </p>
                      <p className="text-sm text-white/50">
                        Модель: {order.model || 'не указана'}
                      </p>
                      <p className="text-sm text-white/50">
                        Цвет: {order.color || 'не указан'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium">
                        {order.status || 'не указан'}
                      </span>
                      <p className="mt-3 text-sm text-white/50">Сумма</p>
                      <p className="text-2xl font-bold text-green-400">
                        {order.price || 0}
                      </p>
                    </div>
                  </div>

                  {order.before_images && order.before_images.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm text-white/60">Фото до сервиса</p>
                      <div className="flex flex-wrap gap-3">
                        {order.before_images.map((img, index) => (
                          <img
                            key={`before-${index}`}
                            src={img}
                            alt="Before service"
                            className="h-24 w-24 rounded-xl object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {order.after_images && order.after_images.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm text-white/60">Фото после сервиса</p>
                      <div className="flex flex-wrap gap-3">
                        {order.after_images.map((img, index) => (
                          <img
                            key={`after-${index}`}
                            src={img}
                            alt="After service"
                            className="h-24 w-24 rounded-xl object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {order.status !== 'done' && (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input
                        type="number"
                        placeholder="Введите сумму"
                        value={priceInputs[order.id] || ''}
                        onChange={(e) =>
                          setPriceInputs((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        className="rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
                      />

                      <button
                        onClick={() => finishOrder(order.id)}
                        className="rounded-2xl bg-green-600 px-6 py-4 font-semibold text-white transition hover:bg-green-500"
                      >
                        Завершить
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="mt-4 rounded-2xl border border-red-500 px-4 py-2 text-red-400 transition hover:bg-red-500/10"
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:col-span-3">
          <h2 className="mb-4 text-2xl font-bold">Пользователи</h2>

          {profiles.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/50">
              Пользователей пока нет
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <p className="font-semibold">{profile.full_name || 'Без имени'}</p>
                  <p className="text-sm text-white/60">{profile.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {message && (
          <div className="md:col-span-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-white">
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}