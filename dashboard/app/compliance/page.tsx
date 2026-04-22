"use client";

import React from 'react';
import { 
  FileCheck, 
  History, 
  Download, 
  FileText, 
  AlertCircle,
  Calendar,
  CheckCircle,
  ShieldAlert
} from 'lucide-react';

const reports = [
  { name: 'DPDP-2026-Q1-Compliance.pdf', date: '2026-03-31', size: '2.4 MB', status: 'Verified' },
  { name: 'Privacy-Audit-Monthly-March.jsonl', date: '2026-03-01', size: '15.1 MB', status: 'Pending' },
  { name: 'Entity-Risk-Assessment-v2.pdf', date: '2026-02-15', size: '1.2 MB', status: 'Verified' },
];

export default function CompliancePage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-heading font-extrabold text-white tracking-tight flex items-center space-x-3">
            <FileCheck className="w-8 h-8 text-primary" />
            <span>Compliance Audit</span>
          </h2>
          <p className="text-textDim">DPDP Regulation adherence and automated reporting.</p>
        </div>
        <button className="btn-primary">Generate New Audit</button>
      </div>

      {/* Compliance Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-success/20 bg-success/5 relative overflow-hidden">
          <CheckCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-success/10 -rotate-12" />
          <h4 className="text-sm font-bold text-success mb-4 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>DPDP Coverage</span>
          </h4>
          <p className="text-3xl font-heading font-bold text-white mb-2">100%</p>
          <p className="text-xs text-textDim">All required identifiers are currently being monitored.</p>
        </div>
        
        <div className="glass-card p-6 border-primary/20 bg-primary/5 relative overflow-hidden">
          <History className="absolute -right-4 -bottom-4 w-24 h-24 text-primary/10 -rotate-12" />
          <h4 className="text-sm font-bold text-primary mb-4 flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>Last Audit</span>
          </h4>
          <p className="text-3xl font-heading font-bold text-white mb-2">14h ago</p>
          <p className="text-xs text-textDim">Automated daily check successfully completed.</p>
        </div>

        <div className="glass-card p-6 border-danger/20 bg-danger/5 relative overflow-hidden">
          <ShieldAlert className="absolute -right-4 -bottom-4 w-24 h-24 text-danger/10 -rotate-12" />
          <h4 className="text-sm font-bold text-danger mb-4 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4" />
            <span>Risk Index</span>
          </h4>
          <p className="text-3xl font-heading font-bold text-white mb-2">LOW</p>
          <p className="text-xs text-textDim">No critical data exposure incidents detected.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reports List */}
        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-heading font-bold text-white">Latest Reports</h3>
            <button className="text-xs font-bold text-primary hover:underline">Download All</button>
          </div>
          
          <div className="space-y-4">
            {reports.map((report, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-white/[0.02] group hover:border-primary/30 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-white/5 text-textDim group-hover:text-primary transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{report.name}</p>
                    <div className="flex items-center space-x-3 mt-0.5">
                      <span className="text-[10px] text-textMuted flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{report.date}</span>
                      </span>
                      <span className="text-[10px] text-textMuted">{report.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${report.status === 'Verified' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                    {report.status}
                  </span>
                  <button className="text-textMuted hover:text-white transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Timeline */}
        <div className="glass-card p-8 flex flex-col">
          <h3 className="text-xl font-heading font-bold text-white mb-8">System Audit Log</h3>
          <div className="flex-1 space-y-6 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="relative pl-6 border-l border-border-subtle pb-6 last:pb-0">
                <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary shadow-glow-primary" />
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-white">Policy Update Event</p>
                    <span className="text-[10px] text-textMuted">15:30:11</span>
                  </div>
                  <p className="text-xs text-textDim">Administrator modified PII detection sensitivity for Phone Numbers (Region: Mumbai).</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 py-3 w-full border border-border-subtle rounded-xl text-xs font-bold text-textDim hover:bg-white/5 hover:text-white transition-all">
            View Expanded Compliance History
          </button>
        </div>
      </div>
    </div>
  );
}
