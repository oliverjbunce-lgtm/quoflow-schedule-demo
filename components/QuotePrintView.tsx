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
    <div className="print-container">
      {/* Header */}
      <div className="print-header">
        <div>
          <div className="print-logo">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="12" height="12" x="2" y="2" rx="2" fill="#E9A620" />
              <rect width="12" height="12" x="14" y="2" rx="2" fill="#E9A620" opacity="0.6" />
              <rect width="12" height="12" x="2" y="14" rx="2" fill="#E9A620" opacity="0.6" />
              <rect width="12" height="12" x="14" y="14" rx="2" fill="#E9A620" opacity="0.3" />
            </svg>
            <span className="print-logo-text">
              Quo<span className="gold">flow</span>
            </span>
          </div>
          <p className="print-doc-label">Door Schedule Quote</p>
        </div>
        <div className="print-meta">
          <span className="print-meta-date">{today}</span>
          {data.orderNumber && (
            <p className="print-meta-order">
              Order: <span>{data.orderNumber}</span>
            </p>
          )}
        </div>
      </div>

      {/* Job Details + Global Specs */}
      <div className="print-details-grid">
        <div>
          <h2 className="print-section-title">Job Details</h2>
          <div className="print-detail-list">
            {data.jobName && (
              <div className="print-detail-row">
                <span className="print-detail-label">Job Name</span>
                <span className="print-detail-value">{data.jobName}</span>
              </div>
            )}
            {data.clientName && (
              <div className="print-detail-row">
                <span className="print-detail-label">Client</span>
                <span className="print-detail-value">{data.clientName}</span>
              </div>
            )}
            {data.siteAddress && (
              <div className="print-detail-row">
                <span className="print-detail-label">Site Address</span>
                <span className="print-detail-value">{data.siteAddress}</span>
              </div>
            )}
            {data.requiredBy && (
              <div className="print-detail-row">
                <span className="print-detail-label">Required By</span>
                <span className="print-detail-value">{data.requiredBy}</span>
              </div>
            )}
            <div className="print-detail-row">
              <span className="print-detail-label">Delivery</span>
              <span className="print-detail-value">{data.deliveryType}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="print-section-title">Global Specifications</h2>
          <div className="print-detail-list">
            <div className="print-detail-row">
              <span className="print-detail-label print-detail-label--wide">Jamb Style</span>
              <span className="print-detail-value">{data.globalSpecs.jambStyle}</span>
            </div>
            <div className="print-detail-row">
              <span className="print-detail-label print-detail-label--wide">Jamb Material</span>
              <span className="print-detail-value">{data.globalSpecs.jambMaterial}</span>
            </div>
            {data.globalSpecs.hardwareBrand && (
              <div className="print-detail-row">
                <span className="print-detail-label print-detail-label--wide">Hardware Brand</span>
                <span className="print-detail-value">{data.globalSpecs.hardwareBrand}</span>
              </div>
            )}
            {data.globalSpecs.hingeDetails && (
              <div className="print-detail-row">
                <span className="print-detail-label print-detail-label--wide">Hinges</span>
                <span className="print-detail-value">{data.globalSpecs.hingeDetails}</span>
              </div>
            )}
            <div className="print-detail-row">
              <span className="print-detail-label print-detail-label--wide">Handle Height</span>
              <span className="print-detail-value">{data.globalSpecs.handleHeight || '1000'}mm</span>
            </div>
            <div className="print-detail-row">
              <span className="print-detail-label print-detail-label--wide">Drilling</span>
              <span className="print-detail-value">
                {data.globalSpecs.drillingRequired ? 'Required' : 'Not Required'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Door Schedule Table */}
      <div>
        <h2 className="print-section-title">
          Door Schedule — {data.doors.length} door{data.doors.length !== 1 ? 's' : ''}
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="print-table">
            <thead>
              <tr>
                <th>Mark</th>
                <th>Location</th>
                <th>Width</th>
                <th>Height</th>
                <th>Thick</th>
                <th>Hanging</th>
                <th>Frame</th>
                <th>Finish</th>
                <th>Core</th>
                <th className="th-center">SC</th>
                <th>Hardware</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.doors.map((door) => (
                <tr key={door.id}>
                  <td className="td-mark">{door.mark}</td>
                  <td className="td-body">{door.location}</td>
                  <td className="td-body">{door.width}</td>
                  <td className="td-body">{door.height}</td>
                  <td className="td-body">{door.thickness}</td>
                  <td className="td-body">{door.hanging}</td>
                  <td className="td-body">{door.frameType}</td>
                  <td className="td-body">{door.doorFinish}</td>
                  <td className="td-body">{door.doorCore}</td>
                  <td className="td-center">{door.softClose ? '✓' : '—'}</td>
                  <td className="td-body">{door.hardwareCode}</td>
                  <td className="td-notes">{door.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="print-footer">
        <span>Generated by Quoflow Schedule Demo</span>
        <span>{today}</span>
      </div>
    </div>
  );
}
