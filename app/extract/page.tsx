'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import StepIndicator from '../../components/StepIndicator';
import DoorTable from '../../components/DoorTable';
import type { DoorRow, Flag, WallSpec, YoloResult } from '../../types';

const LOADING_MESSAGES = [
  'Reading floor plans…',
  'Finding door schedules…',
  'Extracting specifications…',
  'Almost done…',
];

export default function ExtractPage() {
  const router = useRouter();
  const [doors, setDoors] = useState<DoorRow[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [walls, setWalls] = useState<WallSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState('');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [yoloResult, setYoloResult] = useState<YoloResult | null>(null);
  const [yoloLoading, setYoloLoading] = useState(false);

  // Cycle loading messages every 2 seconds
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const fileUri = sessionStorage.getItem('qf_file_uri');
    const pdf = sessionStorage.getItem('qf_pdf'); // legacy fallback
    const name = sessionStorage.getItem('qf_filename') ?? 'Document';
    setFilename(name);

    if (!fileUri && !pdf) {
      router.replace('/');
      return;
    }

    const hfSessionId = sessionStorage.getItem('hf_session_id') || '';
    const hfPage = parseInt(sessionStorage.getItem('hf_suggested_page') || '1', 10);

    async function runGemini() {
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
      const wallsWithIds: WallSpec[] = ((data.walls ?? []) as Omit<WallSpec, 'id'>[]).map((w) => ({
        ...w,
        id: uuidv4(),
      }));
      setDoors(doorsWithIds);
      setWalls(wallsWithIds);
      setFlags(data.flags ?? []);
    }

    async function runYolo() {
      if (!hfSessionId) return;
      setYoloLoading(true);
      try {
        const detectRes = await fetch('/api/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: hfSessionId, page: hfPage }),
        });
        if (!detectRes.ok) return;
        const detectData = await detectRes.json();
        if (!detectData.error) setYoloResult(detectData);
      } catch {
        // Non-fatal — just don't show the section
      } finally {
        setYoloLoading(false);
      }
    }

    async function run() {
      try {
        // Fire Gemini extraction and YOLO detection in parallel
        await Promise.all([
          runGemini().catch((err) => {
            throw err; // Gemini errors are fatal
          }),
          runYolo(), // YOLO errors are swallowed inside runYolo
        ]);
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
    sessionStorage.setItem('qf_walls', JSON.stringify(walls));
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
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white border border-slate-200 rounded-2xl gap-5">
          <div className="relative w-14 h-14">
            <div
              className="w-14 h-14 border-slate-200 rounded-full animate-spin"
              style={{ borderWidth: 3, borderStyle: 'solid', borderTopColor: '#1D3461' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E9A620]" />
            </div>
          </div>
          <div className="text-center">
            <p
              key={loadingMsgIdx}
              className="font-semibold text-slate-700 text-base transition-all"
              style={{ animation: 'fadeIn 0.4s ease' }}
            >
              {LOADING_MESSAGES[loadingMsgIdx]}
            </p>
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
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">AI Findings &amp; Issues</h2>

              {errors.map((f, i) => (
                <div key={i} className="flex gap-3 p-3 pl-4 bg-red-50/60 border-l-4 border-l-red-400 rounded-r-lg">
                  <span className="text-red-500 text-base leading-none mt-0.5">⛔</span>
                  <div>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Error</span>
                    <p className="text-sm text-red-700 mt-0.5">{f.message}</p>
                  </div>
                </div>
              ))}

              {warnings.map((f, i) => (
                <div key={i} className="flex gap-3 p-3 pl-4 bg-amber-50/60 border-l-4 border-l-amber-400 rounded-r-lg">
                  <span className="text-amber-500 text-base leading-none mt-0.5">⚠️</span>
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Warning</span>
                    <p className="text-sm text-amber-700 mt-0.5">{f.message}</p>
                  </div>
                </div>
              ))}

              {infos.map((f, i) => (
                <div key={i} className="flex gap-3 p-3 pl-4 bg-blue-50/60 border-l-4 border-l-blue-400 rounded-r-lg">
                  <span className="text-blue-500 text-base leading-none mt-0.5">ℹ️</span>
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Note</span>
                    <p className="text-sm text-blue-700 mt-0.5">{f.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary badges */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                {doors.length} door{doors.length !== 1 ? 's' : ''} extracted
              </span>
              {errors.length > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                  ⛔ {errors.length} error{errors.length !== 1 ? 's' : ''}
                </span>
              )}
              {warnings.length > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                  ⚠️ {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <span className="text-slate-400 text-xs">Click any cell to edit</span>
          </div>

          <DoorTable doors={doors} onChange={setDoors} />

          {/* Wall Specifications */}
          {walls.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-[#1D3461]">Wall Specifications</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  {walls.length} wall type{walls.length !== 1 ? 's' : ''} detected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {walls.map((wall) => (
                  <div
                    key={wall.id}
                    className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm ${
                      wall.cavitySuitable ? 'border-l-4 border-l-green-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[#1D3461] text-sm">{wall.wallType}</span>
                      {wall.cavitySuitable ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Cavity Suitable ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                          Standard Only
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">{wall.description}</p>
                    {(wall.thickness || wall.framingType) && (
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                        {wall.thickness && <span>Thickness: {wall.thickness}</span>}
                        {wall.framingType && <span>Framing: {wall.framingType}</span>}
                      </div>
                    )}
                    {wall.notes && (
                      <p className="mt-2 text-xs text-slate-400">{wall.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Floor Plan Scan — YOLO detection results */}
          {(yoloLoading || yoloResult) && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-[#1D3461]">Floor Plan Scan</h2>
                <span className="text-xs text-slate-400 font-medium">Powered by YOLO</span>
              </div>

              {yoloLoading && (
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-5">
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 animate-spin"
                    style={{ borderWidth: 2, borderStyle: 'solid', borderColor: '#e2e8f0', borderTopColor: '#1D3461' }}
                  />
                  <p className="text-sm text-slate-500 font-medium">Scanning floor plans…</p>
                </div>
              )}

              {!yoloLoading && yoloResult && (() => {
                const hfPage = parseInt(sessionStorage.getItem('hf_suggested_page') || '1', 10);
                const geminiCount = doors.length;
                const yoloCount = yoloResult.count ?? 0;
                const diff = Math.abs(yoloCount - geminiCount);
                const matches = diff <= 1;

                return (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Left: annotated image */}
                      {yoloResult.annotated_image_url && (
                        <div className="flex flex-col gap-2">
                          <img
                            src={yoloResult.annotated_image_url}
                            alt="Annotated floor plan with detected doors"
                            className="rounded-xl max-h-64 object-contain border border-slate-200 w-full"
                          />
                          <p className="text-xs text-slate-400 text-center">Detected doors highlighted</p>
                        </div>
                      )}

                      {/* Right: stats */}
                      <div className="flex flex-col justify-center gap-3">
                        <div>
                          <p className="text-3xl font-bold text-[#1D3461]">{yoloCount}</p>
                          <p className="text-sm text-slate-500 mt-0.5">doors detected</p>
                        </div>

                        {matches ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
                            ✓ Matches schedule
                          </span>
                        ) : yoloCount > geminiCount ? (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
                            ⚠ {diff} door{diff !== 1 ? 's' : ''} not in schedule — review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
                            ⚠ Schedule has {diff} more door{diff !== 1 ? 's' : ''} than detected
                          </span>
                        )}

                        <p className="text-xs text-slate-400">Scanned page {hfPage} of your floor plans</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-slate-100">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
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
