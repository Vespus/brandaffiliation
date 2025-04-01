'use client';

import { useState, useEffect } from 'react';

interface ScaleWeight {
  name: string;
  weight: number;
}

interface ScaleWeightsProps {
  weights: ScaleWeight[];
  onChange: (weights: ScaleWeight[]) => void;
}

export default function ScaleWeights({ weights, onChange }: ScaleWeightsProps) {
  const [localWeights, setLocalWeights] = useState<ScaleWeight[]>(weights);
  const [error, setError] = useState<string | null>(null);

  // Berechne die Summe der Gewichtungen
  const totalWeight = localWeights.reduce((sum, { weight }) => sum + weight, 0);

  // Validiere die Summe und aktualisiere den Fehlerstatus
  useEffect(() => {
    if (Math.abs(totalWeight - 1) > 0.001) { // Toleranz für Fließkommafehler
      setError(`Die Summe der Gewichtungen muss 1.0 sein (aktuell: ${totalWeight.toFixed(2)})`);
    } else {
      setError(null);
    }
  }, [totalWeight]);

  const handleWeightChange = (index: number, newWeight: number) => {
    const newWeights = [...localWeights];
    newWeights[index] = { ...newWeights[index], weight: newWeight };
    setLocalWeights(newWeights);
    onChange(newWeights);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Skalengewichtungen</h3>
        <div className="text-sm font-medium">
          Summe: <span className={error ? "text-red-500" : "text-green-500"}>
            {totalWeight.toFixed(2)}
          </span>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {localWeights.map((scale, index) => (
          <div key={scale.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                {scale.name}
              </label>
              <span className="text-sm text-gray-500">
                {(scale.weight * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={scale.weight}
              onChange={(e) => handleWeightChange(index, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        ))}
      </div>
    </div>
  );
} 