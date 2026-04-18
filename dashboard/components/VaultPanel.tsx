'use client';

import React from 'react';
import { Database, Lock, Eye, EyeOff, Search } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VaultItem {
  token: string;
  original: string;
  type: string;
}

export default function VaultPanel() {
  const [items] = React.useState<VaultItem[]>([
    { token: '[PERSON_1]', original: 'Priya Sharma', type: 'PERSON' },
    { token: '[AADHAAR_1]', original: '8234-5678-9012', type: 'AADHAAR' },
    { token: '[EMAIL_1]', original: 'priya@techcorp.in', type: 'EMAIL' },
    { token: '[SALARY_1]', original: '₹18,50,000', type: 'SALARY' },
  ]);

  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({});

  const toggleReveal = (token: string) => {
    setRevealed(prev => ({ ...prev, [token]: !prev[token] }));
  };

  return (
    <div className="flex flex-col h-full bg-background-surface border-l border-border">
      <header className="px-8 py-4 border-b border-border bg-background-surface/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-accent-green" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Token Vault</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-background-elevated border border-border/50 rounded-md">
          <Lock className="w-3 h-3 text-text-muted" />
          <span className="text-[10px] font-bold text-text-muted tracking-tight uppercase">AES-256 ENCRYPTED</span>
        </div>
      </header>

      <div className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search vault..." 
            className="w-full bg-background-elevated border border-border/50 rounded-md py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-accent-green/30 text-text-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-2 pb-8">
        {items.map((item) => (
          <div 
            key={item.token}
            className="group p-4 bg-background-elevated/40 border border-border/30 rounded-lg hover:border-accent-green/20 hover:bg-background-elevated/60 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="token text-[11px]">{item.token}</span>
              <span className="pii-badge">{item.type}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className={cn(
                "text-sm font-medium tracking-tight transition-all flex-1 truncate",
                revealed[item.token] ? "text-text-primary" : "text-text-muted blur-[5px] select-none"
              )}>
                {item.original}
              </div>
              <button 
                onClick={() => toggleReveal(item.token)}
                className="p-1.5 rounded bg-background-elevated border border-border/50 text-text-muted hover:text-text-primary hover:border-border-accent transition-all"
                title={revealed[item.token] ? "Hide Original" : "Show Original"}
              >
                {revealed[item.token] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border/30 rounded-xl">
            <Lock className="w-10 h-10 text-text-muted mb-4 opacity-20" />
            <p className="text-text-muted text-xs font-medium uppercase tracking-widest">Vault is empty</p>
            <p className="text-text-muted text-[10px] mt-2">Redact something to see it here</p>
          </div>
        )}
      </div>

      <footer className="p-6 bg-background-surface border-t border-border">
        <div className="flex items-center justify-between p-4 bg-background-elevated rounded-lg border border-border/50">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-1">Session Duration</p>
            <p className="font-display text-sm font-bold text-text-primary">02:24:15</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-1">Vault Status</p>
            <p className="text-[11px] font-bold text-accent-green uppercase tracking-tighter">Verified Secure</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
