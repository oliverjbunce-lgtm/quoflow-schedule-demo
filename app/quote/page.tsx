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
    <div>
      <StepIndicator currentStep={3} />

      <div className="mb-6">
        <h1 className="page-title">Quote Builder</h1>
        <p className="page-subtitle">
          Fill in job details and global specifications, then review the door schedule.
        </p>
      </div>

      <div className="quote-layout">
        {/* Left column: forms */}
        <div className="quote-sidebar">
          <QuoteHeader data={headerData} onChange={setHeaderData} />
          <GlobalSpecsForm specs={globalSpecs} onChange={handleSpecsChange} />

          <div className="btn-row quote-sidebar-cta">
            <button onClick={() => router.push('/extract')} className="btn btn--ghost">
              ← Back
            </button>
            <button onClick={handlePreview} className="btn btn--gold">
              Preview Quote
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right column: door table */}
        <div className="quote-main">
          <div className="section-header">
            <h2 className="section-title">
              Door Schedule — {doors.length} door{doors.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <DoorTable doors={doors} onChange={setDoors} showAllSpecs />
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="btn-row quote-mobile-cta mt-6 pt-4 border-top">
        <button onClick={() => router.push('/extract')} className="btn btn--ghost">
          ← Back
        </button>
        <button onClick={handlePreview} className="btn btn--gold">
          Preview Quote
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
