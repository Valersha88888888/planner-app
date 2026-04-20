'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function SignupPage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      setMessage('Заполните все поля')
      return
    }

    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage('Ошибка: ' + error.message)
      setLoading(false)
      return
    }

    const user = data.user

    if (user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        },
      ])

      if (profileError) {
        setMessage('Аккаунт создан, но профиль не сохранился: ' + profileError.message)
        setLoading(false)
        return
      }
    }

    setMessage('Аккаунт создан. Теперь войдите.')
    setLoading(false)

    setTimeout(() => {
      router.push('/login')
    }, 1200)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-white/10 p-6">
        <h1 className="text-2xl font-semibold">Kenon & Rostik</h1>
        <p className="text-sm text-white/70">Регистрация</p>

        <input
          type="text"
          placeholder="Имя"
          className="rounded-md border border-white/20 bg-transparent p-3"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Фамилия"
          className="rounded-md border border-white/20 bg-transparent p-3"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="rounded-md border border-white/20 bg-transparent p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Пароль"
          className="rounded-md border border-white/20 bg-transparent p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="rounded-md bg-white px-4 py-3 text-black disabled:opacity-50"
        >
          {loading ? 'Загрузка...' : 'Создать аккаунт'}
        </button>

        {message && <p className="text-sm text-white/80">{message}</p>}
      </div>
    </div>
  )
}