// ─────────────────────────────────────────────
//  components/letterpad/Appbar.tsx
// ─────────────────────────────────────────────
import React from 'react';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import styles from './Appbar.module.css';

interface AppbarProps {
  onPrint: () => void;
  onPDF: () => void;
  onToggleEndorse: () => void;
  onToggleCopy: () => void;
  onHistory: () => void;
  lastModel?: string;   // e.g. "llama-3.3-70b-versatile"
}

export default function Appbar({ onPrint, onPDF, onToggleEndorse, onToggleCopy, onHistory, lastModel }: AppbarProps) {
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
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onHistory} title="View History">
          <Clock className="w-5 h-5 mr-1" /> History
        </button>
        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnPrint}`} onClick={onPrint}>� Preview*</button>
        <button className={`${styles.btn} ${styles.btnSaffron}`} onClick={onPDF}>⬇ Generate PDF</button>
      </div>
    </header>
  );
}
