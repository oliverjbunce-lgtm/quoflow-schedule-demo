'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import StepIndicator from '../../components/StepIndicator';
import DoorTable from '../../components/DoorTable';
import type { DoorRow, Flag, WallSpec, YoloResult } from '../../types';

const LOADING_MESSAGES = [
  'Quoflow AI is reading your document…',
  'Identifying door schedules…',
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
        <h2 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest">{title}</h2>
        {count !== undefined && (
          <span className="text-xs font-medium text-[#9CA3AF] bg-[#F7F8FA] border border-[#E5E7EB] px-2 py-0.5 rounded-full">
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

    async function runExtract() {
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

    async function runVision() {
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
          runExtract().catch((err) => {
            throw err;
          }),
          runVision(),
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
        <h1 className="text-2xl font-bold text-[#0F1117]">Review Extracted Schedule</h1>
        <p className="text-[#6B7280] mt-1 text-sm">
          Quoflow AI has read <strong className="text-[#0F1117] font-semibold">{filename}</strong>. Review and edit before continuing.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white border border-[#E5E7EB] rounded-xl gap-5">
          <div className="relative w-12 h-12">
            <div
              className="w-12 h-12 rounded-full"
              style={{ border: '2px solid #E5E7EB', borderTopColor: '#1D3461', animation: 'spin 0.8s linear infinite' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#E9A620]" />
            </div>
          </div>
          <div className="text-center">
            <p
              key={loadingMsgIdx}
              className="font-semibold text-[#0F1117] text-sm"
              style={{ animation: 'fadeIn 0.4s ease' }}
            >
              {LOADING_MESSAGES[loadingMsgIdx]}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-[#DC2626]">
          <p className="font-bold mb-1 text-sm">Extraction Failed</p>
          <p className="text-sm">{error}</p>
          <button onClick={() => router.push('/')} className="mt-3 text-sm text-[#1D3461] font-semibold underline">
            Back to Upload
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">

          {/* ── Summary strip ─────────────────────────────────── */}
          <div className="animate-fadeIn flex items-center gap-3 py-3 px-4 bg-white border border-[#E5E7EB] rounded-xl">
            <span className="text-sm font-semibold text-[#0F1117]">
              {doors.length} door{doors.length !== 1 ? 's' : ''} extracted
            </span>
            <span className="w-px h-4 bg-[#E5E7EB]" />

            {errorCount > 0 && (
              <button
                onClick={() => setActiveFilter(activeFilter === 'error' ? null : 'error')}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                  activeFilter === 'error'
                    ? 'bg-red-100 text-[#DC2626] ring-1 ring-red-300'
                    : 'bg-red-50 text-[#DC2626] hover:bg-red-100'
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
                    ? 'bg-amber-100 text-[#D97706] ring-1 ring-amber-300'
                    : 'bg-amber-50 text-[#D97706] hover:bg-amber-100'
                }`}
              >
                <IconWarning /> {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </button>
            )}

            {errorCount === 0 && warningCount === 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#059669]">
                <IconCheck /> No issues found
              </span>
            )}

            {activeFilter && (
              <>
                <span className="ml-auto text-xs text-[#9CA3AF]">Filtered</span>
                <button
                  onClick={() => setActiveFilter(null)}
                  className="text-xs text-[#9CA3AF] hover:text-[#6B7280] underline"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {/* ── General flags drawer ──────────────────────────── */}
          {flags.length > 0 && (
            <div className="animate-fadeIn mb-4">
              <button
                onClick={() => setFlagsOpen(!flagsOpen)}
                className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#0F1117] transition-colors py-1"
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
                          ? 'border-l-red-400 bg-red-50 text-[#DC2626]'
                          : flag.level === 'warning'
                          ? 'border-l-amber-400 bg-amber-50 text-[#D97706]'
                          : 'border-l-blue-400 bg-blue-50 text-[#2563EB]'
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

          {/* ── Door Schedule ─────────────────────────────────── */}
          <div className="animate-fadeIn">
            <SectionHeader
              title="Door Schedule"
              count={doors.length}
              right={<span className="text-[#9CA3AF] text-xs">Click any row to edit</span>}
            />
            {activeFilter && (
              <div className="mb-3 flex items-center gap-2 text-xs text-[#6B7280] bg-[#F7F8FA] border border-[#E5E7EB] px-3 py-2 rounded-lg">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 5v3M6 3.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Filter active: showing all {doors.length} door{doors.length !== 1 ? 's' : ''} — door-level filtering coming soon
                <button onClick={() => setActiveFilter(null)} className="ml-auto text-[#9CA3AF] hover:text-[#6B7280] underline">
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
                    className={`bg-white border border-[#E5E7EB] rounded-xl p-4 ${
                      wall.cavitySuitable ? 'border-l-4 border-l-[#059669]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[#1D3461] text-sm">{wall.wallType}</span>
                      {wall.cavitySuitable ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-[#059669]">
                          <IconCheck /> Cavity Suitable
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F7F8FA] text-[#9CA3AF]">
                          Standard Only
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#0F1117]">{wall.description}</p>
                    {(wall.thickness || wall.framingType) && (
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#6B7280]">
                        {wall.thickness && <span>Thickness: {wall.thickness}</span>}
                        {wall.framingType && <span>Framing: {wall.framingType}</span>}
                      </div>
                    )}
                    {wall.notes && (
                      <p className="mt-2 text-xs text-[#9CA3AF]">{wall.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Floor Plan Analysis — vision detection results ───────────────── */}
          {(yoloLoading || yoloResult) && (
            <div className="animate-fadeIn space-y-4">
              <SectionHeader
                title="Floor Plan Analysis"
                right={<span className="text-[11px] text-[#9CA3AF] font-medium uppercase tracking-wide">Quoflow Vision</span>}
              />

              {yoloLoading && (
                <div className="flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-xl p-5">
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0"
                    style={{ border: '2px solid #E5E7EB', borderTopColor: '#1D3461', animation: 'spin 0.8s linear infinite' }}
                  />
                  <p className="text-sm text-[#6B7280] font-medium">Scanning floor plans…</p>
                </div>
              )}

              {!yoloLoading && yoloResult && (() => {
                const hfPage = parseInt(sessionStorage.getItem('hf_suggested_page') || '1', 10);
                const extractCount = doors.length;
                const visionCount = yoloResult.count ?? 0;
                const diff = Math.abs(visionCount - extractCount);
                const matches = diff <= 1;

                return (
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Left: annotated image */}
                      {yoloResult.annotated_image_url && (
                        <div className="flex flex-col gap-2">
                          <img
                            src={yoloResult.annotated_image_url}
                            alt="Annotated floor plan with detected doors"
                            className="rounded-xl max-h-64 object-contain border border-[#E5E7EB] w-full"
                          />
                          <p className="text-xs text-[#9CA3AF] text-center">Detected doors highlighted</p>
                        </div>
                      )}

                      {/* Right: stats */}
                      <div className="flex flex-col justify-center gap-3">
                        <div>
                          <p className="text-3xl font-bold text-[#1D3461]">{visionCount}</p>
                          <p className="text-sm text-[#6B7280] mt-0.5">doors detected</p>
                        </div>

                        {matches ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-[#059669] text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
                            <IconCheck /> Matches schedule
                          </span>
                        ) : visionCount > extractCount ? (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-[#D97706] text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
                            <IconWarning /> {diff} door{diff !== 1 ? 's' : ''} not in schedule — review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-[#D97706] text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
                            <IconWarning /> Schedule has {diff} more door{diff !== 1 ? 's' : ''} than detected
                          </span>
                        )}

                        <p className="text-xs text-[#9CA3AF]">Scanned page {hfPage} of your floor plans</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── Action bar ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-[#E5E7EB]">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#E5E7EB] text-[#0F1117] text-sm font-medium hover:bg-[#F7F8FA] transition-colors"
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
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#E9A620] text-white hover:bg-[#D4941C]'
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

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
