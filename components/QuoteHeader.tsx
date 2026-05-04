'use client';

import type { QuoteData } from '../types';

type QuoteHeaderFields = Pick<
  QuoteData,
  'jobName' | 'clientName' | 'siteAddress' | 'orderNumber' | 'requiredBy' | 'deliveryType'
>;

interface QuoteHeaderProps {
  data: QuoteHeaderFields;
  onChange: (data: QuoteHeaderFields) => void;
}

export default function QuoteHeader({ data, onChange }: QuoteHeaderProps) {
  function update<K extends keyof QuoteHeaderFields>(key: K, value: QuoteHeaderFields[K]) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-[#1D3461] uppercase tracking-wider mb-4">
        Job Details
      </h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Job Name *</label>
          <input
            type="text"
            value={data.jobName}
            onChange={(e) => update('jobName', e.target.value)}
            placeholder="e.g. Smith Residence — Lot 12"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9A620] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Client Name</label>
          <input
            type="text"
            value={data.clientName}
            onChange={(e) => update('clientName', e.target.value)}
            placeholder="e.g. John Smith"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9A620] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Site Address</label>
          <input
            type="text"
            value={data.siteAddress}
            onChange={(e) => update('siteAddress', e.target.value)}
            placeholder="e.g. 12 Example Street, Auckland"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9A620] focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Order Number</label>
            <input
              type="text"
              value={data.orderNumber}
              onChange={(e) => update('orderNumber', e.target.value)}
              placeholder="e.g. QF-2024-001"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9A620] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Required By</label>
            <input
              type="date"
              value={data.requiredBy}
              onChange={(e) => update('requiredBy', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9A620] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Delivery Type</label>
          <div className="flex gap-3">
            {(['Delivery', 'Collection'] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="deliveryType"
                  value={type}
                  checked={data.deliveryType === type}
                  onChange={() => update('deliveryType', type)}
                  className="accent-[#E9A620]"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
