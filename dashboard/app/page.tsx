"use client";

import React from 'react';
import { Hero } from '@/components/Landing/Hero';
import { FeatureGrid } from '@/components/Landing/FeatureGrid';
import { CodePreview } from '@/components/Landing/CodePreview';
import { TrustSection } from '@/components/Landing/TrustSection';
import { NPMPackage } from '@/components/Landing/NPMPackage';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center w-full space-y-20 pb-32">
      <Hero />
      <NPMPackage />
      <FeatureGrid />
      <TrustSection />
      <CodePreview />
      
      {/* Final Call to Action */}
      <section className="w-full max-w-4xl mx-auto px-6 py-20 animate-fade-in delay-700">
        <div className="relative p-12 rounded-[40px] bg-white/[0.02] border border-white/5 overflow-hidden text-center space-y-8 group">
          <div className="absolute inset-0 bg-gradient-to-b from-accent-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <h2 className="text-4xl md:text-5xl font-heading font-black text-white relative z-10">
            Secure Your AI Roadmap Today.
          </h2>
          <p className="text-textDim text-lg max-w-xl mx-auto relative z-10">
            Join enterprise teams building locally-compliant AI gateways in India with CipherLLM.
          </p>
          
          <div className="flex items-center justify-center pt-4 relative z-10">
            <button className="px-12 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-white/90 transition-all active:scale-95 shadow-2xl shadow-white/5">
              Read Specification
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
