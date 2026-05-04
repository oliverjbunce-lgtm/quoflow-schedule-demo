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
    <div className="print-container bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="12" height="12" x="2" y="2" rx="2" fill="#E9A620" />
              <rect width="12" height="12" x="14" y="2" rx="2" fill="#E9A620" opacity="0.6" />
              <rect width="12" height="12" x="2" y="14" rx="2" fill="#E9A620" opacity="0.6" />
              <rect width="12" height="12" x="14" y="14" rx="2" fill="#E9A620" opacity="0.3" />
            </svg>
            <span className="text-[#1D3461] font-bold text-2xl tracking-tight">
              Quo<span className="text-[#E9A620]">flow</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm">Door Schedule Quote</p>
        </div>
        <div className="text-right text-sm text-gray-600 space-y-1">
          <p className="font-semibold text-gray-800">{today}</p>
          {data.orderNumber && (
            <p className="text-gray-500">Order: <span className="font-medium text-gray-700">{data.orderNumber}</span></p>
          )}
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xs font-semibold text-[#1D3461] uppercase tracking-wider mb-3">Job Details</h2>
          <div className="space-y-2 text-sm">
            {data.jobName && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-24 shrink-0">Job Name</span>
                <span className="font-medium text-gray-800">{data.jobName}</span>
              </div>
            )}
            {data.clientName && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-24 shrink-0">Client</span>
                <span className="font-medium text-gray-800">{data.clientName}</span>
              </div>
            )}
            {data.siteAddress && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-24 shrink-0">Site Address</span>
                <span className="font-medium text-gray-800">{data.siteAddress}</span>
              </div>
            )}
            {data.requiredBy && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-24 shrink-0">Required By</span>
                <span className="font-medium text-gray-800">{data.requiredBy}</span>
              </div>
            )}
            <div className="flex gap-2">
              <span className="text-gray-500 w-24 shrink-0">Delivery</span>
              <span className="font-medium text-gray-800">{data.deliveryType}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-[#1D3461] uppercase tracking-wider mb-3">Global Specifications</h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-gray-500 w-28 shrink-0">Jamb Style</span>
              <span className="font-medium text-gray-800">{data.globalSpecs.jambStyle}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500 w-28 shrink-0">Jamb Material</span>
              <span className="font-medium text-gray-800">{data.globalSpecs.jambMaterial}</span>
            </div>
            {data.globalSpecs.hardwareBrand && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-28 shrink-0">Hardware Brand</span>
                <span className="font-medium text-gray-800">{data.globalSpecs.hardwareBrand}</span>
              </div>
            )}
            {data.globalSpecs.hingeDetails && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-28 shrink-0">Hinges</span>
                <span className="font-medium text-gray-800">{data.globalSpecs.hingeDetails}</span>
              </div>
            )}
            <div className="flex gap-2">
              <span className="text-gray-500 w-28 shrink-0">Handle Height</span>
              <span className="font-medium text-gray-800">{data.globalSpecs.handleHeight || '1000'}mm</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500 w-28 shrink-0">Drilling</span>
              <span className="font-medium text-gray-800">{data.globalSpecs.drillingRequired ? 'Required' : 'Not Required'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Door Schedule Table */}
      <div>
        <h2 className="text-xs font-semibold text-[#1D3461] uppercase tracking-wider mb-3">
          Door Schedule — {data.doors.length} door{data.doors.length !== 1 ? 's' : ''}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#1D3461] text-white text-xs">
                <th className="px-3 py-2.5 text-left font-semibold">Mark</th>
                <th className="px-3 py-2.5 text-left font-semibold">Location</th>
                <th className="px-3 py-2.5 text-left font-semibold">Width</th>
                <th className="px-3 py-2.5 text-left font-semibold">Height</th>
                <th className="px-3 py-2.5 text-left font-semibold">Thick</th>
                <th className="px-3 py-2.5 text-left font-semibold">Hanging</th>
                <th className="px-3 py-2.5 text-left font-semibold">Frame</th>
                <th className="px-3 py-2.5 text-left font-semibold">Finish</th>
                <th className="px-3 py-2.5 text-left font-semibold">Core</th>
                <th className="px-3 py-2.5 text-center font-semibold">SC</th>
                <th className="px-3 py-2.5 text-left font-semibold">Hardware</th>
                <th className="px-3 py-2.5 text-left font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.doors.map((door, idx) => (
                <tr
                  key={door.id}
                  className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafbfd]'}`}
                >
                  <td className="px-3 py-2.5 font-semibold text-[#1D3461]">{door.mark}</td>
                  <td className="px-3 py-2.5 text-gray-700">{door.location}</td>
                  <td className="px-3 py-2.5 text-gray-700">{door.width}</td>
                  <td className="px-3 py-2.5 text-gray-700">{door.height}</td>
                  <td className="px-3 py-2.5 text-gray-700">{door.thickness}</td>
                  <td className="px-3 py-2.5 text-gray-700">{door.hanging}</td>
                  <td className="px-3 py-2.5 text-gray-700">{door.frameType}</td>
                  <td className="px-3 py-2.5 text-gray-700">{door.doorFinish}</td>
                  <td className="px-3 py-2.5 text-gray-700">{door.doorCore}</td>
                  <td className="px-3 py-2.5 text-center">{door.softClose ? '✓' : '—'}</td>
                  <td className="px-3 py-2.5 text-gray-700">{door.hardwareCode}</td>
                  <td className="px-3 py-2.5 text-gray-600 text-xs">{door.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
        <span>Generated by Quoflow Schedule Demo</span>
        <span>{today}</span>
      </div>
    </div>
  );
}
