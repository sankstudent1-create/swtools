'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  FileText, Download, ExternalLink, Search, Filter, 
  LayoutDashboard, Wallet, Loader2, Clock
} from 'lucide-react';
import Link from 'next/link';

export default function FilesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadFiles() {
      if (user) {
        const { data } = await supabase
          .from('user_files')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setFiles(data || []);
      }
      setLoading(false);
    }
    loadFiles();
  }, [user]);

  const filteredFiles = files.filter(f => 
    f.file_name.toLowerCase().includes(search.toLowerCase()) ||
    f.tool_id.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#07090f] border-r border-white/5 p-8 hidden lg:flex flex-col fixed h-full">
        <Link href="/dashboard" className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <img src="/icon-192.png" alt="Logo" className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl">SW<span className="text-white/40">Tools</span></span>
        </Link>
        <nav className="space-y-2 flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/dashboard/wallet" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
            <Wallet className="w-5 h-5" /> Wallet
          </Link>
          <Link href="/dashboard/files" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FileText className="w-5 h-5" /> My Files
          </Link>
        </nav>
      </aside>

      <main className="flex-1 lg:ml-72 p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-black mb-2 tracking-tight">My <span className="text-blue-500">Files</span></h1>
            <p className="text-white/40">Access and re-download your previously generated documents.</p>
          </header>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="text" 
                placeholder="Search files..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : filteredFiles.length > 0 ? filteredFiles.map((file, i) => (
              <div key={i} className="group bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-center justify-between hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-0.5">{file.file_name}</h3>
                    <div className="flex items-center gap-3 text-sm text-white/30">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/60">
                        {file.tool_id.replace(/-/g, ' ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(file.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => alert('Re-downloading is free since you already paid for this file.')}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/60 hover:text-white"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/30 font-medium">No files found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
