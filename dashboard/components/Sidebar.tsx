"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Database, 
  FileCheck, 
  Terminal, 
  Settings,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Privacy Monitor', href: '/redactions', icon: ShieldAlert },
  { label: 'Vault Manager', href: '/vault', icon: Database },
  { label: 'Compliance Audit', href: '/compliance', icon: FileCheck },
  { label: 'API Playground', href: '/playground', icon: Terminal },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-72 h-screen border-r border-border-subtle bg-surface flex flex-col sticky top-0">
      {/* Brand Header */}
      <div className="p-8 flex items-center space-x-3 group cursor-pointer">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold text-white tracking-tight">CipherVault</h1>
          <div className="flex items-center space-x-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70 font-bold">DS Protocol</p>
            <span className="px-1.5 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[8px] text-primary font-black uppercase">NPM Module</span>
          </div>
        </div>
      </div>

      <div className="mx-6 px-4 py-3 rounded-xl bg-white/5 border border-border-subtle flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
        <div className="flex items-center space-x-3">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-bold text-textDim uppercase tracking-widest">cipherllm v1.0.0</span>
        </div>
        <ChevronRight className="w-3 h-3 text-textMuted group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-textDim hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <div className="flex items-center space-x-4">
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-textMuted group-hover:text-textDim")} />
                <span className="font-medium tracking-tight">{item.label}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-border-subtle">
        <div className="glass-card p-4 flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <div className="flex-1">
            <p className="text-xs font-bold text-white">System Secure</p>
            <p className="text-[10px] text-textMuted">v2.4.0-STABLE</p>
          </div>
          <Settings className="w-4 h-4 text-textMuted cursor-pointer hover:rotate-90 transition-transform" />
        </div>
      </div>
    </div>
  );
}
