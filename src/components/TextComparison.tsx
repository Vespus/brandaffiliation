import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface TextComparisonProps {
  openaiText: string;
  anthropicText: string;
  textTopic?: string;
}

export function TextComparison({ openaiText, anthropicText, textTopic }: TextComparisonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);

  const handleCompare = async () => {
    setIsLoading(true);
    setError(null);
    setComparisonResult(null);

    try {
      const response = await fetch('/api/compare-texts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          openaiText,
          anthropicText,
          textTopic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ein Fehler ist aufgetreten');
      }

      const data = await response.json();
      setComparisonResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleCompare}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Vergleiche Texte...' : 'Texte vergleichen'}
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {comparisonResult && (
        <div className="p-6 border rounded">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{comparisonResult}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
} 