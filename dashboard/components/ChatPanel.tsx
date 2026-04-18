'use client';

import React from 'react';
import { Send, Bot, User, ShieldCheck, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intercepted?: number;
}

export default function ChatPanel() {
  const [messages, setMessages] = React.useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: "Hello. I am the CipherLLM Privacy Proxy. All messages sent through this terminal are automatically stripped of PII before being forwarded to the LLM. How can I help you today?" 
    }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    // Mock response simulation
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I have processed your request. Based on the documentation for [PERSON_1] with Aadhaar [AADHAAR_1], I can confirm that the contract is valid.",
        intercepted: 2
      }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-background-primary">
      <header className="px-8 py-4 border-b border-border bg-background-primary/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent-blue" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-secondary">AI Terminal</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-accent-blue/10 border border-accent-blue/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
            <span className="text-[10px] font-bold text-accent-blue tracking-wider uppercase">OpenAI GPT-4o</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex gap-4 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded shrink-0 flex items-center justify-center border",
              msg.role === 'assistant' 
                ? "bg-background-elevated border-border text-accent-green" 
                : "bg-accent-green text-background-primary border-accent-green"
            )}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className="space-y-3">
              <div className={cn(
                "p-4 rounded-lg text-sm leading-relaxed",
                msg.role === 'assistant' 
                  ? "bg-background-surface border border-border shadow-sm" 
                  : "bg-background-elevated border border-border/50 text-text-primary"
              )}>
                {msg.content.split(/(\[.*?\])/g).map((part, i) => {
                  if (part.startsWith('[') && part.endsWith(']')) {
                    return <span key={i} className="token mx-1">{part}</span>;
                  }
                  return part;
                })}
              </div>
              {msg.intercepted && (
                <div className="flex items-center gap-2 ml-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-green" />
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">
                    {msg.intercepted} Item{msg.intercepted > 1 ? 's' : ''} Intercepted
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center border bg-background-elevated border-border text-accent-green">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-lg bg-background-surface border border-border text-sm text-text-muted italic">
              AI is redacting and thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-background-primary border-t border-border">
        <form onSubmit={handleSubmit} className="relative group">
          <input 
            type="text" 
            placeholder="Describe your request (e.g., 'Summarize contract for Priya Sharma'...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-background-elevated border border-border rounded-lg px-5 py-4 text-sm focus:outline-none focus:border-accent-green/50 transition-all pr-16 text-text-primary placeholder:text-text-muted group-hover:border-border-accent"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 px-4 bg-accent-green rounded-md text-background-primary font-bold transition-all hover:bg-accent-green/90 disabled:opacity-50 disabled:grayscale flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="mt-4 text-[10px] text-text-muted text-center uppercase tracking-widest font-medium">
          CipherLLM Environment: <span className="text-accent-green">Secure</span> | Privacy Level: <span className="text-accent-blue">Strict</span>
        </p>
      </div>
    </div>
  );
}
