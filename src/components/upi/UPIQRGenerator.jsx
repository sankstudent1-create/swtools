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
        scale: 4, 
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const card = clonedDoc.getElementById('upi-qr-card-container');
          if (card) {
            // Traverse all elements to remove oklab/oklch colors which crash html2canvas
            const elements = card.getElementsByTagName('*');
            for (let i = 0; i < elements.length; i++) {
              const el = elements[i];
              const style = window.getComputedStyle(el);
              
              // If any color property contains 'oklch' or 'oklab', force to rgb
              const props = ['color', 'backgroundColor', 'borderColor', 'boxShadow', 'background'];
              props.forEach(prop => {
                const val = style[prop];
                if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('color-mix'))) {
                  // We use a safe fallback or try to get the computed rgb
                  // In most browsers style[prop] already returns rgb for computed styles
                  // but in some cases with Tailwind v4 it might keep the modern function
                  el.style[prop] = val.replace(/oklch\([^)]+\)/g, '#000000').replace(/oklab\([^)]+\)/g, '#000000');
                }
              });
            }
          }
        }
      });
      const link = document.createElement('a');
      link.download = `upi-payment-${upiId.replace(/[@.]/g, '-') || 'qr'}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error('Download error:', err);
      alert('Unable to download QR code. Please try taking a screenshot.');
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
        allowTaint: true,
        onclone: (clonedDoc) => {
          const card = clonedDoc.getElementById('upi-qr-card-container');
          if (card) {
            const elements = card.getElementsByTagName('*');
            for (let i = 0; i < elements.length; i++) {
              const el = elements[i];
              const style = window.getComputedStyle(el);
              const props = ['color', 'backgroundColor', 'borderColor', 'boxShadow', 'background'];
              props.forEach(prop => {
                const val = style[prop];
                if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('color-mix'))) {
                  el.style[prop] = val.replace(/oklch\([^)]+\)/g, '#000000').replace(/oklab\([^)]+\)/g, '#000000');
                }
              });
            }
          }
        }
      });
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.8));
      if (!blob) throw new Error('Failed to create blob');
      
      const file = new File([blob], `upi-payment.png`, { type: 'image/png' });

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
          url: window.location.href,
        });
      } else {
        // Fallback: Just download
        handleDownload();
      }
    } catch (err) {
      console.error('Share error:', err);
      // Fallback: Try sharing just the text/url
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'UPI Payment',
            text: `Pay ${name || upiId} ₹${amount || ''} via UPI`,
            url: window.location.href,
          });
        } catch (sErr) {
          console.error('Secondary share error:', sErr);
        }
      }
    }
  };

  const handlePayNow = () => {
    const uri = buildUPIUri();
    window.location.href = uri;
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-6">
      {/* Branded QR Card */}
      <div 
        ref={cardRef}
        id="upi-qr-card-container"
        className="rounded-[2.5rem] p-8 flex flex-col items-center relative overflow-hidden border" 
        style={{ 
          backgroundColor: '#ffffff', 
          borderColor: '#f3f4f6',
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
        }}
      >
        {/* Subtle background gradient pattern */}
        <div 
          className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] blur-3xl rounded-full" 
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', pointerEvents: 'none' }}
        ></div>

        {/* Branding Header - SW Tools Logo */}
        <div className="w-full flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: '#000000', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}
            >
              <img src="/icon-512.png" alt="SW Tools" className="w-6 h-6 object-contain" crossOrigin="anonymous" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: '#111827', margin: 0 }}>SW Info Systems</span>
              <span className="text-sm font-black tracking-tight leading-none" style={{ color: '#111827', margin: 0 }}>SW TOOLS</span>
              <span className="text-[10px] font-semibold tracking-wider" style={{ color: '#9ca3af', margin: 0 }}>UPI Payment</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-px" style={{ backgroundColor: '#e5e7eb' }}></div>
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #f97316, #ec4899)',
                boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)'
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" className="w-4 h-4">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
        </div>

        {/* QR Canvas with Center Logo */}
        <div className="relative group z-10">
          <div 
            className="absolute -inset-2 rounded-[2rem] blur-md opacity-10"
            style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}
          ></div>
          <div 
            className="relative p-4 rounded-[1.8rem] border flex items-center justify-center min-h-[260px] min-w-[260px]"
            style={{ 
              backgroundColor: '#ffffff', 
              borderColor: '#f9fafb',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
            }}
          >
            <div ref={canvasRef} className="qrcode-container" />
            
            {/* Center Logo overlay */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center z-10 overflow-hidden"
              style={{ 
                backgroundColor: '#ffffff', 
                borderColor: '#f3f4f6',
                borderWidth: '1px',
                borderStyle: 'solid',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <img src="/icon-512.png" alt="Logo" className="w-8 h-8 object-contain" crossOrigin="anonymous" />
            </div>
          </div>
        </div>

        {/* Payee Details */}
        <div className="mt-8 text-center w-full relative z-10">
          <div className="flex items-center justify-center gap-2 mb-1">
            <p className="font-black text-2xl tracking-tight" style={{ color: '#000000', margin: 0 }}>{name || 'Secure Payment'}</p>
            {name && (
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#10b981' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" className="w-3 h-3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            )}
          </div>
          <p className="text-xs font-black tracking-widest uppercase" style={{ color: '#3b82f6', opacity: 0.4, margin: 0 }}>{upiId || 'VIRTUAL PAYMENT ADDRESS'}</p>
          
          {amount && (
            <div className="mt-6 relative inline-block">
              <div 
                className="absolute inset-0 blur-2xl opacity-10 rounded-full"
                style={{ backgroundColor: '#2563eb' }}
              ></div>
              <div 
                className="relative py-3 px-8 rounded-2xl flex items-center gap-3"
                style={{ 
                  backgroundColor: '#000000',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                }}
              >
                <span className="text-[10px] font-black tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.3)' }}>TOTAL AMOUNT</span>
                <span className="text-white font-black text-3xl tracking-tighter italic" style={{ color: '#ffffff' }}>₹{amount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Branding - UPI App Logos */}
        <div className="mt-12 pt-8 border-t w-full flex flex-col items-center gap-5" style={{ borderTopColor: '#f3f4f6' }}>
          <div className="flex items-center justify-center gap-5 flex-wrap opacity-60">
            <img src={LOGOS.gpay} alt="Google Pay" className="h-5 w-auto object-contain" crossOrigin="anonymous" />
            <img src={LOGOS.phonepe} alt="PhonePe" className="h-5 w-auto object-contain" crossOrigin="anonymous" />
            <img src={LOGOS.paytm} alt="Paytm" className="h-5 w-auto object-contain" crossOrigin="anonymous" />
            <img src={LOGOS.amazon} alt="Amazon Pay" className="h-5 w-auto object-contain" crossOrigin="anonymous" />
            <img src={LOGOS.ippb} alt="IPPB" className="h-3 w-auto object-contain" crossOrigin="anonymous" />
            <img src={LOGOS.cred} alt="Cred" className="h-5 w-auto object-contain" crossOrigin="anonymous" />
            <img src={LOGOS.bhim} alt="BHIM" className="h-5 w-auto object-contain" crossOrigin="anonymous" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8" style={{ backgroundColor: '#e5e7eb' }}></div>
            <span className="text-[10px] font-black tracking-[0.4em] uppercase" style={{ color: '#9ca3af' }}>Verified by SWTools</span>
            <div className="h-[1px] w-8" style={{ backgroundColor: '#e5e7eb' }}></div>
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
