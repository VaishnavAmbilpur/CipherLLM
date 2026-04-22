"use client";

import React from 'react';
import { Package, Terminal, Command, ChevronRight } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center pt-24 pb-20 px-6 max-w-5xl mx-auto text-center space-y-12 min-h-[85vh]">
      {/* Dynamic Badge */}
      <div className="animate-fade-in inline-flex items-center space-x-2.5 px-5 py-2 rounded-full bg-white/[0.03] border border-white/10 text-accent-secondary text-[10px] font-black tracking-[0.2em] uppercase cursor-default hover:bg-white/[0.05] transition-all hover:border-accent-secondary/30">
        <Package className="w-3.5 h-3.5" />
        <span>NPM Library Distribution</span>
      </div>

      {/* Hero Heading */}
      <div className="space-y-8 animate-slide-up">
        <h1 className="text-7xl md:text-9xl font-heading font-black text-white leading-[0.85] tracking-tighter">
          Privacy-First<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">LLM Gateway</span>
        </h1>
        <p className="text-lg md:text-xl text-textDim max-w-2xl mx-auto leading-relaxed font-medium">
          The core engine of CipherLLM is a high-performance Node.js library designed to scrub sensitive Indian PII before it reaches external providers.
        </p>
      </div>

      {/* Interaction Block */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full animate-fade-in delay-200">
        {/* Install Button / Display */}
        <div className="flex-1 w-full max-w-md p-[1px] rounded-2xl bg-gradient-to-r from-white/10 to-white/5 hover:from-accent-primary/50 hover:to-accent-secondary/50 transition-all duration-500 group cursor-pointer">
          <div className="bg-background rounded-[15px] p-5 flex items-center justify-between border border-white/5">
            <div className="flex items-center space-x-4">
              <Terminal className="w-5 h-5 text-accent-primary animate-pulse" />
              <code className="text-accent-primary font-mono font-bold text-lg select-all tracking-tight">npm install cipherllm</code>
            </div>
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all text-textDim group-hover:text-white">
              <Command className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => document.getElementById('code-preview')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-full md:w-auto px-10 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-4 hover:bg-white/90 transition-all active:scale-[0.98] group shadow-2xl shadow-white/10"
        >
          <span>Get Started</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
        </button>
      </div>
    </section>
  );
};
