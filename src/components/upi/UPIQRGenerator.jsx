import React, { useEffect, useRef } from 'react';
import styles from './UPIQRGenerator.module.css';
import { Download, Share2, ExternalLink } from 'lucide-react';

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

  const handleDownload = () => {
    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `upi-qr-${upiId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    const uri = buildUPIUri();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'UPI Payment',
          text: `Pay ${name || upiId} ₹${amount || ''} using UPI`,
          url: uri,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const handlePayNow = () => {
    const uri = buildUPIUri();
    window.location.href = uri;
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-6" ref={containerRef}>
      {/* Branded QR Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-2xl flex flex-col items-center relative overflow-hidden border border-gray-100">
        {/* Branding Header */}
        <div className="w-full flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">SW Info Systems</span>
            <span className="text-sm font-black text-gray-800 tracking-tight leading-none italic">TRUSTED PAY</span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <div className="w-2 h-2 rounded-full bg-white border border-blue-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* QR Canvas */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-teal-400 rounded-2xl blur-sm opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div ref={canvasRef} className="relative bg-white p-3 rounded-2xl border border-gray-100 shadow-sm min-h-[256px] min-w-[256px]" />
        </div>

        {/* Payee Details */}
        <div className="mt-6 text-center w-full">
          <p className="text-gray-900 font-bold text-lg truncate px-4">{name || 'Scan to Pay'}</p>
          <p className="text-gray-400 text-xs font-medium mt-0.5 tracking-wide">{upiId}</p>
          {amount && (
            <div className="mt-3 bg-blue-50 py-1.5 px-4 rounded-full inline-block">
              <span className="text-blue-700 font-black text-xl italic">₹{amount}</span>
            </div>
          )}
        </div>

        {/* Branding Footer */}
        <div className="mt-8 pt-6 border-t border-gray-50 w-full flex items-center justify-around opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/100px-UPI-Logo-vector.svg.png" alt="UPI" className="h-4 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/BHIM_Logo.svg/100px-BHIM_Logo.svg.png" alt="BHIM" className="h-4 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/100px-PhonePe_Logo.svg.png" alt="PhonePe" className="h-4 object-contain" />
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
