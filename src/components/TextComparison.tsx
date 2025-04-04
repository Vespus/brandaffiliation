import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { StreamStatus } from '@/types/api';

interface TextComparisonProps {
  openaiText: string;
  anthropicText: string;
  textTopic?: string;
}

export function TextComparison({ openaiText, anthropicText, textTopic }: TextComparisonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    isComplete: false,
    error: null,
    progress: 0
  });

  const handleCompare = async () => {
    setIsLoading(true);
    setError(null);
    setComparisonResult(null);
    setStreamStatus({
      isComplete: false,
      error: null,
      progress: 0
    });

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

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Keine Antwort vom Server erhalten');
      }

      let result = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line.replace(/^data: /, '').trim());
            if (data.result) {
              result += data.result;
              setComparisonResult(result);
              setStreamStatus(prev => ({
                ...prev,
                progress: (result.length / 1000) * 100 // Schätzung des Fortschritts
              }));
            }
          } catch (e) {
            console.error('Fehler beim Parsen der Stream-Daten:', e);
          }
        }
      }

      setStreamStatus(prev => ({
        ...prev,
        isComplete: true,
        progress: 100
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
      setStreamStatus(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      }));
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

      {streamStatus.progress > 0 && !streamStatus.isComplete && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${streamStatus.progress}%` }}
          ></div>
        </div>
      )}

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