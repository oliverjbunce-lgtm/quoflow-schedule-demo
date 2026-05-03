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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-[#1D3461] uppercase tracking-wider mb-4">
        Global Specifications
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Jamb Style</label>
            <select
              value={specs.jambStyle}
              onChange={(e) => update('jambStyle', e.target.value as GlobalSpecs['jambStyle'])}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9A620] focus:border-transparent"
            >
              <option value="Flat">Flat</option>
              <option value="Groove">Groove</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Jamb Material</label>
            <select
              value={specs.jambMaterial}
              onChange={(e) => update('jambMaterial', e.target.value as GlobalSpecs['jambMaterial'])}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9A620] focus:border-transparent"
            >
              <option value="MDF">MDF</option>
              <option value="Pine">Pine</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hardware Brand</label>
          <input
            type="text"
            value={specs.hardwareBrand}
            onChange={(e) => update('hardwareBrand', e.target.value)}
            placeholder="e.g. Gainsborough, Lockwood"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9A620] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hinge Details</label>
          <input
            type="text"
            value={specs.hingeDetails}
            onChange={(e) => update('hingeDetails', e.target.value)}
            placeholder="e.g. 3x 100mm butt hinges"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9A620] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Handle Height (mm)</label>
          <input
            type="text"
            value={specs.handleHeight}
            onChange={(e) => update('handleHeight', e.target.value)}
            placeholder="1000"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9A620] focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <input
            type="checkbox"
            id="drillingRequired"
            checked={specs.drillingRequired}
            onChange={(e) => update('drillingRequired', e.target.checked)}
            className="w-4 h-4 accent-[#E9A620] cursor-pointer"
          />
          <label htmlFor="drillingRequired" className="text-sm text-gray-700 cursor-pointer">
            Drilling Required
          </label>
        </div>
      </div>
    </div>
  );
}
