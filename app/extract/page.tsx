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
    <div className="max-w-7xl mx-auto">
      <StepIndicator currentStep={2} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1D3461] mb-2">Extract & Review</h1>
        <p className="text-gray-500 text-sm">
          Review and edit the extracted door schedule before building your quote.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-[#f0f3f9] rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-[#E9A620] rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#1D3461]">Analysing schedule pages…</p>
            <p className="text-sm text-gray-400 mt-1">Gemini 2.5 Flash is extracting your door schedule</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-xl">
          <p className="font-semibold text-red-700 mb-1">Extraction Failed</p>
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-3 text-sm text-red-600 underline hover:text-red-800"
          >
            ← Back to Upload
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Results summary */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-700">
                {doors.length} door{doors.length !== 1 ? 's' : ''} extracted
              </span>
            </div>
            <span className="text-sm text-gray-400">Click any cell to edit</span>
          </div>

          <DoorTable doors={doors} onChange={setDoors} />

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-6 py-3 bg-[#1D3461] text-white rounded-xl font-semibold text-sm hover:bg-[#243d75] transition-all shadow-sm hover:shadow-md"
            >
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
