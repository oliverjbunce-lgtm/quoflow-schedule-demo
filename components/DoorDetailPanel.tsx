'use client';

import { useEffect, useRef } from 'react';
import type { DoorRow } from '../types';

interface DoorDetailPanelProps {
  door: DoorRow | null;
  onClose: () => void;
  onChange: (door: DoorRow) => void;
  onDelete: (id: string) => void;
  totalDoors: number;
  currentIndex: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  doors: DoorRow[];
}

const HANGING_OPTIONS = ['LH', 'RH', 'Slider', 'Bi-Fold'];
const FRAME_OPTIONS = ['Standard', 'Cavity', 'Bifold', 'Wardrobe', 'Custom'];
const FINISH_OPTIONS = ['Primed', 'White', 'RAW', 'Custom'];
const CORE_OPTIONS = ['Poly', 'Solid', 'Honeycomb'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E9A620] focus:border-transparent w-full bg-white';

export default function DoorDetailPanel({
  door,
  onClose,
  onChange,
  onDelete,
  totalDoors,
  currentIndex,
  onNavigate,
  doors,
}: DoorDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isOpen = door !== null;

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  function update(field: keyof DoorRow, value: string | boolean) {
    if (!door) return;
    onChange({ ...door, [field]: value });
  }

  const prevDoor = currentIndex > 0 ? doors[currentIndex - 1] : null;
  const nextDoor = currentIndex < totalDoors - 1 ? doors[currentIndex + 1] : null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — desktop: right side fixed; mobile: bottom sheet */}
      <div
        ref={panelRef}
        className={`
          fixed z-50 bg-white transition-transform duration-200 ease-out
          /* Mobile: bottom sheet */
          bottom-0 left-0 right-0 rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto
          md:bottom-auto md:top-0 md:left-auto md:right-0 md:w-[380px] md:h-full md:rounded-none md:border-l md:border-slate-200 md:shadow-xl md:overflow-y-auto
          ${isOpen
            ? 'translate-y-0 md:translate-x-0'
            : 'translate-y-full md:translate-x-full'
          }
        `}
        aria-modal="true"
        role="dialog"
      >
        {door && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#1D3461] leading-none">
                  {door.mark || 'Unnamed Door'}
                </h2>
                {door.location && (
                  <p className="text-sm text-slate-500 mt-1">{door.location}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors ml-2 shrink-0"
                aria-label="Close panel"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            {totalDoors > 1 && (
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-100 shrink-0">
                <button
                  onClick={() => onNavigate('prev')}
                  disabled={!prevDoor}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    prevDoor
                      ? 'text-[#1D3461] hover:bg-[#f0f3fa]'
                      : 'text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {prevDoor ? prevDoor.mark || `Door ${currentIndex}` : 'First'}
                </button>
                <span className="text-xs text-slate-400 font-medium">
                  {currentIndex + 1} / {totalDoors}
                </span>
                <button
                  onClick={() => onNavigate('next')}
                  disabled={!nextDoor}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    nextDoor
                      ? 'text-[#1D3461] hover:bg-[#f0f3fa]'
                      : 'text-slate-300 cursor-not-allowed'
                  }`}
                >
                  {nextDoor ? nextDoor.mark || `Door ${currentIndex + 2}` : 'Last'}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}

            {/* Form body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Row 1: Width | Height */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Width (mm)">
                  <input
                    type="text"
                    value={door.width}
                    onChange={(e) => update('width', e.target.value)}
                    placeholder="e.g. 810"
                    className={inputCls}
                  />
                </Field>
                <Field label="Height (mm)">
                  <input
                    type="text"
                    value={door.height}
                    onChange={(e) => update('height', e.target.value)}
                    placeholder="e.g. 2040"
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Row 2: Hanging | Frame */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Hanging">
                  <select
                    value={door.hanging}
                    onChange={(e) => update('hanging', e.target.value)}
                    className={inputCls}
                  >
                    {HANGING_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                    {!HANGING_OPTIONS.includes(door.hanging) && door.hanging && (
                      <option value={door.hanging}>{door.hanging}</option>
                    )}
                  </select>
                </Field>
                <Field label="Frame Type">
                  <select
                    value={door.frameType}
                    onChange={(e) => update('frameType', e.target.value)}
                    className={inputCls}
                  >
                    {FRAME_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                    {!FRAME_OPTIONS.includes(door.frameType) && door.frameType && (
                      <option value={door.frameType}>{door.frameType}</option>
                    )}
                  </select>
                </Field>
              </div>

              {/* Row 3: Finish | Core */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Door Finish">
                  <select
                    value={door.doorFinish}
                    onChange={(e) => update('doorFinish', e.target.value)}
                    className={inputCls}
                  >
                    {FINISH_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                    {!FINISH_OPTIONS.includes(door.doorFinish) && door.doorFinish && (
                      <option value={door.doorFinish}>{door.doorFinish}</option>
                    )}
                  </select>
                </Field>
                <Field label="Door Core">
                  <select
                    value={door.doorCore}
                    onChange={(e) => update('doorCore', e.target.value)}
                    className={inputCls}
                  >
                    {CORE_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                    {!CORE_OPTIONS.includes(door.doorCore) && door.doorCore && (
                      <option value={door.doorCore}>{door.doorCore}</option>
                    )}
                  </select>
                </Field>
              </div>

              {/* Row 4: Hardware Code | Soft Close */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Hardware Code">
                  <input
                    type="text"
                    value={door.hardwareCode}
                    onChange={(e) => update('hardwareCode', e.target.value)}
                    placeholder="e.g. HW-001"
                    className={inputCls}
                  />
                </Field>
                <Field label="Soft Close">
                  <div className="flex items-center h-[38px]">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={door.softClose}
                        onChange={(e) => update('softClose', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#E9A620] rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-[#1D3461] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                      <span className="ml-2 text-sm font-medium text-slate-700">
                        {door.softClose ? 'Yes' : 'No'}
                      </span>
                    </label>
                  </div>
                </Field>
              </div>

              {/* Mark & Location editable in panel too */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Door Mark">
                  <input
                    type="text"
                    value={door.mark}
                    onChange={(e) => update('mark', e.target.value)}
                    placeholder="e.g. D1"
                    className={inputCls}
                  />
                </Field>
                <Field label="Location">
                  <input
                    type="text"
                    value={door.location}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="e.g. Bedroom 1"
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Row 5: Notes full width */}
              <Field label="Notes">
                <textarea
                  value={door.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  rows={3}
                  placeholder="Any special requirements or notes…"
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 shrink-0">
              <button
                onClick={() => {
                  onDelete(door.id);
                  onClose();
                }}
                className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 3h12M5 3V2h4v1M2 3l1 9h8l1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Delete door
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
