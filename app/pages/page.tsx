'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from '../../components/StepIndicator';

interface Thumbnail {
  page: number;
  url: string;
}

export default function PagesPage() {
  const router = useRouter();
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [suggestedPage, setSuggestedPage] = useState(1);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [manualPage, setManualPage] = useState('');

  useEffect(() => {
    const fileUri = sessionStorage.getItem('qf_file_uri');
    if (!fileUri) { router.replace('/'); return; }

    const raw = sessionStorage.getItem('hf_thumbnails');
    const thumbs: Thumbnail[] = raw ? JSON.parse(raw) : [];
    const suggested = parseInt(sessionStorage.getItem('hf_suggested_page') || '1');
    setThumbnails(thumbs);
    setSuggestedPage(suggested);
    setSelectedPage(suggested); // pre-select suggested page
  }, [router]);

  function handleContinue() {
    const page = selectedPage ?? parseInt(manualPage) ?? 1;
    sessionStorage.setItem('hf_selected_page', String(page));
    router.push('/extract');
  }

  const hasThumbnails = thumbnails.length > 0;

  return (
    <div className="max-w-5xl mx-auto">
      <StepIndicator currentStep={2} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">Select the floor plan page</h1>
        <p className="text-[#6B7280] text-sm">
          Choose the page that contains the floor plan. Quoflow Vision will scan it for door locations.
        </p>
      </div>

      {hasThumbnails ? (
        <>
          {/* Thumbnail grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {thumbnails.map((thumb) => {
              const isSelected = selectedPage === thumb.page;
              const isSuggested = suggestedPage === thumb.page;
              return (
                <button
                  key={thumb.page}
                  onClick={() => setSelectedPage(thumb.page)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all text-left focus:outline-none ${
                    isSelected
                      ? 'border-[#0A84FF] shadow-lg shadow-[#0A84FF]/20 ring-4 ring-[#0A84FF]/10'
                      : 'border-[#E5E7EB] hover:border-[#0A84FF]/40'
                  }`}
                >
                  {/* Page thumbnail image */}
                  <div className="aspect-[3/4] bg-[#F5F5F7] relative flex items-center justify-center">
                    <img
                      src={thumb.url}
                      alt={`Page ${thumb.page}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Show page number fallback
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.thumb-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'thumb-fallback flex flex-col items-center justify-center w-full h-full text-[#9CA3AF]';
                          fallback.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M10 11h12M10 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg><span style="font-size:11px;margin-top:8px">Page ${thumb.page}</span>`;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                    {/* Selected overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#0A84FF]/10 flex items-center justify-center">
                        <div className="bg-[#0A84FF] rounded-full p-1.5">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8l4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Page label */}
                  <div className={`px-3 py-2 flex items-center justify-between ${isSelected ? 'bg-[#0A84FF]' : 'bg-white'}`}>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-[#0a0a0a]'}`}>
                      Page {thumb.page}
                    </span>
                    {isSuggested && !isSelected && (
                      <span className="text-[10px] font-medium text-[#0A84FF] bg-[#0A84FF]/10 px-1.5 py-0.5 rounded-full">
                        Suggested
                      </span>
                    )}
                    {isSuggested && isSelected && (
                      <span className="text-[10px] font-medium text-white/80">
                        Suggested
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        /* Fallback: no thumbnails — show manual page number input */
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 mb-8 text-center">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto mb-4">
            <rect width="40" height="40" rx="10" fill="#F5F5F7"/>
            <path d="M13 12h14a2 2 0 012 2v12a2 2 0 01-2 2H13a2 2 0 01-2-2V14a2 2 0 012-2z" stroke="#6B7280" strokeWidth="1.5"/>
            <path d="M15 17h10M15 21h6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-[#0a0a0a] font-medium mb-1">Thumbnails unavailable</p>
          <p className="text-[#6B7280] text-sm mb-6">Enter the page number that contains your floor plan</p>
          <div className="flex items-center justify-center gap-3">
            <label className="text-sm font-medium text-[#6B7280]">Floor plan page:</label>
            <input
              type="number"
              min="1"
              value={manualPage}
              onChange={(e) => {
                setManualPage(e.target.value);
                setSelectedPage(parseInt(e.target.value) || null);
              }}
              placeholder="e.g. 2"
              className="w-24 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/30 focus:border-[#0A84FF]"
            />
          </div>
        </div>
      )}

      {/* Skip option */}
      <p className="text-xs text-[#9CA3AF] text-center mb-6">
        Don&apos;t need floor plan scanning?{' '}
        <button
          onClick={() => {
            sessionStorage.setItem('hf_selected_page', '');
            router.push('/extract');
          }}
          className="text-[#0A84FF] hover:underline"
        >
          Skip this step
        </button>
      </p>

      {/* CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
        <button
          onClick={() => router.push('/')}
          className="text-sm font-medium text-[#6B7280] hover:text-[#0a0a0a] transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedPage && !manualPage}
          className="flex items-center gap-2 bg-[#0A84FF] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#0066CC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Analyse floor plan
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
