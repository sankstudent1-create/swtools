"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TypingAnalyzer, TypingSessionResult } from '../engine/analyzer';
import { generateTutorLesson, TUTOR_LEVELS, generateShortfallPractice } from '../engine/generator';
import { generateTypingPDF } from '../engine/pdfReport';
import { ArrowLeft, RefreshCw, Trophy, ChevronRight, BookOpen, Download } from 'lucide-react';

export default function TutorModePage() {
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [analyzer] = useState(() => new TypingAnalyzer());
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<TypingSessionResult | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startNewLesson = (levelId?: string, weakKeys?: string[]) => {
    let newText = "";
    if (weakKeys && weakKeys.length > 0) {
      newText = generateShortfallPractice(weakKeys, 100);
    } else {
      newText = generateTutorLesson(levelId || selectedLevel || 'home-1', 120);
    }
    if (levelId) setSelectedLevel(levelId);
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
      const lastChar = val[val.length - 1];
      const expectedChar = text[val.length - 1];
      if (expectedChar) {
        analyzer.logKeystroke(expectedChar, lastChar, val.length - 1);
      }
    } else if (val.length < input.length) {
      analyzer.logBackspace();
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
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-medium">Tutor Mode</h1>
            {selectedLevel && (
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                {TUTOR_LEVELS.find(l => l.id === selectedLevel)?.name}
              </span>
            )}
          </div>
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

        {!selectedLevel ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {TUTOR_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => startNewLesson(level.id)}
                className="group relative p-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl text-left hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{level.name}</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">
                  {level.description}
                </p>
              </button>
            ))}
          </div>
        ) : !isFinished ? (
          <div className="space-y-6">
            <button 
              onClick={() => setSelectedLevel(null)}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              ← Change Lesson
            </button>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-10 backdrop-blur-xl transition-all duration-300">
              <div className="text-3xl font-mono leading-relaxed mb-8 select-none break-all relative text-center">
                {text.split('').map((char, index) => {
                  let colorClass = "text-white/20"; // upcoming
                  if (index < input.length) {
                    colorClass = input[index] === char ? "text-emerald-400" : "text-rose-500 bg-rose-500/10 rounded px-px";
                  } else if (index === input.length) {
                    colorClass = "text-white bg-blue-500/30 border-b-2 border-blue-400 animate-pulse"; // cursor
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
                className="opacity-0 absolute inset-0 w-full h-full cursor-default"
                autoComplete="off"
                autoFocus
              />
              <div className="text-center mt-8 text-xs text-white/20 animate-bounce">
                Start typing to begin...
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-12 backdrop-blur-xl text-center shadow-2xl animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Trophy className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-4xl font-semibold mb-2 text-white">Lesson Complete!</h2>
            <p className="text-white/40 mb-10">Excellent progress. Your muscle memory is getting stronger.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Net Speed</div>
                <div className="text-3xl text-emerald-400 font-semibold">{results?.wpm} <span className="text-xs">WPM</span></div>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Accuracy</div>
                <div className="text-3xl text-blue-400 font-semibold">{results?.accuracy}%</div>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Backspaces</div>
                <div className="text-3xl text-amber-400 font-semibold">{results?.backspaces}</div>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Time</div>
                <div className="text-3xl text-fuchsia-400 font-semibold">{results?.timeSeconds}s</div>
              </div>
            </div>

            {results && results.weakKeys.length > 0 && (
              <div className="mb-10 p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-left">
                <h3 className="text-sm font-medium text-rose-400 mb-3">Targeted Shortfall Detection</h3>
                <div className="flex flex-wrap gap-2">
                  {results.weakKeys.map(key => (
                    <span key={key} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-mono">
                      {key === ' ' ? 'Space' : key}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-white/30 italic">
                  Tip: Use the shortfall practice button below to focus specifically on these keys.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => setSelectedLevel(null)} 
                className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition"
              >
                Back to Curriculum
              </button>
              <button 
                onClick={() => startNewLesson()} 
                className="flex-1 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
              >
                Repeat Lesson
              </button>
              {results?.weakKeys && results.weakKeys.length > 0 && (
                <button 
                  onClick={() => startNewLesson(undefined, results.weakKeys)} 
                  className="flex-1 px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Shortfall Practice
                </button>
              )}
              <button 
                onClick={() => results && generateTypingPDF(results, `Tutor: ${TUTOR_LEVELS.find(l => l.id === selectedLevel)?.name}`)}
                className="flex-1 px-8 py-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
