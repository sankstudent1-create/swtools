'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';

const InteractiveEditor = dynamic(
  () => import('@/components/pdf-editor/InteractiveEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-white/50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-white/40 border-r-2 mb-4"></div>
        <p className="text-sm font-medium">Loading editor workspace...</p>
      </div>
    )
  }
);

export default function PdfEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="h-screen bg-[#07090f] flex flex-col pt-[72px] font-sans text-white overflow-hidden">
      <style>{`
        .react-pdf__Page__textContent span {
          cursor: pointer !important;
        }
        .react-pdf__Page__textContent span:hover {
          background: rgba(37, 99, 235, 0.08) !important;
          border-radius: 2px;
        }
        .react-pdf__Page__textContent span[data-hidden-id] {
          visibility: hidden !important;
        }
      `}</style>

      {!file ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="ui-upload-dropzone p-20 flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input type="file" accept="application/pdf" hidden ref={fileInputRef} onChange={handleUpload} />
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
              <Plus className="w-10 h-10 text-[var(--brand-orange)]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Upload PDF to Edit</h1>
            <p className="text-white/40 text-sm">Pixel-perfect text editing & pro tools</p>
          </div>
        </div>
      ) : (
        <InteractiveEditor file={file} onClose={() => setFile(null)} />
      )}
    </div>
  );
}

