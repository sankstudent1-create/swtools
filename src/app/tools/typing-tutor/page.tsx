"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Target, Activity, Zap, Play, Trophy, Keyboard } from 'lucide-react';
import { requireUser } from '@/lib/auth';

export default function TypingTutorDashboard() {
  const [stats, setStats] = useState({ avgWpm: 0, avgAccuracy: 0, testsTaken: 0 });

  useEffect(() => {
    // In a real app, this would check DB if logged in, else LocalStorage
    const saved = localStorage.getItem('typing_stats');
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[150px] mix-blend-screen pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6">
            <Keyboard className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">Typing Tutor & Exam Prep</h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto font-light">
            Master keyboard combinations, build muscle memory, and prepare for competitive exams like SSC CGL with our intelligent shortfall analysis.
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-white/60 font-medium text-sm">Avg Speed</span>
            </div>
            <div className="text-4xl font-semibold text-white">{stats.avgWpm} <span className="text-lg text-white/40">WPM</span></div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <span className="text-white/60 font-medium text-sm">Accuracy</span>
            </div>
            <div className="text-4xl font-semibold text-white">{stats.avgAccuracy}%</div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-pink-400" />
              <span className="text-white/60 font-medium text-sm">Tests Taken</span>
            </div>
            <div className="text-4xl font-semibold text-white">{stats.testsTaken}</div>
          </div>
        </div>

        {/* Action Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tutor Mode */}
          <div className="relative group p-1 rounded-3xl bg-gradient-to-b from-white/[0.1] to-transparent">
            <div className="bg-[#0a0a0a] rounded-[22px] h-full p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-medium mb-3 text-white">Tutor Mode</h3>
                <p className="text-white/50 mb-8 font-light min-h-[60px]">
                  Learn rows, build finger memory with targeted keys without pressure. The Shortfall Engine dynamically adapts to your mistakes.
                </p>
                <Link href="/tools/typing-tutor/tutor" className="inline-flex items-center justify-center w-full bg-white text-black py-4 rounded-xl font-medium hover:bg-white/90 transition-colors">
                  <Play className="w-4 h-4 mr-2" /> Start Lesson
                </Link>
              </div>
            </div>
          </div>

          {/* Exam Mode */}
          <div className="relative group p-1 rounded-3xl bg-gradient-to-b from-white/[0.1] to-transparent">
            <div className="bg-[#0a0a0a] rounded-[22px] h-full p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-fuchsia-500/5 group-hover:bg-fuchsia-500/10 transition-colors duration-500"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-medium mb-3 text-white">Exam Simulation</h3>
                <p className="text-white/50 mb-8 font-light min-h-[60px]">
                  Strict rules, disabled backspaces, split-pane view. Exactly like the SSC CGL Skill Test environment.
                </p>
                <Link href="/tools/typing-tutor/exam" className="inline-flex items-center justify-center w-full bg-white/[0.05] border border-white/[0.1] text-white py-4 rounded-xl font-medium hover:bg-white/[0.1] transition-colors">
                  <Trophy className="w-4 h-4 mr-2" /> Enter Sandbox
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
