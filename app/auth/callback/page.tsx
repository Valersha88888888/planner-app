'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function Callback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        router.push('/login')
        return
      }

      if (data.session) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      Проверка входа...
    </div>
  )
}