'use client';

import { useState, useEffect, useRef } from 'react';
import { Brand } from '@/types/brands';

interface BrandSearchProps {
  brands: Brand[];
  onSelect: (brand: Brand) => void;
  selectedBrand: Brand | null;
}

export default function BrandSearch({ brands, onSelect, selectedBrand }: BrandSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedBrand) {
      setQuery(selectedBrand.Marke);
    }
  }, [selectedBrand]);

  const filteredBrands = brands.filter(brand =>
    brand.Marke.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' && selectedIndex < filteredBrands.length - 1) {
      setSelectedIndex(prev => prev + 1);
    } else if (e.key === 'ArrowUp' && selectedIndex > 0) {
      setSelectedIndex(prev => prev - 1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      onSelect(filteredBrands[selectedIndex]);
      setIsOpen(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Marke suchen..."
          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {isOpen && query && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-96 overflow-auto">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand, index) => (
              <div
                key={brand.Marke}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-100 ${
                  index === selectedIndex ? 'bg-gray-100' : ''
                }`}
                onClick={() => {
                  onSelect(brand);
                  setIsOpen(false);
                  setSelectedIndex(-1);
                }}
              >
                <div className="font-medium text-gray-900">{brand.Marke}</div>
                <div className="text-sm text-gray-500">{brand['Kurzcharakteristik 1']}</div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500">Keine Marken gefunden</div>
          )}
        </div>
      )}
    </div>
  );
} 