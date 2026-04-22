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
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setMessage('Заполните все поля')
      return
    }

    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    })

    console.log('SIGNUP DATA:', data)
    console.log('SIGNUP ERROR:', error)

    if (error) {
      setMessage('Ошибка регистрации: ' + error.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setMessage('Пользователь не создался')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: data.user.id,
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`,
      },
    ])

    console.log('PROFILE ERROR:', profileError)

    if (profileError) {
      setMessage('Аккаунт создан, но профиль не сохранился: ' + profileError.message)
      setLoading(false)
      return
    }

    setMessage('Аккаунт создан. Проверьте email и потом войдите.')
    setLoading(false)

    setTimeout(() => {
      router.push('/login')
    }, 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="mb-2 text-center text-4xl font-bold">🚗 Bilservice</h1>
        <p className="mb-8 text-center text-white/60">Регистрация</p>

        <label htmlFor="firstName" className="mb-2 block text-sm text-white/70">
          Имя
        </label>
        <input
          id="firstName"
          type="text"
          placeholder="Введите имя"
          className="mb-4 w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <label htmlFor="lastName" className="mb-2 block text-sm text-white/70">
          Фамилия
        </label>
        <input
          id="lastName"
          type="text"
          placeholder="Введите фамилию"
          className="mb-4 w-full rounded-xl bg-white p-4 text-black outline-none placeholder:text-black/50"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

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
          onClick={handleSignup}
          disabled={loading}
          className="w-full rounded-xl bg-white py-4 text-xl font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Загрузка...' : 'Создать аккаунт'}
        </button>

        {message && (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/80">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-white/50">
          Уже есть аккаунт?{' '}
          <span
            onClick={() => router.push('/login')}
            className="cursor-pointer underline transition hover:text-white"
          >
            Войти
          </span>
        </p>
      </div>
    </div>
  )
}