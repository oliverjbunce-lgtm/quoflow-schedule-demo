'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { DoorRow } from '../types';
import DoorDetailPanel from './DoorDetailPanel';

interface DoorTableProps {
  doors: DoorRow[];
  onChange: (doors: DoorRow[]) => void;
  showAllSpecs?: boolean;
}

function HangingBadge({ value }: { value: string }) {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold';
  if (value === 'Slider') {
    return <span className={`${base} bg-amber-100 text-amber-700`}>{value}</span>;
  }
  if (value === 'Bi-Fold') {
    return <span className={`${base} bg-blue-100 text-blue-700`}>{value}</span>;
  }
  if (value === 'LH' || value === 'RH') {
    return <span className={`${base} bg-slate-100 text-slate-600`}>{value}</span>;
  }
  return <span className={`${base} bg-slate-100 text-slate-500`}>{value}</span>;
}

export default function DoorTable({ doors, onChange, showAllSpecs = false }: DoorTableProps) {
  const [selectedDoorId, setSelectedDoorId] = useState<string | null>(null);

  const selectedIndex = selectedDoorId ? doors.findIndex((d) => d.id === selectedDoorId) : -1;
  const selectedDoor = selectedIndex >= 0 ? doors[selectedIndex] : null;

  function handleRowClick(id: string) {
    setSelectedDoorId((prev) => (prev === id ? null : id));
  }

  function handlePanelChange(updatedDoor: DoorRow) {
    onChange(doors.map((d) => (d.id === updatedDoor.id ? updatedDoor : d)));
  }

  function handleDelete(id: string) {
    onChange(doors.filter((d) => d.id !== id));
    setSelectedDoorId(null);
  }

  function handleNavigate(direction: 'prev' | 'next') {
    if (selectedIndex < 0) return;
    const newIndex = direction === 'prev' ? selectedIndex - 1 : selectedIndex + 1;
    if (newIndex >= 0 && newIndex < doors.length) {
      setSelectedDoorId(doors[newIndex].id);
    }
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
    const updated = [...doors, newDoor];
    onChange(updated);
    // Auto-open new door in panel
    setSelectedDoorId(newDoor.id);
  }

  function formatSize(width: string, height: string) {
    if (!width && !height) return '—';
    const w = width || '?';
    const h = height || '?';
    return `${w} × ${h}`;
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-[#1D3461] text-white text-xs uppercase tracking-wider sticky top-0">
              <th className="py-3 px-4 font-semibold whitespace-nowrap w-16">Mark</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">Location</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap hidden sm:table-cell">Room</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap hidden sm:table-cell">W × H</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">Hanging</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap hidden md:table-cell">Frame</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap w-8 hidden sm:table-cell">
                <span className="sr-only">Notes</span>
              </th>
              <th className="py-3 px-4 w-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {doors.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                  No doors yet. Add a row or re-run extraction.
                </td>
              </tr>
            ) : (
              doors.map((door, idx) => {
                const hasNotes = Boolean(door.notes && door.notes.trim());
                const isSelected = door.id === selectedDoorId;

                let rowBase = idx % 2 === 0 ? 'bg-white' : 'bg-[#fafbfd]';
                if (isSelected) rowBase = 'bg-[#EEF2FF]';

                const leftBorder = isSelected
                  ? 'border-l-2 border-l-[#1D3461]'
                  : hasNotes
                  ? 'border-l-2 border-l-amber-400'
                  : 'border-l-2 border-l-transparent';

                return (
                  <tr
                    key={door.id}
                    onClick={() => handleRowClick(door.id)}
                    className={`cursor-pointer transition-colors hover:bg-[#f5f7fc] ${rowBase} ${leftBorder}`}
                  >
                    {/* Mark */}
                    <td className="py-2.5 px-4 font-bold text-[#1D3461] w-16 whitespace-nowrap">
                      {door.mark || <span className="text-slate-300 font-normal">—</span>}
                    </td>

                    {/* Location */}
                    <td className="py-2.5 px-4 text-slate-600 max-w-[140px]">
                      <span className="block truncate">
                        {door.location || <span className="text-slate-300">—</span>}
                      </span>
                    </td>

                    {/* Room */}
                    <td className="py-2.5 px-4 text-slate-600 hidden sm:table-cell max-w-[120px]">
                      <span className="block truncate">
                        {door.roomContext ? door.roomContext : <span className="text-slate-300">—</span>}
                      </span>
                    </td>

                    {/* W × H */}
                    <td className="py-2.5 px-4 text-slate-700 font-mono text-xs whitespace-nowrap hidden sm:table-cell">
                      {formatSize(door.width, door.height)}
                    </td>

                    {/* Hanging badge */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {door.hanging ? (
                        <HangingBadge value={door.hanging} />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Frame */}
                    <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap hidden md:table-cell">
                      <span className="block truncate max-w-[100px]">
                        {door.frameType || <span className="text-slate-300">—</span>}
                      </span>
                    </td>

                    {/* Notes dot */}
                    <td className="py-2.5 px-4 w-8 hidden sm:table-cell">
                      {hasNotes && (
                        <span
                          className="inline-block w-2 h-2 rounded-full bg-amber-400"
                          title="Has notes"
                        />
                      )}
                    </td>

                    {/* Chevron */}
                    <td className="py-2.5 px-4 w-6 text-slate-300 text-base leading-none select-none">
                      ›
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
        Add Door
      </button>

      {/* Detail panel — rendered inside DoorTable, not in pages */}
      <DoorDetailPanel
        door={selectedDoor}
        onClose={() => setSelectedDoorId(null)}
        onChange={handlePanelChange}
        onDelete={handleDelete}
        totalDoors={doors.length}
        currentIndex={selectedIndex}
        onNavigate={handleNavigate}
        doors={doors}
      />
    </div>
  );
}
