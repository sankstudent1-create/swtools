'use client';
import React, { useState, useRef, useEffect } from 'react';
import type { AppState, LetterForm } from '@/types/letterpad';
import styles from './AIChatAssistant.module.css';

interface Message {
  role: 'user' | 'assistant' | 'error';
  text: string;
}

interface AIChatAssistantProps {
  state: AppState;
  onUpdateForm: (key: keyof LetterForm, value: string) => void;
}

export default function AIChatAssistant({ state, onUpdateForm }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi! I can help you edit this letter. Tell me what to change, like "Make the tone more polite" or "Change the recipient name to Rahul".' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
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
        // Apply changes
        let changedCount = 0;
        for (const [key, value] of Object.entries(json.data)) {
          if (key in state.form && value !== state.form[key as keyof LetterForm]) {
            onUpdateForm(key as keyof LetterForm, value as string);
            changedCount++;
          }
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
        <div className={styles.chatTitle}>✨ AI Editor</div>
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
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI to change something..."
          disabled={isLoading}
        />
        <button className={styles.sendBtn} onClick={handleSend} disabled={isLoading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
