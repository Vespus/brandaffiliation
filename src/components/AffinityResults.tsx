import { Brand } from '@/types/brands';
import { calculateAffinity } from '@/utils/affinity';
import { useState } from 'react';

interface AffinityResultsProps {
  selectedBrand: Brand;
  similarBrands: {
    brand: Brand;
    affinity: {
      overallSimilarity: number;
      textSimilarity: {
        similarity: number;
        commonWords: string[];
      };
      scaleSimilarity: {
        similarity: number;
        scaleDetails: Record<string, {
          brand1Value: number;
          brand2Value: number;
          difference: number;
          similarity: number;
        }>;
      };
    };
  }[];
}

export default function AffinityResults({ selectedBrand, similarBrands }: AffinityResultsProps) {
  const [expandedBrandId, setExpandedBrandId] = useState<string | null>(null);
  const [expandedScalesId, setExpandedScalesId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Ähnliche Marken</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {similarBrands.map(({ brand, affinity }) => (
          <div key={brand.Marke} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
            {/* Header mit Markenname und Gesamtähnlichkeit */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{brand.Marke}</h3>
              <div className="flex items-center space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${
                      i < Math.round(affinity.overallSimilarity * 3)
                        ? 'bg-emerald-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
                <span className="ml-2 text-base font-medium text-gray-700">
                  {Math.round(affinity.overallSimilarity * 100)}%
                </span>
              </div>
            </div>

            {/* Zusammenfassung der Ähnlichkeiten */}
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-600">
                Skalen: {Math.round(affinity.scaleSimilarity.similarity * 100)}%
              </span>
              <span className="text-gray-600">
                Text: {Math.round(affinity.textSimilarity.similarity * 100)}%
              </span>
            </div>

            {/* Skalen-Vergleich (Collapsible) */}
            <div className="border-t border-gray-100 pt-3">
              <button
                onClick={() => setExpandedScalesId(
                  expandedScalesId === brand.Marke ? null : brand.Marke
                )}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                <svg
                  className={`w-4 h-4 mr-1 transition-transform ${
                    expandedScalesId === brand.Marke ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Skalendetails
              </button>

              {expandedScalesId === brand.Marke && (
                <div className="mt-2 space-y-1.5">
                  {Object.entries(affinity.scaleSimilarity.scaleDetails).map(([scale, details]) => (
                    <div key={scale} className="flex items-center justify-between bg-gray-50 p-1.5 rounded text-sm">
                      <span className="text-gray-600">{scale}:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">
                          {details.brand1Value} vs {details.brand2Value}
                        </span>
                        <div className="w-12 text-right">
                          <span className={`${
                            details.similarity === 1 ? 'text-emerald-600' : 'text-gray-600'
                          }`}>
                            {Math.round(details.similarity * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gemeinsame Wörter (Collapsible) */}
            {affinity.textSimilarity.commonWords.length > 0 && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <button
                  onClick={() => setExpandedBrandId(
                    expandedBrandId === brand.Marke ? null : brand.Marke
                  )}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <svg
                    className={`w-4 h-4 mr-1 transition-transform ${
                      expandedBrandId === brand.Marke ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  Begriffe
                </button>
                
                {expandedBrandId === brand.Marke && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-md">
                    <div className="flex flex-wrap gap-1.5">
                      {affinity.textSimilarity.commonWords.map((word) => (
                        <span
                          key={word}
                          className="px-2 py-0.5 bg-white rounded-full text-xs text-gray-600 border border-gray-200"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 