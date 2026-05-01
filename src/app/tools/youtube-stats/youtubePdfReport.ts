import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generateYouTubePDF(stats: any) {
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

  const isVideo = stats.type === 'video';
  const isPlaylist = stats.type === 'playlist';
  const isChannel = stats.type === 'channel';

  const formatNumber = (num: string | number) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-IN').format(Number(num));
  };

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
        .brand-logo span { color: #ef4444; }
        
        .certificate-meta { text-align: right; }
        .cert-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px; }
        .cert-id { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #0f172a; }

        .hero-section { margin-bottom: 40px; }
        .hero-title { font-size: 36px; font-weight: 800; letter-spacing: -0.04em; margin-bottom: 8px; color: #0f172a; line-height: 1.2; }
        .hero-subtitle { font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

        .main-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .stat-card {
          padding: 24px 16px;
          border-radius: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          text-align: center;
        }
        
        .stat-card.primary {
          background: #0f172a;
          color: #ffffff;
          border: none;
        }
        
        .stat-card .label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          display: block;
          opacity: 0.7;
        }
        
        .stat-card .value {
          font-size: 28px;
          font-weight: 800;
          line-height: 1;
        }

        .content-box {
          background: #f8fafc;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          padding: 30px;
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .section-title::after {
          content: "";
          flex: 1;
          height: 2px;
          background: #f1f5f9;
        }

        .data-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .data-item {
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        .data-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
        .data-value { font-size: 14px; font-weight: 700; color: #0f172a; }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .tag {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
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
        
        .qr-section { text-align: center; }
        .qr-placeholder {
          width: 80px;
          height: 80px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
        .qr-label {
          font-size: 8px;
          font-weight: 800;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      </style>
    </head>
    <body>
      <div class="page-header">
        <div class="brand-logo">YT<span>STATS</span></div>
        <div class="certificate-meta">
          <div class="cert-label">Report ID</div>
          <div class="cert-id">${Math.random().toString(36).substring(2, 15).toUpperCase()}</div>
        </div>
      </div>

      <div class="hero-section">
        <div class="hero-subtitle">YouTube ${stats.type} Analysis</div>
        <h1 class="hero-title">${stats.title}</h1>
        <div class="hero-subtitle" style="color: #94a3b8; font-weight: 500;">Extracted on ${dateStr}</div>
      </div>

      <div class="main-stats">
        ${isVideo ? `
          <div class="stat-card primary">
            <span class="label">Total Views</span>
            <div class="value">${formatNumber(stats.viewCount)}</div>
          </div>
          <div class="stat-card">
            <span class="label">Total Likes</span>
            <div class="value">${formatNumber(stats.likeCount)}</div>
          </div>
          <div class="stat-card">
            <span class="label">Comments</span>
            <div class="value">${formatNumber(stats.commentCount)}</div>
          </div>
        ` : isPlaylist ? `
          <div class="stat-card primary">
            <span class="label">Total Videos</span>
            <div class="value">${formatNumber(stats.itemCount)}</div>
          </div>
          <div class="stat-card">
            <span class="label">Channel</span>
            <div class="value" style="font-size: 18px;">${stats.channelTitle}</div>
          </div>
          <div class="stat-card">
            <span class="label">Type</span>
            <div class="value" style="font-size: 18px;">Playlist</div>
          </div>
        ` : `
          <div class="stat-card primary">
            <span class="label">Subscribers</span>
            <div class="value">${formatNumber(stats.subscriberCount)}</div>
          </div>
          <div class="stat-card">
            <span class="label">Total Views</span>
            <div class="value">${formatNumber(stats.viewCount)}</div>
          </div>
          <div class="stat-card">
            <span class="label">Videos</span>
            <div class="value">${formatNumber(stats.videoCount)}</div>
          </div>
        `}
      </div>

      <div class="section-title">Deep Insights</div>
      <div class="content-box">
        <div class="data-grid">
          <div class="data-item">
            <div class="data-label">Published At</div>
            <div class="data-value">${new Date(stats.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          </div>
          <div class="data-item">
            <div class="data-label">YouTube ID</div>
            <div class="data-value">${stats.id}</div>
          </div>
          ${isVideo ? `
            <div class="data-item">
              <div class="data-label">Channel Name</div>
              <div class="data-value">${stats.channel.title}</div>
            </div>
            <div class="data-item">
              <div class="data-label">Video Duration</div>
              <div class="data-value">${stats.duration.replace('PT','').toLowerCase()}</div>
            </div>
          ` : ''}
        </div>
        
        ${isVideo && stats.tags?.length > 0 ? `
          <div style="margin-top: 30px;">
            <div class="data-label">Extracted Tags</div>
            <div class="tags-container">
              ${stats.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <div class="section-title">Description Overview</div>
      <div class="content-box" style="font-size: 12px; color: #64748b; line-height: 1.8;">
        ${stats.description.substring(0, 1000)}${stats.description.length > 1000 ? '...' : ''}
      </div>

      <div class="footer">
        <div class="footer-info">
          <strong>Official YouTube Data Report</strong><br>
          Generated via SW Tools (tools.swinfosystems.online)<br>
          Source: YouTube Data API v3
        </div>
        <div class="qr-section">
          <div class="qr-placeholder">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1.5">
              <path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM9 3h2v2H9zM13 3h2v2h-2zM9 7h2v2H9zM13 7h2v2h-2zM11 11h2v2h-2zM7 11h2v2H7zM15 11h2v2h-2zM11 15h2v2h-2zM7 15h2v2H7zM15 15h2v2h-2zM19 11h2v2h-2zM19 15h2v2h-2z" />
            </svg>
          </div>
          <div class="qr-label">Verified Report</div>
        </div>
      </div>
    </body>
    </html>
  `;

  iframeDoc.open();
  iframeDoc.write(content);
  iframeDoc.close();

  // Wait for content and fonts
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    const canvas = await html2canvas(iframeDoc.body, { 
      scale: 1.5,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
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
    pdf.save(`YT_${stats.type.toUpperCase()}_Report_${new Date().getTime()}.pdf`);
  } catch (err) {
    console.error("PDF Generation Error:", err);
    alert("Could not generate report. Please try again.");
  } finally {
    document.body.removeChild(iframe);
  }
}
