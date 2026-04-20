'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Заполните все поля')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage('Ошибка: ' + error.message)
      setLoading(false)
      return
    }

    // ✅ УСПІШНИЙ ЛОГІН → dashboard
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">

        <h1 className="mb-2 text-3xl font-bold text-center">
          🚗 Bilservice
        </h1>

        <p className="mb-6 text-center text-white/60">
          Вход
        </p>

        <div className="flex flex-col gap-3">

          <input
            type="email"
            placeholder="Email"
            className="rounded-lg border border-white/20 bg-black/40 p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Пароль"
            className="rounded-lg border border-white/20 bg-black/40 p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-2 rounded-lg bg-white py-3 font-semibold text-black"
          >
            {loading ? 'Загрузка...' : 'Войти'}
          </button>

          {message && (
            <p className="text-sm text-center text-white/70">
              {message}
            </p>
          )}

          <p className="text-center text-sm text-white/50 mt-4">
            Нет аккаунта?{' '}
            <p
  onClick={() => router.push('/reset-password')}
  className="text-sm text-center text-white/50 cursor-pointer underline"
>
  Забыли пароль?
</p>
            <span
              onClick={() => router.push('/signup')}
              className="cursor-pointer underline"
            >
              Регистрация
            </span>
          </p>

        </div>
      </div>
    </div>
  )
}