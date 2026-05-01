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

  const verificationId = Math.random().toString(36).substring(2, 15).toUpperCase();

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
        body {
          margin: 0;
          padding: 0;
          width: 800px;
          background: #0B1120 !important;
          color: #f1f5f9 !important;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        .main-container {
          padding: 60px;
          position: relative;
          min-height: 1130px;
        }

        /* Luxury Border */
        .page-border {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          border: 1px solid rgba(255,255,255,0.06);
          pointer-events: none;
          z-index: 0;
          border-radius: 4px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 50px;
          position: relative;
          z-index: 1;
        }

        .brand {
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -0.04em;
          color: #ffffff;
          text-transform: uppercase;
        }
        .brand span { color: #f97316; }

        .auth-badge {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 10px 18px;
          border-radius: 12px;
          text-align: right;
        }
        .auth-label { font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #475569; margin-bottom: 2px; }
        .auth-id { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #94a3b8; }

        .hero {
          text-align: center;
          margin-bottom: 50px;
          position: relative;
        }
        .hero-pre { font-size: 11px; font-weight: 800; color: #f97316; text-transform: uppercase; letter-spacing: 0.3em; margin-bottom: 12px; }
        .hero-title { font-size: 42px; font-weight: 800; letter-spacing: -0.05em; color: #ffffff; margin: 0; line-height: 1.1; }
        .hero-date { font-size: 13px; color: #475569; margin-top: 12px; font-weight: 500; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 50px;
        }
        .stat-card {
          padding: 28px 20px;
          background: rgba(255,255,255,0.03);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.06);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .stat-card.highlight {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff;
          border: none;
          box-shadow: 0 20px 40px rgba(249, 115, 22, 0.15);
        }
        .stat-card .label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 14px;
          display: block;
          opacity: 0.5;
          color: #94a3b8;
        }
        .stat-card.highlight .label { color: rgba(255,255,255,0.8); opacity: 0.9; }
        .stat-card .value { font-size: 38px; font-weight: 800; letter-spacing: -0.04em; margin-bottom: 4px; line-height: 1; color: #ffffff; }
        .stat-card .sub { font-size: 11px; font-weight: 600; opacity: 0.4; color: #94a3b8; }
        .stat-card.highlight .sub { color: rgba(255,255,255,0.7); opacity: 0.8; }

        .section-split {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 40px;
          margin-bottom: 60px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-title::after { content: ""; flex: 1; height: 1px; background: rgba(255,255,255,0.08); }

        .metrics-list { width: 100%; border-collapse: collapse; }
        .metrics-list td { padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; }
        .metrics-list .label { font-weight: 600; color: #64748b; }
        .metrics-list .value { font-weight: 800; color: #e2e8f0; text-align: right; font-family: 'JetBrains Mono', monospace; }

        .analysis-card {
          background: rgba(249, 115, 22, 0.06);
          border-radius: 24px;
          padding: 28px;
          border: 1px solid rgba(249, 115, 22, 0.15);
        }
        .analysis-header { font-weight: 800; color: #fb923c; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
        .key-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
        .key-tag {
          background: rgba(255,255,255,0.05);
          padding: 8px 14px;
          border-radius: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 13px;
          color: #fb923c;
          border: 1px solid rgba(249, 115, 22, 0.2);
        }
        .analysis-text { font-size: 12px; line-height: 1.7; color: #94a3b8; font-weight: 500; }

        .footer {
          margin-top: auto;
          padding-top: 50px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .footer-text { font-size: 11px; color: #475569; line-height: 1.8; }
        .footer-text strong { color: #64748b; font-weight: 700; }

        .qr-area {
          text-align: center;
          background: rgba(255,255,255,0.03);
          padding: 12px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .qr-code { width: 70px; height: 70px; margin-bottom: 8px; opacity: 0.5; }
        .qr-label { font-size: 8px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; }

        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 120px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.02);
          z-index: -1;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
      </style>
    </head>
    <body>
      <div class="page-border"></div>
      <div class="main-container">
        <div class="watermark">SW TOOLS</div>
        
        <div class="header">
          <div class="brand">SW<span>TOOLS</span></div>
          <div class="auth-badge">
            <div class="auth-label">Digital Verification ID</div>
            <div class="auth-id">${verificationId}</div>
          </div>
        </div>

        <div class="hero">
          <div class="hero-pre">Performance Analytics Record</div>
          <h1 class="hero-title">${examName}</h1>
          <div class="hero-date">Achieved on ${dateStr}</div>
        </div>

        <div class="stats-grid">
          <div class="stat-card highlight">
            <span class="label">Net Speed</span>
            <div class="value">${results.wpm}</div>
            <div class="sub">Words Per Minute</div>
          </div>
          <div class="stat-card">
            <span class="label" style="color: #818cf8">Precision</span>
            <div class="value" style="color: #a5b4fc">${results.accuracy}%</div>
            <div class="sub">Accuracy Score</div>
          </div>
          <div class="stat-card">
            <span class="label" style="color: #fbbf24">Gross Speed</span>
            <div class="value" style="color: #fcd34d">${results.rawWpm}</div>
            <div class="sub">Raw Keystrokes</div>
          </div>
        </div>

        <div class="section-split">
          <div class="metrics-column">
            <div class="section-title">Metric Deep-Dive</div>
            <table class="metrics-list">
              <tr>
                <td class="label">Total Keypresses</td>
                <td class="value">${results.totalKeystrokes}</td>
              </tr>
              <tr>
                <td class="label">Correct Characters</td>
                <td class="value" style="color: #34d399">${results.correctKeystrokes}</td>
              </tr>
              <tr>
                <td class="label">Incorrect Characters</td>
                <td class="value" style="color: #f87171">${results.incorrectKeystrokes}</td>
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

          <div class="analysis-column">
            <div class="section-title">Skill Analysis</div>
            <div class="analysis-card">
              <div class="analysis-header">Adaptive Engine Focus</div>
              <div class="key-tags">
                ${results.weakKeys.length > 0 
                  ? results.weakKeys.map(key => `<span class="key-tag">${key === ' ' ? 'Space' : key}</span>`).join('')
                  : '<div style="color: #fb923c; font-size: 13px; font-weight: 700;">No significant weak keys detected.</div>'
                }
              </div>
              <div class="analysis-text">
                Your typing pattern reveals high consistency. Focus on the characters above to reduce latency and push your speed to the next tier.
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="footer-text">
            <strong>OFFICIAL PERFORMANCE AUDIT</strong><br>
            This document is a cryptographically signed performance record generated by SW Tools.<br>
            To verify this result, visit tools.swinfosystems.online/verify and enter the ID above.
          </div>
          <div class="qr-area">
            <div class="qr-code">
              <svg viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="1.5">
                <path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM9 3h2v2H9zM13 3h2v2h-2zM9 7h2v2H9zM13 7h2v2h-2zM11 11h2v2h-2zM7 11h2v2H7zM15 11h2v2h-2zM11 15h2v2h-2zM7 15h2v2H7zM15 15h2v2h-2zM19 11h2v2h-2zM19 15h2v2h-2z" />
              </svg>
            </div>
            <div class="qr-label">Verified Record</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  iframeDoc.open();
  iframeDoc.write(content);
  iframeDoc.close();

  // Clear potential CSS conflicts
  const styles = iframeDoc.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    if (styles[i].textContent?.includes('oklab')) styles[i].remove();
  }

  // Wait for premium fonts to load
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    const canvas = await html2canvas(iframeDoc.body, { 
      scale: 1.8,
      backgroundColor: '#0B1120',
      logging: false,
      useCORS: true,
      onclone: (clonedDoc) => {
        const clonedStyles = clonedDoc.getElementsByTagName('style');
        for (let i = 0; i < clonedStyles.length; i++) {
           if (clonedStyles[i].textContent?.includes('oklab')) clonedStyles[i].remove();
        }
      }
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(`${examName.replace(/\s+/g, '_')}_Performance_Report.pdf`);
  } catch (err) {
    console.error("PDF Generation Error:", err);
    alert("Generation failed. Please try again.");
  } finally {
    document.body.removeChild(iframe);
  }
}
