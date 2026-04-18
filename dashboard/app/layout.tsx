import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CipherLLM | Privacy Gateway",
  description: "Secure, India-first PII redaction for LLMs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
