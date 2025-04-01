'use client';

import { useEffect, useState } from 'react';
import { Brand } from '@/types/brands';
import { loadBrands } from '@/utils/loadBrands';
import BrandTable from '@/components/BrandTable';

export default function AllBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Alle Marken
        </h1>
        <p className="text-lg text-gray-600">
          Eine Übersicht aller verfügbaren Marken
        </p>
      </div>

      <BrandTable brands={brands} />
    </div>
  );
} 