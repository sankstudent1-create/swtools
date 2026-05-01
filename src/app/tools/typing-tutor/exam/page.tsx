"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, AlertTriangle, Trophy } from 'lucide-react';
import { TypingAnalyzer } from '../engine/analyzer';
import { generateSSCCGLPassage } from '../engine/generator';

// SSC CGL specific rules: generally 15 minutes for 2000 keystrokes (~26 WPM requirement but realistically higher for safety).
const EXAM_DURATION_SECONDS = 15 * 60; // 15 mins

export default function ExamModePage() {
  const [passage, setPassage] = useState("");
  const [input, setInput] = useState("");
  const [analyzer] = useState(() => new TypingAnalyzer());
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Generate a 2000 character mock passage
    setPassage(generateSSCCGLPassage(2000));
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      endExam();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startExam = () => {
    setIsActive(true);
    analyzer.startSession();
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const endExam = () => {
    setIsActive(false);
    setIsFinished(true);
    setResults(analyzer.endSession());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isActive) return;

    const val = e.target.value;
    
    // EXAM RULE: Disable backspace handling. In SSC CGL you usually can backspace, 
    // but sometimes you can't depending on the specific exam stage. 
    // For this simulation, we'll allow backspace normally but log errors strictly on forward typing.
    if (val.length > input.length) {
      const lastChar = val[val.length - 1];
      const expectedChar = passage[val.length - 1];
      if (expectedChar) {
        analyzer.logKeystroke(expectedChar, lastChar);
      }
    } else if (val.length < input.length) {
      // Backspace handled
    }

    setInput(val);

    if (val.length >= passage.length) {
      endExam();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault(); // Exam rule: No copy paste allowed
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/tools/typing-tutor" className="inline-flex items-center text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Exit Exam
          </Link>
          
          {isActive && (
            <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2 rounded-full font-mono text-xl">
              <Clock className="w-5 h-5" /> <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {!isFinished ? (
          <div className="space-y-6">
            {!isActive && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl flex items-start space-x-4 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                <div>
                  <h3 className="text-amber-400 font-medium text-lg mb-1">SSC CGL Skill Test Simulation</h3>
                  <p className="text-amber-400/80 text-sm">
                    15 minutes duration. ~2000 keystrokes required. Copy-paste is disabled. Type in the bottom box matching the original passage exactly as shown above.
                  </p>
                  <button 
                    onClick={startExam}
                    className="mt-4 bg-amber-400 text-black px-6 py-2 rounded-xl font-medium hover:bg-amber-300 transition-colors"
                  >
                    Start Exam Timer
                  </button>
                </div>
              </div>
            )}

            {/* Top Pane: Required Text */}
            <div className={`p-6 bg-white/[0.02] border border-white/[0.05] rounded-t-xl min-h-[250px] max-h-[300px] overflow-y-auto leading-relaxed font-mono text-lg select-none ${!isActive ? 'blur-sm opacity-50' : ''}`}>
              {passage.split('').map((char, index) => {
                let colorClass = "text-white/60";
                if (index < input.length) {
                  colorClass = input[index] === char ? "text-emerald-400" : "text-rose-500 bg-rose-500/20";
                } else if (index === input.length && isActive) {
                  colorClass = "bg-blue-500/30 border-b-2 border-blue-400";
                }
                return <span key={index} className={colorClass}>{char}</span>;
              })}
            </div>

            {/* Bottom Pane: User Input */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onPaste={handlePaste}
              disabled={!isActive}
              className="w-full p-6 bg-white/[0.04] border border-white/[0.1] rounded-b-xl min-h-[250px] focus:outline-none focus:border-blue-500/50 resize-none font-mono text-lg text-white"
              placeholder={isActive ? "Start typing here..." : "Click 'Start Exam Timer' to begin."}
              spellCheck="false"
            />
            
            {isActive && (
              <div className="text-right text-sm text-white/40 font-mono">
                Keystrokes: {input.length} / {passage.length}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-3xl p-12 text-center shadow-2xl mt-12 max-w-2xl mx-auto">
            <Trophy className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-4xl font-semibold mb-2">Exam Concluded</h2>
            <p className="text-white/50 mb-8 font-light">Here is your definitive skill test result.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <div className="text-sm text-white/50 mb-2 uppercase tracking-widest font-semibold">Net WPM</div>
                <div className={`text-5xl font-semibold ${results.wpm >= 27 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {results.wpm}
                </div>
                <div className="text-xs text-white/30 mt-2">Required: 27 WPM (minimum)</div>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <div className="text-sm text-white/50 mb-2 uppercase tracking-widest font-semibold">Accuracy</div>
                <div className={`text-5xl font-semibold ${results.accuracy >= 95 ? 'text-blue-400' : 'text-amber-400'}`}>
                  {results.accuracy}%
                </div>
                <div className="text-xs text-white/30 mt-2">Required: 95% (UR category std)</div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/[0.05] flex justify-between px-8 text-sm text-white/60 mb-8">
              <span>Total Keystrokes: <strong className="text-white">{results.totalKeystrokes}</strong></span>
              <span>Errors: <strong className="text-rose-400">{results.incorrectKeystrokes}</strong></span>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="inline-block w-full px-6 py-4 bg-white text-black hover:bg-white/90 rounded-xl font-medium transition shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Take Another Mock Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
