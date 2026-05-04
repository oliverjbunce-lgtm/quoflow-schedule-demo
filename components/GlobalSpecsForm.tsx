'use client';

import type { GlobalSpecs } from '../types';

interface GlobalSpecsFormProps {
  specs: GlobalSpecs;
  onChange: (specs: GlobalSpecs) => void;
}

export default function GlobalSpecsForm({ specs, onChange }: GlobalSpecsFormProps) {
  function update<K extends keyof GlobalSpecs>(key: K, value: GlobalSpecs[K]) {
    onChange({ ...specs, [key]: value });
  }

  return (
    <div className="card">
      <h3 className="card-title">Global Specifications</h3>
      <div className="form-stack">
        <div className="form-grid-2">
          <div className="form-field">
            <label className="form-label">Jamb Style</label>
            <select
              value={specs.jambStyle}
              onChange={(e) => update('jambStyle', e.target.value as GlobalSpecs['jambStyle'])}
              className="form-select"
            >
              <option value="Flat">Flat</option>
              <option value="Groove">Groove</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Jamb Material</label>
            <select
              value={specs.jambMaterial}
              onChange={(e) => update('jambMaterial', e.target.value as GlobalSpecs['jambMaterial'])}
              className="form-select"
            >
              <option value="MDF">MDF</option>
              <option value="Pine">Pine</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Hardware Brand</label>
          <input
            type="text"
            value={specs.hardwareBrand}
            onChange={(e) => update('hardwareBrand', e.target.value)}
            placeholder="e.g. Gainsborough, Lockwood"
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Hinge Details</label>
          <input
            type="text"
            value={specs.hingeDetails}
            onChange={(e) => update('hingeDetails', e.target.value)}
            placeholder="e.g. 3x 100mm butt hinges"
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Handle Height (mm)</label>
          <input
            type="text"
            value={specs.handleHeight}
            onChange={(e) => update('handleHeight', e.target.value)}
            placeholder="1000"
            className="form-input"
          />
        </div>

        <label className="form-checkbox-label">
          <input
            type="checkbox"
            id="drillingRequired"
            checked={specs.drillingRequired}
            onChange={(e) => update('drillingRequired', e.target.checked)}
          />
          Drilling Required
        </label>
      </div>
    </div>
  );
}
