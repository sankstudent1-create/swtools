"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import UPIQRGenerator from '@/components/upi/UPIQRGenerator';
import { ArrowLeft } from 'lucide-react';

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
      <Link href="/tools" className="self-start mb-6 flex items-center text-white/70 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Tools
      </Link>

      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/10">
        <h1 className="text-3xl font-semibold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">
          UPI QR Generator
        </h1>
        <p className="text-center text-white/70 mb-8">
          Fill the details below and instantly get a premium glass‑morphic QR code for UPI payments.
        </p>
        <div className="grid grid-cols-1 gap-4 mb-8">
          <input
            name="upiId"
            placeholder="UPI ID (e.g. example@upi)"
            value={form.upiId}
            onChange={handleChange}
            className="w-full bg-white/10 text-white placeholder-white/40 rounded-lg p-3 focus:outline-none"
          />
          <input
            name="name"
            placeholder="Payee Name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-white/10 text-white placeholder-white/40 rounded-lg p-3 focus:outline-none"
          />
          <input
            name="amount"
            placeholder="Amount (optional)"
            value={form.amount}
            onChange={handleChange}
            className="w-full bg-white/10 text-white placeholder-white/40 rounded-lg p-3 focus:outline-none"
          />
          <input
            name="transactionRef"
            placeholder="Transaction Ref (optional)"
            value={form.transactionRef}
            onChange={handleChange}
            className="w-full bg-white/10 text-white placeholder-white/40 rounded-lg p-3 focus:outline-none"
          />
          <input
            name="note"
            placeholder="Note / Description (optional)"
            value={form.note}
            onChange={handleChange}
            className="w-full bg-white/10 text-white placeholder-white/40 rounded-lg p-3 focus:outline-none"
          />
        </div>
        <div className="flex justify-center">
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
  );
}
