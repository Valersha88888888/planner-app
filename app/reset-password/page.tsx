'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleUpdate = async () => {
    if (!password.trim()) {
      setMessage('Введите пароль')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setMessage('Ошибка: ' + error.message)
      setLoading(false)
      return
    }

    setMessage('Пароль обновлен')

    setTimeout(() => {
      router.push('/login')
    }, 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="mb-2 text-center text-4xl font-bold">🔑 Новый пароль</h1>
        <p className="mb-8 text-center text-white/60">
          Введите новый пароль
        </p>

        <label className="mb-2 block text-sm text-white/70">
          Новый пароль
        </label>
        <input
          type="password"
          placeholder="Введите пароль"
          className="mb-6 w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full rounded-xl bg-white py-4 text-lg font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Сохранение...' : 'Сохранить пароль'}
        </button>

        {message && (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/80">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}