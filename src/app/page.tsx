'use client';

import { useEffect, useState } from 'react';
import { Brand } from '@/types/brands';
import { loadBrands } from '@/utils/loadBrands';
import BrandSearch from '@/components/BrandSearch';
import BrandTable from '@/components/BrandTable';
import BrandDetails from '@/components/BrandDetails';
import AffinitySlider from '@/components/AffinitySlider';
import { calculateAffinity } from '@/utils/affinity';

export default function Home() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [affinityWeight, setAffinityWeight] = useState(0.6); // Standardgewichtung: 60% Skalen, 40% Text

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
    
    return brands
      .filter(brand => brand.Marke !== selectedBrand.Marke)
      .map(brand => ({
        brand,
        affinity: calculateAffinity(selectedBrand, brand, affinityWeight)
      }))
      .sort((a, b) => b.affinity.overallSimilarity - a.affinity.overallSimilarity);
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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Markencharakteristiken
          </h1>
          <p className="text-lg text-gray-600">
            Entdecken Sie die Vielfalt der Markenwelt
          </p>
        </div>

        <div className="mb-8">
          <BrandSearch
            brands={brands}
            onSelect={(brand) => {
              setSelectedBrand(brand);
              setShowAllBrands(false);
            }}
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
          </>
        )}

        <div className="text-center mb-8">
          <button
            onClick={() => setShowAllBrands(!showAllBrands)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {showAllBrands ? 'Übersicht ausblenden' : 'Alle Marken anzeigen'}
          </button>
        </div>

        {showAllBrands && <BrandTable brands={brands} />}
      </div>
    </main>
  );
}
