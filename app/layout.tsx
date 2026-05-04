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
        {/* Tailwind CSS via CDN — no build step required */}
        <script src="https://cdn.tailwindcss.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      navy: { DEFAULT: '#1D3461', dark: '#142549', light: '#243d75' },
                      gold: { DEFAULT: '#E9A620', dark: '#c98d1a' },
                    },
                    fontFamily: {
                      sans: ['Inter', 'system-ui', 'sans-serif'],
                    },
                  }
                }
              }
            `,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-100 font-sans">
        {/* Nav */}
        <header className="bg-[#1D3461] border-b border-[#243d75] sticky top-0 z-50 shadow-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              <a href="/" className="flex items-center gap-2.5">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect width="12" height="12" x="2" y="2" rx="2" fill="#E9A620" />
                  <rect width="12" height="12" x="14" y="2" rx="2" fill="#E9A620" opacity="0.6" />
                  <rect width="12" height="12" x="2" y="14" rx="2" fill="#E9A620" opacity="0.6" />
                  <rect width="12" height="12" x="14" y="14" rx="2" fill="#E9A620" opacity="0.3" />
                </svg>
                <span className="text-white font-semibold text-lg tracking-tight">
                  Quo<span className="text-[#E9A620]">flow</span>
                </span>
                <span className="text-[#6b84b5] text-sm hidden sm:block">/ Schedule Demo</span>
              </a>
              <span className="text-[#6b84b5] text-xs font-medium px-2 py-1 rounded-full border border-[#2d4a80] bg-[#243d75]">
                Demo
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
