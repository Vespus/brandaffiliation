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
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<{
    chatgpt?: string;
    claude?: string;
  } | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<string | null>(null);
  const [promptTemplate, setPromptTemplate] = useState<string>('');
  const [selectedLLM, setSelectedLLM] = useState<'chatgpt' | 'claude' | 'both'>('chatgpt');
  const [activeTab, setActiveTab] = useState<'chatgpt' | 'claude' | 'comparison'>('chatgpt');
  const [generating, setGenerating] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);

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
      const priceLevels = ['sehr günstig', 'günstig-mittleres Segment', 'mittlere Preislage', 'gehoben', 'Luxus'];
      const designLevels = ['klassisch/traditionell', 'leicht modernisiert', 'modern', 'modisch-trendig', 'avantgardistisch'];
      const fameLevels = ['Nische', 'klein-regional', 'Große Zahl treuer Markenfans', 'weit verbreitet', 'globaler Mainstream'];
      const rangeLevels = ['nur 1 Produktkategorie', 'wenige Kategorien', 'moderat diversifiziert', 'breites Sortiment', 'sehr breit (inkl. Unterlinien)'];
      const positioningLevels = ['sportiv/casual', 'Mix aus Business & Casual', 'Business-orientiert'];

      // Erstelle den Prompt mit den Markendaten
      const prompt = promptTemplate
        .replace('{brand}', selectedBrand.Marke)
        .replace('{category}', selectedCategory)
        .replace('{season}', selectedSeason)
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
    if (!editedPrompt) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/generate-seo-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand: selectedBrand?.Marke,
          season: selectedSeason,
          category: selectedCategory,
          llm: selectedLLM,
          brandDetails: selectedBrand ? {
            char1: selectedBrand['Kurzcharakteristik 1'],
            char2: selectedBrand['Kurzcharakteristik 2'],
            char3: selectedBrand['Kurzcharakteristik 3 (optional)'],
            price: selectedBrand.Preis.toString(),
            design: selectedBrand.Design.toString(),
            fame: selectedBrand.Bekanntheit.toString(),
            range: selectedBrand.Sortimentsbreite.toString(),
            positioning: selectedBrand.Positionierung.toString()
          } : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler bei der Textgenerierung');
      }

      const result = await response.json();
      setGeneratedText(result);
      setCurrentStep(3);
    } catch (error) {
      setError('Fehler bei der Textgenerierung');
    } finally {
      setGenerating(false);
    }
  };

  // Formatierungsfunktionen
  const formatText = (type: 'bold' | 'italic') => {
    if (!generatedText) return;
    
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = generatedText.chatgpt || generatedText.claude || '';
    
    if (selectedText) {
      const prefix = type === 'bold' ? '**' : '_';
      const newText = 
        selectedText.substring(0, start) +
        `${prefix}${selectedText.substring(start, end)}${prefix}` +
        selectedText.substring(end);
      
      setGeneratedText({
        ...generatedText,
        [selectedLLM]: newText,
      });
      
      // Setze die Cursor-Position nach der Formatierung
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          end + prefix.length
        );
      }, 0);
    }
  };

  // Funktion zum Vergleichen der Texte
  const handleCompareTexts = async () => {
    if (!generatedText?.chatgpt || !generatedText?.claude) {
      setError('Beide Texte müssen generiert sein, um einen Vergleich durchzuführen');
      return;
    }

    setComparing(true);
    setError(null);
    setComparisonResult(null);
    setActiveTab('comparison'); // Wechsle sofort zum Vergleich-Tab

    try {
      console.log('Sende Anfrage an API...');
      const response = await fetch('/api/compare-texts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          openaiText: generatedText.chatgpt,
          anthropicText: generatedText.claude,
          textTopic: `${selectedBrand?.Marke} - ${selectedCategory} (${selectedSeason})`,
          useStream: true
        }),
      });

      console.log('API Antwort erhalten:', response.status, response.statusText);
      console.log('Content-Type:', response.headers.get('content-type'));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Fehler:', errorData);
        throw new Error(errorData.error || 'Ein Fehler ist aufgetreten');
      }

      if (!response.body) {
        console.error('Kein Response Body');
        throw new Error('Keine Antwort vom Server erhalten');
      }

      // Prüfe, ob wir einen Stream erhalten
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('text/event-stream')) {
        console.error('Unerwarteter Content-Type:', contentType);
        throw new Error('Server sendet keinen Stream');
      }

      console.log('Starte Stream-Verarbeitung...');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      let chunkCount = 0;
      let lastUpdateTime = Date.now();
      const updateInterval = 50; // Reduziertes Update-Intervall für flüssigere Updates

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('Stream beendet');
            break;
          }

          const chunk = decoder.decode(value);
          console.log('Chunk empfangen, Länge:', chunk.length);
          
          // Verarbeite SSE-Format
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;

            try {
              const jsonStr = line.replace(/^data: /, '').trim();
              if (!jsonStr) continue;

              const data = JSON.parse(jsonStr);
              console.log('Verarbeite Daten:', data);
              
              if (data.result) {
                result += data.result;
                chunkCount++;
                
                // UI-Update mit kürzerem Intervall
                const now = Date.now();
                if (now - lastUpdateTime >= updateInterval) {
                  console.log('Aktualisiere UI mit neuem Text');
                  setComparisonResult(result);
                  lastUpdateTime = now;
                }
              }
            } catch (e) {
              console.error('Fehler beim Parsen der Stream-Daten:', e, 'Zeile:', line);
              // Ignoriere Parsing-Fehler für einzelne Chunks
              continue;
            }
          }
        }
      } finally {
        console.log('Schließe Stream');
        reader.releaseLock();
      }

      // Finale UI-Aktualisierung
      console.log('Stream-Verarbeitung abgeschlossen');
      setComparisonResult(result);
    } catch (error) {
      console.error('Fehler in handleCompareTexts:', error);
      setError(error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten');
    } finally {
      setComparing(false);
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
                  onClick={() => setSelectedSeason(season.name)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    selectedSeason === season.name
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
                  onClick={() => setSelectedCategory(category.name)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    selectedCategory === category.name
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
              Wählen Sie das KI-Modell und überprüfen Sie den generierten Prompt.
            </div>

            <div className="space-y-4 mb-6">
              <label className="block text-sm font-medium text-gray-700">KI-Modell auswählen</label>
              <div className="flex space-x-4">
                <button
                  className={`px-4 py-2 rounded-lg ${
                    selectedLLM === 'chatgpt'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setSelectedLLM('chatgpt')}
                >
                  ChatGPT
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${
                    selectedLLM === 'claude'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setSelectedLLM('claude')}
                >
                  Claude
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${
                    selectedLLM === 'both'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setSelectedLLM('both')}
                >
                  Beide
                </button>
              </div>
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
                className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400"
              >
                {generating ? 'Generiere...' : 'Text generieren'}
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('chatgpt')}
                  className={`${
                    activeTab === 'chatgpt'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  ChatGPT
                </button>
                <button
                  onClick={() => setActiveTab('claude')}
                  className={`${
                    activeTab === 'claude'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Claude
                </button>
                {generatedText?.chatgpt && generatedText?.claude && (
                  <button
                    onClick={() => setActiveTab('comparison')}
                    className={`${
                      activeTab === 'comparison'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Textvergleich
                  </button>
                )}
              </nav>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => formatText('bold')}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Fett
                </button>
                <button
                  onClick={() => formatText('italic')}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Kursiv
                </button>
              </div>
              {generatedText?.chatgpt && generatedText?.claude && !comparing && (
                <button
                  onClick={handleCompareTexts}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Texte vergleichen
                </button>
              )}
              {comparing && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-500">Vergleiche Texte...</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="mt-4">
              {activeTab === 'chatgpt' && (
                <textarea
                  value={generatedText?.chatgpt || ''}
                  onChange={(e) =>
                    setGeneratedText((prev) => ({
                      ...prev,
                      chatgpt: e.target.value,
                    }))
                  }
                  className="w-full h-96 p-4 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              )}
              {activeTab === 'claude' && (
                <textarea
                  value={generatedText?.claude || ''}
                  onChange={(e) =>
                    setGeneratedText((prev) => ({
                      ...prev,
                      claude: e.target.value,
                    }))
                  }
                  className="w-full h-96 p-4 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              )}
              {activeTab === 'comparison' && (
                <div className="prose max-w-none">
                  {comparing ? (
                    <div className="p-4 border border-gray-300 rounded-md">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="text-sm text-gray-500">Vergleiche Texte...</span>
                      </div>
                      {comparisonResult && (
                        <div 
                          className="whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: comparisonResult.replace(/\n/g, '<br>') }}
                        />
                      )}
                    </div>
                  ) : comparisonResult ? (
                    <div 
                      className="p-4 border border-gray-300 rounded-md whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: comparisonResult.replace(/\n/g, '<br>') }}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <button
                        onClick={handleCompareTexts}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Texte vergleichen
                      </button>
                    </div>
                  )}
                </div>
              )}
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