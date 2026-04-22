import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "CipherLLM | The Privacy-First LLM Gateway",
  description: "Enterprise privacy protocol for LLM data redaction and compliance. Local-first Indian PII scrubbing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="flex flex-col min-h-screen bg-background text-textMain relative overflow-x-hidden selection:bg-accent-primary/30 scroll-smooth">
        
        {/* Cinematic Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-primary/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 animate-pulse transition-all duration-[10s]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-secondary/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        </div>

        <Navbar />

        <main className="flex-1 w-full relative">
          {children}
        </main>

        <footer className="w-full border-t border-white/5 py-12 bg-background-dark/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-accent-primary" />
              </div>
              <span className="text-sm font-heading font-black text-white uppercase tracking-wider">CipherVault / DS Protocol</span>
            </div>
            
            <div className="flex items-center space-x-12 text-xs font-bold uppercase tracking-[0.2em] text-textMuted">
              <a href="https://github.com/VaishnavAmbilpur/CipherLLM" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
            
            <div className="text-[10px] text-textMuted font-bold uppercase tracking-widest border border-white/5 px-3 py-1 rounded-full bg-white/[0.02]">
              Stable Build v1.0.0
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-8 pt-8 border-t border-white/[0.02] text-center">
            <p className="text-[9px] text-textMuted font-bold uppercase tracking-[0.3em]">
              Designed for Private Data Sovereignty & DPDP Compliance
            </p>
          </div>
        </footer>

      </body>
    </html>
  );
}
