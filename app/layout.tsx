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
      <body>
        {/* Nav */}
        <header className="app-nav no-print">
          <div className="app-nav-inner">
            <a href="/" className="app-nav-logo">
              {/* Geometric mark */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="12" height="12" x="2" y="2" rx="2" fill="#E9A620" />
                <rect width="12" height="12" x="14" y="2" rx="2" fill="#E9A620" opacity="0.6" />
                <rect width="12" height="12" x="2" y="14" rx="2" fill="#E9A620" opacity="0.6" />
                <rect width="12" height="12" x="14" y="14" rx="2" fill="#E9A620" opacity="0.3" />
              </svg>
              <span className="app-nav-logo-text">
                Quo<span className="gold">flow</span>
              </span>
              <span className="app-nav-subtitle">/ Schedule Demo</span>
            </a>
            <div>
              <span className="app-nav-badge">Demo</span>
            </div>
          </div>
        </header>

        <main className="app-main">
          {children}
        </main>
      </body>
    </html>
  );
}
