'use client';

import { useState, useEffect } from 'react';
import { Brand } from '@/types/brands';
import { loadBrands } from '@/utils/loadBrands';
import BrandSearch from '@/components/BrandSearch';
import { Season, Category } from '@/types/seo';

// Schritte der Benutzerführung
const STEPS = [
  { id: 1, title: 'Marke, Saison und Kategorie auswählen' },
  { id: 2, title: 'Prompt überprüfen und Text generieren' },
  { id: 3, title: 'SEO-Text bearbeiten' }
];

// Verfügbare Saisons
const SEASONS: Season[] = [
  { id: 'ss', name: 'Frühjahr/Sommer' },
  { id: 'aw', name: 'Herbst/Winter' }
];

export default function SeoTextUIPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<string | null>(null);
  const [promptTemplate, setPromptTemplate] = useState<string>('');
  const [generating, setGenerating] = useState(false);

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
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Generiere den Prompt basierend auf den Auswahlen
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
      setEditedPrompt(prompt);
      setCurrentStep(2);
      setError(null);
    } catch (err) {
      setError('Fehler bei der Prompt-Generierung');
    }
  };

  // Generiere den SEO-Text
  const handleGenerateText = async () => {
    if (!editedPrompt) {
      setError('Bitte zuerst den Prompt generieren');
      return;
    }

    setGenerating(true);
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler bei der Textgenerierung');
      }

      setGeneratedText(data.text);
      setCurrentStep(3);
    } catch (err) {
      console.error('Fehler Details:', err);
      setError(err instanceof Error ? err.message : 'Fehler bei der Textgenerierung');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex-1 relative ${
                step.id === currentStep
                  ? 'text-blue-600'
                  : step.id < currentStep
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step.id === currentStep
                      ? 'border-blue-600 bg-blue-50'
                      : step.id < currentStep
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {step.id < currentStep ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                {step.id < STEPS.length && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step.id < currentStep ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  ></div>
                )}
              </div>
              <div className="text-sm mt-2">{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 mb-4">
              Wählen Sie die Marke, Saison und Kategorie für den SEO-Text aus.
            </div>
            
            {/* Markensuche */}
            <div>
              <BrandSearch
                brands={brands}
                onSelect={setSelectedBrand}
                selectedBrand={selectedBrand}
              />
            </div>

            {/* Saison Auswahl */}
            <div className="grid grid-cols-2 gap-4">
              {SEASONS.map((season) => (
                <button
                  key={season.id}
                  onClick={() => setSelectedSeason(season)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    selectedSeason?.id === season.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-500'
                  }`}
                >
                  {season.name}
                </button>
              ))}
            </div>

            {/* Kategorie Auswahl */}
            <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    selectedCategory?.id === category.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-500'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Weiter Button */}
            <div className="flex justify-end">
              <button
                onClick={generatePrompt}
                disabled={!selectedBrand || !selectedSeason || !selectedCategory}
                className={`px-6 py-2 rounded-lg text-white font-semibold ${
                  !selectedBrand || !selectedSeason || !selectedCategory
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Weiter
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 mb-4">
              Überprüfen Sie den generierten Prompt und passen Sie ihn bei Bedarf an.
            </div>
            
            <textarea
              value={editedPrompt || ''}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="w-full h-64 p-4 border rounded-lg font-mono text-sm"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:border-blue-500"
              >
                Zurück
              </button>
              <button
                onClick={handleGenerateText}
                disabled={generating}
                className={`px-6 py-2 rounded-lg text-white font-semibold ${
                  generating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {generating ? 'Generiere Text...' : 'SEO-Text erstellen'}
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 mb-4">
              Bearbeiten Sie den generierten SEO-Text nach Ihren Wünschen.
            </div>
            
            {/* Formatierungsleiste */}
            <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
              <button
                className="p-2 hover:bg-gray-100 rounded"
                title="Fett"
                onClick={() => {/* TODO: Implement formatting */}}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" />
                </svg>
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded"
                title="Kursiv"
                onClick={() => {/* TODO: Implement formatting */}}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6v12h4M14 6h4v12h-4" />
                </svg>
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded"
                title="Kopieren"
                onClick={() => navigator.clipboard.writeText(generatedText || '')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </button>
            </div>

            <textarea
              value={generatedText || ''}
              onChange={(e) => setGeneratedText(e.target.value)}
              className="w-full h-96 p-4 border rounded-lg font-mono text-sm"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:border-blue-500"
              >
                Zurück
              </button>
              <button
                onClick={() => {
                  setSelectedBrand(null);
                  setSelectedSeason(null);
                  setSelectedCategory(null);
                  setGeneratedPrompt(null);
                  setEditedPrompt(null);
                  setGeneratedText(null);
                  setCurrentStep(1);
                }}
                className="px-6 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
              >
                Neuen Text erstellen
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-50 text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 