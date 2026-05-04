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
    <div className="max-w-7xl mx-auto">
      <StepIndicator currentStep={5} />

      {/* Action bar */}
      <div className="no-print flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1117] mb-1">Quote Preview</h1>
          <p className="text-[#6B7280] text-sm">
            Review the final quote. Use &quot;Print / Save PDF&quot; to export.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/quote')}
            className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#0F1117] border border-[#E5E7EB] rounded-lg hover:bg-[#F5F5F7] transition-colors bg-white"
          >
            ← Back to Edit
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0A84FF] text-white rounded-lg font-semibold text-sm hover:bg-[#0066CC] transition-colors"
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

      {/* Print styles inline */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          header { display: none !important; }
          body { background: white !important; }
          main { padding: 0 !important; max-width: 100% !important; }
          .print-container {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 20px !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
