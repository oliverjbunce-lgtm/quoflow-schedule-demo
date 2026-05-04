'use client';

import type { QuoteData } from '../types';

interface QuotePrintViewProps {
  data: QuoteData;
}

export default function QuotePrintView({ data }: QuotePrintViewProps) {
  const today = new Date().toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="print-container bg-white rounded-xl border border-[#E5E7EB] p-8 max-w-5xl mx-auto" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {/* Document Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            {/* Logo mark — blue squares */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="10" height="10" x="1" y="1" rx="2" fill="#0A84FF" />
              <rect width="10" height="10" x="13" y="1" rx="2" fill="#0A84FF" fillOpacity="0.5" />
              <rect width="10" height="10" x="1" y="13" rx="2" fill="#0A84FF" fillOpacity="0.5" />
              <rect width="10" height="10" x="13" y="13" rx="2" fill="#0A84FF" fillOpacity="0.2" />
            </svg>
            <span className="text-[#0F1117] font-bold text-xl tracking-tight">
              Quo<span style={{ color: '#0A84FF' }}>flow</span>
            </span>
          </div>
          <p className="text-[#6B7280] text-sm">Door Schedule Quote</p>
        </div>
        <div className="text-right text-sm text-[#6B7280] space-y-1">
          <p className="font-semibold text-[#0F1117]">{today}</p>
          {data.orderNumber && (
            <p className="text-[#9CA3AF]">Order: <span className="font-medium text-[#6B7280]">{data.orderNumber}</span></p>
          )}
        </div>
      </div>

      {/* Job Details + Global Specs */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest mb-3">Job Details</h2>
          <div className="space-y-2 text-sm">
            {data.jobName && (
              <div className="flex gap-2">
                <span className="text-[#9CA3AF] w-24 shrink-0">Job Name</span>
                <span className="font-medium text-[#0F1117]">{data.jobName}</span>
              </div>
            )}
            {data.clientName && (
              <div className="flex gap-2">
                <span className="text-[#9CA3AF] w-24 shrink-0">Client</span>
                <span className="font-medium text-[#0F1117]">{data.clientName}</span>
              </div>
            )}
            {data.siteAddress && (
              <div className="flex gap-2">
                <span className="text-[#9CA3AF] w-24 shrink-0">Site Address</span>
                <span className="font-medium text-[#0F1117]">{data.siteAddress}</span>
              </div>
            )}
            {data.requiredBy && (
              <div className="flex gap-2">
                <span className="text-[#9CA3AF] w-24 shrink-0">Required By</span>
                <span className="font-medium text-[#0F1117]">{data.requiredBy}</span>
              </div>
            )}
            <div className="flex gap-2">
              <span className="text-[#9CA3AF] w-24 shrink-0">Delivery</span>
              <span className="font-medium text-[#0F1117]">{data.deliveryType}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest mb-3">Global Specifications</h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-[#9CA3AF] w-28 shrink-0">Jamb Style</span>
              <span className="font-medium text-[#0F1117]">{data.globalSpecs.jambStyle}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#9CA3AF] w-28 shrink-0">Jamb Material</span>
              <span className="font-medium text-[#0F1117]">{data.globalSpecs.jambMaterial}</span>
            </div>
            {data.globalSpecs.hardwareBrand && (
              <div className="flex gap-2">
                <span className="text-[#9CA3AF] w-28 shrink-0">Hardware Brand</span>
                <span className="font-medium text-[#0F1117]">{data.globalSpecs.hardwareBrand}</span>
              </div>
            )}
            {data.globalSpecs.hingeDetails && (
              <div className="flex gap-2">
                <span className="text-[#9CA3AF] w-28 shrink-0">Hinges</span>
                <span className="font-medium text-[#0F1117]">{data.globalSpecs.hingeDetails}</span>
              </div>
            )}
            <div className="flex gap-2">
              <span className="text-[#9CA3AF] w-28 shrink-0">Handle Height</span>
              <span className="font-medium text-[#0F1117]">{data.globalSpecs.handleHeight || '1000'}mm</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#9CA3AF] w-28 shrink-0">Drilling</span>
              <span className="font-medium text-[#0F1117]">{data.globalSpecs.drillingRequired ? 'Required' : 'Not Required'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Door Schedule Table */}
      <div>
        <h2 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest mb-3">
          Door Schedule — {data.doors.length} door{data.doors.length !== 1 ? 's' : ''}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#F5F5F7] border-b border-[#E5E7EB]">
                <th className="px-3 py-2.5 text-left text-[#6B7280] text-xs font-semibold uppercase tracking-wide">Mark</th>
                <th className="px-3 py-2.5 text-left text-[#6B7280] text-xs font-semibold uppercase tracking-wide">Location</th>
                <th className="px-3 py-2.5 text-left text-[#6B7280] text-xs font-semibold uppercase tracking-wide">Width</th>
                <th className="px-3 py-2.5 text-left text-[#6B7280] text-xs font-semibold uppercase tracking-wide">Height</th>
                <th className="px-3 py-2.5 text-left text-[#6B7280] text-xs font-semibold uppercase tracking-wide">Thick</th>
                <th className="px-3 py-2.5 text-left text-[#6B7280] text-xs font-semibold uppercase tracking-wide">Hanging</th>
                <th className="px-3 py-2.5 text-left text-[#6B7280] text-xs font-semibold uppercase tracking-wide">Frame</th>
                <th className="px-3 py-2.5 text-left text-[#6B7280] text-xs font-semibold uppercase tracking-wide">Finish</th>
                <th className="px-3 py-2.5 text-left text-[#6B7280] text-xs font-semibold uppercase tracking-wide">Core</th>
                <th className="px-3 py-2.5 text-center text-[#6B7280] text-xs font-semibold uppercase tracking-wide">SC</th>
                <th className="px-3 py-2.5 text-left text-[#6B7280] text-xs font-semibold uppercase tracking-wide">Hardware</th>
                <th className="px-3 py-2.5 text-left text-[#6B7280] text-xs font-semibold uppercase tracking-wide">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {data.doors.map((door, idx) => (
                <tr
                  key={door.id}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}
                >
                  <td className="px-3 py-2.5 font-semibold text-[#0a0a0a]">{door.mark}</td>
                  <td className="px-3 py-2.5 text-[#0F1117]">{door.location}</td>
                  <td className="px-3 py-2.5 text-[#0F1117]">{door.width}</td>
                  <td className="px-3 py-2.5 text-[#0F1117]">{door.height}</td>
                  <td className="px-3 py-2.5 text-[#0F1117]">{door.thickness}</td>
                  <td className="px-3 py-2.5 text-[#0F1117]">{door.hanging}</td>
                  <td className="px-3 py-2.5 text-[#0F1117]">{door.frameType}</td>
                  <td className="px-3 py-2.5 text-[#0F1117]">{door.doorFinish}</td>
                  <td className="px-3 py-2.5 text-[#0F1117]">{door.doorCore}</td>
                  <td className="px-3 py-2.5 text-center text-[#0F1117]">{door.softClose ? '✓' : '—'}</td>
                  <td className="px-3 py-2.5 text-[#0F1117]">{door.hardwareCode}</td>
                  <td className="px-3 py-2.5 text-[#6B7280] text-xs">{door.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#9CA3AF]">
        <span>Generated by Quoflow</span>
        <span>{today}</span>
      </div>
    </div>
  );
}
