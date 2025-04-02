'use client';

import { useState, useEffect } from 'react';

interface ScaleWeight {
  name: string;
  weight: number;
}

interface ScaleWeightsProps {
  weights: ScaleWeight[];
  onChange: (weights: ScaleWeight[]) => void;
  useAlternativeMethod: boolean;
  onMethodChange: (useAlternative: boolean) => void;
}

export default function ScaleWeights({ 
  weights, 
  onChange, 
  useAlternativeMethod,
  onMethodChange 
}: ScaleWeightsProps) {
  const [localWeights, setLocalWeights] = useState<ScaleWeight[]>(weights);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Skalengewichtungen
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Berechnungsmethode:</span>
              <button
                onClick={() => onMethodChange(!useAlternativeMethod)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  useAlternativeMethod
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {useAlternativeMethod ? 'Alternative' : 'Standard'}
              </button>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? 'Ausblenden' : 'Anpassen'}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
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
      )}
    </div>
  );
} 