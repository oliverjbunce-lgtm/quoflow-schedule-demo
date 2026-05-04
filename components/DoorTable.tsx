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
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
  if (value === 'Slider') {
    return <span className={`${base} bg-amber-50 text-[#D97706]`}>{value}</span>;
  }
  if (value === 'Bi-Fold') {
    return <span className={`${base} bg-blue-50 text-[#2563EB]`}>{value}</span>;
  }
  if (value === 'LH' || value === 'RH') {
    return <span className={`${base} bg-[#F7F8FA] text-[#6B7280]`}>{value}</span>;
  }
  return <span className={`${base} bg-[#F7F8FA] text-[#9CA3AF]`}>{value}</span>;
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
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
              <th className="py-3 px-4 text-[#6B7280] text-xs font-semibold uppercase tracking-wide whitespace-nowrap w-16">Mark</th>
              <th className="py-3 px-4 text-[#6B7280] text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Location</th>
              <th className="py-3 px-4 text-[#6B7280] text-xs font-semibold uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">Room</th>
              <th className="py-3 px-4 text-[#6B7280] text-xs font-semibold uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">W × H</th>
              <th className="py-3 px-4 text-[#6B7280] text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Hanging</th>
              <th className="py-3 px-4 text-[#6B7280] text-xs font-semibold uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Frame</th>
              <th className="py-3 px-4 w-8 hidden sm:table-cell">
                <span className="sr-only">Notes</span>
              </th>
              <th className="py-3 px-4 w-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {doors.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[#9CA3AF] text-sm">
                  No doors yet. Add a row or re-run extraction.
                </td>
              </tr>
            ) : (
              doors.map((door, idx) => {
                const hasNotes = Boolean(door.notes && door.notes.trim());
                const isSelected = door.id === selectedDoorId;

                let rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]';
                if (isSelected) rowBg = 'bg-[#E9A620]/[0.06]';

                const leftBorder = isSelected
                  ? 'border-l-2 border-l-[#E9A620]'
                  : hasNotes
                  ? 'border-l-2 border-l-[#D97706]'
                  : 'border-l-2 border-l-transparent';

                return (
                  <tr
                    key={door.id}
                    onClick={() => handleRowClick(door.id)}
                    className={`cursor-pointer transition-colors hover:bg-[#F7F8FA] ${rowBg} ${leftBorder}`}
                  >
                    {/* Mark */}
                    <td className="py-2.5 px-4 font-bold text-[#1D3461] w-16 whitespace-nowrap">
                      {door.mark || <span className="text-[#D1D5DB] font-normal">—</span>}
                    </td>

                    {/* Location */}
                    <td className="py-2.5 px-4 text-[#0F1117] max-w-[140px]">
                      <span className="block truncate">
                        {door.location || <span className="text-[#D1D5DB]">—</span>}
                      </span>
                    </td>

                    {/* Room */}
                    <td className="py-2.5 px-4 text-[#0F1117] hidden sm:table-cell max-w-[120px]">
                      <span className="block truncate">
                        {door.roomContext ? door.roomContext : <span className="text-[#D1D5DB]">—</span>}
                      </span>
                    </td>

                    {/* W × H */}
                    <td className="py-2.5 px-4 text-[#0F1117] font-mono text-xs whitespace-nowrap hidden sm:table-cell">
                      {formatSize(door.width, door.height)}
                    </td>

                    {/* Hanging badge */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {door.hanging ? (
                        <HangingBadge value={door.hanging} />
                      ) : (
                        <span className="text-[#D1D5DB]">—</span>
                      )}
                    </td>

                    {/* Frame */}
                    <td className="py-2.5 px-4 text-[#0F1117] whitespace-nowrap hidden md:table-cell">
                      <span className="block truncate max-w-[100px]">
                        {door.frameType || <span className="text-[#D1D5DB]">—</span>}
                      </span>
                    </td>

                    {/* Notes dot */}
                    <td className="py-2.5 px-4 w-8 hidden sm:table-cell">
                      {hasNotes && (
                        <span
                          className="inline-block w-2 h-2 rounded-full bg-[#D97706]"
                          title="Has notes"
                        />
                      )}
                    </td>

                    {/* Chevron */}
                    <td className="py-2.5 px-4 w-6 text-[#D1D5DB] text-base leading-none select-none">
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
        className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-white border border-[#E5E7EB] text-[#0F1117] hover:bg-[#F7F8FA] transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Add Door
      </button>

      {/* Detail panel */}
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
