"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Mail, HelpCircle, PhoneCall } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-black mb-8">Support Center</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group">
            <MessageSquare className="w-8 h-8 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-black italic uppercase tracking-tighter mb-2">Live Chat</h2>
            <p className="text-sm text-white/50 mb-6">Our average response time is under 15 minutes during business hours.</p>
            <button className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition-colors">
              Start Conversation
            </button>
          </div>

          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group">
            <Mail className="w-8 h-8 text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-black italic uppercase tracking-tighter mb-2">Email Ticket</h2>
            <p className="text-sm text-white/50 mb-6">Open a formal support ticket for technical issues or billing inquiries.</p>
            <button className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-purple-500 transition-colors">
              Create Ticket
            </button>
          </div>

          <div className="md:col-span-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-3xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {[
                "How do I refill my credits?",
                "Are my uploaded files secure?",
                "Can I get a refund for failed processing?",
                "How do I integrate SW Tools into my workflow?"
              ].map((q, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{q}</span>
                  <HelpCircle className="w-4 h-4 text-white/20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
