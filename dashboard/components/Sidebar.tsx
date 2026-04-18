'use client';

import React from 'react';
import { Shield, LayoutDashboard, History, FileCheck, Key, BookOpen } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'history', icon: History, label: 'Session History' },
    { id: 'audit', icon: FileCheck, label: 'Audit Log' },
  ];

  const utilityItems = [
    { id: 'keys', icon: Key, label: 'API Keys' },
    { id: 'docs', icon: BookOpen, label: 'Documentation' },
  ];

  return (
    <aside className="w-[260px] bg-background-surface border-r border-border flex flex-col h-full overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-accent-green flex items-center justify-center">
          <Shield className="w-5 h-5 text-background-primary" />
        </div>
        <h1 className="font-heading text-xl font-bold tracking-tight">CipherLLM</h1>
      </div>

      <div className="px-6 py-8">
        <p className="text-text-secondary text-[10px] uppercase tracking-widest mb-4 font-medium">Redaction Stats</p>
        <div className="bg-background-elevated rounded-lg p-5 border border-border/50 group hover:border-accent-green/30 transition-all shadow-glow-green/5">
          <p className="font-display text-4xl text-accent-green font-bold mb-1">1,203</p>
          <p className="text-text-secondary text-xs font-medium uppercase tracking-tight">Items Intercepted</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group",
              activeTab === item.id 
                ? "bg-accent-green/10 text-accent-green" 
                : "text-text-secondary hover:text-text-primary hover:bg-background-elevated"
            )}
          >
            <item.icon className={cn(
              "w-4 h-4",
              activeTab === item.id ? "text-accent-green" : "text-text-muted group-hover:text-text-primary"
            )} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-4 py-8 space-y-1 mt-auto border-t border-border/50">
        <p className="px-3 text-text-muted text-[10px] uppercase tracking-widest mb-3 font-medium">Settings</p>
        {utilityItems.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-elevated transition-all group"
          >
            <item.icon className="w-4 h-4 text-text-muted group-hover:text-text-primary" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
        
        <div className="mt-6 px-3 py-4 bg-background-elevated/50 rounded-lg border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-accent-green tracking-wider">Protected</span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed font-medium">Session #A3F2 Active</p>
        </div>
      </div>
    </aside>
  );
}
