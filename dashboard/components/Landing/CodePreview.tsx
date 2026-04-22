"use client";

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const CodePreview = () => {
  return (
    <section id="code-preview" className="w-full px-6 max-w-7xl mx-auto py-20 animate-fade-in delay-500">
      <div className="glass-card p-2 overflow-hidden border-white/5">
        <div className="bg-background-dark/40 rounded-2xl border border-white/5 p-12 flex flex-col lg:flex-row items-center gap-16">
          
          <div className="flex-1 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-success/5 border border-success/20 text-success text-[10px] font-black uppercase tracking-[0.2em]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Middleware Optimized</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight leading-[1.1]">
              Lightweight Integration.<br/>
              Zero Latency Overhead.
            </h2>
            
            <p className="text-textDim text-lg leading-relaxed font-medium">
              CipherLLM is stateless and designed for the edge. It fits into your existing Node.js middleware chain with just three lines of declarative logic.
            </p>
            
            <div className="flex flex-wrap items-center gap-6 pt-6">
              <div className="flex -space-x-3">
                {['JS', 'TS', 'N'].map((lang, i) => (
                  <div key={i} className="w-12 h-12 rounded-full bg-elevated border-2 border-background flex items-center justify-center text-xs font-black text-white shadow-xl">
                    {lang}
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-textMuted font-black uppercase tracking-widest">Environment Support</p>
                <p className="text-xs text-white font-bold uppercase tracking-widest">CommonJS & ESM v16+</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full relative group">
            <div className="absolute inset-0 bg-accent-primary/20 blur-[80px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
            
            <div className="relative bg-[#08080A] rounded-2xl border border-white/10 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.03]">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-[0_0_10px_rgba(255,95,86,0.3)]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <span className="text-[10px] text-textMuted font-mono font-bold uppercase tracking-widest">example_gateway.ts</span>
              </div>
              
              <div className="p-8 text-sm font-mono text-left overflow-x-auto leading-[1.8] custom-scrollbar">
                <div className="flex items-start space-x-4">
                  <span className="text-textMuted tabular-nums select-none opacity-30 text-xs">01</span>
                  <p><span className="text-secondary">import</span> <span className="text-white">{`{ CipherLLM, OpenAIProvider } `}</span> <span className="text-secondary">from</span> <span className="text-primary">'cipherllm'</span><span className="text-white">;</span></p>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="text-textMuted tabular-nums select-none opacity-30 text-xs">02</span>
                  <p className="text-textMuted opacity-50 italic">// Initialize engine</p>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="text-textMuted tabular-nums select-none opacity-30 text-xs">03</span>
                  <p><span className="text-secondary">const</span> <span className="text-white">openai = </span> <span className="text-secondary">new</span> <span className="text-white">OpenAIProvider(process.env.KEY);</span></p>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="text-textMuted tabular-nums select-none opacity-30 text-xs">04</span>
                  <p><span className="text-secondary">const</span> <span className="text-white">cipher = </span> <span className="text-secondary">new</span> <span className="text-white">CipherLLM(openai);</span></p>
                </div>
                <div className="flex items-start space-x-4 mt-4">
                  <span className="text-textMuted tabular-nums select-none opacity-30 text-xs">05</span>
                  <p className="text-textMuted opacity-50 italic">// Transparent Privacy</p>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="text-textMuted tabular-nums select-none opacity-30 text-xs">06</span>
                  <p><span className="text-secondary">const</span> <span className="text-white">{`{ response } `}</span> <span className="text-white">= </span> <span className="text-secondary">await</span> <span className="text-white">cipher.chat(prompt, sessionId);</span></p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
