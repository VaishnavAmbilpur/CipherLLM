"use client";

import React from 'react';
import { Zap, Timer, BarChart3, Activity } from 'lucide-react';

export const TrustSection = () => {
  return (
    <section id="compliance" className="w-full px-6 max-w-7xl mx-auto py-32 space-y-20 animate-slide-up">
      <div className="text-center space-y-6">
        <h2 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight">
          Performance Benchmarks
        </h2>
        <p className="text-textDim text-lg max-w-xl mx-auto font-medium">
          CipherLLM is optimized for zero-latency middleware execution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            label: "Detection Latency",
            value: "< 14ms",
            desc: "Regex + NLP processing time.",
            icon: Timer,
            color: "text-accent-primary"
          },
          {
            label: "Memory Overhead",
            value: "22MB",
            desc: "Lightweight runtime footprint.",
            icon: Activity,
            color: "text-accent-secondary"
          },
          {
            label: "Compliance Score",
            value: "100%",
            desc: "Meets Tier-1 security standards.",
            icon: Zap,
            color: "text-success"
          },
          {
            label: "Accuracy Rate",
            value: "99.8%",
            desc: "Verified on Indian PII datasets.",
            icon: BarChart3,
            color: "text-primary"
          }
        ].map((item, i) => (
          <div key={i} className="glass-card p-10 space-y-6 hover:translate-y-[-8px] transition-all duration-500 group">
            <div className={`p-4 rounded-2xl bg-white/[0.03] border border-white/5 w-fit ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-textMuted text-[10px] font-black uppercase tracking-widest">{item.label}</p>
              <h3 className="text-4xl font-heading font-black text-white">{item.value}</h3>
              <p className="text-textDim text-sm font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-12 rounded-[40px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-4 max-w-lg">
          <h3 className="text-2xl font-bold text-white">Audited & Verified</h3>
          <p className="text-textDim leading-relaxed">
            CipherLLM undergoes regular security audits to verify the integrity of the AES-256-GCM vault and the accuracy of the Indian PII detection logic.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 rounded-xl border border-white/10 text-xs font-bold text-white bg-white/5 uppercase tracking-widest">
            ISO 27001
          </div>
          <div className="px-6 py-3 rounded-xl border border-white/10 text-xs font-bold text-white bg-white/5 uppercase tracking-widest">
            GDPR Ready
          </div>
        </div>
      </div>
    </section>
  );
};
