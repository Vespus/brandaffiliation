import { Brand } from '@/types/brands';
import { preisLabels, designLabels, bekannheitLabels, sortimentsbreiteLabels, positionierungLabels } from '@/utils/scales';
import { useState } from 'react';

interface BrandDetailsProps {
  brand: Brand;
}

export default function BrandDetails({ brand }: BrandDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 cursor-pointer flex items-center justify-between"
      >
        <h2 className="text-xl font-bold text-white">{brand.Marke}</h2>
        <svg
          className={`w-5 h-5 text-white transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-6 space-y-8">
          {/* Charakteristiken */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Charakteristik</h3>
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">{brand['Kurzcharakteristik 1']}</p>
              {brand['Kurzcharakteristik 2'] && (
                <p className="text-gray-700 leading-relaxed">{brand['Kurzcharakteristik 2']}</p>
              )}
            </div>
          </section>

          {/* Skalenwerte */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Markenprofile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Preis */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Preis</h4>
                  <div className="text-yellow-500">{'★'.repeat(brand.Preis)}{'☆'.repeat(5 - brand.Preis)}</div>
                </div>
                <p className="text-sm text-gray-600">{preisLabels[brand.Preis]}</p>
              </div>

              {/* Design */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Design</h4>
                  <div className="text-yellow-500">{'★'.repeat(brand.Design)}{'☆'.repeat(5 - brand.Design)}</div>
                </div>
                <p className="text-sm text-gray-600">{designLabels[brand.Design]}</p>
              </div>

              {/* Bekanntheit */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Bekanntheit</h4>
                  <div className="text-yellow-500">{'★'.repeat(brand.Bekanntheit)}{'☆'.repeat(5 - brand.Bekanntheit)}</div>
                </div>
                <p className="text-sm text-gray-600">{bekannheitLabels[brand.Bekanntheit]}</p>
              </div>

              {/* Sortimentsbreite */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Sortimentsbreite</h4>
                  <div className="text-yellow-500">{'★'.repeat(brand.Sortimentsbreite)}{'☆'.repeat(5 - brand.Sortimentsbreite)}</div>
                </div>
                <p className="text-sm text-gray-600">{sortimentsbreiteLabels[brand.Sortimentsbreite]}</p>
              </div>

              {/* Positionierung */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Positionierung</h4>
                  <div className="text-yellow-500">{'★'.repeat(brand.Positionierung)}{'☆'.repeat(3 - brand.Positionierung)}</div>
                </div>
                <p className="text-sm text-gray-600">{positionierungLabels[brand.Positionierung]}</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
} 