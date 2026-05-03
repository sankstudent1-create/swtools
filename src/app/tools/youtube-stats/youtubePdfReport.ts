import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generateYouTubePDF(stats: any) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '0';
  iframe.style.width = '1200px';
  iframe.style.height = '1600px';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const dateStr = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const verifyId = Math.random().toString(36).substring(2, 12).toUpperCase();

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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; }
        body {
          font-family: 'Inter', sans-serif;
          background: #f8fafc !important;
          color: #0f172a !important;
          width: 794px;
          min-height: 1123px;
        }

        .page {
          background: white;
          padding: 45px 55px;
          min-height: 1123px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 25px;
          border-bottom: 3px solid ${config.color};
          margin-bottom: 30px;
        }

        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-icon {
          width: 44px;
          height: 44px;
          background: ${config.color};
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-icon svg { width: 24px; height: 24px; color: white; }
        .brand-text { display: flex; flex-direction: column; }
        .brand-name { font-weight: 800; font-size: 19px; color: #0f172a; letter-spacing: -0.02em; }
        .brand-tagline { font-size: 11px; color: #64748b; font-weight: 500; }

        .report-stamp { text-align: right; }
        .report-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: ${config.color}; margin-bottom: 4px; }
        .report-id { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: #0f172a; letter-spacing: 0.1em; }

        .hero-card {
          display: flex;
          gap: 25px;
          padding: 28px;
          background: ${config.color}10;
          border: 1px solid ${config.color}30;
          border-radius: 18px;
          margin-bottom: 30px;
        }

        .thumbnail {
          width: 140px;
          height: 100px;
          background: ${config.color};
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .thumbnail svg { width: 48px; height: 48px; color: white; }

        .hero-content { flex: 1; }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: white;
          border-radius: 100px;
          margin-bottom: 12px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: ${config.color};
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .hero-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 10px 0;
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hero-meta { font-size: 13px; color: #64748b; font-weight: 500; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px 20px;
          text-align: center;
        }

        .stat-card.primary {
          background: ${config.color};
          border-color: ${config.color};
          box-shadow: 0 10px 30px ${config.color}30;
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${config.color}10;
          border-radius: 12px;
        }

        .stat-card.primary .stat-icon { background: rgba(255,255,255,0.2); }
        .stat-icon svg { width: 22px; height: 22px; color: ${config.color}; }
        .stat-card.primary .stat-icon svg { color: white; }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }

        .stat-card.primary .stat-value { color: white; }

        .stat-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94a3b8;
        }

        .stat-card.primary .stat-label { color: rgba(255,255,255,0.8); }

        .details-section {
          padding: 25px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          margin-bottom: 25px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e2e8f0;
        }
        .section-header svg { width: 18px; height: 18px; color: ${config.color}; }
        .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; }

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
          border-bottom: 1px solid #e2e8f0;
        }
        .detail-item:last-child { border-bottom: none; }
        .detail-label { font-size: 13px; color: #64748b; font-weight: 500; }
        .detail-value { font-size: 14px; font-weight: 700; color: #0f172a; }
        .detail-value.channel { color: ${config.color}; }

        .tags-section {
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #e2e8f0;
        }
        .tags-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
        .tags-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag {
          padding: 6px 12px;
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          color: #475569;
        }

        .description-card {
          padding: 25px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          margin-bottom: 30px;
        }

        .description-text {
          font-size: 14px;
          line-height: 1.7;
          color: #475569;
        }

        .footer {
          margin-top: auto;
          padding-top: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 2px solid #e2e8f0;
        }

        .footer-info { display: flex; align-items: center; gap: 12px; }
        .footer-logo {
          width: 40px;
          height: 40px;
          background: #dc2626;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .footer-logo svg { width: 22px; height: 22px; color: white; }
        .footer-text { font-size: 12px; color: #94a3b8; line-height: 1.5; }
        .footer-text strong { color: #64748b; font-weight: 600; }

        .qr-box { text-align: center; }
        .qr { width: 60px; height: 60px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; }
        .qr svg { width: 32px; height: 32px; color: #94a3b8; }
        .qr-l { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; }
      </style>
    </head>
    </head>
    <body>
      <div class="page">
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
          <div class="report-stamp">
            <div class="report-label">Report ID</div>
            <div class="report-id">${verifyId}</div>
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
            <div class="hero-badge">${stats.type.toUpperCase()}</div>
            <h1 class="hero-title">${stats.title}</h1>
            <div class="hero-meta">Generated on ${dateStr}</div>
          </div>
        </div>

        <div class="stats-grid">
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
              <strong>YouTube Analytics Report</strong><br>
              tools.swinfosystems.online
            </div>
          </div>
          <div class="qr-box">
            <div class="qr">
              <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
                <path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3z"/>
              </svg>
            </div>
            <div class="qr-l">Verify</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  doc.open();
  doc.write(content);
  doc.close();

  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    const canvas = await html2canvas(doc.body, {
      scale: 2,
      backgroundColor: '#ffffff',
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
