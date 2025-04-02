'use client';

import { useState, useEffect } from 'react';
import { Brand } from '@/types/brands';
import { loadBrands } from '@/utils/loadBrands';
import BrandSearch from '@/components/BrandSearch';
import { Season, Category } from '@/types/seo';

const SEASONS: Season[] = [
  { id: 'ss', name: 'Frühjahr/Sommer' },
  { id: 'aw', name: 'Herbst/Winter' }
];

interface CategoryData extends Category {
  seoKeywords: string[];
  subcategories: string[];
}

export default function SeoTextPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<string | null>(null);
  const [promptTemplate, setPromptTemplate] = useState<string>('');

  // Lade Marken, Kategorien und Prompt Template beim Start
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

        // Lade Prompt Template von der API
        const settingsResponse = await fetch('/api/settings');
        if (!settingsResponse.ok) {
          throw new Error('Fehler beim Laden des Prompt Templates');
        }
        const settingsData = await settingsResponse.json();
        setPromptTemplate(settingsData.promptTemplate || '');
      } catch (err) {
        setError('Fehler beim Laden der Daten');
      }
    }
    fetchData();
  }, []);

  const generatePrompt = () => {
    if (!selectedBrand || !selectedSeason || !selectedCategory) {
      setError('Bitte wählen Sie eine Marke, Saison und Kategorie aus');
      return;
    }

    if (!promptTemplate) {
      setError('Prompt Template ist nicht konfiguriert');
      return;
    }

    try {
      // Übersetze die Skalenwerte in beschreibende Texte
      const priceLevels = ['günstig', 'preisgünstig', 'mittleres Preissegment', 'premium', 'luxuriös'];
      const designLevels = ['einfach', 'klassisch', 'zeitlos', 'modern', 'innovativ'];
      const fameLevels = ['neu', 'aufstrebend', 'etabliert', 'bekannt', 'Premium-Marke'];
      const rangeLevels = ['fokussiert', 'spezialisiert', 'breit', 'sehr breit', 'universell'];
      const positioningLevels = ['Mass Market', 'Premium', 'Luxus'];

      // Erstelle den Prompt mit den Markendaten
      const prompt = promptTemplate
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

      setGeneratedPrompt(prompt);
      setEditedPrompt(prompt); // Initialisiere den editierbaren Prompt
      setError(null);
    } catch (err) {
      setError('Fehler bei der Prompt-Generierung');
    }
  };

  const handleGenerateText = async () => {
    if (!editedPrompt) {
      setError('Bitte zuerst den Prompt generieren');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-seo-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptTemplate: editedPrompt,
        }),
      });

      console.log('API Antwort Status:', response.status);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler bei der Textgenerierung');
      }

      setGeneratedText(data.text);
      setGeneratedPrompt(null);
      setEditedPrompt(null);
    } catch (err) {
      console.error('Fehler Details:', err);
      setError(err instanceof Error ? err.message : 'Fehler bei der Textgenerierung');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPrompt = () => {
    if (generatedPrompt) {
      setEditedPrompt(generatedPrompt);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">SEO-Text Generator</h1>
      
      <div className="space-y-6">
        {/* Markenauswahl */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Marke auswählen</h2>
          <BrandSearch
            brands={brands}
            onSelect={setSelectedBrand}
            selectedBrand={selectedBrand}
          />
          {selectedBrand && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Ausgewählte Marke:</h3>
              <p className="text-blue-600">{selectedBrand.Marke}</p>
              <div className="mt-2 text-sm text-blue-700">
                <p>Charakteristik 1: {selectedBrand['Kurzcharakteristik 1']}</p>
                <p>Charakteristik 2: {selectedBrand['Kurzcharakteristik 2']}</p>
                {selectedBrand['Kurzcharakteristik 3 (optional)'] && (
                  <p>Charakteristik 3: {selectedBrand['Kurzcharakteristik 3 (optional)']}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Saisonauswahl */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Saison auswählen</h2>
          <div className="grid grid-cols-2 gap-4">
            {SEASONS.map((season) => (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season)}
                className={`p-4 rounded-lg border ${
                  selectedSeason?.id === season.id
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-200 hover:border-blue-500'
                }`}
              >
                {season.name}
              </button>
            ))}
          </div>
        </div>

        {/* Kategorieauswahl */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Kategorie auswählen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`p-4 rounded-lg border ${
                  selectedCategory?.id === category.id
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-200 hover:border-blue-500'
                }`}
              >
                <div className="font-semibold">{category.name}</div>
                {category.subcategories && (
                  <div className="mt-2 text-sm text-gray-600">
                    {category.subcategories.join(', ')}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Generierung und Bearbeitung */}
        <div className="mb-8">
          {!generatedPrompt ? (
            <button
              onClick={generatePrompt}
              disabled={!selectedBrand || !selectedSeason || !selectedCategory}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
                !selectedBrand || !selectedSeason || !selectedCategory
                  ? 'bg-gray-400'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              Prompt generieren
            </button>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Prompt überprüfen und anpassen</h2>
              <textarea
                value={editedPrompt || ''}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="w-full h-64 p-4 border rounded-lg font-mono text-sm"
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleResetPrompt}
                  className="py-2 px-4 rounded-lg border border-gray-300 hover:border-blue-500"
                >
                  Zurücksetzen
                </button>
                <button
                  onClick={handleGenerateText}
                  disabled={loading}
                  className={`flex-1 py-2 px-4 rounded-lg text-white font-semibold ${
                    loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {loading ? 'Generiere Text...' : 'An ChatGPT senden'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fehlermeldung */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {/* Generierter Text */}
        {generatedText && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Generierter SEO-Text</h2>
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="prose max-w-none">
                {generatedText.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 