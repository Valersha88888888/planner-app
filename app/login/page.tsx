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
    if (!email.trim() || !password.trim()) {
      setMessage('Заполните все поля')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })

    if (error) {
      setMessage('Ошибка: ' + error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="mb-2 text-center text-4xl font-bold">🚗 Bilservice</h1>
        <p className="mb-8 text-center text-white/60">Вход</p>

        <label htmlFor="email" className="mb-2 block text-sm text-white/70">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Введите email"
          className="mb-4 w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password" className="mb-2 block text-sm text-white/70">
          Пароль
        </label>
        <input
          id="password"
          type="password"
          placeholder="Введите пароль"
          className="mb-6 w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-xl bg-white py-4 text-xl font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Загрузка...' : 'Войти'}
        </button>

        {message && (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/80">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-white/50">
          Нет аккаунта?{' '}
          <span
            onClick={() => router.push('/signup')}
            className="cursor-pointer underline transition hover:text-white"
          >
            Регистрация
          </span>
        </p>

        <p className="mt-2 text-center text-sm text-white/50">
          <span
            onClick={() => router.push('/reset-password')}
            className="cursor-pointer underline transition hover:text-white"
          >
            Забыли пароль?
          </span>
        </p>
      </div>
    </div>
  )
}