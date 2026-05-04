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

const inputCls = 'w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white text-[#0F1117] focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/30 focus:border-[#0A84FF]';
const labelCls = 'block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1';

export default function QuoteHeader({ data, onChange }: QuoteHeaderProps) {
  function update<K extends keyof QuoteHeaderFields>(key: K, value: QuoteHeaderFields[K]) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-4">
        Job Details
      </h3>
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Job Name</label>
          <input
            type="text"
            value={data.jobName}
            onChange={(e) => update('jobName', e.target.value)}
            placeholder="e.g. Smith Residence — Lot 12"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Client Name</label>
          <input
            type="text"
            value={data.clientName}
            onChange={(e) => update('clientName', e.target.value)}
            placeholder="e.g. John Smith"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Site Address</label>
          <input
            type="text"
            value={data.siteAddress}
            onChange={(e) => update('siteAddress', e.target.value)}
            placeholder="e.g. 12 Example Street, Auckland"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Order Number</label>
            <input
              type="text"
              value={data.orderNumber}
              onChange={(e) => update('orderNumber', e.target.value)}
              placeholder="e.g. QF-2024-001"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Required By</label>
            <input
              type="date"
              value={data.requiredBy}
              onChange={(e) => update('requiredBy', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Delivery Type</label>
          <div className="flex gap-4 mt-1.5">
            {(['Delivery', 'Collection'] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="deliveryType"
                  value={type}
                  checked={data.deliveryType === type}
                  onChange={() => update('deliveryType', type)}
                  className="accent-[#0A84FF]"
                />
                <span className="text-sm text-[#0F1117]">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
