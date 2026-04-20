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

    // 1. Создаём пользователя
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

    // 2. Добавляем профиль
    if (user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        },
      ])

      if (profileError) {
        setMessage(
          'Аккаунт создан, но профиль не сохранился: ' +
            profileError.message
        )
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">

        <h1 className="mb-2 text-3xl font-bold text-center">
          🚗 Bilservice
        </h1>

        <p className="mb-6 text-center text-white/60">
          Регистрация
        </p>

        <div className="flex flex-col gap-3">

          <input
            type="text"
            placeholder="Имя"
            className="rounded-lg border border-white/20 bg-black/40 p-3 focus:outline-none focus:ring-2 focus:ring-white/40"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Фамилия"
            className="rounded-lg border border-white/20 bg-black/40 p-3 focus:outline-none focus:ring-2 focus:ring-white/40"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="rounded-lg border border-white/20 bg-black/40 p-3 focus:outline-none focus:ring-2 focus:ring-white/40"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Пароль"
            className="rounded-lg border border-white/20 bg-black/40 p-3 focus:outline-none focus:ring-2 focus:ring-white/40"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleSignup}
            disabled={loading}
            className="mt-2 rounded-lg bg-white py-3 font-semibold text-black transition hover:opacity-80 disabled:opacity-40"
          >
            {loading ? 'Загрузка...' : 'Создать аккаунт'}
          </button>

          {message && (
            <p className="mt-2 text-center text-sm text-white/70">
              {message}
            </p>
          )}

          <p className="mt-4 text-center text-sm text-white/50">
            Уже есть аккаунт?{' '}
            <span
              onClick={() => router.push('/login')}
              className="cursor-pointer text-white underline"
            >
              Войти
            </span>
          </p>

        </div>
      </div>
    </div>
  )
}