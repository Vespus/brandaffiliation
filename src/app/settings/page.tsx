'use client';

import { useState, useEffect } from 'react';
import Settings from '@/components/Settings';

const STORAGE_KEY = 'affineBrandsCount';

export default function SettingsPage() {
  const [affineBrandsCount, setAffineBrandsCount] = useState(5);

  useEffect(() => {
    // Lade gespeicherte Einstellung beim Start
    const savedCount = localStorage.getItem(STORAGE_KEY);
    if (savedCount) {
      setAffineBrandsCount(parseInt(savedCount));
    }
  }, []);

  const handleAffineBrandsCountChange = (count: number) => {
    setAffineBrandsCount(count);
    localStorage.setItem(STORAGE_KEY, count.toString());
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <Settings
        defaultAffineBrandsCount={affineBrandsCount}
        onAffineBrandsCountChange={handleAffineBrandsCountChange}
      />
    </div>
  );
} 