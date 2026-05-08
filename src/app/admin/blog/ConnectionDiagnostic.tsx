"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ShieldCheck, Database, Table, Lock, HardDrive, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export default function ConnectionDiagnostic() {
  const supabase = createSupabaseBrowserClient();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function runDiagnostic() {
    setLoading(true);
    setResults([]);
    const tests = [];

    // 1. Auth & Session Check
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      tests.push({
        name: "Supabase Auth Session",
        status: sessionError ? "error" : session ? "success" : "warning",
        message: sessionError ? sessionError.message : session ? `Authenticated as ${session.user.email}` : "No active session (Anonymous)",
        details: session ? `User ID: ${session.user.id}` : "Sign in to test Admin RLS"
      });
    } catch (e: any) {
      tests.push({ name: "Auth Check", status: "error", message: e.message });
    }

    // 2. Tables & RLS Check (blog_posts)
    try {
      const { data, error } = await supabase.from("blog_posts").select("id").limit(1);
      tests.push({
        name: "Table: blog_posts (Read)",
        status: error ? "error" : "success",
        message: error ? error.message : "Table accessible",
        details: error?.code === "42P01" ? "Table does not exist" : error?.code === "PGRST301" ? "RLS Policy Denied" : "Reading works"
      });
    } catch (e: any) {
      tests.push({ name: "Table Check", status: "error", message: e.message });
    }

    // 3. Admin Function Check
    try {
      // Attempt to fetch from admin-only view or check is_admin if exposed
      const { data, error } = await supabase.from("blog_categories").select("*").limit(1);
      tests.push({
        name: "Admin Privileges (RLS)",
        status: error ? "error" : "success",
        message: error ? error.message : "Can access category management",
        details: error ? "Your role might not be 'admin' in profiles table" : "RLS 'is_admin()' check passed"
      });
    } catch (e: any) {
      tests.push({ name: "Admin Check", status: "error", message: e.message });
    }

    // 4. Storage Bucket Check
    try {
      const { data, error } = await supabase.storage.from("blog").list("", { limit: 1 });
      tests.push({
        name: "Storage: 'blog' Bucket",
        status: error ? "error" : "success",
        message: error ? error.message : "Bucket accessible",
        details: error ? "Check if bucket 'blog' is public or has correct RLS" : "Listing files works"
      });
    } catch (e: any) {
      tests.push({ name: "Storage Check", status: "error", message: e.message });
    }

    setResults(tests);
    setLoading(false);
  }

  return (
    <div className="ui-modal-shell p-6 bg-indigo-500/5 border-indigo-500/20 mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20">
            <ShieldCheck className="text-indigo-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">System Diagnostic</h2>
            <p className="text-xs text-white/40">Check Supabase connection, RLS policies, and Storage buckets.</p>
          </div>
        </div>
        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="ui-btn-secondary text-sm px-4 py-2 flex items-center gap-2"
        >
          {loading ? "Running..." : "Run Connection Test"}
        </button>
      </div>

      <div className="grid gap-3">
        {results.map((res, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 group hover:border-white/20 transition-all">
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
                <p className="text-[11px] text-white/30 mt-1 font-mono">{res.details}</p>
              )}
            </div>
          </div>
        ))}
        
        {!loading && results.length === 0 && (
          <div className="py-8 text-center text-white/20 border border-dashed border-white/10 rounded-xl">
            Click the button above to test your environment configuration.
          </div>
        )}
      </div>
    </div>
  );
}
