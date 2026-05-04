'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import StepIndicator from '../../components/StepIndicator';
import DoorTable from '../../components/DoorTable';
import type { DoorRow, Flag } from '../../types';

export default function ExtractPage() {
  const router = useRouter();
  const [doors, setDoors] = useState<DoorRow[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState('');

  useEffect(() => {
    const fileUri = sessionStorage.getItem('qf_file_uri');
    const pdf = sessionStorage.getItem('qf_pdf'); // legacy fallback
    const name = sessionStorage.getItem('qf_filename') ?? 'Document';
    setFilename(name);

    if (!fileUri && !pdf) {
      router.replace('/');
      return;
    }

    async function run() {
      try {
        const body = fileUri ? { fileUri } : { pdf };
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const doorsWithIds: DoorRow[] = (data.doors as Omit<DoorRow, 'id'>[]).map((d) => ({
          ...d,
          id: uuidv4(),
          softClose: Boolean(d.softClose),
        }));
        setDoors(doorsWithIds);
        setFlags(data.flags ?? []);
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

  const errors = flags.filter((f) => f.level === 'error');
  const warnings = flags.filter((f) => f.level === 'warning');
  const infos = flags.filter((f) => f.level === 'info');

  return (
    <div>
      <StepIndicator currentStep={2} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1D3461]">Review Extracted Schedule</h1>
        <p className="text-slate-500 mt-1">
          AI has read <strong>{filename}</strong>. Review and edit before continuing.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[280px] bg-white border border-slate-200 rounded-2xl gap-4">
          <div className="w-12 h-12 border-t-[#1D3461] border-slate-200 rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <div className="text-center">
            <p className="font-semibold text-slate-700">Analysing full document…</p>
            <p className="text-slate-400 text-sm mt-1">Gemini 2.5 Flash is reading every page</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <p className="font-bold mb-1">Extraction Failed</p>
          <p className="text-sm">{error}</p>
          <button onClick={() => router.push('/')} className="mt-3 text-sm text-[#1D3461] font-semibold underline">
            ← Back to Upload
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">

          {/* Flags section */}
          {flags.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">AI Findings & Issues</h2>

              {errors.map((f, i) => (
                <div key={i} className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <span className="text-red-500 text-lg leading-none mt-0.5">⛔</span>
                  <div>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Error</span>
                    <p className="text-sm text-red-700 mt-0.5">{f.message}</p>
                  </div>
                </div>
              ))}

              {warnings.map((f, i) => (
                <div key={i} className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-amber-500 text-lg leading-none mt-0.5">⚠️</span>
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Warning</span>
                    <p className="text-sm text-amber-700 mt-0.5">{f.message}</p>
                  </div>
                </div>
              ))}

              {infos.map((f, i) => (
                <div key={i} className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-blue-500 text-lg leading-none mt-0.5">ℹ️</span>
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Note</span>
                    <p className="text-sm text-blue-700 mt-0.5">{f.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results summary */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                {doors.length} door{doors.length !== 1 ? 's' : ''} extracted
              </span>
              {errors.length > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">
                  {errors.length} error{errors.length !== 1 ? 's' : ''}
                </span>
              )}
              {warnings.length > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full">
                  {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <span className="text-slate-400 text-sm">Click any cell to edit</span>
          </div>

          <DoorTable doors={doors} onChange={setDoors} />

          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => router.push('/')} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
              ← Upload Different PDF
            </button>
            <button
              onClick={handleContinue}
              disabled={doors.length === 0}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                doors.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#1D3461] text-white hover:bg-[#142549]'
              }`}
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
