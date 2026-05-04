'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from '../components/StepIndicator';

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [uploadStage, setUploadStage] = useState<'reading' | 'uploading' | null>(null);

  async function handleFile(f: File) {
    if (!f.type.includes('pdf') && !f.name.endsWith('.pdf')) {
      setError('Please upload a PDF file.');
      return;
    }

    setLoading(true);
    setError(null);
    setFilename(f.name);
    setUploadStage('uploading');

    try {
      const formData = new FormData();
      formData.append('file', f);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Upload failed (HTTP ${res.status})`);
      }

      const result = await res.json();
      const { fileUri } = result;

      sessionStorage.setItem('qf_file_uri', fileUri);
      sessionStorage.setItem('qf_filename', f.name);
      // Store HF Space session for YOLO detection
      sessionStorage.setItem('hf_session_id', result.hfSessionId || '');
      sessionStorage.setItem('hf_suggested_page', String(result.hfSuggestedPage || 1));
      // Clear any stale base64 data from previous sessions
      sessionStorage.removeItem('qf_pdf');

      router.push('/extract');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file. Please try again.');
      setLoading(false);
      setUploadStage(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator currentStep={1} />

      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#1D3461] mb-3">Door Schedule Extraction</h1>
        <p className="text-slate-500 text-lg">
          Upload a full set of floor plans. AI reads the entire document and extracts every door — no page selection needed.
        </p>
      </div>

      {/* Drop zone */}
      {!loading && (
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-between w-full h-72 rounded-2xl border-2 border-dashed cursor-pointer transition-all px-6 py-8
            ${isDragging
              ? 'border-[#E9A620] bg-amber-50'
              : 'border-slate-300 bg-white hover:border-[#1D3461] hover:bg-slate-50'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="flex-1 flex flex-col items-center justify-center gap-3 pointer-events-none">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-colors ${isDragging ? 'bg-amber-100' : 'bg-slate-100'}`}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={isDragging ? '#E9A620' : '#94a3b8'} strokeWidth="1.5">
                <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-700 text-lg">
                {isDragging ? 'Drop PDF here' : 'Drag & drop your floor plans'}
              </p>
              <p className="text-slate-400 text-sm mt-1">or click to browse — PDF only</p>
            </div>
            <div className="flex gap-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Full document scan
              </span>
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                All pages analysed
              </span>
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Issues flagged
              </span>
            </div>
          </div>
          {/* Bottom support text */}
          <p className="text-xs text-slate-300 pointer-events-none mt-2">
            Supports PDF files up to 100MB&nbsp;•&nbsp;Files are not stored
          </p>
        </label>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center w-full h-72 rounded-2xl border border-slate-200 bg-white gap-4 shadow-sm">
          <div
            className="w-12 h-12 border-slate-200 rounded-full animate-spin"
            style={{ borderWidth: 3, borderStyle: 'solid', borderTopColor: '#1D3461' }}
          />
          <div className="text-center">
            <p className="font-bold text-[#1D3461] text-base">{filename}</p>
            <p className="text-slate-400 text-sm mt-1">Uploading to AI…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* How it works */}
      {!loading && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                </svg>
              ),
              title: 'Upload',
              desc: 'Drop your full PDF floor plan set',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              ),
              title: 'AI Analyses',
              desc: 'Gemini reads every page, finds all doors and relevant specs',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              ),
              title: 'Review & Quote',
              desc: 'Check extracted doors, flag issues, build your quote',
            },
          ].map((s) => (
            <div key={s.title} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <div className="flex justify-center mb-2 text-[#1D3461]">{s.icon}</div>
              <p className="font-semibold text-slate-700 text-sm">{s.title}</p>
              <p className="text-slate-400 text-xs mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
