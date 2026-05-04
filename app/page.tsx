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
      sessionStorage.setItem('hf_session_id', result.hfSessionId || '');
      sessionStorage.setItem('hf_suggested_page', String(result.hfSuggestedPage || 1));
      sessionStorage.setItem('hf_thumbnails', JSON.stringify(result.hfThumbnails || []));
      sessionStorage.removeItem('qf_pdf');

      router.push('/pages');
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
        <h1 className="text-2xl font-bold text-[#0F1117] mb-3">Upload your floor plans</h1>
        <p className="text-[#6B7280] text-[15px]">
          Quoflow AI extracts door schedules, wall specifications, and room context in seconds.
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
              ? 'border-[#0A84FF] bg-[#0A84FF]/5'
              : 'border-[#E5E7EB] bg-white hover:border-[#0A84FF]'
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
          <div className="flex-1 flex flex-col items-center justify-center gap-4 pointer-events-none">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#F5F5F7"/>
              <path d="M20 26V14M14 20l6-6 6 6" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 30h16" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div className="text-center">
              <p className="font-medium text-[#0F1117] text-base">
                {isDragging ? 'Drop your PDF here' : 'Drop your PDF here'}
              </p>
              <p className="text-[#9CA3AF] text-sm mt-1">or click to browse</p>
            </div>
          </div>
          <p className="text-[11px] text-[#9CA3AF] pointer-events-none uppercase tracking-wide font-medium">
            Supports PDF files up to 100MB&nbsp;&middot;&nbsp;Files are processed securely and not stored
          </p>
        </label>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center w-full h-72 rounded-2xl border border-[#E5E7EB] bg-white gap-4">
          <div
            className="w-10 h-10 rounded-full"
            style={{ border: '2px solid #E5E7EB', borderTopColor: '#0A84FF', animation: 'spin 0.8s linear infinite' }}
          />
          <div className="text-center">
            <p className="font-bold text-[#0F1117] text-sm">{filename}</p>
            <p className="text-[#9CA3AF] text-sm mt-1">Quoflow AI is analysing your document…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-[#DC2626] text-sm">
          {error}
        </div>
      )}

      {/* How it works */}
      {!loading && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                </svg>
              ),
              title: 'Upload',
              desc: 'Drop your full PDF floor plan set',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              ),
              title: 'AI Analyses',
              desc: 'Quoflow AI reads every page and finds all doors and relevant specs',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              ),
              title: 'Review & Quote',
              desc: 'Check extracted doors, flag issues, build your quote',
            },
          ].map((s) => (
            <div key={s.title} className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <div className="text-[#0a0a0a] mb-3">{s.icon}</div>
              <p className="font-semibold text-[#0F1117] text-sm">{s.title}</p>
              <p className="text-[#9CA3AF] text-xs mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
