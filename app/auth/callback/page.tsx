'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function Callback() {
  const router = useRouter()

  useEffect(() => {
    const handleSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        router.push('/dashboard') // 👉 редірект
      } else {
        router.push('/login')
      }
    }

    handleSession()
  }, [router])

  return <p>Завантаження...</p>
}