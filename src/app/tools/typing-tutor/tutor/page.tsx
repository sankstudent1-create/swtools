"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { TypingAnalyzer } from '../engine/analyzer';
import { generateKeyCombinations, generateShortfallPractice } from '../engine/generator';

export default function TutorModePage() {
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [analyzer] = useState(() => new TypingAnalyzer());
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startNewLesson = (weakKeys?: string[]) => {
    let newText = "";
    if (weakKeys && weakKeys.length > 0) {
      newText = generateShortfallPractice(weakKeys, 100);
    } else {
      newText = generateKeyCombinations(['home', 'top'], 100); // defaults
    }
    setText(newText);
    setInput("");
    setIsFinished(false);
    setResults(null);
    analyzer.startSession();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    startNewLesson();
  }, [analyzer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    
    const val = e.target.value;
    // Don't allow backspace if we are strictly adding forward, but for tutor backspace might be fine.
    // However, to track perfectly, we match char by char.
    const lastChar = val[val.length - 1];
    const expectedChar = text[val.length - 1];

    if (val.length > input.length) {
      // Character added
      if (expectedChar) {
        analyzer.logKeystroke(expectedChar, lastChar);
      }
    }
    
    setInput(val);

    if (val.length >= text.length) {
      setIsFinished(true);
      const res = analyzer.endSession();
      setResults(res);

      // Save to local storage mock
      const saved = localStorage.getItem('typing_stats');
      let stats = saved ? JSON.parse(saved) : { avgWpm: 0, avgAccuracy: 0, testsTaken: 0 };
      
      stats.testsTaken += 1;
      // moving average
      stats.avgWpm = Math.round((stats.avgWpm * (stats.testsTaken - 1) + res.wpm) / stats.testsTaken);
      stats.avgAccuracy = Math.round((stats.avgAccuracy * (stats.testsTaken - 1) + res.accuracy) / stats.testsTaken);
      
      localStorage.setItem('typing_stats', JSON.stringify(stats));
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 font-sans relative">
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/tools/typing-tutor" className="inline-flex items-center text-white/50 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-medium">Tutor Mode</h1>
          <div className="flex gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
            <div className="px-4 py-1 text-center">
              <div className="text-[10px] text-white/40 uppercase tracking-widest">Accuracy</div>
              <div className="text-xl font-mono text-blue-400">{Math.round((input.split('').filter((c, i) => c === text[i]).length / Math.max(1, input.length)) * 100)}%</div>
            </div>
            <div className="w-px bg-white/10 my-1"></div>
            <div className="px-4 py-1 text-center">
              <div className="text-[10px] text-white/40 uppercase tracking-widest">Progress</div>
              <div className="text-xl font-mono text-emerald-400">{Math.round((input.length / Math.max(1, text.length)) * 100)}%</div>
            </div>
          </div>
        </div>

        {!isFinished ? (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-xl transition-all duration-300">
            <div className="text-2xl font-mono leading-relaxed mb-8 select-none break-all relative">
              {text.split('').map((char, index) => {
                let colorClass = "text-white/40"; // upcoming
                if (index < input.length) {
                  colorClass = input[index] === char ? "text-emerald-400" : "text-rose-500 bg-rose-500/20 rounded px-px";
                } else if (index === input.length) {
                  colorClass = "text-white bg-white/20 rounded px-px animate-pulse"; // cursor
                }
                
                return (
                  <span key={index} className={colorClass}>
                    {char}
                  </span>
                )
              })}
            </div>
            
            <input 
              ref={inputRef}
              type="text" 
              value={input} 
              onChange={handleInputChange} 
              className="opacity-0 absolute top-0 -z-10" // Hidden real input
              autoComplete="off"
              autoFocus
            />
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-xl text-center">
            <h2 className="text-3xl font-medium mb-6">Lesson Complete!</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="text-sm text-white/50 mb-1">WPM</div>
                <div className="text-3xl text-emerald-400 font-semibold">{results.wpm}</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="text-sm text-white/50 mb-1">Accuracy</div>
                <div className="text-3xl text-blue-400 font-semibold">{results.accuracy}%</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="text-sm text-white/50 mb-1">Errors</div>
                <div className="text-3xl text-rose-400 font-semibold">{results.incorrectKeystrokes}</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="text-sm text-white/50 mb-1">Weak Keys</div>
                <div className="text-xl text-amber-400 font-medium">{results.weakKeys.join(', ') || 'None!'}</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={() => startNewLesson()} 
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
              >
                Normal Next Lesson
              </button>
              {results.weakKeys.length > 0 && (
                <button 
                  onClick={() => startNewLesson(results.weakKeys)} 
                  className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-xl font-medium transition shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Target "{results.weakKeys.join(', ')}" Shortfall
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
