"use client";

import React from 'react';
import { Shield, Cpu, Lock } from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: "Data Sovereignty",
    desc: "Redaction and re-hydration occur entirely on your infrastructure. No raw PII ever leaves your network.",
    color: "from-accent-primary/20",
  },
  {
    icon: Cpu,
    title: "Indo-Centric Logic",
    desc: "Specialized regex and NLP engines for Aadhaar, PAN Card, UPI, and Indian naming conventions.",
    color: "from-accent-secondary/20",
  },
  {
    icon: Lock,
    title: "DPDP Compliant",
    desc: "Built from the ground up to meet the requirements of India's Digital Personal Data Protection Act 2023.",
    color: "from-success/20",
  }
];

export const FeatureGrid = () => {
  return (
    <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-6 max-w-7xl mx-auto animate-slide-up delay-300">
      {FEATURES.map((feat, i) => (
        <div 
          key={i} 
          className="glass-card p-10 text-left space-y-8 hover:border-white/20 transition-all duration-500 group relative overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${feat.color} to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
          
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 group-hover:bg-white/[0.08] transition-all duration-500 relative z-10">
            <feat.icon className="w-8 h-8 text-textDim group-hover:text-white transition-all" />
          </div>
          
          <div className="space-y-4 relative z-10">
            <h3 className="text-2xl font-heading font-bold text-white tracking-tight">{feat.title}</h3>
            <p className="text-textDim leading-relaxed font-medium">{feat.desc}</p>
          </div>

          <div className="pt-4 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-textMuted group-hover:text-white transition-colors cursor-pointer relative z-10">
            <span>Learn More</span>
            <div className="w-1 h-1 rounded-full bg-accent-primary group-hover:scale-[2] transition-transform" />
          </div>
        </div>
      ))}
    </section>
  );
};
