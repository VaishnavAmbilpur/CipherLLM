"use client";

import React from 'react';
import { 
  Database, 
  Lock, 
  Search, 
  Plus, 
  RefreshCcw, 
  Hash, 
  Key,
  Trash2,
  FileJson
} from 'lucide-react';

const tokens = [
  { id: 'TKN-091', value: '8221 1123 4452', substitute: 'ID_CARD_VAULT_091', created: '1h ago', algorithm: 'AES-256-GCM' },
  { id: 'TKN-089', value: 'vaishnav@example.com', substitute: 'EMAIL_VAULT_089', created: '3h ago', algorithm: 'AES-256-GCM' },
  { id: 'TKN-084', value: '+91 9988776655', substitute: 'PHONE_VAULT_084', created: '12h ago', algorithm: 'AES-256-GCM' },
  { id: 'TKN-072', value: 'Karnataka, India', substitute: 'LOC_VAULT_072', created: '1d ago', algorithm: 'AES-256-GCM' },
];

export default function VaultPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-heading font-extrabold text-white tracking-tight flex items-center space-x-3">
            <Database className="w-8 h-8 text-primary" />
            <span>Vault Manager</span>
          </h2>
          <p className="text-textDim">Encrypted storage for PII token mappings.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-white text-sm font-medium hover:bg-white/10 transition-all flex items-center space-x-2">
            <RefreshCcw className="w-4 h-4" />
            <span>Sync Vault</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Mapping</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="glass-card p-6 bg-primary/5 border-primary/20 flex items-center space-x-6">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white mb-1">Hardware Security Module Enabled</h4>
          <p className="text-xs text-textDim max-w-2xl">
            All token mappings are encrypted using project-specific master keys and stored in our local HSM-compliant secure enclave. De-hydration is performed locally at the gateway level.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-1">Vault Status</p>
          <div className="flex items-center space-x-2 text-success text-xs font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span>SYNCHRONIZED</span>
          </div>
        </div>
      </div>

      {/* Vault Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tokens.map((token) => (
          <div key={token.id} className="glass-card p-6 flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <Hash className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight">{token.id}</h4>
                  <p className="text-[10px] text-textMuted">{token.created}</p>
                </div>
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-lg hover:bg-white/10 text-textMuted hover:text-white transition-all">
                  <FileJson className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-danger/10 text-textMuted hover:text-danger transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest">Substitution Token</p>
                <div className="p-3 bg-black/40 rounded-xl border border-border-subtle flex items-center justify-between">
                  <span className="text-sm font-mono text-primary font-bold">{token.substitute}</span>
                  <Key className="w-4 h-4 text-primary/50" />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest">Original Data (Encrypted)</p>
                <div className="p-3 bg-white/[0.02] rounded-xl border border-border-subtle/50 text-sm text-textDim italic">
                  •••• •••• ••••
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[10px] text-textMuted font-bold uppercase tracking-[0.2em]">{token.algorithm}</span>
              <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
