"use client";

import React from 'react';
import { Package, Zap, Shield, Globe, ArrowRight, Layers, Check, X } from 'lucide-react';

export const NPMPackage = () => {
  const comparisons = [
    {
      feature: "Architecture",
      cipher: "Native Node.js Middleware",
      others: "External Python API / Sidecar",
      better: true
    },
    {
      feature: "Data Residency",
      cipher: "100% Local (On-Prem)",
      others: "SaaS / External Vaults",
      better: true
    },
    {
      feature: "Latency",
      cipher: "< 15ms Overhead",
      others: "100ms - 500ms (Network)",
      better: true
    },
    {
      feature: "DPDP 2023 Rules",
      cipher: "Pre-configured for India",
      others: "Generic GDPR / Manual Setup",
      better: true
    },
    {
      feature: "Offline Mode",
      cipher: "Works without Internet",
      others: "Requires Cloud Sync",
      better: true
    }
  ];

  return (
    <section id="npm-package" className="w-full px-6 max-w-7xl mx-auto py-24 space-y-24">
      {/* Intro Header */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-accent-primary/5 border border-accent-primary/20 text-accent-primary text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
          <Package className="w-3.5 h-3.5" />
          <span>Now Available on NPM</span>
        </div>
        
        <h2 className="text-5xl md:text-7xl font-heading font-black text-white tracking-tighter leading-[0.9] animate-slide-up">
          The Only Library <br/>
          <span className="text-accent-primary">Engineered for India.</span>
        </h2>
        
        <p className="text-textDim text-xl font-medium leading-relaxed animate-slide-up delay-100">
          CipherLLM isn't just a dashboard—it's a high-performance npm package that embeds 
          privacy directly into your application runtime.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-slide-up delay-200">
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <code className="relative flex items-center space-x-4 px-8 py-5 bg-[#0A0A0C] border border-white/10 rounded-2xl font-mono text-sm group">
              <span className="text-secondary">$</span>
              <span className="text-white">npm install cipherllm</span>
              <button 
                onClick={() => navigator.clipboard.writeText('npm install cipherllm')}
                className="ml-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-textMuted hover:text-white transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </code>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-3xl font-heading font-black text-white">Why CipherLLM over Traditional Layers?</h3>
            <p className="text-textDim text-lg leading-relaxed">
              Most privacy solutions (like Presidio or custom cloud vaults) add significant architectural complexity and network hops. CipherLLM executes in-process, ensuring your PII never leaves your memory space.
            </p>
          </div>

          <div className="space-y-4">
            {comparisons.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                <span className="text-sm font-bold text-textMuted uppercase tracking-wider">{item.feature}</span>
                <div className="flex items-center space-x-6 text-xs font-black">
                  <div className="flex items-center space-x-2 text-danger/60 line-through">
                    <X className="w-3.5 h-3.5" />
                    <span>Other Layers</span>
                  </div>
                  <div className="flex items-center space-x-2 text-primary">
                    <Check className="w-3.5 h-3.5" />
                    <span>CipherLLM</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-accent-primary/20 blur-[120px] rounded-full opacity-30" />
          <div className="glass-card relative overflow-hidden aspect-square flex items-center justify-center border-white/10">
            <div className="relative w-72 h-72">
              {/* Abstract visual of layers */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute rounded-3xl border-2 border-white/10 animate-pulse"
                    style={{
                      width: `${(i + 1) * 80}px`,
                      height: `${(i + 1) * 80}px`,
                      animationDelay: `${i * 0.5}s`,
                      opacity: 1 - i * 0.3
                    }}
                  />
                ))}
                <Layers className="w-16 h-16 text-primary animate-bounce-slow" />
              </div>
              
              {/* Floating badges */}
              <div className="absolute top-0 -left-12 p-4 rounded-2xl bg-success/10 border border-success/20 backdrop-blur-md animate-float">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <div className="absolute bottom-12 -right-12 p-4 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md animate-float delay-700">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute top-24 -right-16 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 backdrop-blur-md animate-float delay-1000">
                <Globe className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
