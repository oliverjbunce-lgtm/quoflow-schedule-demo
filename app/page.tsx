'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PageThumb {
  pageNum: number;
  dataUrl: string; // base64 PNG
}

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renderPDF = useCallback(async (f: File) => {
    setLoading(true);
    setError(null);
    setPages([]);
    setSelectedPages(new Set());

    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      // Use CDN worker to avoid bundling issues
      GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

      const arrayBuffer = await f.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const thumbs: PageThumb[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        thumbs.push({ pageNum: i, dataUrl: canvas.toDataURL('image/png') });
      }

      setPages(thumbs);
    } catch (err) {
      setError('Failed to render PDF. Please ensure it is a valid PDF file.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleFile(f: File) {
    if (!f.type.includes('pdf') && !f.name.endsWith('.pdf')) {
      setError('Please upload a PDF file.');
      return;
    }
    setFile(f);
    renderPDF(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function togglePage(pageNum: number) {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  }

  function handleExtract() {
    const selected = pages
      .filter((p) => selectedPages.has(p.pageNum))
      .map((p) => p.dataUrl.replace(/^data:image\/png;base64,/, ''));

    sessionStorage.setItem('qf_pages', JSON.stringify(selected));
    router.push('/extract');
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1D3461] mb-2">Door Schedule Extraction</h1>
        <p className="text-gray-500 text-sm">
          Upload a floor plan PDF to extract and quote the door schedule using AI.
        </p>
      </div>

      {/* Drop Zone */}
      {!file && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
            isDragging
              ? 'border-[#E9A620] bg-[#fef9ec]'
              : 'border-[#1D3461] bg-white hover:border-[#E9A620] hover:bg-[#fef9ec]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="flex flex-col items-center gap-3 pointer-events-none">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-[#E9A620]' : 'bg-[#f0f3f9]'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={isDragging ? 'text-white' : 'text-[#1D3461]'}>
                <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-[#1D3461]">
                {isDragging ? 'Drop PDF here' : 'Drag & drop your floor plan'}
              </p>
              <p className="text-sm text-gray-400 mt-1">or click to browse — PDF files only</p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#1D3461] border-t-[#E9A620] rounded-full animate-spin border-[3px]" />
          <p className="text-sm text-gray-500">Rendering PDF pages…</p>
        </div>
      )}

      {/* File info + page grid */}
      {file && pages.length > 0 && (
        <div className="space-y-6">
          {/* File info bar */}
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M14 2v6h6" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-400">{pages.length} page{pages.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setPages([]); setSelectedPages(new Set()); setError(null); }}
              className="text-xs text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Remove
            </button>
          </div>

          {/* Page selection instructions */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">Select the pages</span> that contain the door schedule table.
            {selectedPages.size > 0 && (
              <span className="ml-2 text-[#E9A620] font-semibold">
                {selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          {/* Page thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pages.map((page) => {
              const isSelected = selectedPages.has(page.pageNum);
              return (
                <div
                  key={page.pageNum}
                  onClick={() => togglePage(page.pageNum)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'border-[#E9A620] shadow-[0_0_0_3px_rgba(233,166,32,0.2)]'
                      : 'border-gray-200 hover:border-[#E9A620]'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.pageNum}`}
                    className="w-full object-cover"
                  />
                  <div className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#E9A620] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                    Page {page.pageNum}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#E9A620] rounded-full flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleExtract}
              disabled={selectedPages.size === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                selectedPages.size === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#1D3461] text-white hover:bg-[#243d75] shadow-sm hover:shadow-md'
              }`}
            >
              Extract Schedule
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {selectedPages.size === 0 && (
              <p className="text-xs text-gray-400">Select at least 1 page to continue</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
