'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const router = useRouter()
 

  const handleUpdate = async () => {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (!error) {
      router.push('/login')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-6 border border-white/10 rounded-xl">
        <h1 className="text-xl mb-4">Новый пароль</h1>

        <input
          type="password"
          placeholder="Новый пароль"
          className="w-full p-3 mb-3 bg-white text-black rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleUpdate}
          className="w-full bg-white text-black p-3 rounded-md"
        >
          Сохранить
        </button>
      </div>
    </div>
  )
}