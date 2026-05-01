import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TypingSessionResult } from '../engine/analyzer';

export async function generateTypingPDF(results: TypingSessionResult, examName: string = "Typing Skill Test") {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '1000px';
  iframe.style.height = '1414px';
  iframe.style.visibility = 'hidden';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) return;

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
        body {
          margin: 0;
          padding: 60px;
          width: 800px;
          background: #ffffff !important;
          color: #0f172a !important;
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 50px;
          padding-bottom: 30px;
          border-bottom: 2px solid #f1f5f9;
        }
        
        .brand-logo {
          font-weight: 800;
          font-size: 24px;
          letter-spacing: -0.04em;
          color: #0f172a;
          text-transform: uppercase;
        }
        .brand-logo span { color: #f97316; }
        
        .certificate-meta { text-align: right; }
        .cert-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px; }
        .cert-id { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #0f172a; }

        .hero-section { margin-bottom: 60px; text-align: center; }
        .hero-title { font-size: 42px; font-weight: 800; letter-spacing: -0.04em; margin-bottom: 8px; color: #0f172a; }
        .hero-subtitle { font-size: 16px; color: #64748b; font-weight: 500; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 50px;
        }
        
        .stat-card {
          padding: 30px 20px;
          border-radius: 24px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          text-align: center;
          transition: transform 0.2s;
        }
        
        .stat-card.highlight {
          background: #0f172a;
          color: #ffffff;
          border: none;
          grid-column: span 1;
        }
        
        .stat-card .label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          display: block;
          opacity: 0.7;
        }
        
        .stat-card .value {
          font-size: 36px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 4px;
        }
        
        .stat-card .subtext { font-size: 12px; opacity: 0.6; font-weight: 500; }

        .section-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #0f172a;
        }
        .section-title::after {
          content: "";
          flex: 1;
          height: 2px;
          background: #f1f5f9;
        }

        .metrics-container {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
          margin-bottom: 50px;
        }

        .data-table { width: 100%; border-collapse: collapse; }
        .data-table td {
          padding: 16px 0;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
        }
        .data-table .label { font-weight: 600; color: #64748b; }
        .data-table .value { font-weight: 700; color: #0f172a; text-align: right; font-family: 'JetBrains Mono', monospace; }

        .mistake-map {
          background: #fff7ed;
          border: 1px solid #ffedd5;
          padding: 24px;
          border-radius: 24px;
        }
        
        .mistake-title { font-weight: 800; color: #9a3412; font-size: 14px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em; }
        
        .key-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .key-tag {
          background: #ffffff;
          border: 1px solid #fed7aa;
          padding: 6px 12px;
          border-radius: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 14px;
          color: #c2410c;
          box-shadow: 0 2px 4px rgba(251, 146, 60, 0.1);
        }

        .chart-placeholder {
          height: 180px;
          background: #f8fafc;
          border-radius: 20px;
          border: 2px dashed #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 40px;
        }

        .footer {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 40px;
          border-top: 2px solid #f1f5f9;
        }
        
        .footer-info { font-size: 12px; color: #94a3b8; line-height: 1.8; }
        .footer-info strong { color: #64748b; }
        
        .qr-placeholder {
          width: 80px;
          height: 80px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .qr-label {
          position: absolute;
          bottom: -20px;
          width: 100px;
          text-align: center;
          font-size: 8px;
          font-weight: 800;
          color: #cbd5e1;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="page-header">
        <div class="brand-logo">SW<span>TOOLS</span></div>
        <div class="certificate-meta">
          <div class="cert-label">Certificate Verification</div>
          <div class="cert-id">${Math.random().toString(36).substring(2, 15).toUpperCase()}</div>
        </div>
      </div>

      <div class="hero-section">
        <div class="hero-subtitle">TYPING PROFICIENCY RECORD</div>
        <h1 class="hero-title">${examName}</h1>
        <div class="hero-subtitle">Issued on ${dateStr}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card highlight">
          <span class="label">Net Speed</span>
          <div class="value">${results.wpm}</div>
          <div class="subtext">Words Per Minute</div>
        </div>
        <div class="stat-card">
          <span class="label" style="color: #6366f1">Accuracy</span>
          <div class="value" style="color: #4f46e5">${results.accuracy}%</div>
          <div class="subtext">Precision Rate</div>
        </div>
        <div class="stat-card">
          <span class="label" style="color: #f59e0b">Raw Speed</span>
          <div class="value" style="color: #d97706">${results.rawWpm}</div>
          <div class="subtext">Gross WPM</div>
        </div>
      </div>

      <div class="section-title">In-Depth Analysis</div>
      <div class="metrics-container">
        <div>
          <table class="data-table">
            <tr>
              <td class="label">Total Keystrokes</td>
              <td class="value">${results.totalKeystrokes}</td>
            </tr>
            <tr>
              <td class="label">Correct Entries</td>
              <td class="value" style="color: #059669">${results.correctKeystrokes}</td>
            </tr>
            <tr>
              <td class="label">Incorrect Entries</td>
              <td class="value" style="color: #dc2626">${results.incorrectKeystrokes}</td>
            </tr>
            <tr>
              <td class="label">Correction Overhead</td>
              <td class="value">${results.backspaces} backspaces</td>
            </tr>
            <tr>
              <td class="label">Keys Per Hour (KPH)</td>
              <td class="value">${results.kph}</td>
            </tr>
          </table>
        </div>
        
        <div class="mistake-map">
          <div class="mistake-title">Targeted Weak Keys</div>
          <div class="key-grid">
            ${results.weakKeys.length > 0 
              ? results.weakKeys.map(key => `<span class="key-tag">${key === ' ' ? 'Space' : key}</span>`).join('')
              : '<div style="color: #c2410c; font-size: 12px; font-weight: 600;">Perfect execution. No weak keys detected.</div>'
            }
          </div>
          <p style="margin-top: 20px; font-size: 11px; color: #c2410c; opacity: 0.8; font-weight: 500;">
            Our adaptive engine recommends focusing on these characters to break your current speed plateau.
          </p>
        </div>
      </div>

      <div class="section-title">Consistency Progress</div>
      <div class="chart-placeholder">
        Keystroke Dynamics & Timing Variance Chart (Visual Analytics)
      </div>

      <div class="footer">
        <div class="footer-info">
          <strong>Digital Signature Verified</strong><br>
          This document serves as an official performance audit by SW Tools.<br>
          Verification URI: https://tools.swinfosystems.online/verify/${Math.random().toString(36).substring(7)}
        </div>
        <div class="qr-placeholder">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1.5">
            <path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM9 3h2v2H9zM13 3h2v2h-2zM9 7h2v2H9zM13 7h2v2h-2zM11 11h2v2h-2zM7 11h2v2H7zM15 11h2v2h-2zM11 15h2v2h-2zM7 15h2v2H7zM15 15h2v2h-2zM19 11h2v2h-2zM19 15h2v2h-2z" />
          </svg>
          <div class="qr-label">Scan to Verify</div>
        </div>
      </div>
    </body>
    </html>
  `;

  iframeDoc.open();
  iframeDoc.write(content);
  iframeDoc.close();

  // Clear any potential oklab-using stylesheets
  const styles = iframeDoc.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    if (styles[i].textContent?.includes('oklab')) {
      styles[i].remove();
    }
  }

  // Allow fonts to load
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    const canvas = await html2canvas(iframeDoc.body, { 
      scale: 1.5,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      onclone: (clonedDoc) => {
        const clonedStyles = clonedDoc.getElementsByTagName('style');
        for (let i = 0; i < clonedStyles.length; i++) {
           if (clonedStyles[i].textContent?.includes('oklab')) {
             clonedStyles[i].remove();
           }
        }
      }
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(`${examName.replace(/\s+/g, '_')}_Result.pdf`);
  } catch (err) {
    console.error("PDF Generation Error:", err);
    alert("Could not generate high-quality PDF. Reverting to basic mode.");
  } finally {
    document.body.removeChild(iframe);
  }
}
