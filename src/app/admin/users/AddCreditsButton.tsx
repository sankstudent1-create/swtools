'use client'

import { useState } from 'react'

export default function AddCreditsButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!confirm('Add 100 credits to this user?')) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users/add-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, credits: 100 }),
      })
      
      if (res.ok) {
        window.location.reload()
      } else {
        const j = await res.json()
        alert(j.error || 'Failed to add credits')
      }
    } catch (err) {
      alert('Error connecting to API')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
    >
      {loading ? '...' : '+100'}
    </button>
  )
}
