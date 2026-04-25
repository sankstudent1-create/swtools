'use client'

import { useState } from 'react'

type FileRow = {
  id: string
  tool_id: string
  filename: string
  created_at: string
}

export default function FilesListClient({ files }: { files: FileRow[] }) {
  const [busyId, setBusyId] = useState<string | null>(null)

  const download = async (fileId: string) => {
    setBusyId(fileId)
    try {
      const res = await fetch('/api/files/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileId }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok) {
        alert(j?.error || 'Could not get download link')
        return
      }
      window.open(j.url, '_blank')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mt-3 space-y-2">
      {files.map(f => (
        <div key={f.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
          <div>
            <div className="text-sm font-medium">{f.filename}</div>
            <div className="text-xs text-white/50">{f.tool_id} • {new Date(f.created_at).toLocaleString()}</div>
          </div>
          <button className="ui-btn-secondary" onClick={() => download(f.id)} disabled={busyId === f.id}>
            {busyId === f.id ? 'Loading…' : 'Download'}
          </button>
        </div>
      ))}
      {files.length === 0 ? <div className="text-sm text-white/50">No files yet.</div> : null}
    </div>
  )
}
