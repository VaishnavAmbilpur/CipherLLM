"use client";

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Send, 
  Trash2, 
  Copy, 
  Code, 
  User, 
  Cpu,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { chat } from '@/lib/api';

export default function PlaygroundPage() {
  const [input, setInput] = useState('');
  const [sessionId] = useState(`sess-${Math.random().toString(36).substring(7)}`);
  const [history, setHistory] = useState<any[]>([
    { role: 'gateway', content: 'CipherVault Protocol Online. You are connected to the privacy engine.', redacted: false },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input || isTyping) return;
    
    setError(null);
    const userMsg = { role: 'user', content: input };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chat(input, sessionId, 'mock');
      setHistory(prev => [...prev, { 
        role: 'gateway', 
        content: result.response, 
        redacted: result.metadata?.redactions?.length > 0,
        metadata: result.metadata
      }]);
    } catch (err: any) {
      setError(err.message);
      setHistory(prev => [...prev, { 
        role: 'gateway', 
        content: `Error: ${err.message}`, 
        isError: true 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-heading font-extrabold text-white tracking-tight flex items-center space-x-3">
            <Terminal className="w-8 h-8 text-primary" />
            <span>API Playground</span>
          </h2>
          <p className="text-text-dim">Test the privacy protocol against real-world scenarios.</p>
        </div>
        <button 
          onClick={() => setHistory([])}
          className="p-2.5 rounded-xl border border-border-subtle text-textMuted hover:text-danger hover:border-danger/30 transition-all"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        {/* Interaction Panel */}
        <div className="glass-card flex flex-col min-h-0">
          <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-danger/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
              </div>
              <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Protocol Sandbox</span>
            </div>
            <div className="text-xs font-mono text-primary/70">session: {sessionId}</div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-background' : 'bg-white/5 border border-white/10 text-white'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary/10 border border-primary/20 text-white' : msg.isError ? 'bg-danger/10 border border-danger/20 text-danger' : 'bg-white/5 border border-white/10 text-textDim'}`}>
                    {msg.content}
                    {msg.redacted && (
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center space-x-2 text-[10px] font-bold text-primary italic uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Shield Active: Data Masked</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex space-x-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center animate-pulse text-primary">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-textDim italic text-xs">
                    Processing privacy layers...
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border-subtle bg-black/20">
            <div className="relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a sensitive message..."
                disabled={isTyping}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-primary/50 transition-all shadow-inner disabled:opacity-50"
              />
              <button 
                onClick={handleSend}
                disabled={isTyping || !input}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-background hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Intelligence Detail */}
        <div className="glass-card p-8 space-y-8 h-full overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            <h3 className="text-xl font-heading font-bold text-white">Detection Intelligence</h3>
            <p className="text-sm text-textDim">Technical analysis of the last transaction.</p>
          </div>

          {history.length > 1 && history[history.length - 1].role === 'gateway' ? (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">NER Confidence</span>
                  <span className="text-xs font-mono text-primary">98.2%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '98.2%' }} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-textMuted uppercase tracking-[0.2em]">Redacted Entities</h4>
                <div className="flex flex-wrap gap-2">
                  {history[history.length - 1].metadata?.redactions?.map((r: any, j: number) => (
                    <span key={j} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-textDim flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{r.type}</span>
                    </span>
                  )) || <span className="text-xs text-textMuted italic">No sensitive data found.</span>}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-textMuted uppercase tracking-[0.2em]">Gateway Metadata</h4>
                <div className="p-4 bg-black/40 rounded-xl border border-border-subtle font-mono text-[11px] text-primary/80 overflow-x-auto">
                  <pre>{JSON.stringify(history[history.length - 1].metadata || {}, null, 2)}</pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-10 border-2 border-dashed border-border-subtle rounded-3xl">
              <div className="space-y-4">
                <AlertCircle className="w-12 h-12 text-textMuted mx-auto" />
                <p className="text-sm text-textMuted max-w-[200px]">Send a message to see the privacy layer analysis.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
