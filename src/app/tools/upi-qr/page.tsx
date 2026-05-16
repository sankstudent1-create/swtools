"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import UPIQRGenerator from '@/components/upi/UPIQRGenerator';
import { ArrowLeft, CreditCard, Smartphone, User, Landmark } from 'lucide-react';

export default function UPIQRPage() {
  const [form, setForm] = useState({
    upiId: '',
    name: '',
    amount: '',
    transactionRef: '',
    note: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center py-12 px-4">
      {/* Back link */}
      <Link href="/tools" prefetch={false} className="self-start mb-6 flex items-center text-white/70 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Tools
      </Link>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-green-400">
            UPI QR Generator
          </h1>
          <p className="text-white/50 mb-8 text-sm">
            Generate a trusted, NPCI-compliant QR code for instant payments.
          </p>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1 mb-2 block">UPI ID (Required)</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input
                  name="upiId"
                  placeholder="example@upi"
                  value={form.upiId}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1 mb-2 block">Payee Name</label>
                <input
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1 mb-2 block">Amount (₹)</label>
                <input
                  name="amount"
                  type="number"
                  placeholder="0.00 (optional)"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1 mb-2 block">Payment Note</label>
              <input
                name="note"
                placeholder="Gift / Dinner / etc."
                value={form.note}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3 text-white/30 text-xs">
              <Landmark className="w-4 h-4" />
              <span>Supports all major UPI apps (GPay, PhonePe, BHIM, etc.)</span>
            </div>
          </div>
        </div>

        {/* Right Side: QR Display & Actions */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col items-center">
            <UPIQRGenerator
              upiId={form.upiId}
              name={form.name}
              amount={form.amount}
              transactionRef={form.transactionRef}
              note={form.note}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
