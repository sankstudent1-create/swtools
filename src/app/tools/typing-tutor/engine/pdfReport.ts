import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TypingSessionResult } from '../engine/analyzer';

export async function generateTypingPDF(results: TypingSessionResult, examName: string = "Typing Skill Test") {
  const element = document.createElement('div');
  element.style.padding = '40px';
  element.style.width = '800px';
  element.style.background = '#ffffff';
  element.style.color = '#000000';
  element.style.fontFamily = 'sans-serif';

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  element.innerHTML = `
    <div style="border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; text-transform: uppercase;">${examName} Report</h1>
      <p style="margin: 5px 0 0; color: #666;">Generated on ${dateStr}</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
      <div style="padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="font-size: 14px; color: #666; text-transform: uppercase;">Net Speed</div>
        <div style="font-size: 32px; font-weight: bold; color: ${results.wpm >= 27 ? '#059669' : '#dc2626'}">${results.wpm} WPM</div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">Gross Speed: ${results.rawWpm} WPM</div>
      </div>
      <div style="padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="font-size: 14px; color: #666; text-transform: uppercase;">Accuracy</div>
        <div style="font-size: 32px; font-weight: bold; color: ${results.accuracy >= 95 ? '#2563eb' : '#d97706'}">${results.accuracy}%</div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">Correct Keys: ${results.correctKeystrokes} / ${results.totalKeystrokes}</div>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="border-left: 4px solid #000; padding-left: 10px; margin-bottom: 15px;">Detailed Statistics</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">Total Keystrokes</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${results.totalKeystrokes}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">Mistakes (Spotted)</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #dc2626;">${results.incorrectKeystrokes}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">Backspaces Used</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${results.backspaces}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">Time Taken</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${results.timeSeconds} seconds</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="border-left: 4px solid #000; padding-left: 10px; margin-bottom: 15px;">Mistake Analysis & Weak Keys</h3>
      <p style="font-size: 14px; line-height: 1.6;">
        Our shortfall engine detected ${results.weakKeys.length} weak areas. 
        Focus keys for your next practice: <strong>${results.weakKeys.join(', ') || 'None'}</strong>.
      </p>
      <div style="margin-top: 15px; font-size: 12px; color: #666;">
        * Backspaces were counted but did not deduct from net speed unless you failed to correct the character.
      </div>
    </div>

    <div style="margin-top: 50px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999;">
      This is an auto-generated performance report from SW Tools Typing Tutor.
    </div>
  `;

  document.body.appendChild(element);
  
  try {
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`Typing_Report_${new Date().getTime()}.pdf`);
  } finally {
    document.body.removeChild(element);
  }
}
