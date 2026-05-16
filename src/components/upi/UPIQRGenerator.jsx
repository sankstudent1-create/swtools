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
        width: 1024,
        height: 1024,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.H,
      });
      // Scale it down in the UI
      const qrImage = container.querySelector('img');
      const qrCanvas = container.querySelector('canvas');
      if (qrImage) {
        qrImage.style.width = '260px';
        qrImage.style.height = '260px';
        qrImage.style.display = 'block';
      }
      if (qrCanvas) {
        qrCanvas.style.width = '260px';
        qrCanvas.style.height = '260px';
        qrCanvas.style.display = 'none'; // qrcodejs shows both, we only need the img for consistency
      }
    };

    loadQRCode();
  }, [upiId, name, amount, transactionRef, currency, note]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 4, // 4x is plenty for high-quality and avoids browser memory limits
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        allowTaint: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        onclone: (clonedDoc) => {
          const card = clonedDoc.getElementById('upi-qr-card-container');
          if (card) {
            // Force high-quality image rendering and fix any CSS issues
            card.style.transform = 'none';
            card.style.position = 'relative';
            card.style.margin = '0';
            
            const elements = card.getElementsByTagName('*');
            for (let i = 0; i < elements.length; i++) {
              const el = elements[i] as HTMLElement;
              // Fix modern color functions
              const style = window.getComputedStyle(el);
              const props = ['color', 'backgroundColor', 'borderColor', 'boxShadow', 'background'];
              props.forEach(prop => {
                const val = (style as any)[prop];
                if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('lab') || val.includes('color-mix'))) {
                  el.style[prop as any] = '#000000';
                }
              });
              // Force text rendering quality
              el.style.webkitFontSmoothing = 'antialiased';
              el.style.textRendering = 'optimizeLegibility';
            }
          }
        }
      });
      const link = document.createElement('a');
      link.download = `upi-qr-${upiId.replace(/[@.]/g, '-') || 'payment'}.png`;
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
        scale: 4,
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
                if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('lab') || val.includes('color-mix'))) {
                  el.style[prop] = val.replace(/oklch\([^)]+\)/g, '#000000')
                                    .replace(/oklab\([^)]+\)/g, '#000000')
                                    .replace(/lab\([^)]+\)/g, '#000000')
                                    .replace(/color-mix\([^)]+\)/g, '#000000');
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
        className="rounded-[3rem] p-9 flex flex-col items-center relative overflow-hidden border shadow-2xl mx-auto" 
        style={{ 
          width: '100%',
          maxWidth: '380px',
          minHeight: '560px',
          backgroundColor: '#ffffff', 
          borderColor: '#f1f5f9',
          boxShadow: '0 25px 60px -12px rgba(0,0,0,0.15)'
        }}
      >
        {/* Subtle background gradient pattern */}
        <div 
          className="absolute inset-0 opacity-[0.07]" 
          style={{ 
            background: `
              radial-gradient(at 0% 0%, #2563eb 0px, transparent 45%),
              radial-gradient(at 100% 0%, #7c3aed 0px, transparent 45%),
              radial-gradient(at 100% 100%, #db2777 0px, transparent 45%),
              radial-gradient(at 0% 100%, #ea580c 0px, transparent 45%)
            `,
            pointerEvents: 'none' 
          }}
        ></div>

        {/* Branding Header - SW Tools Logo */}
        <div className="w-full flex justify-between items-center mb-8 relative z-10 pt-1">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #000000, #1f2937)', 
                boxShadow: '0 4px 10px -2px rgba(0,0,0,0.2)' 
              }}
            >
              <img src="/icon-512.png" alt="SW Tools" className="w-7 h-7 object-contain" crossOrigin="anonymous" />
            </div>
            <div className="flex flex-col gap-0">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none mb-0.5" style={{ color: '#94a3b8' }}>SW Info Systems</span>
              <span className="text-lg font-black tracking-tight leading-none" style={{ color: '#1e293b' }}>SW TOOLS</span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-bold tracking-wider text-green-600 uppercase">Secure UPI</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <img 
              src="https://www.npci.org.in/images/npci/upi/upi-logo.png" 
              alt="UPI" 
              className="h-5 w-auto object-contain opacity-90" 
              crossOrigin="anonymous"
            />
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">NPCI Verified</span>
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
              <img src="/icon-512.png" alt="Logo" className="w-10 h-10 object-contain" crossOrigin="anonymous" />
            </div>
          </div>
        </div>

        {/* Payee Details */}
        <div className="mt-8 text-center w-full relative z-10 px-4">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center gap-2">
              <h3 className="font-black text-2xl tracking-tight leading-tight text-slate-900 m-0">
                {name || 'Secure Merchant'}
              </h3>
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ 
                  background: 'linear-gradient(135deg, #10b981, #059669)', 
                  boxShadow: '0 4px 12px rgba(16,185,129,0.4)' 
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4" className="w-3.5 h-3.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-40">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">{upiId}</span>
          </div>
          
          {amount && (
            <div className="mt-5 relative inline-block w-full max-w-[180px]">
              <div 
                className="absolute inset-0 blur-xl opacity-[0.06] rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #1e293b, #64748b)' }}
              ></div>
              <div 
                className="relative py-3 px-5 rounded-2xl flex flex-col items-center justify-center gap-0.5"
                style={{ 
                  background: 'linear-gradient(180deg, #ffffff, #f8fafc)',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 20px -4px rgba(0,0,0,0.04)'
                }}
              >
                <span className="text-[9px] font-black tracking-[0.2em] opacity-40 uppercase text-slate-500">Amount to Pay</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black text-slate-400">₹</span>
                  <span className="text-3xl font-black tracking-tight text-slate-900">{amount}</span>
                </div>
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
