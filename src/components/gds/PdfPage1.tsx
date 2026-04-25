import React from 'react';
import type { FormData } from '@/types/gds';
import type { DerivedData } from '@/types/gds';
import { fmtDMY } from '@/lib/gds/utils';

interface PdfPage1Props {
  data: FormData;
  derived: DerivedData;
}

// Helper: absolutely positioned label text
function T({
  left, top, right, bold, sz = 12, children, style = {},
}: {
  left?: string; top: string; right?: string; bold?: boolean;
  sz?: 10 | 12; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        whiteSpace: 'nowrap',
        fontSize: sz === 10 ? '10pt' : '12pt',
        lineHeight: 1,
        color: '#000',
        fontFamily: "'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif",
        fontWeight: bold ? 'bold' : 'normal',
        left, top, right,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Underline bar
function UL({ left, top, right, width }: { left?: string; top: string; right?: string; width?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        height: 0,
        borderBottom: '0.8pt solid #000',
        left, top, right, width,
      }}
    />
  );
}

// Filled value (sits above its underline, baseline on the line)
function UV({
  id, left, top, right, width, children, fontSize = '11pt',
}: {
  id?: string; left: string; top: string; right?: string; width?: string;
  children?: React.ReactNode; fontSize?: string;
}) {
  return (
    <div
      id={id}
      style={{
        position: 'absolute',
        fontSize,
        lineHeight: 1,
        color: '#000',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontFamily: "'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif",
        left, top, right, width,
      }}
    >
      {children}
    </div>
  );
}

export function PdfPage1({ data, derived }: PdfPage1Props) {
  const { applicant, leave, substitute, sanction } = data;
  const d = derived;
  const addrLines = leave.address.split('\n');

  return (
    <div
      className="pdf-page"
      style={{
        width: '215.91mm',
        height: '279.42mm',
        position: 'relative',
        background: '#fff',
        fontFamily: "'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif",
        color: '#000',
        overflow: 'hidden',
      }}
    >
      {/* Border */}
      <div style={{ position:'absolute', left:'8.47mm', top:'8.47mm', width:'199.01mm', height:'262.52mm', border:'1pt solid #000' }} />

      {/* Title */}
      <T top="11mm" bold style={{ left:'50%', transform:'translateX(-50%)' }}>APPLICATION FOR LEAVE GRAMIN DAK SEVAKS</T>
      <T top="16mm" bold style={{ left:'50%', transform:'translateX(-50%)' }}>(TO BE FILLED IN QUADRUPLICATE /4 COPY )</T>

      {/* Field 1: Name */}
      <T left="11.5mm" top="25mm">1.</T>
      <T left="19mm"   top="25mm">Name</T>
      <T left="52mm"   top="25mm">:</T>
      <UL left="55mm"  top="29.5mm" right="11.5mm" />
      <UV left="55.5mm" top="25.7mm" right="12mm">{applicant.name}</UV>

      {/* Field 2: Designation */}
      <T left="11.5mm" top="33.5mm">2.</T>
      <T left="19mm"   top="33.5mm">Designation</T>
      <T left="52mm"   top="33.5mm">:</T>
      <UL left="55mm"  top="38mm"   right="11.5mm" />
      <UV left="55.5mm" top="34.2mm" right="12mm">{applicant.desig}</UV>

      {/* Field 3: Nature and period (single line) */}
      <T left="11.5mm" top="42mm">3.</T>
      <T left="19mm"   top="42mm">Nature and period of leave required (Paid leave/LWA)</T>
      <T left="138mm"  top="42mm">:</T>
      <UL left="141mm" top="46.5mm" right="11.5mm" />
      <UV left="141.5mm" top="42.7mm" right="12mm">{leave.leaveType}</UV>

      {/* Field 4: Date */}
      <T left="11.5mm" top="50mm">4.</T>
      <T left="19mm"   top="50mm">Date for which leave is required</T>
      <T left="88mm"   top="50mm">:</T>
      <UL left="91mm"  top="54.5mm" right="11.5mm" />
      <UV left="91.5mm" top="50.7mm" right="12mm">{d.dateStr}</UV>

      {/* Field 5: Grounds */}
      <T left="11.5mm" top="58mm">5.</T>
      <T left="19mm"   top="58mm">Grounds on which leave applied (Personal affairs / Medical</T>
      <T left="19mm"   top="63mm">ground / to officiate in a departmental post)</T>
      <T left="113mm"  top="63mm">:</T>
      <UL left="116mm" top="67.5mm" right="11.5mm" />
      <UV left="116.5mm" top="63.7mm" right="12mm">{leave.ground}</UV>

      {/* Field 6: Address */}
      <T left="11.5mm" top="73mm">6.</T>
      <T left="19mm"   top="73mm">Full address while on leave</T>
      <T left="76mm"   top="73mm">:</T>
      <UL left="79mm"  top="77.5mm" right="11.5mm" />
      <UV left="79.5mm" top="73.7mm" right="12mm">{addrLines[0] || ''}</UV>
      <UL left="19mm"  top="87.5mm" right="11.5mm" />
      <UV left="19.5mm" top="83.7mm" right="12mm">{addrLines[1] || ''}</UV>

      {/* Field 7: Substitute */}
      <T left="11.5mm" top="93mm">7.</T>
      <T left="19mm"   top="93mm">Name, Age and address of the substitute</T>
      <T left="107mm"  top="93mm">:</T>
      <UL left="110mm" top="97.5mm" right="11.5mm" />
      <UV left="110.5mm" top="93.7mm" right="12mm">{d.subLine1}</UV>
      <UL left="19mm"  top="107.5mm" right="11.5mm" />
      <UV left="19.5mm" top="103.7mm" right="12mm">{substitute.address}</UV>

      {/* Field 8: Specimen signature */}
      <T left="11.5mm" top="113mm">8.</T>
      <T left="19mm"   top="113mm">Specimen signature of the substitute</T>
      <T left="101mm"  top="113mm">:</T>
      <UL left="104mm" top="117.5mm" right="11.5mm" />

      {/* Certification paragraphs */}
      <div style={{ position:'absolute', left:'19mm', top:'122mm', width:'179mm', fontSize:'10pt', fontFamily:"'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif", textAlign:'justify', lineHeight:1.55, color:'#000' }}>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I hereby propose Shri/Smt/Kum.&nbsp;
        <span style={{ fontWeight:'normal' }}>{substitute.name || '_________________________________'}</span>
        &nbsp;whose particulars are given above to work as my substitute during my leave on my responsibility according to the terms of the security bond executed by me.
      </div>
      <div style={{ position:'absolute', left:'19mm', top:'133mm', width:'179mm', fontSize:'10pt', fontFamily:"'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif", textAlign:'justify', lineHeight:1.55, color:'#000' }}>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I am aware of provisions of Rule 7 of the Department of Posts Gramin Dak Sevaks (Conduct and Employment) Rules, 2001 and I will abide by them.
      </div>
      <div style={{ position:'absolute', left:'19mm', top:'142mm', width:'179mm', fontSize:'10pt', fontFamily:"'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif", textAlign:'justify', lineHeight:1.55, color:'#000' }}>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A charge report signed by myself and my nominee will be submitted as prescribed in Rule 50 of Rules for Branch Office / Rules 45 &amp; 56 of P&amp;T Manual Vol.IV.
      </div>
      <div style={{ position:'absolute', left:'19mm', top:'151mm', width:'179mm', fontSize:'10pt', fontFamily:"'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif", lineHeight:1.55, color:'#000' }}>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Necessary approval may kindly be accorded to this arrangement.
      </div>

      {/* Station + Date + GDS Signature */}
      <T left="11.5mm" top="159mm">Station :</T>
      <UV left="33mm" top="159mm" fontSize="12pt">{applicant.station}</UV>
      <T left="11.5mm" top="165mm">Date{'\u00A0\u00A0\u00A0\u00A0'} :</T>
      <UV left="31mm" top="165mm" fontSize="12pt">{d.appDateFormatted}</UV>
      <T top="165mm" bold right="11.5mm">Signature of the Gramin Dak Sevak</T>

      {/* LEAVE SANCTION ORDERS */}
      <T top="174mm" bold style={{ left:'50%', transform:'translateX(-50%)' }}>LEAVE SANCTION ORDERS</T>
      <T top="179.5mm" bold style={{ left:'50%', transform:'translateX(-50%)' }}>(For use of the sanctioning authority)</T>

      {/* Sanction 1 */}
      <T sz={10} left="15mm" top="187mm">1.</T>
      <div style={{ position:'absolute', left:'21mm', top:'187mm', width:'176mm', fontSize:'10pt', fontFamily:"'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif", lineHeight:1.55, color:'#000', whiteSpace:'nowrap' }}>
        Shri/Smt/Kum.{applicant.name || '_______________________'}(Designation) {applicant.desig || '_____________'} BO/SO
      </div>
      <div style={{ position:'absolute', left:'21mm', top:'192.5mm', width:'176mm', fontSize:'10pt', fontFamily:"'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif", lineHeight:1.55, color:'#000', whiteSpace:'normal' }}>
        {d.boSoLine || '_______________________'} Division{applicant.div ? ` ${applicant.div} ` : '__________________'} has been permitted to proceed on leave
      </div>
      <div style={{ position:'absolute', left:'21mm', top:'198mm', width:'176mm', fontSize:'10pt', fontFamily:"'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif", lineHeight:1.55, color:'#000', whiteSpace:'normal' }}>
        without allowances (LWA)/Paid leave for {d.daysCount || '________'} days from {leave.fromDate ? fmtDMY(leave.fromDate) : '__________'}to {leave.toDate ? fmtDMY(leave.toDate) : '_________'}.
      </div>

      {/* Sanction 2 */}
      <T sz={10} left="15mm" top="203.5mm">2.</T>
      <div style={{ position:'absolute', left:'21mm', top:'203.5mm', width:'176mm', fontSize:'10pt', fontFamily:"'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif", lineHeight:1.55, color:'#000', whiteSpace:'normal' }}>
        The appointment of Shri/Smt/Kum. {substitute.name || '_________________________________'} as his/her substitute is
      </div>
      <div style={{ position:'absolute', left:'21mm', top:'209mm', width:'176mm', fontSize:'10pt', fontFamily:"'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif", lineHeight:1.55, color:'#000', whiteSpace:'normal' }}>
        approved on the clear understanding that the substitute may be discharged by the appointing authority
      </div>
      <div style={{ position:'absolute', left:'21mm', top:'214.5mm', width:'176mm', fontSize:'10pt', fontFamily:"'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif", lineHeight:1.55, color:'#000' }}>
        at any time without assigning any reason.
      </div>

      {/* Sanction 3 */}
      <T sz={10} left="15mm" top="220mm">3.</T>
      <T sz={10} left="21mm" top="220mm">The substitute is entitled only to the minimum of the TRCA applicable to GDS.</T>

      {/* Sanction 4 */}
      <T sz={10} left="15mm" top="225.5mm">4.</T>
      <div style={{ position:'absolute', left:'21mm', top:'225.5mm', width:'176mm', fontSize:'10pt', fontFamily:"'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif", lineHeight:1.55, color:'#000', whiteSpace:'normal' }}>
        The paid leave at the credit of the GDS for the half year ending on {sanction.halfYear || '_______________'} after deducting the
      </div>
      <div style={{ position:'absolute', left:'21mm', top:'231mm', width:'176mm', fontSize:'10pt', fontFamily:"'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif", lineHeight:1.55, color:'#000', whiteSpace:'normal' }}>
        paid leave now sanctioned, is {sanction.balance || '_________________________'} days only.
      </div>

      {/* Sanctioning Authority Signature */}
      <T top="240mm" bold right="11.5mm">Signature of the Sanctioning Authority</T>

      {/* Date 2 + Copy To */}
      <T left="11.5mm" top="246mm">Date{'\u00A0\u00A0\u00A0\u00A0'} :</T>
      <T left="11.5mm" top="252mm">Copy to  :</T>

      {/* Copy 1 */}
      <T left="22mm" top="252mm">1.</T>
      <T left="28mm" top="252mm">Shri/Smt/Kum.</T>
      <UL left="60mm" top="256.5mm" width="82mm" />
      <UV left="60.5mm" top="252.7mm" width="81mm">{applicant.name}</UV>
      <T left="144mm" top="252mm">GDS.</T>

      {/* Copy 2 */}
      <T left="22mm" top="257.5mm">2.</T>
      <T left="28mm" top="257.5mm">Shri/Smt/Kum.</T>
      <UL left="60mm" top="262mm" width="82mm" />
      <UV left="60.5mm" top="258.2mm" width="81mm">{substitute.name}</UV>
      <T left="144mm" top="257.5mm">(Substitute).</T>

      {/* Copy 3 */}
      <T left="22mm" top="263mm">3.</T>
      <T left="28mm" top="263mm">Postmaster</T>
      <UL left="47mm" top="267.5mm" width="110mm" />
      <UV left="47.5mm" top="263.7mm" width="109mm">{sanction.postmaster}</UV>
      <T left="158.5mm" top="263mm">.</T>
    </div>
  );
}
