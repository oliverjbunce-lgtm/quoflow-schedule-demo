import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quoflow Schedule Demo',
  description: 'AI-powered door schedule extraction and quoting',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f8f9fb]">
        {/* Nav */}
        <header className="no-print bg-[#1D3461] border-b border-[#243d75] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <a href="/" className="flex items-center gap-2.5 group">
                {/* Geometric mark */}
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="12" height="12" x="2" y="2" rx="2" fill="#E9A620" />
                  <rect width="12" height="12" x="14" y="2" rx="2" fill="#E9A620" opacity="0.6" />
                  <rect width="12" height="12" x="2" y="14" rx="2" fill="#E9A620" opacity="0.6" />
                  <rect width="12" height="12" x="14" y="14" rx="2" fill="#E9A620" opacity="0.3" />
                </svg>
                <span className="text-white font-semibold text-lg tracking-tight">
                  Quo<span className="text-[#E9A620]">flow</span>
                </span>
                <span className="text-[#6b84b5] text-sm font-normal hidden sm:block">
                  / Schedule Demo
                </span>
              </a>
              <div className="flex items-center gap-3">
                <span className="text-[#6b84b5] text-xs font-medium px-2 py-1 rounded-full border border-[#2d4a80] bg-[#243d75]">
                  Demo
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
