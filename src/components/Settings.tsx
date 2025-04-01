'use client';

import { useState } from 'react';

interface SettingsProps {
  defaultAffineBrandsCount: number;
  onAffineBrandsCountChange: (count: number) => void;
}

export default function Settings({ defaultAffineBrandsCount, onAffineBrandsCountChange }: SettingsProps) {
  const [affineBrandsCount, setAffineBrandsCount] = useState(defaultAffineBrandsCount);

  const handleChange = (value: number) => {
    setAffineBrandsCount(value);
    onAffineBrandsCountChange(value);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Einstellungen</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anzahl affiner Marken
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="20"
              value={affineBrandsCount}
              onChange={(e) => handleChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
              {affineBrandsCount}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Wählen Sie die Anzahl der angezeigten affinen Marken (1-20)
          </p>
        </div>
      </div>
    </div>
  );
} 