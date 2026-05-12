"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ShieldCheck, Database, Table, Lock, HardDrive, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Terminal } from "lucide-react";

export default function ConnectionDiagnostic() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [rawOutput, setRawOutput] = useState("");

  const addLog = useCallback((msg: string) => { 
    setRawOutput(prev => prev + `[${new Date().toLocaleTimeString()}] ${msg}\n`); 
  }, []);

  const addTestResult = useCallback((test: any) => {
    setResults(prev => [...prev, test]);
  }, []);

  const runDiagnostic = useCallback(async () => {
    setLoading(true);
    setResults([]);
    setRawOutput(`[${new Date().toLocaleTimeString()}] Starting Diagnostic Log...\n`);

    // 0. Env Check
    addLog("Checking environment variables...");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      addLog(`CRITICAL: Missing environment variables! URL: ${!!url}, Key: ${!!key}`);
      addTestResult({
        name: "Environment Variables",
        status: "error",
        message: "Supabase URL or Anon Key missing",
        details: "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel."
      });
      setLoading(false);
      return;
    }
    addLog(`Env vars present. URL: ${url.substring(0, 15)}...`);

    // 0.1 Network Check
    try {
      addLog("Testing network connectivity to Supabase URL...");
      const start = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${url}/rest/v1/`, { 
        method: "GET", 
        headers: { "apikey": key },
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      addLog(`Network check success (${Date.now() - start}ms) - Status: ${response.status}`);
      if (!response.ok) {
        addLog(`Network warning: Response not OK (${response.status})`);
      }
    } catch (e: any) {
      addLog(`Network check failed: ${e.message}`);
      addTestResult({
        name: "Network Connectivity",
        status: "error",
        message: "Cannot reach Supabase API",
        details: "This is likely a network issue or an incorrect Supabase URL."
      });
    }

    // 1. Auth & Session Check
    try {
      addLog("Calling supabase.auth.getSession()...");
      const sessionPromise = supabase.auth.getSession();
      
      // Add a timeout to the session promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Supabase Auth Timeout (10s)")), 10000)
      );

      const { data: { session }, error: sessionError } = await (Promise.race([sessionPromise, timeoutPromise]) as any);
      
      if (sessionError) throw sessionError;
      
      addTestResult({
        name: "Supabase Auth Session",
        status: session ? "success" : "warning",
        message: session ? `Authenticated as ${session.user.email}` : "No active session (Anonymous)",
        details: session ? `User ID: ${session.user.id}` : "Sign in as Admin to manage blog"
      });
      if (session) addLog(`Auth success: ${session.user.id}`);
      else addLog("Auth warning: No session found");
    } catch (e: any) {
      addLog(`Auth error: ${e.message}`);
      addTestResult({ name: "Auth Check", status: "error", message: e.message });
    }

    // 2. Profile Role Check
    try {
      addLog("Checking user role in profiles...");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        
        if (profileError) throw profileError;
        
        const isAdmin = profile?.role === "admin";
        addTestResult({
          name: "User Profile Role",
          status: isAdmin ? "success" : "warning",
          message: profile ? `Current Role: ${profile.role}` : "Profile not found",
          details: isAdmin ? "Admin verified" : "You need 'admin' role in profiles table"
        });
        addLog(`Profile found: role=${profile?.role}`);

        // 2.1 RPC Function Check (Inside user check)
        addLog("Testing public.is_admin() function via RPC...");
        const { data: rpcIsAdmin, error: rpcError } = await supabase.rpc('is_admin');
        
        if (rpcError) {
          addLog(`RPC Error: ${rpcError.code} - ${rpcError.message}`);
          addTestResult({
            name: "Admin Function (RPC)",
            status: "error",
            message: rpcError.message,
            details: "The is_admin() function might be missing or broken. Check supabase_blog.sql."
          });
        } else {
          addLog(`RPC Result: ${rpcIsAdmin}`);
          addTestResult({
            name: "Admin Function (RPC)",
            status: rpcIsAdmin ? "success" : "warning",
            message: rpcIsAdmin ? "is_admin() returned TRUE" : "is_admin() returned FALSE",
            details: rpcIsAdmin ? "Database function is working correctly" : "User is not recognized as admin by the database function."
          });
        }
      } else {
        addLog("No user found, skipping profile and RPC checks");
        addTestResult({
          name: "User Auth Session",
          status: "warning",
          message: "No active session (Anonymous)",
          details: "Sign in as Admin to manage blog"
        });
      }
    } catch (e: any) {
      addLog(`Profile/RPC check error: ${e.message}`);
    }

    // 3. Storage Bucket Check
    try {
      addLog("Checking 'blog' storage bucket...");
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        addLog(`Bucket error: ${bucketError.message}`);
        addTestResult({
          name: "Storage: Blog Bucket",
          status: "error",
          message: "Could not list buckets",
          details: bucketError.message
        });
      } else {
        const blogBucket = buckets?.find(b => b.id === 'blog');
        addLog(`Bucket 'blog' exists: ${!!blogBucket}`);
        addTestResult({
          name: "Storage: Blog Bucket",
          status: blogBucket ? "success" : "error",
          message: blogBucket ? "Blog bucket exists" : "Blog bucket missing",
          details: blogBucket ? (blogBucket.public ? "Bucket is public" : "Bucket is private (warning)") : "Run migration to create storage bucket."
        });
      }
    } catch (e: any) {
      addLog(`Storage check error: ${e.message}`);
    }

    // 4. Table Structure Check
    const tables = ["blog_posts", "blog_categories", "blog_comments"];
    for (const table of tables) {
      try {
        addLog(`Testing read access on ${table}...`);
        const { error } = await supabase.from(table).select("id").limit(1);
        if (error) {
          addLog(`Read error on ${table}: ${error.code} - ${error.message}`);
          addTestResult({
            name: `Table: ${table}`,
            status: "error",
            message: error.message,
            details: error.code === "42P01" ? "Table missing! Run migration." : `Error Code: ${error.code}`
          });
        } else {
          addLog(`Read success on ${table}`);
          addTestResult({
            name: `Table: ${table}`,
            status: "success",
            message: "Table exists and is readable"
          });
        }
      } catch (e: any) {
        addLog(`Critical error testing ${table}: ${e.message}`);
      }
    }

    // 4. Admin Function Check (Try an update)
    try {
      addLog("Testing write permissions (dry-run)...");
      const writePromise = supabase
        .from("blog_categories")
        .update({ name: "test" })
        .eq("id", "00000000-0000-0000-0000-000000000000")
        .select("id")
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Write Test Timeout (10s)")), 10000)
      );

      const { error } = await (Promise.race([writePromise, timeoutPromise]) as any);
        
      if (error && (error.code === "PGRST301" || error.code === "42501")) {
        addLog("Write blocked by RLS policy");
        addTestResult({
          name: "Admin Permissions",
          status: "error",
          message: "Write access denied by RLS",
          details: "You are logged in but do not have 'admin' role in the profiles table."
        });
      } else {
        addLog("Write check passed (dry-run)");
        addTestResult({
          name: "Admin Permissions",
          status: "success",
          message: "Write permissions verified"
        });
      }
    } catch (e: any) {
      addLog(`Write check error: ${e.message}`);
      addTestResult({
        name: "Admin Permissions",
        status: "error",
        message: e.message,
        details: "The write test timed out or failed critically."
      });
    }

    setLoading(false);
  }, [supabase, addLog, addTestResult]);

  // Diagnostic runs only when user clicks "Run Test" — not on mount

  return (
    <div className="ui-modal-shell p-6 bg-indigo-500/5 border-indigo-500/20 mb-10 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20">
            <ShieldCheck className="text-indigo-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">System Status</h2>
            <p className="text-xs text-white/40">Diagnostic check for Blog functionality.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white transition-all"
            title="Show Logs"
          >
            <Terminal size={18} />
          </button>
          <button
            onClick={async () => {
              addLog("Signing out...");
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
            title="Sign Out"
          >
            <Lock size={18} />
          </button>
          <button
            onClick={runDiagnostic}
            disabled={loading}
            className="ui-btn-secondary text-sm px-4 py-2 flex items-center gap-2 group"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
            {loading ? "Diagnosing..." : "Run Test"}
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {results.map((res, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
            <div className="mt-1">
              {res.status === "success" && <CheckCircle2 className="text-emerald-400" size={18} />}
              {res.status === "warning" && <AlertTriangle className="text-orange-400" size={18} />}
              {res.status === "error" && <XCircle className="text-rose-400" size={18} />}
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white/80">{res.name}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  res.status === "success" ? "bg-emerald-500/10 text-emerald-400" :
                  res.status === "warning" ? "bg-orange-500/10 text-orange-400" :
                  "bg-rose-500/10 text-rose-400"
                }`}>
                  {res.status}
                </span>
              </div>
              <p className="text-sm text-white/60 mt-1">{res.message}</p>
              {res.details && (
                <p className="text-[11px] text-white/30 mt-1 font-mono bg-black/30 p-2 rounded border border-white/5">{res.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showRaw && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-white/30">Raw Console Logs</span>
            <button onClick={() => setRawOutput("")} className="text-[10px] text-white/20 hover:text-white">Clear</button>
          </div>
          <pre className="bg-black/40 p-4 rounded-xl border border-white/10 text-[10px] font-mono text-indigo-300/80 overflow-x-auto max-h-40 overflow-y-auto">
            {rawOutput || "No logs yet..."}
          </pre>
        </div>
      )}

      {results.some(r => r.status === "error") && (
        <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 animate-pulse">
          <p className="text-xs text-rose-400">
            <span className="font-bold uppercase mr-2">Error Detected:</span>
            One or more components are not working. Please run the <code className="bg-black/40 px-1 rounded">supabase_blog.sql</code> migration in your Supabase Dashboard to fix this.
          </p>
        </div>
      )}
    </div>
  );
}
