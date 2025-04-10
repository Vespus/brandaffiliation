'use client';

import { useEffect, useState } from 'react';
import { Brand } from '@/types/brands';
import { loadBrands } from '@/utils/loadBrands';
import BrandSearch from '@/components/BrandSearch';
import BrandDetails from '@/components/BrandDetails';
import AffinitySlider from '@/components/AffinitySlider';
import ScaleWeights from '@/components/ScaleWeights';
import { calculateAffinity } from '@/utils/affinity';

const SCALE_WEIGHTS_KEY = 'scaleWeights';

// Standardgewichte für die Skalen
const DEFAULT_SCALE_WEIGHTS = [
  { name: 'Preis', weight: 0.3 },
  { name: 'Design', weight: 0.2 },
  { name: 'Bekanntheit', weight: 0.2 },
  { name: 'Sortimentsbreite', weight: 0.15 },
  { name: 'Positionierung', weight: 0.15 }
];

export default function BrandComparisonPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand1, setSelectedBrand1] = useState<Brand | null>(null);
  const [selectedBrand2, setSelectedBrand2] = useState<Brand | null>(null);
  const [affinityWeight, setAffinityWeight] = useState(0.6);
  const [scaleWeights, setScaleWeights] = useState(DEFAULT_SCALE_WEIGHTS);
  const [useAlternativeMethod, setUseAlternativeMethod] = useState(false);

  useEffect(() => {
    // Lade gespeicherte Skalengewichtungen
    const savedWeights = localStorage.getItem(SCALE_WEIGHTS_KEY);
    if (savedWeights) {
      try {
        const parsedWeights = JSON.parse(savedWeights);
        setScaleWeights(parsedWeights);
      } catch (e) {
        console.error('Fehler beim Laden der Skalengewichtungen:', e);
      }
    }
  }, []);

  // Speichere Skalengewichtungen bei Änderung
  useEffect(() => {
    localStorage.setItem(SCALE_WEIGHTS_KEY, JSON.stringify(scaleWeights));
  }, [scaleWeights]);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const data = await loadBrands();
        setBrands(data);
        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden der Daten');
        setLoading(false);
      }
    }

    fetchBrands();
  }, []);

  // Berechne Affinität zwischen den ausgewählten Marken
  const calculateComparison = () => {
    if (!selectedBrand1 || !selectedBrand2) return null;
    
    // Konvertiere die Gewichtungen in das Format für die Berechnung
    const weightsObject = scaleWeights.reduce((acc, { name, weight }) => {
      acc[name] = weight;
      return acc;
    }, {} as Record<string, number>);
    
    return calculateAffinity(selectedBrand1, selectedBrand2, affinityWeight, weightsObject, useAlternativeMethod);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  const comparison = calculateComparison();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Markenvergleich
        </h1>
        <p className="text-lg text-gray-600">
          Vergleichen Sie zwei Marken miteinander
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Erste Marke</h2>
          <BrandSearch
            brands={brands}
            onSelect={setSelectedBrand1}
            selectedBrand={selectedBrand1}
          />
          {selectedBrand1 && (
            <div className="mt-4">
              <BrandDetails brand={selectedBrand1} />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Zweite Marke</h2>
          <BrandSearch
            brands={brands}
            onSelect={setSelectedBrand2}
            selectedBrand={selectedBrand2}
          />
          {selectedBrand2 && (
            <div className="mt-4">
              <BrandDetails brand={selectedBrand2} />
            </div>
          )}
        </div>
      </div>

      {selectedBrand1 && selectedBrand2 && (
        <>
          <div className="mb-8">
            <AffinitySlider
              value={affinityWeight}
              onChange={setAffinityWeight}
            />
          </div>

          <div className="mb-8">
            <ScaleWeights
              weights={scaleWeights}
              onChange={setScaleWeights}
              useAlternativeMethod={useAlternativeMethod}
              onMethodChange={setUseAlternativeMethod}
            />
          </div>

          {comparison && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Vergleichsergebnis
              </h2>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {(comparison.overallSimilarity * 100).toFixed(1)}%
                </div>
                <div className="text-gray-600">
                  Gesamtähnlichkeit
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 