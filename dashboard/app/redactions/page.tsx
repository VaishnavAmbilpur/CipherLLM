"use client";

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Eye, 
  EyeOff,
  Download,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const redactions = [
  { id: 'RED-9021', timestamp: '2026-04-18 15:22:11', entity: 'AADHAR_CARD', original: '8221 **** ****', redacted: '[REDACTED_ID]', status: 'Secure', session: 'SESS-821' },
  { id: 'RED-9020', timestamp: '2026-04-18 15:21:45', entity: 'PHONE_NUMBER', original: '+91 91234 ****', redacted: '[REDACTED_PHONE]', status: 'Secure', session: 'SESS-432' },
  { id: 'RED-9019', timestamp: '2026-04-18 15:18:02', entity: 'EMAIL_ADDRESS', original: 'vaishnav.****@gmail.com', redacted: '[REDACTED_EMAIL]', status: 'Secure', session: 'SESS-821' },
  { id: 'RED-9018', timestamp: '2026-04-18 15:15:22', entity: 'LOCATION', original: 'Whitefield, Bangalore', redacted: '[REDACTED_LOC]', status: 'Secure', session: 'SESS-110' },
  { id: 'RED-9017', timestamp: '2026-04-18 15:12:11', entity: 'FULL_NAME', original: 'Vaishnav Ambilpur', redacted: '[REDACTED_NAME]', status: 'Secure', session: 'SESS-554' },
  { id: 'RED-9016', timestamp: '2026-04-18 15:10:01', entity: 'BANK_ACCOUNT', original: 'ICICI-9921-****', redacted: '[REDACTED_FIN]', status: 'Secure', session: 'SESS-221' },
];

export default function RedactionsPage() {
  const [showOriginal, setShowOriginal] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-heading font-extrabold text-white tracking-tight flex items-center space-x-3">
            <ShieldAlert className="w-8 h-8 text-primary" />
            <span>Privacy Monitor</span>
          </h2>
          <p className="text-textDim">Real-time surveillance of PII redaction activity.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 rounded-xl bg-white/5 border border-border-subtle text-white text-sm font-medium hover:bg-white/10 transition-all flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Logs</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex-1 max-w-md relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search by ID, Status or Session..."
            className="w-full bg-black/20 border border-border-subtle rounded-xl py-2.5 pl-12 pr-4 text-sm text-textMain focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm text-textDim hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-white/[0.02]">
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-textMuted font-bold">Log ID</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-textMuted font-bold">Entity Type</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-textMuted font-bold">Redaction Status</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-textMuted font-bold">Preview</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-textMuted font-bold">Session</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {redactions.map((row) => (
              <tr key={row.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-6 py-5">
                  <span className="text-xs font-mono text-textDim">{row.id}</span>
                  <p className="text-[10px] text-textMuted mt-0.5">{row.timestamp}</p>
                </td>
                <td className="px-6 py-5">
                  <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-textMain tracking-wider">
                    {row.entity}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-2 text-success text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{row.status}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-mono text-textDim italic">
                      {showOriginal === row.id ? row.original : row.redacted}
                    </span>
                    <button 
                      onClick={() => setShowOriginal(showOriginal === row.id ? null : row.id)}
                      className="text-textMuted hover:text-primary transition-colors"
                    >
                      {showOriginal === row.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-xs font-bold text-primary px-2 py-1 rounded bg-primary/5 border border-primary/10">
                    {row.session}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-textMuted hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
