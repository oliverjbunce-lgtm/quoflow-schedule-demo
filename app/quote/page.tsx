'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from '../../components/StepIndicator';
import DoorTable from '../../components/DoorTable';
import GlobalSpecsForm from '../../components/GlobalSpecsForm';
import QuoteHeader from '../../components/QuoteHeader';
import type { DoorRow, GlobalSpecs, QuoteData } from '../../types';

const DEFAULT_GLOBAL_SPECS: GlobalSpecs = {
  hingeDetails: '',
  jambStyle: 'Flat',
  jambMaterial: 'MDF',
  drillingRequired: false,
  hardwareBrand: '',
  handleHeight: '1000',
};

function loadSavedSpecs(): GlobalSpecs {
  if (typeof window === 'undefined') return DEFAULT_GLOBAL_SPECS;
  try {
    const saved = localStorage.getItem('qf_globalSpecs');
    if (saved) return { ...DEFAULT_GLOBAL_SPECS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_GLOBAL_SPECS;
}

export default function QuotePage() {
  const router = useRouter();

  const [doors, setDoors] = useState<DoorRow[]>([]);
  const [globalSpecs, setGlobalSpecs] = useState<GlobalSpecs>(DEFAULT_GLOBAL_SPECS);
  const [headerData, setHeaderData] = useState<Omit<QuoteData, 'globalSpecs' | 'doors'>>({
    jobName: '',
    clientName: '',
    siteAddress: '',
    orderNumber: '',
    requiredBy: '',
    deliveryType: 'Delivery',
  });

  useEffect(() => {
    const rawDoors = sessionStorage.getItem('qf_doors');
    if (!rawDoors) {
      router.replace('/');
      return;
    }
    setDoors(JSON.parse(rawDoors));
    setGlobalSpecs(loadSavedSpecs());
  }, [router]);

  function handleSpecsChange(specs: GlobalSpecs) {
    setGlobalSpecs(specs);
    localStorage.setItem('qf_globalSpecs', JSON.stringify(specs));
  }

  function handlePreview() {
    const quoteData: QuoteData = {
      ...headerData,
      globalSpecs,
      doors,
    };
    sessionStorage.setItem('qf_quote', JSON.stringify(quoteData));
    router.push('/preview');
  }

  return (
    <div className="max-w-7xl mx-auto">
      <StepIndicator currentStep={3} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1D3461] mb-2">Quote Builder</h1>
        <p className="text-gray-500 text-sm">
          Fill in job details and global specifications, then review the door schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: forms */}
        <div className="lg:col-span-1 space-y-4">
          <QuoteHeader data={headerData} onChange={setHeaderData} />
          <GlobalSpecsForm specs={globalSpecs} onChange={handleSpecsChange} />

          <div className="hidden lg:flex items-center gap-4 pt-2">
            <button
              onClick={() => router.push('/extract')}
              className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-6 py-3 bg-[#E9A620] text-white rounded-xl font-semibold text-sm hover:bg-[#d4941c] transition-all shadow-sm hover:shadow-md"
            >
              Preview Quote
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right column: door table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1D3461] uppercase tracking-wider">
              Door Schedule — {doors.length} door{doors.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <DoorTable doors={doors} onChange={setDoors} showAllSpecs />
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="lg:hidden flex items-center gap-4 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => router.push('/extract')}
          className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handlePreview}
          className="flex items-center gap-2 px-6 py-3 bg-[#E9A620] text-white rounded-xl font-semibold text-sm hover:bg-[#d4941c] transition-all shadow-sm hover:shadow-md"
        >
          Preview Quote
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
