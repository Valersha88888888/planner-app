'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://planner-app-umber.vercel.app/update-password',
    })

    if (error) {
      setMessage('Ошибка: ' + error.message)
    } else {
      setMessage('Проверьте email для восстановления пароля')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-6 border border-white/10 rounded-xl">
        <h1 className="text-xl mb-4">Восстановление пароля</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-3 bg-white text-black rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleReset}
          className="w-full bg-white text-black p-3 rounded-md"
        >
          Отправить
        </button>

        {message && <p className="mt-3 text-sm">{message}</p>}
      </div>
    </div>
  )
}