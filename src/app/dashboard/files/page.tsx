'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  FileText, Download, ExternalLink, Search, Filter, 
  LayoutDashboard, Wallet, Loader2, Clock, Zap
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
      {/* Sidebar - Pro Design */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#07090f]/80 backdrop-blur-2xl border-r border-white/[0.05] p-8 hidden lg:flex flex-col z-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <img src="/icon-192.png" alt="Logo" className="w-7 h-7" />
          </div>
          <div>
            <div className="font-black text-xl tracking-tighter">SW<span className="text-blue-500">TOOLS</span></div>
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Dashboard</div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-bold text-sm">Overview</span>
          </Link>
          <Link href="/dashboard/wallet" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Wallet className="w-5 h-5" />
            <span className="font-bold text-sm">Wallet & Billing</span>
          </Link>
          <Link href="/dashboard/files" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <FileText className="w-5 h-5" />
            <span className="font-bold text-sm">My Files</span>
          </Link>
          <div className="pt-8 pb-4 px-5">
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Premium Tools</div>
          </div>
          <Link href="/tools/letterpad-generator" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-sm">Letterpad Gen</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 lg:ml-72 p-6 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black mb-2 tracking-tighter">My <span className="text-indigo-500">Files</span></h1>
              <p className="text-white/40 font-medium">Access and re-download your generated documents.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 pr-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <div className="text-2xl font-black italic leading-none text-indigo-400">{files.length}</div>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Total Assets</div>
              </div>
            </div>
          </header>

          <div className="relative mb-10">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input 
              type="text" 
              placeholder="Filter by filename or tool..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-[1.8rem] py-5 pl-14 pr-6 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all font-medium text-white placeholder:text-white/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="py-24 flex justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              </div>
            ) : filteredFiles.length > 0 ? filteredFiles.map((file, i) => (
              <div key={i} className="group bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between hover:bg-white/[0.04] transition-all gap-6">
                <div className="flex items-center gap-6 flex-1 w-full overflow-hidden">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                    <FileText className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div className="overflow-hidden w-full">
                    <h3 className="font-black text-xl mb-1 truncate text-white/90">{file.file_name}</h3>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                      <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                        {file.tool_id.replace(/-/g, ' ')}
                      </span>
                      <span className="flex items-center gap-2 text-white/20">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(file.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => alert('Accessing secure download link...')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/10 hover:text-white transition-all text-white/60 font-black uppercase tracking-widest text-xs"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button 
                    className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 transition-all hover:text-black shadow-lg shadow-indigo-500/10"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-24 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                <FileText className="w-16 h-16 text-white/5 mx-auto mb-6" />
                <p className="text-white/20 font-black uppercase tracking-[0.2em] italic">No documents found matching your search</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
