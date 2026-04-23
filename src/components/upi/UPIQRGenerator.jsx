import React, { useEffect, useRef } from 'react';
import styles from './UPIQRGenerator.module.css';

/**
 * UPIQRGenerator component renders a QR code for UPI payment.
 * It accepts various UPI related fields and constructs a UPI URI.
 * The QR code is generated using the lightweight QRCode.js library.
 *
 * Props:
 * - upiId (string): UPI ID (e.g., "example@upi")
 * - name (string): Payee name
 * - amount (string|number): Amount to be paid (optional)
 * - transactionRef (string): Transaction reference ID (optional)
 * - currency (string): Currency code, default "INR"
 * - note (string): Payment note/description (optional)
 * - mode (string): "vpa", "bank", "mobile", "aadhar"
 * - accountNo (string): Bank account number (for bank mode)
 * - ifsc (string): IFSC code (for bank mode)
 * - mobileNo (string): Mobile number (for mobile mode)
 * - aadharNo (string): Aadhar number (for aadhar mode)
 */
const UPIQRGenerator = ({
  upiId,
  name,
  amount,
  transactionRef,
  currency = 'INR',
  note,
  mode = 'vpa',
  accountNo,
  ifsc,
  mobileNo,
  aadharNo,
}) => {
  const canvasRef = useRef(null);

  // Build the UPI URI according to UPI specification
  const buildUPIUri = () => {
    const params = new URLSearchParams();
    
    let pa = upiId;
    if (mode === 'bank' && accountNo && ifsc) {
      pa = `${accountNo}@${ifsc}.ifsc.npci`;
    } else if (mode === 'mobile' && mobileNo) {
      pa = `${mobileNo}@mobile.npci`;
    } else if (mode === 'aadhar' && aadharNo) {
      pa = `${aadharNo}@aadhar.npci`;
    }

    params.append('pa', pa);
    if (name) params.append('pn', name);
    if (amount) params.append('am', amount);
    if (currency) params.append('cu', currency);
    if (transactionRef) params.append('tr', transactionRef);
    if (note) params.append('tn', note);
    return `upi://pay?${params.toString()}`;
  };

  useEffect(() => {
    const uri = buildUPIUri();
    // Dynamically load QRCode library if not already present
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
      // Clear previous QR if any
      container.innerHTML = '';
      // eslint-disable-next-line no-new
      new window.QRCode(container, {
        text: uri,
        width: 256,
        height: 256,
        colorDark: '#0d0d0d',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.H,
      });
    };

    loadQRCode();
  }, [upiId, name, amount, transactionRef, currency, note, mode, accountNo, ifsc, mobileNo, aadharNo]);

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>UPI Payment QR</h3>
      <div ref={canvasRef} className={styles.qrCanvas} />
      <p className={styles.caption}>Scan to pay {amount ? `₹${amount}` : ''}</p>
    </div>
  );
};

export default UPIQRGenerator;
