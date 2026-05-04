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
  style,
}: {
  value: string | boolean;
  onChange: (val: string | boolean) => void;
  type?: 'text' | 'select' | 'checkbox';
  options?: string[];
  style?: React.CSSProperties;
}) {
  if (type === 'checkbox') {
    return (
      <td className="td-center" style={{ padding: '0.25rem' }}>
        <input
          type="checkbox"
          checked={value as boolean}
          onChange={(e) => onChange(e.target.checked)}
        />
      </td>
    );
  }

  if (type === 'select' && options) {
    return (
      <td className="editable-cell" style={style}>
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
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
    <td className="editable-cell" style={style}>
      <input
        type="text"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
      />
    </td>
  );
}

export default function DoorTable({ doors, onChange }: DoorTableProps) {
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
    <div className="stack-4">
      <div className="table-wrap">
        <table className="door-table">
          <thead>
            <tr>
              <th>Mark</th>
              <th>Location</th>
              <th>W×H×T (mm)</th>
              <th>Hanging</th>
              <th>Frame</th>
              <th>Finish</th>
              <th>Core</th>
              <th className="th-center">SC</th>
              <th>Hardware</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {doors.length === 0 ? (
              <tr>
                <td colSpan={11} className="table-empty">
                  No doors yet. Add a row or re-run extraction.
                </td>
              </tr>
            ) : (
              doors.map((door) => (
                <tr key={door.id}>
                  <EditableCell
                    value={door.mark}
                    onChange={(v) => updateDoor(door.id, 'mark', v)}
                    style={{ minWidth: '60px', fontWeight: 600, color: 'var(--navy)' }}
                  />
                  <EditableCell
                    value={door.location}
                    onChange={(v) => updateDoor(door.id, 'location', v)}
                    style={{ minWidth: '100px' }}
                  />
                  {/* W×H×T combined column */}
                  <td className="editable-cell" style={{ minWidth: '130px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input
                        type="text"
                        value={door.width}
                        onChange={(e) => updateDoor(door.id, 'width', e.target.value)}
                        placeholder="W"
                        style={{ width: '3rem', textAlign: 'center' }}
                      />
                      <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>×</span>
                      <input
                        type="text"
                        value={door.height}
                        onChange={(e) => updateDoor(door.id, 'height', e.target.value)}
                        placeholder="H"
                        style={{ width: '3rem', textAlign: 'center' }}
                      />
                      <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>×</span>
                      <input
                        type="text"
                        value={door.thickness}
                        onChange={(e) => updateDoor(door.id, 'thickness', e.target.value)}
                        placeholder="T"
                        style={{ width: '2.5rem', textAlign: 'center' }}
                      />
                    </div>
                  </td>
                  <EditableCell
                    value={door.hanging}
                    onChange={(v) => updateDoor(door.id, 'hanging', v)}
                    type="select"
                    options={HANGING_OPTIONS}
                    style={{ minWidth: '90px' }}
                  />
                  <EditableCell
                    value={door.frameType}
                    onChange={(v) => updateDoor(door.id, 'frameType', v)}
                    type="select"
                    options={FRAME_OPTIONS}
                    style={{ minWidth: '100px' }}
                  />
                  <EditableCell
                    value={door.doorFinish}
                    onChange={(v) => updateDoor(door.id, 'doorFinish', v)}
                    type="select"
                    options={FINISH_OPTIONS}
                    style={{ minWidth: '90px' }}
                  />
                  <EditableCell
                    value={door.doorCore}
                    onChange={(v) => updateDoor(door.id, 'doorCore', v)}
                    type="select"
                    options={CORE_OPTIONS}
                    style={{ minWidth: '90px' }}
                  />
                  <EditableCell
                    value={door.softClose}
                    onChange={(v) => updateDoor(door.id, 'softClose', v)}
                    type="checkbox"
                  />
                  <EditableCell
                    value={door.hardwareCode}
                    onChange={(v) => updateDoor(door.id, 'hardwareCode', v)}
                    style={{ minWidth: '90px' }}
                  />
                  <EditableCell
                    value={door.notes}
                    onChange={(v) => updateDoor(door.id, 'notes', v)}
                    style={{ minWidth: '120px' }}
                  />
                  <td style={{ padding: '0.25rem' }}>
                    <button
                      onClick={() => deleteDoor(door.id)}
                      className="btn-delete-row"
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

      <button onClick={addRow} className="btn-add-row">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Add Row
      </button>
    </div>
  );
}
