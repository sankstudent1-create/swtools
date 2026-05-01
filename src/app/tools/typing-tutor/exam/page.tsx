"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, AlertTriangle, Trophy } from 'lucide-react';
import { TypingAnalyzer, TypingSessionResult } from '../engine/analyzer';
import { generateSSCCGLPassage } from '../engine/generator';
import { generateTypingPDF } from '../engine/pdfReport';
import { FileText, Download } from 'lucide-react';

// SSC CGL specific rules: generally 15 minutes for 2000 keystrokes (~26 WPM requirement but realistically higher for safety).
const EXAM_DURATION_SECONDS = 15 * 60; // 15 mins

export default function ExamModePage() {
  const [passage, setPassage] = useState("");
  const [input, setInput] = useState("");
  const [analyzer] = useState(() => new TypingAnalyzer());
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<TypingSessionResult | null>(null);
  
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
        analyzer.logKeystroke(expectedChar, lastChar, val.length - 1);
      }
    } else if (val.length < input.length) {
      analyzer.logBackspace();
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
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-left">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Raw Speed</div>
                <div className="text-2xl font-semibold text-white">{results.rawWpm} <span className="text-xs">WPM</span></div>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Accuracy</div>
                <div className="text-2xl font-semibold text-white">{results.accuracy}%</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Backspaces</div>
                <div className="text-2xl font-semibold text-amber-400">{results.backspaces}</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Mistakes</div>
                <div className="text-2xl font-semibold text-rose-400">{results.incorrectKeystrokes}</div>
              </div>
            </div>

            <div className="mb-8 p-6 bg-white/5 border border-white/5 rounded-2xl text-left">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Mistake Mapping
              </h3>
              <div className="flex flex-wrap gap-2">
                {results.weakKeys.length > 0 ? (
                  results.weakKeys.map(key => (
                    <span key={key} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-mono">
                      {key === ' ' ? 'Space' : key} ({results.errorFrequencyMap[key]} times)
                    </span>
                  ))
                ) : (
                  <span className="text-emerald-400 text-sm italic">Perfect run! No frequent mistakes detected.</span>
                )}
              </div>
              <p className="mt-4 text-xs text-white/40 leading-relaxed">
                Exam Rule Note: Net WPM is calculated by deducting errors from gross speed. Backspaces help improve accuracy but take time, indirectly lowering WPM.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-4 bg-white text-black hover:bg-white/90 rounded-xl font-medium transition"
              >
                Take Another Mock Test
              </button>
              <button 
                onClick={() => generateTypingPDF(results, "SSC CGL Skill Test")}
                className="flex-1 px-6 py-4 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
