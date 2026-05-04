'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from '../../components/StepIndicator';
import QuotePrintView from '../../components/QuotePrintView';
import type { QuoteData } from '../../types';

export default function PreviewPage() {
  const router = useRouter();
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('qf_quote');
    if (!raw) {
      router.replace('/');
      return;
    }
    setQuoteData(JSON.parse(raw));
  }, [router]);

  if (!quoteData) return null;

  return (
    <div>
      <StepIndicator currentStep={4} />

      {/* Action bar */}
      <div className="preview-bar no-print">
        <div>
          <h1 className="page-title">Quote Preview</h1>
          <p className="page-subtitle">
            Review the final quote. Use &quot;Print / Save PDF&quot; to export.
          </p>
        </div>
        <div className="preview-bar-actions">
          <button
            onClick={() => router.push('/quote')}
            className="btn btn--outline"
          >
            ← Back to Edit
          </button>
          <button
            onClick={() => window.print()}
            className="btn btn--gold"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 5V2h8v3M2 5h12a1 1 0 011 1v5a1 1 0 01-1 1h-2v3H4v-3H2a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="currentColor" />
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      <QuotePrintView data={quoteData} />
    </div>
  );
}
