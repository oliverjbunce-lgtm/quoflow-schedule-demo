import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quoflow — Plan Analysis',
  description: 'AI-powered door schedule extraction and quoting',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#F5F5F7]">
        {/* Nav */}
        <header className="no-print bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-14">
              <a href="/" className="flex items-center gap-2.5">
                {/* 4-square logo mark — blue */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="10" height="10" x="1" y="1" rx="2" fill="#0A84FF" />
                  <rect width="10" height="10" x="13" y="1" rx="2" fill="#0A84FF" fillOpacity="0.5" />
                  <rect width="10" height="10" x="1" y="13" rx="2" fill="#0A84FF" fillOpacity="0.5" />
                  <rect width="10" height="10" x="13" y="13" rx="2" fill="#0A84FF" fillOpacity="0.2" />
                </svg>
                <span className="text-[#0F1117] font-semibold text-base tracking-tight">
                  Quo<span style={{ color: '#0A84FF' }}>flow</span>
                </span>
              </a>
              <div className="flex items-center gap-2">
                <span className="text-[#9CA3AF] text-xs font-medium">Plan Analysis</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
