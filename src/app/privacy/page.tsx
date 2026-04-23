import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-fuchsia-400">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-white/70 leading-relaxed">
          <p>Last updated: April 23, 2026</p>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <p>Our tools are designed with privacy as a core principle. For most of our image processing and PDF tools, your data is processed entirely within your browser and is never uploaded to our servers.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Usage Data</h2>
            <p>We may collect anonymous usage statistics to improve our services, such as which tools are used most frequently. This data does not contain any personal information or document content.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Third-Party Services</h2>
            <p>We use Google AdSense to serve advertisements. Google may use cookies to serve ads based on your prior visits to our website or other websites.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at support@swinfosystems.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
