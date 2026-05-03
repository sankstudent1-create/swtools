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

  const getSpeedLevel = (wpm: number) => {
    if (wpm >= 80) return { label: 'Expert', color: '#22c55e' };
    if (wpm >= 60) return { label: 'Advanced', color: '#3b82f6' };
    if (wpm >= 40) return { label: 'Intermediate', color: '#f59e0b' };
    return { label: 'Beginner', color: '#ef4444' };
  };

  const speedLevel = getSpeedLevel(results.wpm);
  const gaugeAngle = Math.min(180, (results.wpm / 120) * 180);

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
          background: #0a0a0a !important;
          color: #ffffff !important;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        .main-container {
          padding: 50px 55px;
          position: relative;
          min-height: 1130px;
          background: #0a0a0a;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 25px;
          border-bottom: 2px solid #1a1a1a;
        }

        .brand-section { display: flex; align-items: center; gap: 15px; }
        .brand-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-icon svg { width: 28px; height: 28px; }
        
        .brand-text {
          display: flex;
          flex-direction: column;
        }
        .brand-name {
          font-weight: 800;
          font-size: 20px;
          letter-spacing: -0.02em;
          color: #ffffff;
          text-transform: uppercase;
        }
        .brand-tagline { font-size: 11px; color: #737373; font-weight: 500; }

        .cert-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          background: #171717;
          border: 1px solid #262626;
          border-radius: 10px;
        }
        .cert-icon { width: 24px; height: 24px; color: #f97316; }
        .cert-info { text-align: left; }
        .cert-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #525252; margin-bottom: 2px; }
        .cert-id { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #a3a3a3; }

        .hero {
          text-align: center;
          margin-bottom: 35px;
          padding: 30px 40px;
          background: linear-gradient(180deg, #171717 0%, #0f0f0f 100%);
          border: 1px solid #262626;
          border-radius: 16px;
        }
        
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(249, 115, 22, 0.15);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 20px;
          margin-bottom: 15px;
        }
        .hero-badge svg { width: 14px; height: 14px; color: #f97316; }
        .hero-badge-text { font-size: 11px; font-weight: 700; color: #fb923c; text-transform: uppercase; letter-spacing: 0.1em; }
        
        .hero-title { font-size: 36px; font-weight: 800; letter-spacing: -0.03em; color: #ffffff; margin: 0 0 10px 0; line-height: 1.2; }
        .hero-date { font-size: 13px; color: #737373; font-weight: 500; }

        .speedometer-section {
          display: flex;
          align-items: center;
          gap: 30px;
          margin-bottom: 35px;
          padding: 30px;
          background: #171717;
          border: 1px solid #262626;
          border-radius: 20px;
        }

        .gauge-container {
          position: relative;
          width: 180px;
          height: 100px;
          flex-shrink: 0;
        }
        
        .gauge-bg {
          position: absolute;
          width: 180px;
          height: 90px;
          border-top-left-radius: 90px;
          border-top-right-radius: 90px;
          background: conic-gradient(from 180deg at 50% 100%,
            #ef4444 0deg 45deg,
            #f59e0b 45deg 90deg,
            #3b82f6 90deg 135deg,
            #22c55e 135deg 180deg
          );
          opacity: 0.3;
        }
        
        .gauge-fill {
          position: absolute;
          width: 180px;
          height: 90px;
          border-top-left-radius: 90px;
          border-top-right-radius: 90px;
          background: conic-gradient(from 180deg at 50% 100%,
            #ef4444 0deg ${gaugeAngle < 45 ? gaugeAngle : 45}deg,
            ${gaugeAngle > 45 ? `#f59e0b 45deg ${gaugeAngle < 90 ? gaugeAngle : 90}deg,` : ''}
            ${gaugeAngle > 90 ? `#3b82f6 90deg ${gaugeAngle < 135 ? gaugeAngle : 135}deg,` : ''}
            ${gaugeAngle > 135 ? `#22c55e 135deg ${gaugeAngle}deg` : ''}
          );
          opacity: 1;
        }
        
        .gauge-center {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 60px;
          background: #171717;
          border-top-left-radius: 60px;
          border-top-right-radius: 60px;
        }
        
        .gauge-needle {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 4px;
          height: 85px;
          background: #ffffff;
          transform-origin: bottom center;
          transform: translateX(-50%) rotate(${gaugeAngle - 90}deg);
          border-radius: 2px;
        }
        
        .gauge-needle::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 14px;
          height: 14px;
          background: #ffffff;
          border-radius: 50%;
        }

        .gauge-labels {
          position: absolute;
          bottom: -20px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #525252;
          font-weight: 600;
        }

        .speed-info {
          flex: 1;
        }
        
        .speed-main {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 8px;
        }
        .speed-value { font-size: 52px; font-weight: 800; color: #ffffff; letter-spacing: -0.04em; line-height: 1; }
        .speed-unit { font-size: 18px; font-weight: 600; color: #737373; }
        
        .speed-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: ${speedLevel.color}20;
          border: 1px solid ${speedLevel.color}40;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          color: ${speedLevel.color};
          margin-bottom: 12px;
        }
        
        .speed-desc { font-size: 13px; color: #a3a3a3; line-height: 1.6; }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 35px;
        }
        
        .stat-box {
          padding: 20px 15px;
          background: #171717;
          border: 1px solid #262626;
          border-radius: 14px;
          text-align: center;
        }
        
        .stat-box-icon {
          width: 36px;
          height: 36px;
          margin: 0 auto 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #262626;
          border-radius: 10px;
        }
        .stat-box-icon svg { width: 20px; height: 20px; }
        
        .stat-box-value {
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
        }
        .stat-box-value.green { color: #22c55e; }
        .stat-box-value.red { color: #ef4444; }
        .stat-box-value.yellow { color: #eab308; }
        .stat-box-value.blue { color: #3b82f6; }
        
        .stat-box-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #737373;
        }

        .analysis-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 35px;
        }

        .analysis-card {
          padding: 25px;
          background: #171717;
          border: 1px solid #262626;
          border-radius: 16px;
        }

        .analysis-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .analysis-header svg { width: 20px; height: 20px; }
        .analysis-title { font-size: 13px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #262626;
        }
        .metric-row:last-child { border-bottom: none; padding-bottom: 0; }
        .metric-name { font-size: 13px; color: #a3a3a3; font-weight: 500; }
        .metric-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
        }
        .metric-value.success { color: #22c55e; }
        .metric-value.error { color: #ef4444; }

        .weak-keys-section {
          margin-top: 15px;
        }
        .weak-keys-title {
          font-size: 11px;
          font-weight: 700;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        .keys-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .key-pill {
          padding: 6px 12px;
          background: rgba(249, 115, 22, 0.15);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          color: #fb923c;
        }
        .key-pill.empty {
          background: #262626;
          border-color: #404040;
          color: #737373;
        }

        .footer {
          margin-top: auto;
          padding-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 2px solid #1a1a1a;
        }
        
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .footer-logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .footer-logo svg { width: 24px; height: 24px; }
        .footer-text { font-size: 11px; color: #525252; line-height: 1.6; }
        .footer-text strong { color: #a3a3a3; font-weight: 700; }
        
        .qr-box {
          text-align: center;
          padding: 15px;
          background: #171717;
          border: 1px solid #262626;
          border-radius: 12px;
        }
        .qr-svg { width: 60px; height: 60px; margin-bottom: 6px; opacity: 0.6; }
        .qr-text { font-size: 9px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 0.05em; }

        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-25deg);
          font-size: 100px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.03);
          z-index: 0;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <div class="main-container">
        <div class="watermark">CERTIFIED</div>
        
        <div class="header">
          <div class="brand-section">
            <div class="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div class="brand-text">
              <div class="brand-name">SW TOOLS</div>
              <div class="brand-tagline">Professional Typing Analytics</div>
            </div>
          </div>
          <div class="cert-badge">
            <svg class="cert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
            <div class="cert-info">
              <div class="cert-label">Verification ID</div>
              <div class="cert-id">${verificationId}</div>
            </div>
          </div>
        </div>

        <div class="hero">
          <div class="hero-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span class="hero-badge-text">Performance Report</span>
          </div>
          <h1 class="hero-title">${examName}</h1>
          <div class="hero-date">Generated on ${dateStr}</div>
        </div>

        <div class="speedometer-section">
          <div class="gauge-container">
            <div class="gauge-bg"></div>
            <div class="gauge-fill"></div>
            <div class="gauge-center"></div>
            <div class="gauge-needle"></div>
            <div class="gauge-labels">
              <span>0</span>
              <span>30</span>
              <span>60</span>
              <span>90</span>
              <span>120+</span>
            </div>
          </div>
          <div class="speed-info">
            <div class="speed-main">
              <span class="speed-value">${results.wpm}</span>
              <span class="speed-unit">WPM</span>
            </div>
            <div class="speed-label">
              ${speedLevel.label} Level
            </div>
            <div class="speed-desc">
              Your net typing speed reflects your actual performance after accounting for accuracy. 
              This places you in the top ${results.wpm > 60 ? '20%' : results.wpm > 40 ? '40%' : '60%'} of typists.
            </div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-box">
            <div class="stat-box-icon" style="color: #22c55e;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="stat-box-value green">${results.accuracy}%</div>
            <div class="stat-box-label">Accuracy</div>
          </div>
          <div class="stat-box">
            <div class="stat-box-icon" style="color: #3b82f6;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div class="stat-box-value blue">${results.rawWpm}</div>
            <div class="stat-box-label">Raw Speed</div>
          </div>
          <div class="stat-box">
            <div class="stat-box-icon" style="color: #eab308;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="stat-box-value yellow">${results.kph}</div>
            <div class="stat-box-label">Keys/Hour</div>
          </div>
          <div class="stat-box">
            <div class="stat-box-icon" style="color: #a3a3a3;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
              </svg>
            </div>
            <div class="stat-box-value">${results.backspaces}</div>
            <div class="stat-box-label">Corrections</div>
          </div>
        </div>

        <div class="analysis-section">
          <div class="analysis-card">
            <div class="analysis-header" style="color: #22c55e;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span class="analysis-title">Keystroke Analysis</span>
            </div>
            <div class="metric-row">
              <span class="metric-name">Total Keystrokes</span>
              <span class="metric-value">${results.totalKeystrokes}</span>
            </div>
            <div class="metric-row">
              <span class="metric-name">Correct Entries</span>
              <span class="metric-value success">${results.correctKeystrokes}</span>
            </div>
            <div class="metric-row">
              <span class="metric-name">Incorrect Entries</span>
              <span class="metric-value error">${results.incorrectKeystrokes}</span>
            </div>
            <div class="metric-row">
              <span class="metric-name">Error Rate</span>
              <span class="metric-value">${((results.incorrectKeystrokes / results.totalKeystrokes) * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div class="analysis-card">
            <div class="analysis-header" style="color: #f97316;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span class="analysis-title">Focus Areas</span>
            </div>
            <div class="weak-keys-section">
              <div class="weak-keys-title">Characters Requiring Practice</div>
              <div class="keys-row">
                ${results.weakKeys.length > 0 
                  ? results.weakKeys.map(key => `<span class="key-pill">${key === ' ' ? 'Space' : key}</span>`).join('')
                  : '<span class="key-pill empty">Excellent - No weak keys!</span>'
                }
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="footer-brand">
            <div class="footer-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div class="footer-text">
              <strong>Official Performance Record</strong><br>
              tools.swinfosystems.online/verify
            </div>
          </div>
          <div class="qr-box">
            <svg class="qr-svg" viewBox="0 0 24 24" fill="none" stroke="#525252" stroke-width="1.5">
              <path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM9 3h2v2H9zM13 3h2v2h-2zM9 7h2v2H9zM13 7h2v2h-2zM11 11h2v2h-2zM7 11h2v2H7zM15 11h2v2h-2zM11 15h2v2h-2zM7 15h2v2H7zM15 15h2v2h-2zM19 11h2v2h-2zM19 15h2v2h-2z"/>
            </svg>
            <div class="qr-text">Scan to Verify</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  iframeDoc.open();
  iframeDoc.write(content);
  iframeDoc.close();

  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    const canvas = await html2canvas(iframeDoc.body, { 
      scale: 1.8,
      backgroundColor: '#0a0a0a',
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
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
