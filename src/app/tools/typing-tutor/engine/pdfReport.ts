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
      <style>
        /* Force reset to avoid inheriting any parent styles that might use oklab */
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
        }
        body {
          margin: 0;
          padding: 40px;
          width: 800px;
          background: #ffffff !important;
          color: #000000 !important;
          font-family: Arial, sans-serif;
        }
        .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; text-align: center; }
        .title { margin: 0; font-size: 24px; text-transform: uppercase; }
        .date { margin: 5px 0 0; color: #666; font-size: 14px; }
        .grid { display: table; width: 100%; border-spacing: 20px; margin-bottom: 20px; }
        .grid-col { display: table-cell; width: 50%; padding: 20px; border: 1px solid #eee; border-radius: 8px; vertical-align: top; }
        .stat-label { font-size: 14px; color: #666; text-transform: uppercase; margin-bottom: 8px; }
        .stat-value { font-size: 32px; font-weight: bold; }
        .stat-sub { font-size: 12px; color: #999; margin-top: 4px; }
        .section-title { border-left: 4px solid #000; padding-left: 10px; margin-bottom: 15px; font-size: 18px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        td { padding: 8px; border-bottom: 1px solid #eee; font-size: 14px; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .footer { margin-top: 50px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">${examName} Report</h1>
        <p class="date">Generated on ${dateStr}</p>
      </div>

      <div class="grid">
        <div class="grid-col">
          <div class="stat-label">Net Speed</div>
          <div class="stat-value" style="color: ${results.wpm >= 27 ? '#059669' : '#dc2626'}">${results.wpm} WPM</div>
          <div class="stat-sub">Gross Speed: ${results.rawWpm} WPM</div>
        </div>
        <div class="grid-col">
          <div class="stat-label">Accuracy</div>
          <div class="stat-value" style="color: ${results.accuracy >= 95 ? '#2563eb' : '#d97706'}">${results.accuracy}%</div>
          <div class="stat-sub">Correct Keys: ${results.correctKeystrokes} / ${results.totalKeystrokes}</div>
        </div>
      </div>

      <div class="section-title">Detailed Statistics</div>
      <table>
        <tr>
          <td>Total Keystrokes</td>
          <td class="text-right bold">${results.totalKeystrokes}</td>
        </tr>
        <tr>
          <td>Mistakes (Spotted)</td>
          <td class="text-right bold" style="color: #dc2626;">${results.incorrectKeystrokes}</td>
        </tr>
        <tr>
          <td>Backspaces Used</td>
          <td class="text-right bold">${results.backspaces}</td>
        </tr>
        <tr>
          <td>Keys Per Hour (KPH)</td>
          <td class="text-right bold">${results.kph}</td>
        </tr>
        <tr>
          <td>Time Taken</td>
          <td class="text-right bold">${results.timeSeconds} seconds</td>
        </tr>
      </table>

      <div class="section-title">Mistake Analysis & Weak Keys</div>
      <p style="font-size: 14px; line-height: 1.6;">
        Our shortfall engine detected ${results.weakKeys.length} weak areas. 
        Focus keys for your next practice: <strong>${results.weakKeys.join(', ') || 'None'}</strong>.
      </p>

      <div class="footer">
        This is an auto-generated performance report from SW Tools Typing Tutor.
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

  // Wait for content to render
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    const canvas = await html2canvas(iframeDoc.body, { 
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      onclone: (clonedDoc) => {
        // Ensure the cloned document also doesn't have oklab
        const clonedStyles = clonedDoc.getElementsByTagName('style');
        for (let i = 0; i < clonedStyles.length; i++) {
           if (clonedStyles[i].textContent?.includes('oklab')) {
             clonedStyles[i].remove();
           }
        }
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`Typing_Report_${new Date().getTime()}.pdf`);
  } catch (err) {
    console.error("PDF Generation Error:", err);
    alert("Could not generate PDF. Please try again.");
  } finally {
    document.body.removeChild(iframe);
  }
}
