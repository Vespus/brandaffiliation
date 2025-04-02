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

const CATEGORIES: Category[] = [
  { id: 'damen', name: 'Damenmode' },
  { id: 'herren', name: 'Herrenmode' },
  { id: 'accessoires', name: 'Accessoires' },
  { id: 'schuhe', name: 'Schuhe' },
  { id: 'taschen', name: 'Taschen' }
];

const DEFAULT_PROMPT_TEMPLATE = `Erstelle einen SEO-optimierten Text für die Marke {brand} in der Kategorie {category} für die Saison {season}.

Markeninformationen:
- Kurzcharakteristik 1: {char1}
- Kurzcharakteristik 2: {char2}
- Kurzcharakteristik 3: {char3}

Markenprofil:
- Preisniveau: {price}
- Design: {design}
- Bekanntheit: {fame}
- Sortimentsbreite: {range}
- Positionierung: {positioning}

Der Text sollte:
1. Natürlich und flüssig lesbar sein
2. Die wichtigsten Keywords für SEO enthalten
3. Die Markenidentität und -werte widerspiegeln
4. Die Zielgruppe ansprechen
5. Call-to-Actions enthalten

Bitte generiere einen Text von 300-400 Wörtern.`;

export default function SeoTextPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  // Lade Marken beim Start
  useEffect(() => {
    async function fetchBrands() {
      try {
        const data = await loadBrands();
        setBrands(data);
      } catch (err) {
        setError('Fehler beim Laden der Markendaten');
      }
    }
    fetchBrands();
  }, []);

  const generatePrompt = () => {
    if (!selectedBrand || !selectedSeason || !selectedCategory) {
      setError('Bitte wählen Sie eine Marke, Saison und Kategorie aus');
      return;
    }

    try {
      // Hole die Einstellungen aus dem localStorage
      const settings = localStorage.getItem('seoSettings');
      let promptTemplate = DEFAULT_PROMPT_TEMPLATE;
      
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        if (parsedSettings.promptTemplate) {
          promptTemplate = parsedSettings.promptTemplate;
        }
      }

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
      setError(null);
    } catch (err) {
      setError('Fehler bei der Prompt-Generierung');
    }
  };

  const handleGenerateText = async () => {
    if (!generatedPrompt) {
      setError('Bitte zuerst den Prompt generieren');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Hole die Einstellungen aus dem localStorage
      const settings = localStorage.getItem('seoSettings');
      let apiKey = '';
      
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        apiKey = parsedSettings.openaiApiKey;
      }

      if (!apiKey) {
        throw new Error('OpenAI API-Key nicht gefunden. Bitte in den Einstellungen hinterlegen.');
      }

      console.log('Sende Anfrage an API...');
      const response = await fetch('/api/generate-seo-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          promptTemplate: generatedPrompt,
        }),
      });

      console.log('API Antwort Status:', response.status);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler bei der Textgenerierung');
      }

      setGeneratedText(data.text);
      setGeneratedPrompt(null); // Reset prompt after successful generation
    } catch (err) {
      console.error('Fehler Details:', err);
      setError(err instanceof Error ? err.message : 'Fehler bei der Textgenerierung');
    } finally {
      setLoading(false);
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
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`p-4 rounded-lg border ${
                  selectedCategory?.id === category.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt-Generierung Button */}
        <button
          onClick={generatePrompt}
          disabled={!selectedBrand || !selectedSeason || !selectedCategory}
          className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
            !selectedBrand || !selectedSeason || !selectedCategory
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          Prompt generieren
        </button>

        {/* Generierter Prompt */}
        {generatedPrompt && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Generierter Prompt</h2>
            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap mb-4">
              {generatedPrompt}
            </div>
            <button
              onClick={handleGenerateText}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {loading ? 'Generiere Text...' : 'An ChatGPT senden'}
            </button>
          </div>
        )}

        {/* Fehleranzeige */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Generierter Text */}
        {generatedText && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Generierter SEO-Text</h2>
            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
              {generatedText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 