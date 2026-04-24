import React, { useEffect, useRef } from 'react';
import styles from './UPIQRGenerator.module.css';
import { Download, Share2, ExternalLink } from 'lucide-react';
import { toPng } from 'html-to-image';

/**
 * UPIQRGenerator component renders a QR code for UPI payment.
 */
const UPIQRGenerator = ({
  upiId,
  name,
  amount,
  transactionRef,
  currency = 'INR',
  note,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

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
    const card = containerRef.current.querySelector('.branded-qr-card');
    if (!card) return;
    
    try {
      const dataUrl = await toPng(card, { 
        quality: 1, 
        pixelRatio: 3, // Higher resolution
        backgroundColor: '#ffffff' 
      });
      const link = document.createElement('a');
      link.download = `swtools-upi-qr-${upiId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
      // Fallback to just QR canvas if full card fails
      const canvas = canvasRef.current.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `upi-qr-${upiId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    }
  };

  const handleShare = async () => {
    const card = containerRef.current.querySelector('.branded-qr-card');
    if (!card) return;

    try {
      if (navigator.share && navigator.canShare) {
        const dataUrl = await toPng(card, { quality: 1, pixelRatio: 2 });
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `upi-payment-qr.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'UPI Payment QR',
            text: `Pay ${name || upiId} ₹${amount || ''} using SWTools Secure QR`,
            files: [file],
          });
        } else {
          // Fallback to URI share
          const uri = buildUPIUri();
          await navigator.share({
            title: 'UPI Payment QR',
            text: `Pay ${name || upiId} ₹${amount || ''} using SWTools Secure QR`,
            url: uri,
          });
        }
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handlePayNow = () => {
    const uri = buildUPIUri();
    window.location.href = uri;
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-6" ref={containerRef}>
      {/* Branded QR Card */}
      <div className="branded-qr-card bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col items-center relative overflow-hidden border border-gray-100">
        {/* Branding Header */}
        <div className="w-full flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#002e6e] uppercase tracking-[0.2em]">SWInfoSystems</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-black text-gray-900 tracking-tight leading-none italic">TRUSTED PAY</span>
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF9933]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white border border-[#000080]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#138808]"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <img src="/icon-192.png" alt="SWTools" className="h-7 w-7 object-contain" />
              <span className="text-xs font-black text-gray-900 tracking-tighter">SW<span className="text-gray-400 font-light">Tools</span></span>
            </div>
          </div>
        </div>

        {/* QR Canvas with Center Logo */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 via-indigo-500 to-teal-400 rounded-[2rem] blur-md opacity-10 group-hover:opacity-25 transition duration-700"></div>
          <div className="relative bg-white p-4 rounded-[1.8rem] border border-gray-50 shadow-[0_10px_30px_rgba(0,0,0,0.05)] min-h-[260px] min-w-[260px] flex items-center justify-center">
            <div ref={canvasRef} className="qrcode-container" />
            
            {/* SWTools Center Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-xl shadow-lg border border-gray-100 p-1 flex items-center justify-center z-10">
              <img 
                src="/icon-192.png" 
                alt="SWTools" 
                className="w-full h-full object-contain p-0.5" 
              />
            </div>
          </div>
        </div>

        {/* Payee Details */}
        <div className="mt-8 text-center w-full">
          <div className="flex items-center justify-center gap-2 mb-1">
            <p className="text-black font-black text-xl tracking-tight uppercase">{name || 'Secure Payment'}</p>
            {name && <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>}
          </div>
          <p className="text-black text-sm font-black tracking-widest uppercase opacity-90">{upiId || 'ENTER VPA ID'}</p>
          
          {amount && (
            <div className="mt-5 relative inline-block">
              <div className="absolute inset-0 bg-blue-600 blur-xl opacity-10 rounded-full"></div>
              <div className="relative bg-gray-900 py-2.5 px-6 rounded-2xl flex items-center gap-2 shadow-xl">
                <span className="text-white/40 text-[10px] font-black tracking-widest">AMOUNT</span>
                <span className="text-white font-black text-2xl tracking-tighter italic">₹{amount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Branding - Minimal & Powered by SWTools */}
        <div className="mt-10 pt-6 border-t border-gray-100 w-full flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-5 w-full px-2">
            <img src="https://cdn.brandfetch.io/idcE0OdG8i/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1667569122597" alt="PhonePe" className="h-4 sm:h-5 w-auto object-contain shrink-0" />
            <img src="https://cdn.brandfetch.io/idWNFFMbfp/w/400/h/400/theme/dark/icon.png?c=1bxid64Mup7aczewSAYMX&t=1769621615289" alt="GPay" className="h-4 sm:h-5 w-auto object-contain shrink-0" />
            <img src="https://cdn.brandfetch.io/idRNBjXRVq/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1700163042274" alt="Paytm" className="h-3 sm:h-4 w-auto object-contain shrink-0" />
            <img src="https://cdn.brandfetch.io/idVg87ij2H/w/517/h/73/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1773151735396" alt="IPPB" className="h-3 sm:h-4 w-auto object-contain shrink-0" />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[9px] font-bold text-gray-400 tracking-[0.3em] uppercase">Powered by SWTools</span>
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
