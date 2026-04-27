'use client';
import React, { useEffect, useState } from 'react';
import { Clock, Download, FileText, Loader2, X } from 'lucide-react';
import styles from './HistoryModal.module.css';

interface HistoryFile {
  id: string;
  filename: string;
  created_at: string;
  size_bytes: number;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolId: string;
}

export default function HistoryModal({ isOpen, onClose, toolId }: HistoryModalProps) {
  const [files, setFiles] = useState<HistoryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, toolId]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const res = await fetch(`/api/files/list?tool_id=${toolId}`);
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
      }
    } catch (e) {
      console.error('Failed to fetch history', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(fileId: string) {
    setDownloadingId(fileId);
    try {
      const res = await fetch('/api/files/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileId }),
      });
      const data = await res.json();
      if (data.url) {
        const a = document.createElement('a');
        a.href = data.url;
        a.download = data.filename || 'document.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      alert('Download failed');
    } finally {
      setDownloadingId(null);
    }
  }

  function formatSize(bytes: number) {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    return kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb.toFixed(1) + ' KB';
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Document History</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.centered}>
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p>Loading your documents...</p>
            </div>
          ) : files.length === 0 ? (
            <div className={styles.centered}>
              <FileText className="w-12 h-12 text-gray-600 mb-2" />
              <p>No saved documents found.</p>
              <span className={styles.subtext}>Your generated PDFs will appear here.</span>
            </div>
          ) : (
            <div className={styles.fileList}>
              {files.map(file => (
                <div key={file.id} className={styles.fileItem}>
                  <div className={styles.fileIcon}>
                    <FileText className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className={styles.fileInfo}>
                    <div className={styles.fileName}>{file.filename}</div>
                    <div className={styles.fileMeta}>
                      {formatDate(file.created_at)} • {formatSize(file.size_bytes)}
                    </div>
                  </div>
                  <button 
                    className={styles.downloadBtn} 
                    onClick={() => handleDownload(file.id)}
                    disabled={downloadingId === file.id}
                  >
                    {downloadingId === file.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
