import React, { useEffect, useRef, useState } from 'react';
import styles from './UPIQRGenerator.module.css';
import { Download, Share2, ExternalLink } from 'lucide-react';
import html2canvas from 'html2canvas';

const UPIQRGenerator = ({
  upiId,
  name,
  amount,
  transactionRef,
  currency = 'INR',
  note,
}) => {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);

  const LOGOS = {
    gpay: "https://cdn.brandfetch.io/idWNFFMbfp/w/400/h/400/theme/dark/icon.png?c=1bxid64Mup7aczewSAYMX&t=1769621615289",
    phonepe: "https://cdn.brandfetch.io/idcE0OdG8i/w/800/h/800/theme/dark/symbol.png?c=1bxid64Mup7aczewSAYMX&t=1668075190583",
    paytm: "https://cdn.brandfetch.io/idRNBjXRVq/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1668516320872",
    amazon: "https://cdn.brandfetch.io/idO-tKGZ90/w/400/h/400/theme/dark/icon.png?c=1bxid64Mup7aczewSAYMX&t=1772301358777",
    ippb: "https://cdn.brandfetch.io/idVg87ij2H/w/517/h/73/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1773151735396",
    cred: "https://cdn.brandfetch.io/id27bJP5LK/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1668516348931",
    bhim: "https://cdn.brandfetch.io/idQLnUz_Rj/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1771957582559"
  };

  const buildUPIUri = () => {
    if (!upiId) return '';
    const params = new URLSearchParams();
    params.append('pa', upiId);
    if (name) params.append('pn', name);
    if (amount) params.append('am', amount);
    if (currency) params.append('cu', currency);
    if (transactionRef) params.append('tr', transactionRef);
    if (note) params.append('tn', note);
    return `upi://pay?${params.toString()}`;
  };

  useEffect(() => {
    const uri = buildUPIUri();
    if (!uri) {
      if (canvasRef.current) canvasRef.current.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-sm italic">Enter UPI ID to generate QR</div>';
      return;
    }

    const loadQRCode = () => {
      if (window.QRCode) {
        renderQR();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      script.onload = renderQR;
      document.body.appendChild(script);
    };

    const renderQR = () => {
      const container = canvasRef.current;
      if (!container) return;
      container.innerHTML = '';
      new window.QRCode(container, {
        text: uri,
        width: 256,
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.H,
      });
    };

    loadQRCode();
  }, [upiId, name, amount, transactionRef, currency, note]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `upi-payment-${upiId || 'qr'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;
      const file = new File([blob], `upi-payment-${upiId || 'qr'}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'UPI Payment',
          text: `Pay ${name || upiId} ₹${amount || ''} via UPI`,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'UPI Payment',
          text: `Pay ${name || upiId} ₹${amount || ''} via UPI`,
          url: buildUPIUri(),
        });
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handlePayNow = () => {
    const uri = buildUPIUri();
    window.location.href = uri;
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-6">
      {/* Branded QR Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col items-center relative overflow-hidden border border-gray-100" ref={cardRef}>
        {/* Branding Header - SW Tools Logo */}
        <div className="w-full flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md overflow-hidden">
              <img src="/icon-512.png" alt="SW Tools" className="w-6 h-6 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.15em]">SW Info Systems</span>
              <span className="text-sm font-black text-gray-900 tracking-tight leading-none">SW TOOLS</span>
              <span className="text-[10px] font-semibold text-gray-400 tracking-wider">UPI Payment</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
        </div>

        {/* QR Canvas with Center Logo */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-tr from-orange-500 via-pink-500 to-red-400 rounded-[2rem] blur-md opacity-10 group-hover:opacity-25 transition duration-700"></div>
          <div className="relative bg-white p-4 rounded-[1.8rem] border border-gray-50 shadow-[0_10px_30px_rgba(0,0,0,0.05)] min-h-[260px] min-w-[260px] flex items-center justify-center">
            <div ref={canvasRef} className="qrcode-container" />
            
            {/* Center Logo overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center z-10">
              <svg viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="2.2" className="w-7 h-7">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Payee Details */}
        <div className="mt-8 text-center w-full">
          <div className="flex items-center justify-center gap-2 mb-1">
            <p className="text-gray-900 font-black text-xl tracking-tight">{name || 'Secure Payment'}</p>
            {name && <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>}
          </div>
          <p className="text-blue-600 text-xs font-bold tracking-widest uppercase opacity-60">{upiId || 'Enter VPA ID'}</p>
          
          {amount && (
            <div className="mt-5 relative inline-block">
              <div className="absolute inset-0 bg-blue-600 blur-xl opacity-10 rounded-full"></div>
              <div className="relative bg-gray-900 py-2.5 px-6 rounded-2xl flex items-center gap-2">
                <span className="text-white/40 text-sm font-medium">AMOUNT</span>
                <span className="text-white font-black text-2xl tracking-tighter italic">₹{amount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Branding - UPI App Logos */}
        <div className="mt-10 pt-6 border-t border-gray-200 w-full flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-4 flex-wrap opacity-80 hover:opacity-100 transition-opacity duration-300">
            <img src={LOGOS.gpay} alt="Google Pay" className="h-6 w-auto object-contain" />
            <img src={LOGOS.phonepe} alt="PhonePe" className="h-6 w-auto object-contain" />
            <img src={LOGOS.paytm} alt="Paytm" className="h-6 w-auto object-contain" />
            <img src={LOGOS.amazon} alt="Amazon Pay" className="h-6 w-auto object-contain" />
            <img src={LOGOS.ippb} alt="India Post Payments Bank" className="h-4 w-auto object-contain" />
            <img src={LOGOS.cred} alt="Cred" className="h-6 w-auto object-contain" />
            <img src={LOGOS.bhim} alt="BHIM" className="h-6 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-gray-500 tracking-[0.3em] uppercase">Powered by SWTools</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={handleDownload}
          disabled={!upiId}
          className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl py-4 font-semibold transition-all backdrop-blur-md border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5 text-blue-400" />
          Save QR
        </button>
        <button 
          onClick={handleShare}
          disabled={!upiId}
          className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl py-4 font-semibold transition-all backdrop-blur-md border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Share2 className="w-5 h-5 text-teal-400" />
          Share
        </button>
        <button 
          onClick={handlePayNow}
          disabled={!upiId}
          className="col-span-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white rounded-2xl py-4 font-bold shadow-xl shadow-blue-900/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ExternalLink className="w-5 h-5" />
          Open UPI App
        </button>
      </div>
    </div>
  );
};

export default UPIQRGenerator;
