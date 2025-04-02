'use client';

import { useEffect, useState } from 'react';
import { Brand } from '@/types/brands';
import { loadBrands } from '@/utils/loadBrands';
import BrandSearch from '@/components/BrandSearch';
import BrandDetails from '@/components/BrandDetails';
import AffinitySlider from '@/components/AffinitySlider';
import AffinityResults from '@/components/AffinityResults';
import ScaleWeights from '@/components/ScaleWeights';
import { calculateAffinity } from '@/utils/affinity';

const STORAGE_KEY = 'affineBrandsCount';
const SCALE_WEIGHTS_KEY = 'scaleWeights';

// Standardgewichte für die Skalen
const DEFAULT_SCALE_WEIGHTS = [
  { name: 'Preis', weight: 0.3 },
  { name: 'Design', weight: 0.2 },
  { name: 'Bekanntheit', weight: 0.2 },
  { name: 'Sortimentsbreite', weight: 0.15 },
  { name: 'Positionierung', weight: 0.15 }
];

export default function Home() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [affinityWeight, setAffinityWeight] = useState(0.6);
  const [affineBrandsCount, setAffineBrandsCount] = useState(5);
  const [scaleWeights, setScaleWeights] = useState(DEFAULT_SCALE_WEIGHTS);
  const [useAlternativeMethod, setUseAlternativeMethod] = useState(false);

  useEffect(() => {
    // Lade gespeicherte Einstellungen beim Start
    const savedCount = localStorage.getItem(STORAGE_KEY);
    const savedWeights = localStorage.getItem(SCALE_WEIGHTS_KEY);
    
    if (savedCount) {
      setAffineBrandsCount(parseInt(savedCount));
    }
    
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

  // Berechne Affinitäten für alle anderen Marken
  const calculateAffinities = () => {
    if (!selectedBrand) return [];
    
    // Konvertiere die Gewichtungen in das Format für die Berechnung
    const weightsObject = scaleWeights.reduce((acc, { name, weight }) => {
      acc[name] = weight;
      return acc;
    }, {} as Record<string, number>);
    
    return brands
      .filter(brand => brand.Marke !== selectedBrand.Marke)
      .map(brand => ({
        brand,
        affinity: calculateAffinity(selectedBrand, brand, affinityWeight, weightsObject, useAlternativeMethod)
      }))
      .sort((a, b) => b.affinity.overallSimilarity - a.affinity.overallSimilarity)
      .slice(0, affineBrandsCount);
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

  const similarBrands = selectedBrand ? calculateAffinities() : [];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <BrandSearch
          brands={brands}
          onSelect={(brand) => {
            setSelectedBrand(brand);
          }}
          selectedBrand={selectedBrand}
        />
      </div>

      {selectedBrand && (
        <>
          <div className="mb-8">
            <BrandDetails brand={selectedBrand} />
          </div>
          
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

          <div className="mb-8">
            <AffinityResults
              selectedBrand={selectedBrand}
              similarBrands={similarBrands}
            />
          </div>
        </>
      )}
    </div>
  );
}
