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
}

export default function Appbar({ onPrint, onPDF, onToggleEndorse, onToggleCopy }: AppbarProps) {
  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <Link href="/tools" className={styles.backBtn}>← Back to Tools</Link>
        <div className={styles.logo}>S</div>
        <div>
          <div className={styles.name}>SW Tools</div>
          <div className={styles.sub}>Letterpad Generator · Groq AI</div>
        </div>
        <div className={styles.tag}>🇮🇳 Government Edition</div>
      </div>
      <div className={styles.right}>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onToggleEndorse}>+ Endorse</button>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onToggleCopy}>+ Copy To</button>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onPrint}>🖨 Print</button>
        <button className={`${styles.btn} ${styles.btnSaffron}`} onClick={onPDF}>⬇ PDF</button>
      </div>
    </header>
  );
}
