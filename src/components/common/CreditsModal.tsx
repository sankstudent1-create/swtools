'use client';
import React from 'react';
import { AlertCircle, ArrowUpRight, X } from 'lucide-react';
import Link from 'next/link';
import styles from './CreditsModal.module.css';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits: number;
}

export default function CreditsModal({ isOpen, onClose, requiredCredits }: CreditsModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className={styles.iconContainer}>
          <div className={styles.iconPulse}>
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
        </div>

        <h3 className={styles.title}>Insufficient Credits</h3>
        <p className={styles.text}>
          This premium tool requires <strong>{requiredCredits} credits</strong> per use. 
          Your current balance is too low to complete this action.
        </p>

        <div className={styles.actions}>
          <Link href="/dashboard/topup" className={styles.primaryBtn}>
            Add Credits Now <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
          <button className={styles.secondaryBtn} onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
