'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback'
      }
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Перевір email 📩')
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <input
        type="email"
        placeholder="Email"
        className="border p-2"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-black text-white px-4 py-2"
      >
        {loading ? 'Зачекай...' : 'Увійти'}
      </button>

      <p>{message}</p>
    </div>
  )
}