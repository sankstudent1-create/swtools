import React from 'react';
import type { FormData, DerivedData } from '@/types/gds';

interface PdfPage2Props {
  data: FormData;
  derived: DerivedData;
}

export function PdfPage2({ data, derived }: PdfPage2Props) {
  const { applicant, leave, substitute, coverLetter } = data;
  const d = derived;
  const boLine = [applicant.bo, applicant.so].filter(Boolean).join(', ');

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
      <div
        style={{
          position: 'absolute',
          left: '22mm', top: '18mm', right: '18mm', bottom: '15mm',
          fontFamily: "'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif",
          fontSize: '11pt',
          lineHeight: 1.75,
          color: '#000',
          overflow: 'hidden',
        }}
      >
        {/* Sender date — right aligned */}
        <div style={{ textAlign: 'right', marginBottom: '16pt', fontSize: '11pt', lineHeight: 1.5 }}>
          <div>Date: {d.appDateLong || '[Date]'}</div>
        </div>

        {/* Addressee */}
        <div style={{ marginBottom: '16pt', fontSize: '11pt', lineHeight: 1.6 }}>
          <div>To,</div>
          <div><strong>{d.officerLine || 'Sub Divisional Inspector of Post Offices'}</strong></div>
          {applicant.div && <div>{applicant.div}</div>}
        </div>

        {/* Subject + Ref */}
        <p style={{ marginBottom: '7pt', fontSize: '11pt' }}>
          <strong>Sub: {coverLetter.subject || 'Request for grant of leave'}</strong>
        </p>
        <p style={{ marginBottom: '7pt', fontSize: '11pt' }}>
          <strong>Ref:</strong> Nil
        </p>
        <p style={{ marginBottom: '7pt', fontSize: '11pt' }}>Respected Sir / Madam,</p>

        {/* Para 1 */}
        <p style={{ marginBottom: '7pt', fontSize: '11pt', textAlign: 'justify' }}>
          &emsp;I, <strong>{applicant.name || 'the undersigned'}</strong>, serving as{' '}
          <strong>{applicant.desig || 'GDS'}</strong> at{' '}
          <strong>{applicant.bo || '[Branch Office]'}</strong>
          {applicant.so && <>, <strong>{applicant.so}</strong></>},{' '}
          <strong>{applicant.div || '[Division]'}</strong>, respectfully submit this application for the
          grant of <strong>{leave.leaveType}</strong> for{' '}
          <strong>{leave.days || '___'} days</strong> with effect from{' '}
          <strong>{d.fromDateLong || '______'}</strong> to{' '}
          <strong>{d.toDateLong || '______'}</strong> on grounds of{' '}
          <strong>{leave.ground}</strong>.
        </p>

        {/* Para 2 */}
        <p style={{ marginBottom: '7pt', fontSize: '11pt', textAlign: 'justify' }}>
          {coverLetter.remarks
            ? `\u2003${coverLetter.remarks}`
            : `\u2003During the said period, I shall be available at: ${leave.address || '[address as in application]'}.`}
        </p>

        {/* Para 3 */}
        <p style={{ marginBottom: '7pt', fontSize: '11pt', textAlign: 'justify' }}>
          &emsp;I propose Shri/Smt/Kum. <strong>{substitute.name || '_______'}</strong>
          {substitute.age && <>, aged <strong>{substitute.age}</strong></>}
          {substitute.relation && `, ${substitute.relation}`}
          {substitute.address && `, resident of ${substitute.address}`}, to work as my substitute
          during my leave period. I take full responsibility for this arrangement as per the terms of
          the security bond executed by me.
        </p>

        {/* Para 4 */}
        <p style={{ marginBottom: '7pt', fontSize: '11pt', textAlign: 'justify' }}>
          &emsp;I humbly request your kind approval for the grant of leave and sanction of the
          substitute arrangement at the earliest. Leave application in prescribed format
          (quadruplicate) is attached herewith.
        </p>

        {/* Yours faithfully — right aligned */}
        <div style={{ marginTop: '18pt', fontSize: '11pt', textAlign: 'right' }}>Yours faithfully,</div>
        <div style={{ marginTop: '32pt', fontSize: '11pt', textAlign: 'right' }}>
          <strong>{applicant.name || '(Signature)'}</strong>
        </div>
        <div style={{ fontSize: '11pt', textAlign: 'right' }}>{applicant.desig || 'GDS'}</div>
        {boLine && <div style={{ fontSize: '11pt', textAlign: 'right' }}>{boLine}</div>}
        {applicant.div && <div style={{ fontSize: '11pt', textAlign: 'right' }}>{applicant.div}</div>}

        {/* Enclosures */}
        <div style={{ marginTop: '16pt', fontSize: '11pt' }}><strong>Encl:</strong></div>
        <div style={{ paddingLeft: '14pt', fontSize: '11pt' }}>1. Leave Application in prescribed format (4 copies)</div>
        <div style={{ paddingLeft: '14pt', fontSize: '11pt' }}>2. Medical Certificate (if applicable)</div>
      </div>
    </div>
  );
}
