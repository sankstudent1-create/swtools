"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ShieldCheck, Database, Table, Lock, HardDrive, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Terminal } from "lucide-react";

export default function ConnectionDiagnostic() {
  const supabase = createSupabaseBrowserClient();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [rawOutput, setRawOutput] = useState("");

  const runDiagnostic = useCallback(async () => {
    setLoading(true);
    setResults([]);
    let log = "Starting Diagnostic Log...\n";

    const addLog = (msg: string) => { 
      log += `[${new Date().toLocaleTimeString()}] ${msg}\n`; 
      setRawOutput(log); 
    };

    const addTestResult = (test: any) => {
      setResults(prev => [...prev, test]);
    };

    // 1. Auth & Session Check
    try {
      addLog("Checking auth session...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
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
      } else {
        addLog("No user found, skipping profile check");
      }
    } catch (e: any) {
      addLog(`Profile check error: ${e.message}`);
      addTestResult({ name: "Profile Check", status: "error", message: e.message });
    }

    // 3. Table Structure Check
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
      const { error } = await supabase
        .from("blog_categories")
        .update({ name: "test" })
        .eq("id", "00000000-0000-0000-0000-000000000000")
        .select("id")
        .single();
        
      if (error && error.code === "PGRST301") {
        addLog("Write blocked by RLS policy");
        addTestResult({
          name: "Admin Permissions",
          status: "error",
          message: "Write access denied by RLS",
          details: "is_admin() check failed or policy missing"
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
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    runDiagnostic();
  }, [runDiagnostic]);

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
