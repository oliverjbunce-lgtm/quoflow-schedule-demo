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

// ─── SVG icon components ───────────────────────────────────────────────────
function IconError() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconWarning() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5L12.5 11H1.5L7 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7 5.5v2.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 6v4M7 4v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Section header component ──────────────────────────────────────────────
function SectionHeader({
  title,
  count,
  right,
}: {
  title: string;
  count?: number;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 bg-[#1D3461] rounded-full" />
        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">{title}</h2>
        {count !== undefined && (
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

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

  // Flags UI state
  const [activeFilter, setActiveFilter] = useState<'error' | 'warning' | null>(null);
  const [flagsOpen, setFlagsOpen] = useState(false);

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

  const errorCount = flags.filter((f) => f.level === 'error').length;
  const warningCount = flags.filter((f) => f.level === 'warning').length;

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
            Back to Upload
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">

          {/* ── Layer 1: Summary strip ─────────────────────────────────── */}
          <div className="animate-fadeIn flex items-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-xl">
            <span className="text-sm font-semibold text-slate-700">
              {doors.length} door{doors.length !== 1 ? 's' : ''} extracted
            </span>
            <span className="w-px h-4 bg-slate-200" />

            {errorCount > 0 && (
              <button
                onClick={() => setActiveFilter(activeFilter === 'error' ? null : 'error')}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                  activeFilter === 'error'
                    ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                <IconError /> {errorCount} error{errorCount !== 1 ? 's' : ''}
              </button>
            )}

            {warningCount > 0 && (
              <button
                onClick={() => setActiveFilter(activeFilter === 'warning' ? null : 'warning')}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                  activeFilter === 'warning'
                    ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                    : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                }`}
              >
                <IconWarning /> {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </button>
            )}

            {errorCount === 0 && warningCount === 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                <IconCheck /> No issues found
              </span>
            )}

            {activeFilter && (
              <>
                <span className="ml-auto text-xs text-slate-400">Filtered</span>
                <button
                  onClick={() => setActiveFilter(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {/* ── Layer 2: General flags drawer ──────────────────────────── */}
          {flags.length > 0 && (
            <div className="animate-fadeIn mb-4">
              <button
                onClick={() => setFlagsOpen(!flagsOpen)}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors py-1"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`transition-transform ${flagsOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {flagsOpen ? 'Hide' : 'Show'} {flags.length} notice{flags.length !== 1 ? 's' : ''}
              </button>

              {flagsOpen && (
                <div className="mt-2 space-y-1.5">
                  {flags.map((flag, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm border-l-4 ${
                        flag.level === 'error'
                          ? 'border-l-red-400 bg-red-50 text-red-700'
                          : flag.level === 'warning'
                          ? 'border-l-amber-400 bg-amber-50 text-amber-700'
                          : 'border-l-blue-400 bg-blue-50 text-blue-700'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {flag.level === 'error' ? <IconError /> : flag.level === 'warning' ? <IconWarning /> : <IconInfo />}
                      </span>
                      <span>{flag.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Layer 3: Door Schedule ─────────────────────────────────── */}
          <div className="animate-fadeIn">
            <SectionHeader
              title="Door Schedule"
              count={doors.length}
              right={<span className="text-slate-400 text-xs">Click any row to edit</span>}
            />
            {activeFilter && (
              <div className="mb-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 5v3M6 3.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Filter active: showing all {doors.length} door{doors.length !== 1 ? 's' : ''} — door-level filtering coming soon
                <button onClick={() => setActiveFilter(null)} className="ml-auto text-slate-400 hover:text-slate-600 underline">
                  Clear
                </button>
              </div>
            )}
            <DoorTable doors={doors} onChange={setDoors} />
          </div>

          {/* ── Wall Specifications ────────────────────────────────────── */}
          {walls.length > 0 && (
            <div className="animate-fadeIn space-y-4">
              <SectionHeader title="Wall Specifications" count={walls.length} />
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
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <IconCheck /> Cavity Suitable
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

          {/* ── Floor Plan Scan — YOLO detection results ───────────────── */}
          {(yoloLoading || yoloResult) && (
            <div className="animate-fadeIn space-y-4">
              <SectionHeader
                title="Floor Plan Scan"
                right={<span className="text-xs text-slate-400 font-medium">Powered by YOLO</span>}
              />

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
                            <IconCheck /> Matches schedule
                          </span>
                        ) : yoloCount > geminiCount ? (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
                            <IconWarning /> {diff} door{diff !== 1 ? 's' : ''} not in schedule — review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
                            <IconWarning /> Schedule has {diff} more door{diff !== 1 ? 's' : ''} than detected
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

          {/* ── Action bar ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-slate-100">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L3 7l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Upload Different PDF
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
