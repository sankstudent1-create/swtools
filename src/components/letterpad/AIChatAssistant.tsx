'use client';
import React, { useState, useRef, useEffect } from 'react';
import type { AppState, LetterForm, AILetterData } from '@/types/letterpad';
import styles from './AIChatAssistant.module.css';

interface Message {
  role: 'user' | 'assistant' | 'error';
  text: string;
}

interface AIChatAssistantProps {
  state: AppState;
  onSetForm: (form: Partial<LetterForm>, bumpTick?: boolean) => void;
  onFillAI: (data: AILetterData, isFull: boolean) => void;
}

export default function AIChatAssistant({ state, onSetForm, onFillAI }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi! I can help you edit this letter or write a completely new one. Type your request below and click the corresponding button.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleEdit = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/edit-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: userText,
          currentForm: state.form
        })
      });

      const json = await res.json();
      
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Failed to edit letter');
      }

      if (json.data) {
        const changes: Partial<LetterForm> = {};
        let changedCount = 0;
        for (const [key, value] of Object.entries(json.data)) {
          if (key in state.form && value !== state.form[key as keyof LetterForm]) {
            (changes as any)[key] = value;
            changedCount++;
          }
        }
        
        if (changedCount > 0) {
          onSetForm(changes, true); // true = bump aiTick so UI updates
        }
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: changedCount > 0 
            ? `I've updated the letter based on your request. (${changedCount} fields changed)` 
            : 'I processed your request but no fields needed changing.'
        }]);
      } else {
        throw new Error('No data returned from AI');
      }
      
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'error', text: err.message || 'An error occurred' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNew = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: userText,
          letterType: 'custom', // Use custom for natural letters without strict GoI formatting
          currentContext: {} // Start fresh
        })
      });

      const json = await res.json();
      
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Failed to generate new letter');
      }

      if (json.data) {
        onFillAI(json.data, true);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: 'I have generated a completely new letter for you!'
        }]);
      } else {
        throw new Error('No data returned from AI');
      }
      
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'error', text: err.message || 'An error occurred' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className={`${styles.chatContainer} ${styles.closed}`} onClick={() => setIsOpen(true)}>
        <div className={styles.closedIcon}>✨</div>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader} onClick={() => setIsOpen(false)}>
        <div className={styles.chatTitle}>✨ AI Assistant</div>
        <button className={styles.closeBtn}>✕</button>
      </div>
      
      <div className={styles.chatBody}>
        {messages.map((m, i) => (
          <div key={i} className={`${styles.message} ${m.role === 'user' ? styles.userMsg : m.role === 'error' ? styles.errorMsg : styles.assistantMsg}`}>
            {m.text}
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.assistantMsg}`}>
            <div className={styles.typingIndicator}>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className={styles.chatInputArea}>
        <input 
          className={styles.chatInput}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleEdit()}
          placeholder="Type instruction here..."
          disabled={isLoading}
        />
        <div className={styles.actionButtons}>
          <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={handleEdit} disabled={isLoading || !input.trim()} title="Edit current letter">
            ✏️ Edit
          </button>
          <button className={`${styles.actionBtn} ${styles.newBtn}`} onClick={handleGenerateNew} disabled={isLoading || !input.trim()} title="Generate completely new letter">
            ✨ New
          </button>
        </div>
      </div>
    </div>
  );
}
