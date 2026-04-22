"use client";

import React from 'react';

export const Navbar = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center p-1.5 transition-transform group-hover:scale-110">
            <div className="w-full h-full bg-background rounded-md flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-accent-primary animate-pulse" />
            </div>
          </div>
          <span className="font-heading font-black text-white uppercase tracking-wider text-sm group-hover:text-primary transition-colors">CipherLLM</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-[10px] font-black uppercase tracking-[0.2em] text-textDim">
          <button onClick={() => scrollTo('npm-package')} className="hover:text-white transition-colors">NPM Package</button>
          <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Architecture</button>
          <button onClick={() => scrollTo('code-preview')} className="hover:text-white transition-colors">Integration</button>
        </div>
        
        <button 
          onClick={() => scrollTo('code-preview')}
          className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all"
        >
          Install Now
        </button>
      </div>
    </nav>
  );
};
