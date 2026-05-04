'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PageThumb {
  pageNum: number;
  dataUrl: string;
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
    <div className="page-container">
      {/* Hero */}
      <div className="page-hero">
        <h1 className="page-title">Door Schedule Extraction</h1>
        <p className="page-subtitle">
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
          className={`drop-zone${isDragging ? ' drop-zone--dragging' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="drop-zone-inner">
            <div className="drop-zone-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="drop-zone-text">
              <p className="drop-zone-title">
                {isDragging ? 'Drop PDF here' : 'Drag & drop your floor plan'}
              </p>
              <p className="drop-zone-hint">or click to browse — PDF files only</p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert--error">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="spinner-wrap">
          <div className="spinner spinner--sm" />
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Rendering PDF pages…</p>
        </div>
      )}

      {/* File info + page grid */}
      {file && pages.length > 0 && (
        <div className="stack-6">
          {/* File info bar */}
          <div className="file-bar">
            <div className="file-bar-info">
              <div className="file-bar-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M14 2v6h6" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="file-bar-name">{file.name}</p>
                <p className="file-bar-meta">{pages.length} page{pages.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setPages([]); setSelectedPages(new Set()); setError(null); }}
              className="file-bar-remove"
            >
              Remove
            </button>
          </div>

          {/* Page selection instructions */}
          <p className="selection-hint">
            <strong>Select the pages</strong> that contain the door schedule table.
            {selectedPages.size > 0 && (
              <span className="selection-count">
                {selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </p>

          {/* Page thumbnails */}
          <div className="page-grid">
            {pages.map((page) => {
              const isSelected = selectedPages.has(page.pageNum);
              return (
                <div
                  key={page.pageNum}
                  onClick={() => togglePage(page.pageNum)}
                  className={`page-thumb${isSelected ? ' page-thumb--selected' : ''}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={page.dataUrl} alt={`Page ${page.pageNum}`} />
                  <div className={`page-thumb-badge ${isSelected ? 'page-thumb-badge--selected' : 'page-thumb-badge--default'}`}>
                    Page {page.pageNum}
                  </div>
                  {isSelected && (
                    <div className="page-thumb-check">
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
          <div className="btn-row">
            <button
              onClick={handleExtract}
              disabled={selectedPages.size === 0}
              className={`btn ${selectedPages.size === 0 ? 'btn--disabled' : 'btn--navy'}`}
            >
              Extract Schedule
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {selectedPages.size === 0 && (
              <p className="btn-hint">Select at least 1 page to continue</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
