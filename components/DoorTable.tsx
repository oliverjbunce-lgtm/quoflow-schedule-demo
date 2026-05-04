'use client';

import { v4 as uuidv4 } from 'uuid';
import type { DoorRow } from '../types';

interface DoorTableProps {
  doors: DoorRow[];
  onChange: (doors: DoorRow[]) => void;
  showAllSpecs?: boolean;
}

const HANGING_OPTIONS = ['LH', 'RH', 'Slider', 'Bi-Fold'];
const FRAME_OPTIONS = ['Standard', 'Cavity', 'Bifold', 'Wardrobe', 'Custom'];
const FINISH_OPTIONS = ['Primed', 'White', 'RAW', 'Custom'];
const CORE_OPTIONS = ['Poly', 'Solid', 'Honeycomb'];

function EditableCell({
  value,
  onChange,
  type = 'text',
  options,
  className = '',
  placeholder = '',
}: {
  value: string | boolean;
  onChange: (val: string | boolean) => void;
  type?: 'text' | 'select' | 'checkbox';
  options?: string[];
  className?: string;
  placeholder?: string;
}) {
  if (type === 'checkbox') {
    return (
      <td className={`px-3 py-2 text-center ${className}`}>
        <input
          type="checkbox"
          checked={value as boolean}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 accent-[#E9A620] cursor-pointer"
        />
      </td>
    );
  }

  if (type === 'select' && options) {
    return (
      <td className={`px-1 py-1 ${className}`}>
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm py-1.5 px-2 cursor-pointer rounded transition-all outline-none hover:ring-1 hover:ring-slate-200 focus:ring-2 focus:ring-[#E9A620] focus:bg-white"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
          {!options.includes(value as string) && value && (
            <option value={value as string}>{value as string}</option>
          )}
        </select>
      </td>
    );
  }

  return (
    <td className={`px-1 py-1 ${className}`}>
      <input
        type="text"
        value={value as string}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm py-1.5 px-2 rounded transition-all outline-none hover:ring-1 hover:ring-slate-200 focus:ring-2 focus:ring-[#E9A620] focus:bg-white min-w-[60px]"
      />
    </td>
  );
}

export default function DoorTable({ doors, onChange, showAllSpecs = false }: DoorTableProps) {
  function updateDoor(id: string, field: keyof DoorRow, value: string | boolean) {
    onChange(doors.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  }

  function deleteDoor(id: string) {
    onChange(doors.filter((d) => d.id !== id));
  }

  function addRow() {
    const newDoor: DoorRow = {
      id: uuidv4(),
      mark: '',
      location: '',
      width: '',
      height: '',
      thickness: '',
      hanging: 'LH',
      frameType: 'Standard',
      doorFinish: 'Primed',
      doorCore: 'Poly',
      softClose: false,
      hardwareCode: '',
      notes: '',
    };
    onChange([...doors, newDoor]);
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-[#1D3461] text-white text-xs uppercase tracking-wider">
              <th className="px-3 py-3.5 font-semibold whitespace-nowrap">Mark</th>
              <th className="px-3 py-3.5 font-semibold whitespace-nowrap">Location</th>
              <th className="px-3 py-3.5 font-semibold whitespace-nowrap">Size (mm)</th>
              <th className="px-3 py-3.5 font-semibold whitespace-nowrap">Hanging</th>
              <th className="px-3 py-3.5 font-semibold whitespace-nowrap">Frame</th>
              <th className="px-3 py-3.5 font-semibold whitespace-nowrap">Finish</th>
              <th className="px-3 py-3.5 font-semibold whitespace-nowrap">Core</th>
              <th className="px-3 py-3.5 font-semibold whitespace-nowrap text-center">SC</th>
              <th className="px-3 py-3.5 font-semibold whitespace-nowrap">Hardware</th>
              <th className="px-3 py-3.5 font-semibold whitespace-nowrap">Notes</th>
              <th className="px-2 py-3.5 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {doors.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-gray-400 text-sm">
                  No doors yet. Add a row or re-run extraction.
                </td>
              </tr>
            ) : (
              doors.map((door, idx) => {
                const hasNotes = Boolean(door.notes && door.notes.trim());
                return (
                  <tr
                    key={door.id}
                    className={`group transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafbfd]'} hover:bg-[#f5f7fc]`}
                  >
                    {/* Mark — left border accent when notes are present */}
                    <td className={`px-1 py-1 font-semibold text-[#1D3461] min-w-[60px] ${hasNotes ? 'border-l-2 border-l-amber-400' : ''}`}>
                      <input
                        type="text"
                        value={door.mark}
                        onChange={(e) => updateDoor(door.id, 'mark', e.target.value)}
                        className="w-full bg-transparent text-sm py-1.5 px-2 rounded transition-all outline-none font-semibold text-[#1D3461] hover:ring-1 hover:ring-slate-200 focus:ring-2 focus:ring-[#E9A620] focus:bg-white min-w-[60px]"
                      />
                    </td>
                    <EditableCell
                      value={door.location}
                      onChange={(v) => updateDoor(door.id, 'location', v)}
                      className="min-w-[100px]"
                    />
                    {/* W×H combined — thickness stored but shown only in notes */}
                    <td className="px-1 py-1 min-w-[110px]">
                      <div className="flex items-center gap-0.5">
                        <input
                          type="text"
                          value={door.width}
                          onChange={(e) => updateDoor(door.id, 'width', e.target.value)}
                          placeholder="W"
                          className="w-14 bg-transparent text-sm py-1.5 px-1.5 text-center rounded transition-all outline-none hover:ring-1 hover:ring-slate-200 focus:ring-2 focus:ring-[#E9A620] focus:bg-white"
                        />
                        <span className="text-gray-300 text-xs select-none">×</span>
                        <input
                          type="text"
                          value={door.height}
                          onChange={(e) => updateDoor(door.id, 'height', e.target.value)}
                          placeholder="H"
                          className="w-14 bg-transparent text-sm py-1.5 px-1.5 text-center rounded transition-all outline-none hover:ring-1 hover:ring-slate-200 focus:ring-2 focus:ring-[#E9A620] focus:bg-white"
                        />
                      </div>
                    </td>
                    <EditableCell
                      value={door.hanging}
                      onChange={(v) => updateDoor(door.id, 'hanging', v)}
                      type="select"
                      options={HANGING_OPTIONS}
                      className="min-w-[90px]"
                    />
                    <EditableCell
                      value={door.frameType}
                      onChange={(v) => updateDoor(door.id, 'frameType', v)}
                      type="select"
                      options={FRAME_OPTIONS}
                      className="min-w-[100px]"
                    />
                    <EditableCell
                      value={door.doorFinish}
                      onChange={(v) => updateDoor(door.id, 'doorFinish', v)}
                      type="select"
                      options={FINISH_OPTIONS}
                      className="min-w-[90px]"
                    />
                    <EditableCell
                      value={door.doorCore}
                      onChange={(v) => updateDoor(door.id, 'doorCore', v)}
                      type="select"
                      options={CORE_OPTIONS}
                      className="min-w-[90px]"
                    />
                    <EditableCell
                      value={door.softClose}
                      onChange={(v) => updateDoor(door.id, 'softClose', v)}
                      type="checkbox"
                    />
                    <EditableCell
                      value={door.hardwareCode}
                      onChange={(v) => updateDoor(door.id, 'hardwareCode', v)}
                      className="min-w-[90px]"
                    />
                    <EditableCell
                      value={door.notes}
                      onChange={(v) => updateDoor(door.id, 'notes', v)}
                      className="min-w-[120px]"
                    />
                    <td className="px-2 py-1">
                      <button
                        onClick={() => deleteDoor(door.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded"
                        title="Delete row"
                      >
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                          <path d="M1 3h12M5 3V2h4v1M2 3l1 9h8l1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={addRow}
        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-[#1D3461] shadow-sm hover:bg-[#1D3461] hover:text-white hover:border-[#1D3461] transition-all"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Add Row
      </button>
    </div>
  );
}
