'use client';

import { useState, useEffect } from 'react';
import { Brand } from '@/types/brands';
import { CategoryData } from '@/types/categories';
import { Season } from '@/types/seo';
import { loadBrands } from '@/utils/loadBrands';

const seasons: Season[] = [
  { id: 'ss', name: 'Frühling/Sommer' },
  { id: 'aw', name: 'Herbst/Winter' }
];

export default function SeoTextModernPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Lade Marken und Kategorien beim Start
  useEffect(() => {
    async function fetchData() {
      try {
        // Lade Marken
        const brandsData = await loadBrands();
        setBrands(brandsData);

        // Lade Kategorien
        const categoriesResponse = await fetch('/categories.json');
        if (!categoriesResponse.ok) {
          throw new Error('Fehler beim Laden der Kategorien');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);
      } catch (err) {
        setError('Fehler beim Laden der Daten');
      }
    }
    fetchData();
  }, []);

  const handleGenerateText = async () => {
    if (!selectedBrand || !selectedSeason || !selectedCategory) {
      setError('Bitte wählen Sie alle erforderlichen Felder aus');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Lade das aktuelle Prompt Template
      const settingsResponse = await fetch('/api/settings');
      const settings = await settingsResponse.json();

      if (!settings.promptTemplate) {
        throw new Error('Kein Prompt Template konfiguriert');
      }

      // Übersetze die Skalenwerte in beschreibende Texte
      const priceLevels = ['günstig', 'preisgünstig', 'mittleres Preissegment', 'premium', 'luxuriös'];
      const designLevels = ['einfach', 'klassisch', 'zeitlos', 'modern', 'innovativ'];
      const fameLevels = ['neu', 'aufstrebend', 'etabliert', 'bekannt', 'Premium-Marke'];
      const rangeLevels = ['fokussiert', 'spezialisiert', 'breit', 'sehr breit', 'universell'];
      const positioningLevels = ['Mass Market', 'Premium', 'Luxus'];

      // Erstelle den Prompt mit den Markendaten
      const prompt = settings.promptTemplate
        .replace('{brand}', selectedBrand.Marke)
        .replace('{category}', selectedCategory.name)
        .replace('{season}', selectedSeason.name)
        .replace('{char1}', selectedBrand['Kurzcharakteristik 1'])
        .replace('{char2}', selectedBrand['Kurzcharakteristik 2'])
        .replace('{char3}', selectedBrand['Kurzcharakteristik 3 (optional)'] || 'N/A')
        .replace('{price}', priceLevels[selectedBrand.Preis - 1])
        .replace('{design}', designLevels[selectedBrand.Design - 1])
        .replace('{fame}', fameLevels[selectedBrand.Bekanntheit - 1])
        .replace('{range}', rangeLevels[selectedBrand.Sortimentsbreite - 1])
        .replace('{positioning}', positioningLevels[selectedBrand.Positionierung - 1]);

      const response = await fetch('/api/generate-seo-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptTemplate: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler bei der Textgenerierung');
      }

      const data = await response.json();
      setGeneratedText(data.text);
      setStep(4); // Springe zum Ergebnis
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Textgenerierung');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Marke auswählen</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map((brand) => (
                <button
                  key={brand.Marke}
                  onClick={() => {
                    setSelectedBrand(brand);
                    setStep(2);
                  }}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedBrand?.Marke === brand.Marke
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{brand.Marke}</h3>
                  <p className="mt-1 text-sm text-gray-500">{brand['Kurzcharakteristik 1']}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Saison auswählen</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {seasons.map((season) => (
                <button
                  key={season.id}
                  onClick={() => {
                    setSelectedSeason(season);
                    setStep(3);
                  }}
                  className={`p-6 rounded-xl border transition-all ${
                    selectedSeason?.id === season.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="text-lg font-medium text-gray-900">{season.name}</h3>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Kategorie auswählen</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category);
                    handleGenerateText();
                  }}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedCategory?.id === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  {category.subcategories && (
                    <p className="mt-1 text-sm text-gray-500">
                      {category.subcategories.join(', ')}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Generierter SEO-Text</h2>
              <button
                onClick={() => {
                  setSelectedBrand(null);
                  setSelectedSeason(null);
                  setSelectedCategory(null);
                  setGeneratedText(null);
                  setStep(1);
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Neu starten
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedBrand?.Marke}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedCategory?.name} • {selectedSeason?.name}
                    </p>
                  </div>
                </div>
                <div className="prose max-w-none">
                  {generatedText?.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 rounded-lg bg-red-50 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex space-x-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex items-center ${s !== 1 ? 'ml-4' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s === step
                      ? 'bg-blue-600 text-white'
                      : s < step
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s !== 4 && (
                  <div
                    className={`h-0.5 w-12 ml-4 ${
                      s < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            Schritt {step} von 4
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-500">Generiere SEO-Text...</p>
            </div>
          ) : (
            renderStep()
          )}
        </div>
      </div>
    </div>
  );
} 