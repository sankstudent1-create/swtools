"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, User, Shield, Bell, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-black mb-8">Account Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 space-y-2">
            <button className="w-full text-left p-4 rounded-xl bg-white/10 text-white font-bold flex items-center gap-3">
              <User className="w-5 h-5" />
              Profile
            </button>
            <button className="w-full text-left p-4 rounded-xl hover:bg-white/5 text-white/50 font-bold flex items-center gap-3 transition-colors">
              <Shield className="w-5 h-5" />
              Security
            </button>
            <button className="w-full text-left p-4 rounded-xl hover:bg-white/5 text-white/50 font-bold flex items-center gap-3 transition-colors">
              <Bell className="w-5 h-5" />
              Notifications
            </button>
          </div>

          <div className="col-span-2 bg-white/5 rounded-3xl p-8 border border-white/10">
            <h2 className="text-xl font-bold mb-6 italic uppercase tracking-tight">Personal Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Display Name</label>
                <input 
                  type="text" 
                  disabled 
                  placeholder="Loading profile..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  disabled 
                  placeholder="Loading profile..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white/50"
                />
              </div>
              <p className="text-xs text-white/30 italic">Profile editing is currently managed through Supabase Auth.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
