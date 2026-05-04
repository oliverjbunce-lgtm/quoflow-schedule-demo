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
    <div className="card">
      <h3 className="card-title">Job Details</h3>
      <div className="form-stack">
        <div className="form-field">
          <label className="form-label">Job Name *</label>
          <input
            type="text"
            value={data.jobName}
            onChange={(e) => update('jobName', e.target.value)}
            placeholder="e.g. Smith Residence — Lot 12"
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Client Name</label>
          <input
            type="text"
            value={data.clientName}
            onChange={(e) => update('clientName', e.target.value)}
            placeholder="e.g. John Smith"
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Site Address</label>
          <input
            type="text"
            value={data.siteAddress}
            onChange={(e) => update('siteAddress', e.target.value)}
            placeholder="e.g. 12 Example Street, Auckland"
            className="form-input"
          />
        </div>

        <div className="form-grid-2">
          <div className="form-field">
            <label className="form-label">Order Number</label>
            <input
              type="text"
              value={data.orderNumber}
              onChange={(e) => update('orderNumber', e.target.value)}
              placeholder="e.g. QF-2024-001"
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Required By</label>
            <input
              type="date"
              value={data.requiredBy}
              onChange={(e) => update('requiredBy', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Delivery Type</label>
          <div className="form-radio-group">
            {(['Delivery', 'Collection'] as const).map((type) => (
              <label key={type} className="form-radio-label">
                <input
                  type="radio"
                  name="deliveryType"
                  value={type}
                  checked={data.deliveryType === type}
                  onChange={() => update('deliveryType', type)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
