'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import StepIndicator from '../../components/StepIndicator';
import DoorTable from '../../components/DoorTable';
import type { DoorRow } from '../../types';

export default function ExtractPage() {
  const router = useRouter();
  const [doors, setDoors] = useState<DoorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('qf_pages');
    if (!raw) {
      router.replace('/');
      return;
    }

    const pages: string[] = JSON.parse(raw);

    async function run() {
      try {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pages }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const doorsWithIds: DoorRow[] = (data.doors as Omit<DoorRow, 'id'>[]).map((d) => ({
          ...d,
          id: uuidv4(),
        }));
        setDoors(doorsWithIds);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Extraction failed');
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [router]);

  function handleContinue() {
    sessionStorage.setItem('qf_doors', JSON.stringify(doors));
    router.push('/quote');
  }

  return (
    <div>
      <StepIndicator currentStep={2} />

      <div className="mb-6">
        <h1 className="page-title">Extract &amp; Review</h1>
        <p className="page-subtitle">
          Review and edit the extracted door schedule before building your quote.
        </p>
      </div>

      {loading && (
        <div className="spinner-wrap spinner-wrap--large">
          <div className="spinner-ring" />
          <div className="spinner-text">
            <p className="spinner-title">Analysing schedule pages…</p>
            <p className="spinner-subtitle">Gemini 2.5 Flash is extracting your door schedule</p>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert--error">
          <p className="alert-title">Extraction Failed</p>
          <p>{error}</p>
          <button onClick={() => router.push('/')} className="alert-link">
            ← Back to Upload
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="stack-6">
          {/* Results summary */}
          <div className="results-row">
            <div className="badge-success">
              <span className="badge-dot" />
              {doors.length} door{doors.length !== 1 ? 's' : ''} extracted
            </div>
            <span className="hint-text">Click any cell to edit</span>
          </div>

          <DoorTable doors={doors} onChange={setDoors} />

          <div className="btn-row">
            <button onClick={() => router.push('/')} className="btn btn--ghost">
              ← Back
            </button>
            <button onClick={handleContinue} className="btn btn--navy">
              Continue to Quote
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
