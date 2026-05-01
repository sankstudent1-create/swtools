import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TypingSessionResult } from '../engine/analyzer';

export async function generateTypingPDF(results: TypingSessionResult, examName: string = "Typing Skill Test") {
  // Create an iframe to isolate the report from Tailwind and modern CSS color functions
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '1000px';
  iframe.style.height = '1414px'; // A4 Aspect Ratio
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
        body {
          margin: 0;
          padding: 50px;
          width: 800px;
          background: #ffffff !important;
          color: #1e293b !important;
          font-family: 'Inter', sans-serif;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 25px;
          margin-bottom: 40px;
        }
        .brand {
          font-weight: 800;
          font-size: 20px;
          letter-spacing: -0.02em;
          color: #0f172a;
        }
        .brand span { color: #f97316; }
        .report-type {
          background: #f8fafc;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }
        .title-section { margin-bottom: 40px; }
        .title { font-size: 32px; font-weight: 800; margin: 0; color: #0f172a; letter-spacing: -0.03em; }
        .date { font-size: 14px; color: #64748b; margin-top: 5px; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }
        .stat-card {
          padding: 24px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }
        .stat-card.primary {
          background: #0f172a;
          color: #ffffff;
          border: none;
        }
        .stat-label {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          display: block;
          opacity: 0.8;
        }
        .stat-value {
          font-size: 42px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 8px;
        }
        .stat-footer {
          font-size: 13px;
          font-weight: 500;
          opacity: 0.7;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #0f172a;
        }
        .section-title::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .metrics-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 40px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }
        .metrics-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
        }
        .metrics-table tr:last-child td { border-bottom: none; }
        .metrics-table .label { font-weight: 600; color: #475569; }
        .metrics-table .value { font-family: 'JetBrains Mono', monospace; font-weight: 600; text-align: right; color: #0f172a; }

        .analysis-box {
          background: #fff7ed;
          border: 1px solid #ffedd5;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 40px;
        }
        .analysis-title { font-weight: 700; color: #9a3412; margin-bottom: 8px; font-size: 15px; }
        .analysis-text { font-size: 14px; color: #c2410c; line-height: 1.6; }
        .weak-keys { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
        .key-badge {
          background: #ffffff;
          border: 1px solid #fed7aa;
          padding: 4px 10px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 13px;
          color: #9a3412;
        }

        .footer {
          margin-top: 60px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
          padding-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">SW<span>TOOLS</span></div>
        <div class="report-type">Verified Performance Certificate</div>
      </div>

      <div class="title-section">
        <h1 class="title">${examName}</h1>
        <p class="date">Achieved on ${dateStr}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card primary">
          <span class="stat-label">Net Typing Speed</span>
          <div class="stat-value">${results.wpm} WPM</div>
          <div class="stat-footer">Gross Speed: ${results.rawWpm} WPM</div>
        </div>
        <div class="stat-card">
          <span class="stat-label" style="color: #64748b">Accuracy Score</span>
          <div class="stat-value" style="color: #0f172a">${results.accuracy}%</div>
          <div class="stat-footer" style="color: #64748b">Consistency: High</div>
        </div>
      </div>

      <div class="section-title">Performance Metrics</div>
      <table class="metrics-table">
        <tr>
          <td class="label">Total Keypresses</td>
          <td class="value">${results.totalKeystrokes}</td>
        </tr>
        <tr>
          <td class="label">Correct Characters</td>
          <td class="value" style="color: #059669">${results.correctKeystrokes}</td>
        </tr>
        <tr>
          <td class="label">Incorrect Characters</td>
          <td class="value" style="color: #dc2626">${results.incorrectKeystrokes}</td>
        </tr>
        <tr>
          <td class="label">Correction (Backspaces)</td>
          <td class="value">${results.backspaces}</td>
        </tr>
        <tr>
          <td class="label">KPH (Keys Per Hour)</td>
          <td class="value">${results.kph}</td>
        </tr>
        <tr>
          <td class="label">Session Duration</td>
          <td class="value">${Math.floor(results.timeSeconds / 60)}m ${results.timeSeconds % 60}s</td>
        </tr>
      </table>

      <div class="section-title">Intelligent Skill Analysis</div>
      <div class="analysis-box">
        <div class="analysis-title">Adaptive Engine Findings</div>
        <div class="analysis-text">
          Based on your keystroke patterns, our engine detected ${results.weakKeys.length} areas requiring focus. 
          Targeting these specific keys in your next session can improve your speed by up to 15%.
        </div>
        ${results.weakKeys.length > 0 ? `
          <div class="weak-keys">
            ${results.weakKeys.map(key => `<span class="key-badge">${key === ' ' ? 'Space' : key}</span>`).join('')}
          </div>
        ` : ''}
      </div>

      <div class="footer">
        This document is an official performance record generated by SW Tools Typing Tutor.<br>
        Verification ID: ${Math.random().toString(36).substring(2, 15).toUpperCase()} • swtools.online
      </div>
    </body>
    </html>
  `;

  iframeDoc.open();
  iframeDoc.write(content);
  iframeDoc.close();

  // Clear any potential oklab-using stylesheets from the iframe just in case
  const styles = iframeDoc.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    if (styles[i].textContent?.includes('oklab')) {
      styles[i].remove();
    }
  }

  // Wait for fonts and content to render
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    const canvas = await html2canvas(iframeDoc.body, { 
      scale: 1.5, // Reduced scale for better file size
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true,
      imageTimeout: 0,
      onclone: (clonedDoc) => {
        const clonedStyles = clonedDoc.getElementsByTagName('style');
        for (let i = 0; i < clonedStyles.length; i++) {
           if (clonedStyles[i].textContent?.includes('oklab')) {
             clonedStyles[i].remove();
           }
        }
      }
    });
    
    // Use JPEG with 0.8 compression for significantly smaller file size (16MB -> ~500KB)
    const imgData = canvas.toDataURL('image/jpeg', 0.8);
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(`Typing_Certificate_${new Date().getTime()}.pdf`);
  } catch (err) {
    console.error("PDF Generation Error:", err);
    alert("Could not generate PDF. Please try again.");
  } finally {
    document.body.removeChild(iframe);
  }
}
