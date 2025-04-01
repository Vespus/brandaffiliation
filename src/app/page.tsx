'use client';

import { useEffect, useState } from 'react';
import { Brand } from '@/types/brands';
import { loadBrands } from '@/utils/loadBrands';
import BrandSearch from '@/components/BrandSearch';
import BrandDetails from '@/components/BrandDetails';
import AffinitySlider from '@/components/AffinitySlider';
import AffinityResults from '@/components/AffinityResults';
import { calculateAffinity } from '@/utils/affinity';

const STORAGE_KEY = 'affineBrandsCount';

export default function Home() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [affinityWeight, setAffinityWeight] = useState(0.6); // Standardgewichtung: 60% Skalen, 40% Text
  const [affineBrandsCount, setAffineBrandsCount] = useState(5);

  useEffect(() => {
    // Lade gespeicherte Einstellung beim Start
    const savedCount = localStorage.getItem(STORAGE_KEY);
    if (savedCount) {
      setAffineBrandsCount(parseInt(savedCount));
    }
  }, []);

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
