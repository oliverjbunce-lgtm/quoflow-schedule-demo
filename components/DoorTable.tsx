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
}: {
  value: string | boolean;
  onChange: (val: string | boolean) => void;
  type?: 'text' | 'select' | 'checkbox';
  options?: string[];
  className?: string;
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
      <td className={`px-1 py-1 editable-cell ${className}`}>
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-sm py-1 px-2 cursor-pointer hover:bg-[#f0f3f9] rounded focus:bg-white focus:border focus:border-[#E9A620] focus:rounded"
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
    <td className={`px-1 py-1 editable-cell ${className}`}>
      <input
        type="text"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-none outline-none text-sm py-1 px-2 hover:bg-[#f0f3f9] rounded focus:bg-white focus:border focus:border-[#E9A620] focus:rounded min-w-[60px]"
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
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Mark</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Location</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">W×H×T (mm)</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Hanging</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Frame</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Finish</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Core</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap text-center">SC</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Hardware</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Notes</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {doors.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-400">
                  No doors yet. Add a row or re-run extraction.
                </td>
              </tr>
            ) : (
              doors.map((door, idx) => (
                <tr
                  key={door.id}
                  className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafbfd]'} hover:bg-[#f5f7fc]`}
                >
                  <EditableCell
                    value={door.mark}
                    onChange={(v) => updateDoor(door.id, 'mark', v)}
                    className="font-semibold text-[#1D3461] min-w-[60px]"
                  />
                  <EditableCell
                    value={door.location}
                    onChange={(v) => updateDoor(door.id, 'location', v)}
                    className="min-w-[100px]"
                  />
                  {/* W×H×T combined column */}
                  <td className="px-1 py-1 editable-cell min-w-[130px]">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={door.width}
                        onChange={(e) => updateDoor(door.id, 'width', e.target.value)}
                        placeholder="W"
                        className="w-12 bg-transparent border-none outline-none text-sm py-1 px-1 text-center hover:bg-[#f0f3f9] rounded focus:bg-white focus:border focus:border-[#E9A620] focus:rounded"
                      />
                      <span className="text-gray-400 text-xs">×</span>
                      <input
                        type="text"
                        value={door.height}
                        onChange={(e) => updateDoor(door.id, 'height', e.target.value)}
                        placeholder="H"
                        className="w-12 bg-transparent border-none outline-none text-sm py-1 px-1 text-center hover:bg-[#f0f3f9] rounded focus:bg-white focus:border focus:border-[#E9A620] focus:rounded"
                      />
                      <span className="text-gray-400 text-xs">×</span>
                      <input
                        type="text"
                        value={door.thickness}
                        onChange={(e) => updateDoor(door.id, 'thickness', e.target.value)}
                        placeholder="T"
                        className="w-10 bg-transparent border-none outline-none text-sm py-1 px-1 text-center hover:bg-[#f0f3f9] rounded focus:bg-white focus:border focus:border-[#E9A620] focus:rounded"
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
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded"
                      title="Delete row"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 3h12M5 3V2h4v1M2 3l1 9h8l1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={addRow}
        className="flex items-center gap-2 text-sm text-[#1D3461] font-medium px-4 py-2 rounded-lg border border-dashed border-[#1D3461] hover:bg-[#1D3461] hover:text-white transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Add Row
      </button>
    </div>
  );
}
