import React from 'react';
import { Mail, MessageSquare, Globe } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-400 text-center">
          Contact Us
        </h1>
        <p className="text-center text-white/60 mb-12 text-lg">
          Have questions or suggestions? We'd love to hear from you.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="text-indigo-400 w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-sm text-white/50">support@swinfosystems.com</p>
          </div>
          
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-fuchsia-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-fuchsia-400 w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">Support</h3>
            <p className="text-sm text-white/50">Available 24/7</p>
          </div>
          
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Globe className="text-cyan-400 w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">Website</h3>
            <p className="text-sm text-white/50">www.swinfosystems.com</p>
          </div>
        </div>
        
        <div className="mt-16 p-8 bg-white/5 rounded-2xl border border-white/5 text-center">
          <h2 className="text-2xl font-semibold mb-4">Connect with us</h2>
          <p className="text-white/50 mb-6">For business inquiries and collaboration, reach out via our official channels.</p>
          <a 
            href="mailto:support@swinfosystems.com" 
            className="inline-flex items-center px-8 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Send an Email
          </a>
        </div>
      </div>
    </div>
  );
}
