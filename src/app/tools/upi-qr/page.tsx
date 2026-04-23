"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import UPIQRGenerator from '@/components/upi/UPIQRGenerator';
import { ArrowLeft, CreditCard, Smartphone, User, Landmark } from 'lucide-react';

export default function UPIQRPage() {
  const [mode, setMode] = useState('vpa'); // 'vpa', 'bank', 'mobile', 'aadhar'
  const [form, setForm] = useState({
    upiId: '',
    name: '',
    amount: '',
    transactionRef: '',
    note: '',
    accountNo: '',
    ifsc: '',
    mobileNo: '',
    aadharNo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const modes = [
    { id: 'vpa', label: 'UPI ID', icon: User },
    { id: 'bank', label: 'Bank A/c', icon: Landmark },
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
    { id: 'aadhar', label: 'Aadhar', icon: CreditCard, disabled: true },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center py-12 px-4">
      {/* Back link */}
      <Link href="/tools" className="self-start mb-6 flex items-center text-white/70 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Tools
      </Link>

      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
        <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-green-400">
          UPI QR Generator
        </h1>
        <p className="text-center text-white/50 mb-8 text-sm">
          Create premium glassmorphic QR codes for instant UPI payments.
        </p>

        {/* Mode Switcher */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 bg-white/5 p-1.5 rounded-xl border border-white/5">
          {modes.map((m) => (
            <button
              key={m.id}
              disabled={m.disabled}
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                mode === m.id
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg shadow-blue-500/20'
                  : m.disabled 
                    ? 'opacity-40 cursor-not-allowed text-white/40'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <m.icon className="w-4 h-4" />
              {m.label}
              {m.disabled && <span className="text-[8px] uppercase font-bold ml-1 opacity-60">Soon</span>}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 mb-10">
          {mode === 'mobile' && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-2 text-center">
              <p className="text-blue-200/80 text-xs leading-relaxed">
                <strong>Pro Tip:</strong> Most apps allow paying to a mobile number using <code className="bg-white/10 px-1 rounded text-blue-300">number@upi</code>.
                Try this in <strong>UPI ID</strong> mode if the direct mobile QR doesn't work.
              </p>
            </div>
          )}
          {mode === 'bank' && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-2">
              <p className="text-amber-200/80 text-xs leading-relaxed">
                <strong>Note:</strong> QR codes for Bank Accounts are supported by NPCI but may be restricted by some UPI apps (like GPay or PhonePe) for security reasons if you are not a verified merchant. If it fails, please use the <strong>UPI ID</strong> mode.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mode === 'vpa' && (
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1 mb-1.5 block">UPI ID</label>
                <input
                  name="upiId"
                  placeholder="example@upi"
                  value={form.upiId}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            )}

            {mode === 'bank' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1 mb-1.5 block">Account Number</label>
                  <input
                    name="accountNo"
                    placeholder="Enter A/c Number"
                    value={form.accountNo}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1 mb-1.5 block">IFSC Code</label>
                  <input
                    name="ifsc"
                    placeholder="SBIN0001234"
                    value={form.ifsc}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all uppercase"
                  />
                </div>
              </>
            )}

            {mode === 'mobile' && (
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1 mb-1.5 block">Mobile Number</label>
                <input
                  name="mobileNo"
                  placeholder="9876543210"
                  value={form.mobileNo}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            )}

            {mode === 'aadhar' && (
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1 mb-1.5 block">Aadhar Number</label>
                <input
                  name="aadharNo"
                  placeholder="12-digit Aadhar No"
                  value={form.aadharNo}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1 mb-1.5 block">Payee Name</label>
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1 mb-1.5 block">Amount (₹)</label>
              <input
                name="amount"
                type="number"
                placeholder="0.00 (optional)"
                value={form.amount}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1 mb-1.5 block">Payment Note</label>
              <input
                name="note"
                placeholder="Gift / Dinner (optional)"
                value={form.note}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative">
              <UPIQRGenerator
                mode={mode}
                upiId={form.upiId}
                accountNo={form.accountNo}
                ifsc={form.ifsc}
                mobileNo={form.mobileNo}
                aadharNo={form.aadharNo}
                name={form.name}
                amount={form.amount}
                transactionRef={form.transactionRef}
                note={form.note}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
