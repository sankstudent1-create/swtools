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

  const getThumbnailLetter = (title: string) => title.charAt(0).toUpperCase();

  const typeConfig = {
    video: { color: '#ef4444', icon: 'play', label: 'Video Analytics' },
    playlist: { color: '#8b5cf6', icon: 'list', label: 'Playlist Report' },
    channel: { color: '#22c55e', icon: 'user', label: 'Channel Insights' }
  };
  const config = typeConfig[stats.type as keyof typeof typeConfig];

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
        body {
          margin: 0;
          padding: 0;
          width: 800px;
          background: #0a0a0a !important;
          color: #ffffff !important;
          font-family: 'Inter', sans-serif;
        }
        
        .main-container {
          padding: 45px 50px;
          position: relative;
          min-height: 1130px;
          background: #0a0a0a;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 35px;
          padding-bottom: 25px;
          border-bottom: 2px solid #1a1a1a;
        }

        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-icon svg { width: 24px; height: 24px; }
        .brand-text { display: flex; flex-direction: column; }
        .brand-name { font-weight: 800; font-size: 20px; color: #ffffff; letter-spacing: -0.02em; }
        .brand-tagline { font-size: 11px; color: #737373; font-weight: 500; }

        .report-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: #171717;
          border: 1px solid #262626;
          border-radius: 10px;
        }
        .report-badge-icon { width: 20px; height: 20px; color: ${config.color}; }
        .report-badge-text { font-size: 11px; font-weight: 700; color: #a3a3a3; text-transform: uppercase; letter-spacing: 0.05em; }

        .hero-card {
          display: flex;
          gap: 25px;
          padding: 30px;
          background: linear-gradient(135deg, #171717 0%, #0f0f0f 100%);
          border: 1px solid #262626;
          border-radius: 20px;
          margin-bottom: 30px;
        }

        .thumbnail {
          width: 140px;
          height: 100px;
          background: linear-gradient(135deg, ${config.color}40 0%, ${config.color}20 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: 900;
          color: ${config.color};
          flex-shrink: 0;
          border: 2px solid ${config.color}30;
        }
        .thumbnail svg { width: 48px; height: 48px; color: ${config.color}; }

        .hero-content { flex: 1; }
        .hero-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: ${config.color}20;
          border: 1px solid ${config.color}40;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          color: ${config.color};
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }
        .hero-title { 
          font-size: 26px; 
          font-weight: 800; 
          color: #ffffff; 
          margin: 0 0 10px 0; 
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .hero-meta { font-size: 13px; color: #737373; font-weight: 500; }

        .main-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          padding: 22px 18px;
          background: #171717;
          border: 1px solid #262626;
          border-radius: 16px;
          text-align: center;
        }
        
        .stat-card.primary {
          background: linear-gradient(135deg, ${config.color} 0%, ${isVideo ? '#dc2626' : isPlaylist ? '#7c3aed' : '#16a34a'} 100%);
          border: none;
          box-shadow: 0 10px 30px ${config.color}30;
        }
        
        .stat-icon {
          width: 36px;
          height: 36px;
          margin: 0 auto 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${config.color}20;
          border-radius: 10px;
        }
        .stat-card.primary .stat-icon { background: rgba(255,255,255,0.2); }
        .stat-icon svg { width: 20px; height: 20px; color: ${config.color}; }
        .stat-card.primary .stat-icon svg { color: #ffffff; }
        
        .stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
          letter-spacing: -0.02em;
        }
        .stat-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #737373;
        }
        .stat-card.primary .stat-label { color: rgba(255,255,255,0.7); }

        .details-section {
          padding: 25px;
          background: #171717;
          border: 1px solid #262626;
          border-radius: 16px;
          margin-bottom: 25px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #262626;
        }
        .section-header svg { width: 20px; height: 20px; color: ${config.color}; }
        .section-title { font-size: 13px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em; }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px 30px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #262626;
        }
        .detail-item:last-child { border-bottom: none; }
        .detail-label { font-size: 12px; color: #737373; font-weight: 500; }
        .detail-value { font-size: 13px; font-weight: 700; color: #ffffff; }
        .detail-value.channel { color: ${config.color}; }

        .tags-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #262626;
        }
        .tags-label { font-size: 11px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .tags-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag {
          padding: 6px 12px;
          background: #262626;
          border: 1px solid #404040;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          color: #a3a3a3;
        }

        .description-card {
          padding: 25px;
          background: #171717;
          border: 1px solid #262626;
          border-radius: 16px;
          margin-bottom: 30px;
        }
        
        .description-text {
          font-size: 13px;
          line-height: 1.8;
          color: #a3a3a3;
          max-height: 120px;
          overflow: hidden;
        }

        .footer {
          margin-top: auto;
          padding-top: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 2px solid #1a1a1a;
        }

        .footer-info { display: flex; align-items: center; gap: 15px; }
        .footer-logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .footer-logo svg { width: 22px; height: 22px; }
        .footer-text { font-size: 11px; color: #525252; line-height: 1.6; }
        .footer-text strong { color: #a3a3a3; font-weight: 700; }

        .verify-box {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 20px;
          background: #171717;
          border: 1px solid #262626;
          border-radius: 12px;
        }
        .qr-code { width: 50px; height: 50px; opacity: 0.5; }
        .qr-code svg { width: 100%; height: 100%; }
        .verify-text { text-align: left; }
        .verify-label { font-size: 9px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
        .verify-id { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #737373; }

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
        <div class="watermark">YOUTUBE</div>

        <div class="header">
          <div class="brand">
            <div class="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
              </svg>
            </div>
            <div class="brand-text">
              <div class="brand-name">YT STATS</div>
              <div class="brand-tagline">Professional Analytics</div>
            </div>
          </div>
          <div class="report-badge">
            <svg class="report-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
            <span class="report-badge-text">${config.label}</span>
          </div>
        </div>

        <div class="hero-card">
          <div class="thumbnail">
            ${isVideo ? `
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ` : isPlaylist ? `
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            ` : `
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
              </svg>
            `}
          </div>
          <div class="hero-content">
            <div class="hero-label">${stats.type.toUpperCase()}</div>
            <h1 class="hero-title">${stats.title}</h1>
            <div class="hero-meta">Generated on ${dateStr}</div>
          </div>
        </div>

        <div class="main-stats">
          ${isVideo ? `
            <div class="stat-card primary">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div class="stat-value">${formatNumber(stats.viewCount)}</div>
              <div class="stat-label">Total Views</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
              </div>
              <div class="stat-value">${formatNumber(stats.likeCount)}</div>
              <div class="stat-label">Likes</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="stat-value">${formatNumber(stats.commentCount)}</div>
              <div class="stat-label">Comments</div>
            </div>
          ` : isPlaylist ? `
            <div class="stat-card primary">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div class="stat-value">${formatNumber(stats.itemCount)}</div>
              <div class="stat-label">Videos</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="stat-value" style="font-size: 18px;">${stats.channelTitle}</div>
              <div class="stat-label">Channel</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="stat-value">${new Date(stats.publishedAt).getFullYear()}</div>
              <div class="stat-label">Created</div>
            </div>
          ` : `
            <div class="stat-card primary">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="stat-value">${formatNumber(stats.subscriberCount)}</div>
              <div class="stat-label">Subscribers</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div class="stat-value">${formatNumber(stats.viewCount)}</div>
              <div class="stat-label">Total Views</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div class="stat-value">${formatNumber(stats.videoCount)}</div>
              <div class="stat-label">Videos</div>
            </div>
          `}
        </div>

        <div class="details-section">
          <div class="section-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span class="section-title">Metadata & Details</span>
          </div>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">YouTube ID</span>
              <span class="detail-value">${stats.id}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Published</span>
              <span class="detail-value">${new Date(stats.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            ${isVideo ? `
              <div class="detail-item">
                <span class="detail-label">Channel</span>
                <span class="detail-value channel">${stats.channel.title}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Duration</span>
                <span class="detail-value">${stats.duration.replace('PT','').toLowerCase()}</span>
              </div>
            ` : isChannel ? `
              <div class="detail-item">
                <span class="detail-label">Channel</span>
                <span class="detail-value channel">${stats.title}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Type</span>
                <span class="detail-value">Public Channel</span>
              </div>
            ` : ''}
          </div>
          
          ${isVideo && stats.tags?.length > 0 ? `
            <div class="tags-section">
              <div class="tags-label">Video Tags</div>
              <div class="tags-row">
                ${stats.tags.slice(0, 10).map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="description-card">
          <div class="section-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span class="section-title">Description</span>
          </div>
          <div class="description-text">
            ${stats.description.substring(0, 500)}${stats.description.length > 500 ? '...' : ''}
          </div>
        </div>

        <div class="footer">
          <div class="footer-info">
            <div class="footer-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
              </svg>
            </div>
            <div class="footer-text">
              <strong>Official YouTube Analytics Report</strong><br>
              tools.swinfosystems.online • Data via YouTube API v3
            </div>
          </div>
          <div class="verify-box">
            <div class="qr-code">
              <svg viewBox="0 0 24 24" fill="none" stroke="#525252" stroke-width="1.5">
                <path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM9 3h2v2H9zM13 3h2v2h-2zM9 7h2v2H9zM13 7h2v2h-2zM11 11h2v2h-2zM7 11h2v2H7zM15 11h2v2h-2zM11 15h2v2h-2zM7 15h2v2H7zM15 15h2v2h-2zM19 11h2v2h-2zM19 15h2v2h-2z"/>
              </svg>
            </div>
            <div class="verify-text">
              <div class="verify-label">Verified Report ID</div>
              <div class="verify-id">${Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
            </div>
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
    pdf.save(`YT_${stats.type.toUpperCase()}_Report_${new Date().getTime()}.pdf`);
  } catch (err) {
    console.error("PDF Generation Error:", err);
    alert("Could not generate report. Please try again.");
  } finally {
    document.body.removeChild(iframe);
  }
}
