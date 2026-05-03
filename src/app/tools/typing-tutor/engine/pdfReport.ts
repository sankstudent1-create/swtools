import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TypingSessionResult } from '../engine/analyzer';

export async function generateTypingPDF(results: TypingSessionResult, examName: string = "Typing Skill Test") {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '0';
  iframe.style.width = '1200px';
  iframe.style.height = '1600px';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const verifyId = Math.random().toString(36).substring(2, 12).toUpperCase();
  
  const getGrade = (wpm: number, acc: number) => {
    const score = (wpm * 0.7) + (acc * 0.5);
    if (score >= 100) return { grade: 'S', color: '#7c3aed', title: 'Elite' };
    if (score >= 85) return { grade: 'A+', color: '#059669', title: 'Excellent' };
    if (score >= 70) return { grade: 'A', color: '#0891b2', title: 'Advanced' };
    if (score >= 55) return { grade: 'B', color: '#0284c7', title: 'Proficient' };
    if (score >= 40) return { grade: 'C', color: '#ea580c', title: 'Intermediate' };
    return { grade: 'D', color: '#dc2626', title: 'Beginner' };
  };

  const grade = getGrade(results.wpm, results.accuracy);

  doc.open();
  doc.write(`
<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact}
body{font-family:Inter,sans-serif;background:#fff;color:#0f172a;width:794px;min-height:1123px}
.page{background:#fff;padding:45px 55px;min-height:1123px}
.header{display:flex;justify-content:space-between;align-items:center;padding-bottom:25px;border-bottom:3px solid #0f172a;margin-bottom:35px}
.brand{display:flex;align-items:center;gap:12px}
.brand-icon{width:44px;height:44px;background:#0f172a;border-radius:10px;display:flex;align-items:center;justify-content:center}
.brand-icon svg{width:22px;height:22px;color:#fff}
.brand-text h1{font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-.02em}
.brand-text p{font-size:11px;color:#64748b;font-weight:500;margin-top:2px}
.cert-stamp{text-align:right}
.cert-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.15em;color:#94a3b8;margin-bottom:4px}
.cert-id{font-family:'Playfair Display',serif;font-size:14px;font-weight:700;color:#0f172a;letter-spacing:.1em}
.title-section{text-align:center;margin-bottom:40px}
.badge-top{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:#f1f5f9;border-radius:100px;margin-bottom:18px}
.badge-top svg{width:14px;height:14px;color:${grade.color}}
.badge-top span{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${grade.color}}
.main-title{font-family:'Playfair Display',serif;font-size:40px;font-weight:700;color:#0f172a;margin-bottom:10px;line-height:1.1}
.subtitle{font-size:14px;color:#64748b;font-weight:500}
.grade-section{display:flex;justify-content:center;margin-bottom:40px}
.grade-circle{width:140px;height:140px;border-radius:50%;border:5px solid ${grade.color};display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;box-shadow:0 8px 30px ${grade.color}20}
.grade-letter{font-family:'Playfair Display',serif;font-size:56px;font-weight:700;color:${grade.color};line-height:1}
.grade-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin-top:4px}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:35px}
.stat-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:28px 20px;text-align:center}
.stat-box.primary{background:#0f172a;border-color:#0f172a;color:#fff}
.stat-icon{width:44px;height:44px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.stat-box.primary .stat-icon{background:rgba(255,255,255,.15);box-shadow:none}
.stat-icon svg{width:22px;height:22px;color:#0f172a}
.stat-box.primary .stat-icon svg{color:#fff}
.stat-value{font-size:36px;font-weight:800;color:#0f172a;line-height:1;margin-bottom:6px;letter-spacing:-.02em}
.stat-box.primary .stat-value{color:#fff}
.stat-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8}
.stat-box.primary .stat-label{color:rgba(255,255,255,.7)}
.progress-section{background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:30px;margin-bottom:30px}
.sec-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#0f172a;margin-bottom:20px;display:flex;align-items:center;gap:8px}
.sec-title svg{width:18px;height:18px;color:${grade.color}}
.progress-item{margin-bottom:18px}
.progress-item:last-child{margin-bottom:0}
.progress-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.progress-label{font-size:13px;font-weight:600;color:#475569}
.progress-value{font-size:14px;font-weight:700;color:#0f172a}
.progress-bar{height:10px;background:#e2e8f0;border-radius:100px;overflow:hidden}
.progress-fill{height:100%;border-radius:100px}
.progress-fill.acc{width:${results.accuracy}%;background:linear-gradient(90deg,#22c55e,#16a34a)}
.progress-fill.spd{width:${Math.min(100,results.wpm)}%;background:linear-gradient(90deg,#3b82f6,#2563eb)}
.analysis-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px}
.analysis-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px}
.card-h{display:flex;align-items:center;gap:10px;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #e2e8f0}
.card-h svg{width:20px;height:20px;color:#0f172a}
.card-t{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#0f172a}
.metric-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;font-size:14px}
.metric-n{font-weight:500;color:#64748b}
.metric-v{font-weight:700;color:#0f172a}
.metric-v.good{color:#16a34a}
.metric-v.bad{color:#dc2626}
.keys-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.key-tag{padding:6px 12px;background:#fff;border:2px solid #0f172a;border-radius:8px;font-family:'Playfair Display',serif;font-size:14px;font-weight:600;color:#0f172a}
.key-tag.empty{border-color:#cbd5e1;color:#94a3b8;font-family:Inter,sans-serif;font-size:12px}
.footer{margin-top:auto;padding-top:25px;border-top:2px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center}
.f-left{display:flex;align-items:center;gap:12px}
.f-logo{width:40px;height:40px;background:#0f172a;border-radius:10px;display:flex;align-items:center;justify-content:center}
.f-logo svg{width:22px;height:22px;color:#fff}
.f-text{font-size:12px;color:#94a3b8;line-height:1.5}
.f-text strong{color:#64748b;font-weight:600}
.qr-box{text-align:center}
.qr{width:60px;height:60px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px}
.qr svg{width:32px;height:32px;color:#94a3b8}
.qr-l{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8}
</style>
</head>
<body>
<div class="page">
<div class="header">
<div class="brand">
<div class="brand-icon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
</div>
<div class="brand-text">
<h1>SW TOOLS</h1>
<p>Professional Typing Analytics</p>
</div>
</div>
<div class="cert-stamp">
<div class="cert-label">Certificate ID</div>
<div class="cert-id">${verifyId}</div>
</div>
</div>

<div class="title-section">
<div class="badge-top">
<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
<span>${grade.title} Performance</span>
</div>
<h1 class="main-title">${examName}</h1>
<p class="subtitle">Completed on ${dateStr}</p>
</div>

<div class="grade-section">
<div class="grade-circle">
<div class="grade-letter">${grade.grade}</div>
<div class="grade-label">Grade</div>
</div>
</div>

<div class="stats-grid">
<div class="stat-box primary">
<div class="stat-icon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
</div>
<div class="stat-value">${results.wpm}</div>
<div class="stat-label">Words Per Minute</div>
</div>
<div class="stat-box">
<div class="stat-icon" style="color:#16a34a">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
</div>
<div class="stat-value" style="color:#16a34a">${results.accuracy}%</div>
<div class="stat-label">Accuracy Rate</div>
</div>
<div class="stat-box">
<div class="stat-icon" style="color:#2563eb">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
</div>
<div class="stat-value" style="color:#2563eb">${results.rawWpm}</div>
<div class="stat-label">Raw Speed</div>
</div>
</div>

<div class="progress-section">
<div class="sec-title">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
Performance Metrics
</div>
<div class="progress-item">
<div class="progress-header">
<span class="progress-label">Typing Accuracy</span>
<span class="progress-value">${results.accuracy}%</span>
</div>
<div class="progress-bar"><div class="progress-fill acc"></div></div>
</div>
<div class="progress-item">
<div class="progress-header">
<span class="progress-label">Speed Rating</span>
<span class="progress-value">${results.wpm} WPM</span>
</div>
<div class="progress-bar"><div class="progress-fill spd"></div></div>
</div>
</div>

<div class="analysis-grid">
<div class="analysis-card">
<div class="card-h">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
<span class="card-t">Keystroke Analysis</span>
</div>
<div class="metric-row"><span class="metric-n">Total Keystrokes</span><span class="metric-v">${results.totalKeystrokes.toLocaleString()}</span></div>
<div class="metric-row"><span class="metric-n">Correct</span><span class="metric-v good">${results.correctKeystrokes.toLocaleString()}</span></div>
<div class="metric-row"><span class="metric-n">Incorrect</span><span class="metric-v bad">${results.incorrectKeystrokes.toLocaleString()}</span></div>
<div class="metric-row"><span class="metric-n">Corrections</span><span class="metric-v">${results.backspaces}</span></div>
</div>
<div class="analysis-card">
<div class="card-h">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
<span class="card-t">Focus Areas</span>
</div>
<p style="font-size:13px;color:#64748b;margin-bottom:12px">Practice these characters:</p>
<div class="keys-row">
${results.weakKeys.length > 0 ? results.weakKeys.map(k => `<span class="key-tag">${k === ' ' ? 'Space' : k}</span>`).join('') : `<span class="key-tag empty">No weak keys!</span>`}
</div>
</div>
</div>

<div class="footer">
<div class="f-left">
<div class="f-logo">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
</div>
<div class="f-text">
<strong>Official Certificate</strong><br>
tools.swinfosystems.online
</div>
</div>
<div class="qr-box">
<div class="qr">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3z"/></svg>
</div>
<div class="qr-l">Verify</div>
</div>
</div>
</div>
</body>
</html>`);

  doc.close();
  await new Promise(r => setTimeout(r, 1500));

  try {
    const canvas = await html2canvas(doc.body, { scale: 2, backgroundColor: '#fff', useCORS: true, logging: false });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save(`${examName.replace(/\s+/g, '_')}_Certificate.pdf`);
  } catch (e) {
    console.error(e);
    alert('PDF generation failed');
  } finally {
    document.body.removeChild(iframe);
  }
}
