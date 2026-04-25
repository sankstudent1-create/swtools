// ─────────────────────────────────────────────
//  components/letterpad/Appbar.tsx
// ─────────────────────────────────────────────
import React from 'react';
import Link from 'next/link';
import styles from './Appbar.module.css';

interface AppbarProps {
  onPrint: () => void;
  onPDF: () => void;
  onToggleEndorse: () => void;
  onToggleCopy: () => void;
  lastModel?: string;   // e.g. "llama-3.3-70b-versatile"
}

export default function Appbar({ onPrint, onPDF, onToggleEndorse, onToggleCopy, lastModel }: AppbarProps) {
  // Shorten the model name for display — e.g. "llama-3.3-70b"
  const modelShort = lastModel
    ? lastModel.replace(/-versatile|-instant|-it|-preview/gi, '').replace('llama-', 'L').replace('gemma', 'G')
    : null;

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <Link href="/tools" className={styles.backBtn}>← Back to Tools</Link>
        <div className={styles.logo}>S</div>
        <div className={styles.brandText}>
          <div className={styles.name}>SW Tools</div>
          <div className={styles.sub}>Letterpad Generator · Groq AI</div>
        </div>
        <div className={styles.tag}>🇮🇳 Gov Edition</div>
        {modelShort && (
          <div className={styles.modelBadge} title={`Last generated via: ${lastModel}`}>
            ⚡ {modelShort}
          </div>
        )}
      </div>

      <div className={styles.right}>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onToggleEndorse}>+ Endorse</button>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onToggleCopy}>+ Copy To</button>
        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnPrint}`} onClick={onPrint}>🖨 Print</button>
        <button className={`${styles.btn} ${styles.btnSaffron}`} onClick={onPDF}>⬇ PDF</button>
      </div>
    </header>
  );
}
