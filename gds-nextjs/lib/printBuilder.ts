import type { FormData, DerivedData } from '@/types/gds';
import { derive, fmtDMY, fmtLong, getPrintCSS } from '@/lib/utils';

// ─── Render a single leave application page as HTML string ───────────────────

function renderPage1HTML(data: FormData, derived: DerivedData): string {
  const { applicant: a, leave: l, substitute: s, sanction: sn } = data;
  const d = derived;
  const addrLines = l.address.split('\n');

  const T = (style: string, cls: string, content: string) =>
    `<div class="t ${cls}" style="${style}">${content}</div>`;
  const UL = (style: string) => `<div class="ul" style="${style}"></div>`;
  const UV = (id: string, style: string, content: string) =>
    `<div class="ulv" style="${style}">${content}</div>`;

  return `
<div class="pdf-page">
  <div class="pdf-border"></div>

  ${T('left:50%;transform:translateX(-50%);top:11mm','bold sz12','APPLICATION FOR LEAVE GRAMIN DAK SEVAKS')}
  ${T('left:50%;transform:translateX(-50%);top:16mm','bold sz12','(TO BE FILLED IN QUADRUPLICATE /4 COPY )')}

  ${T('left:11.5mm;top:25mm','sz12','1.')}
  ${T('left:19mm;top:25mm','sz12','Name')}
  ${T('left:52mm;top:25mm','sz12',':')}
  ${UL('left:55mm;top:29.5mm;right:11.5mm')}
  ${UV('','left:55.5mm;top:25.7mm;right:12mm',a.name)}

  ${T('left:11.5mm;top:33.5mm','sz12','2.')}
  ${T('left:19mm;top:33.5mm','sz12','Designation')}
  ${T('left:52mm;top:33.5mm','sz12',':')}
  ${UL('left:55mm;top:38mm;right:11.5mm')}
  ${UV('','left:55.5mm;top:34.2mm;right:12mm',a.desig)}

  ${T('left:11.5mm;top:42mm','sz12','3.')}
  ${T('left:19mm;top:42mm','sz12','Nature and period of leave required (Paid leave/LWA)')}
  ${T('left:138mm;top:42mm','sz12',':')}
  ${UL('left:141mm;top:46.5mm;right:11.5mm')}
  ${UV('','left:141.5mm;top:42.7mm;right:12mm',l.leaveType)}

  ${T('left:11.5mm;top:50mm','sz12','4.')}
  ${T('left:19mm;top:50mm','sz12','Date for which leave is required')}
  ${T('left:88mm;top:50mm','sz12',':')}
  ${UL('left:91mm;top:54.5mm;right:11.5mm')}
  ${UV('','left:91.5mm;top:50.7mm;right:12mm',d.dateStr)}

  ${T('left:11.5mm;top:58mm','sz12','5.')}
  ${T('left:19mm;top:58mm','sz12','Grounds on which leave applied (Personal affairs / Medical')}
  ${T('left:19mm;top:63mm','sz12','ground / to officiate in a departmental post)')}
  ${T('left:113mm;top:63mm','sz12',':')}
  ${UL('left:116mm;top:67.5mm;right:11.5mm')}
  ${UV('','left:116.5mm;top:63.7mm;right:12mm',l.ground)}

  ${T('left:11.5mm;top:73mm','sz12','6.')}
  ${T('left:19mm;top:73mm','sz12','Full address while on leave')}
  ${T('left:76mm;top:73mm','sz12',':')}
  ${UL('left:79mm;top:77.5mm;right:11.5mm')}
  ${UV('','left:79.5mm;top:73.7mm;right:12mm', addrLines[0] || '')}
  ${UL('left:19mm;top:87.5mm;right:11.5mm')}
  ${UV('','left:19.5mm;top:83.7mm;right:12mm', addrLines[1] || '')}

  ${T('left:11.5mm;top:93mm','sz12','7.')}
  ${T('left:19mm;top:93mm','sz12','Name, Age and address of the substitute')}
  ${T('left:107mm;top:93mm','sz12',':')}
  ${UL('left:110mm;top:97.5mm;right:11.5mm')}
  ${UV('','left:110.5mm;top:93.7mm;right:12mm', d.subLine1)}
  ${UL('left:19mm;top:107.5mm;right:11.5mm')}
  ${UV('','left:19.5mm;top:103.7mm;right:12mm', s.address)}

  ${T('left:11.5mm;top:113mm','sz12','8.')}
  ${T('left:19mm;top:113mm','sz12','Specimen signature of the substitute')}
  ${T('left:101mm;top:113mm','sz12',':')}
  ${UL('left:104mm;top:117.5mm;right:11.5mm')}

  <div class="t sz10" style="position:absolute;left:19mm;top:122mm;width:179mm;text-align:justify;line-height:1.55;white-space:normal;">
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I hereby propose Shri/Smt/Kum. ${s.name || '_________________________________'} whose particulars are given above to work as my substitute during my leave on my responsibility according to the terms of the security bond executed by me.
  </div>
  <div class="t sz10" style="position:absolute;left:19mm;top:133mm;width:179mm;text-align:justify;line-height:1.55;white-space:normal;">
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I am aware of provisions of Rule 7 of the Department of Posts Gramin Dak Sevaks (Conduct and Employment) Rules, 2001 and I will abide by them.
  </div>
  <div class="t sz10" style="position:absolute;left:19mm;top:142mm;width:179mm;text-align:justify;line-height:1.55;white-space:normal;">
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A charge report signed by myself and my nominee will be submitted as prescribed in Rule 50 of Rules for Branch Office / Rules 45 &amp; 56 of P&amp;T Manual Vol.IV.
  </div>
  <div class="t sz10" style="position:absolute;left:19mm;top:151mm;width:179mm;line-height:1.55;white-space:normal;">
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Necessary approval may kindly be accorded to this arrangement.
  </div>

  ${T('left:11.5mm;top:159mm','sz12','Station :')}
  <div class="ulv" style="left:33mm;top:159mm;font-size:12pt;max-width:60mm;">${a.station}</div>
  ${T('left:11.5mm;top:165mm','sz12','Date &nbsp;&nbsp;&nbsp;&nbsp; :')}
  <div class="ulv" style="left:31mm;top:165mm;font-size:12pt;">${d.appDateFormatted}</div>
  ${T('right:11.5mm;top:165mm','bold sz12','Signature of the Gramin Dak Sevak')}

  ${T('left:50%;transform:translateX(-50%);top:174mm','bold sz12','LEAVE SANCTION ORDERS')}
  ${T('left:50%;transform:translateX(-50%);top:179.5mm','bold sz12','(For use of the sanctioning authority)')}

  ${T('left:15mm;top:187mm','sz10','1.')}
  <div class="t sz10" style="position:absolute;left:21mm;top:187mm;width:176mm;line-height:1.55;white-space:normal;">
    Shri/Smt/Kum.${a.name || '_______________________'}(Designation) ${a.desig || '_____________'} BO/SO
  </div>
  <div class="t sz10" style="position:absolute;left:21mm;top:192.5mm;width:176mm;line-height:1.55;white-space:normal;">
    ${d.boSoLine || '_______________________'} Division${a.div ? ' ' + a.div + ' ' : '__________________'} has been permitted to proceed on leave
  </div>
  <div class="t sz10" style="position:absolute;left:21mm;top:198mm;width:176mm;line-height:1.55;white-space:normal;">
    without allowances (LWA)/Paid leave for ${d.daysCount || '________'} days from ${l.fromDate ? fmtDMY(l.fromDate) : '__________'}to ${l.toDate ? fmtDMY(l.toDate) : '_________'}.
  </div>

  ${T('left:15mm;top:203.5mm','sz10','2.')}
  <div class="t sz10" style="position:absolute;left:21mm;top:203.5mm;width:176mm;line-height:1.55;white-space:normal;">
    The appointment of Shri/Smt/Kum. ${s.name || '_________________________________'} as his/her substitute is
  </div>
  <div class="t sz10" style="position:absolute;left:21mm;top:209mm;width:176mm;line-height:1.55;white-space:normal;">
    approved on the clear understanding that the substitute may be discharged by the appointing authority
  </div>
  <div class="t sz10" style="position:absolute;left:21mm;top:214.5mm;width:176mm;line-height:1.55;white-space:normal;">
    at any time without assigning any reason.
  </div>

  ${T('left:15mm;top:220mm','sz10','3.')}
  ${T('left:21mm;top:220mm','sz10','The substitute is entitled only to the minimum of the TRCA applicable to GDS.')}

  ${T('left:15mm;top:225.5mm','sz10','4.')}
  <div class="t sz10" style="position:absolute;left:21mm;top:225.5mm;width:176mm;line-height:1.55;white-space:normal;">
    The paid leave at the credit of the GDS for the half year ending on ${sn.halfYear || '_______________'} after deducting the
  </div>
  <div class="t sz10" style="position:absolute;left:21mm;top:231mm;width:176mm;line-height:1.55;white-space:normal;">
    paid leave now sanctioned, is ${sn.balance || '_________________________'} days only.
  </div>

  ${T('right:11.5mm;top:240mm','bold sz12','Signature of the Sanctioning Authority')}

  ${T('left:11.5mm;top:246mm','sz12','Date &nbsp;&nbsp;&nbsp;&nbsp; :')}
  ${T('left:11.5mm;top:252mm','sz12','Copy to  :')}

  ${T('left:22mm;top:252mm','sz12','1.')}
  ${T('left:28mm;top:252mm','sz12','Shri/Smt/Kum.')}
  ${UL('left:60mm;top:256.5mm;width:82mm')}
  ${UV('','left:60.5mm;top:252.7mm;width:81mm', a.name)}
  ${T('left:144mm;top:252mm','sz12','GDS.')}

  ${T('left:22mm;top:257.5mm','sz12','2.')}
  ${T('left:28mm;top:257.5mm','sz12','Shri/Smt/Kum.')}
  ${UL('left:60mm;top:262mm;width:82mm')}
  ${UV('','left:60.5mm;top:258.2mm;width:81mm', s.name)}
  ${T('left:144mm;top:257.5mm','sz12','(Substitute).')}

  ${T('left:22mm;top:263mm','sz12','3.')}
  ${T('left:28mm;top:263mm','sz12','Postmaster')}
  ${UL('left:47mm;top:267.5mm;width:110mm')}
  ${UV('','left:47.5mm;top:263.7mm;width:109mm', sn.postmaster)}
  ${T('left:158.5mm;top:263mm','sz12','.')}
</div>`;
}

// ─── Render cover letter page as HTML string ──────────────────────────────────

function renderPage2HTML(data: FormData, derived: DerivedData): string {
  const { applicant: a, leave: l, substitute: s, coverLetter: cl } = data;
  const d = derived;
  const boLine = [a.bo, a.so].filter(Boolean).join(', ');

  return `
<div class="pdf-page">
  <div id="letter-content">
    <div style="text-align:right;margin-bottom:16pt;font-size:11pt;line-height:1.5;">
      <div>Date: ${d.appDateLong || '[Date]'}</div>
    </div>
    <div style="margin-bottom:16pt;font-size:11pt;line-height:1.6;">
      <div>To,</div>
      <div><strong>${d.officerLine || 'Sub Divisional Inspector of Post Offices'}</strong></div>
      ${a.div ? `<div>${a.div}</div>` : ''}
    </div>
    <p style="margin-bottom:7pt;font-size:11pt;"><strong>Sub: ${cl.subject || 'Request for grant of leave'}</strong></p>
    <p style="margin-bottom:7pt;font-size:11pt;"><strong>Ref:</strong> Nil</p>
    <p style="margin-bottom:7pt;font-size:11pt;">Respected Sir / Madam,</p>
    <p style="margin-bottom:7pt;font-size:11pt;text-align:justify;">&emsp;I, <strong>${a.name || 'the undersigned'}</strong>, serving as <strong>${a.desig || 'GDS'}</strong> at <strong>${a.bo || '[Branch Office]'}</strong>${a.so ? `, <strong>${a.so}</strong>` : ''}, <strong>${a.div || '[Division]'}</strong>, respectfully submit this application for the grant of <strong>${l.leaveType}</strong> for <strong>${l.days || '___'} days</strong> with effect from <strong>${d.fromDateLong || '______'}</strong> to <strong>${d.toDateLong || '______'}</strong> on grounds of <strong>${l.ground}</strong>.</p>
    <p style="margin-bottom:7pt;font-size:11pt;text-align:justify;">${cl.remarks ? `&emsp;${cl.remarks}` : `&emsp;During the said period, I shall be available at: ${l.address || '[address as in application]'}.`}</p>
    <p style="margin-bottom:7pt;font-size:11pt;text-align:justify;">&emsp;I propose Shri/Smt/Kum. <strong>${s.name || '_______'}</strong>${s.age ? `, aged <strong>${s.age}</strong>` : ''}${s.relation ? `, ${s.relation}` : ''}${s.address ? `, resident of ${s.address}` : ''}, to work as my substitute during my leave period. I take full responsibility for this arrangement as per the terms of the security bond executed by me.</p>
    <p style="margin-bottom:7pt;font-size:11pt;text-align:justify;">&emsp;I humbly request your kind approval for the grant of leave and sanction of the substitute arrangement at the earliest. Leave application in prescribed format (quadruplicate) is attached herewith.</p>
    <div style="margin-top:18pt;font-size:11pt;text-align:right;">Yours faithfully,</div>
    <div style="margin-top:32pt;font-size:11pt;text-align:right;"><strong>${a.name || '(Signature)'}</strong></div>
    <div style="font-size:11pt;text-align:right;">${a.desig || 'GDS'}</div>
    ${boLine ? `<div style="font-size:11pt;text-align:right;">${boLine}</div>` : ''}
    ${a.div  ? `<div style="font-size:11pt;text-align:right;">${a.div}</div>` : ''}
    <div style="margin-top:16pt;font-size:11pt;"><strong>Encl:</strong></div>
    <div style="padding-left:14pt;font-size:11pt;">1. Leave Application in prescribed format (4 copies)</div>
    <div style="padding-left:14pt;font-size:11pt;">2. Medical Certificate (if applicable)</div>
  </div>
</div>`;
}

// ─── Public: build the full print document ────────────────────────────────────

export function buildPrintHTML(data: FormData, autoprint: boolean): string {
  const derived = derive(data);
  const page1   = renderPage1HTML(data, derived);
  const page2   = renderPage2HTML(data, derived);

  // 4 identical copies of page 1
  const copies = [1, 2, 3, 4].map(n => page1).join('\n');

  const autoPrintScript = autoprint
    ? `<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},350);});<\/script>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>${getPrintCSS()}</style>
</head>
<body>
${copies}
${page2}
${autoPrintScript}
</body>
</html>`;
}

// ─── Open print window ────────────────────────────────────────────────────────

export function openPrintWindow(data: FormData): void {
  const html = buildPrintHTML(data, true);
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const w    = window.open(url, '_blank');
  if (!w) {
    alert('Please allow popups so the print dialog can open.\n\nOr use Preview then print from there.');
  }
}

export function openPreviewWindow(data: FormData): string {
  const html = buildPrintHTML(data, false);
  const blob = new Blob([html], { type: 'text/html' });
  return URL.createObjectURL(blob);
}
