import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
          Terms of Service
        </h1>
        <div className="space-y-6 text-white/70 leading-relaxed">
          <p>Last updated: April 23, 2026</p>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using SW Tools Directory, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
            <p>Permission is granted to temporarily use the tools on our website for personal, non-commercial transitory viewing or document processing only.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Disclaimer</h2>
            <p>The materials on SW Tools Directory are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Limitations</h2>
            <p>In no event shall SW Info Systems or its suppliers be liable for any damages arising out of the use or inability to use the tools on our website.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
