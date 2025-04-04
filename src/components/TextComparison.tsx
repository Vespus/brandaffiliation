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
      console.log('Sende Anfrage an API...');
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

      console.log('Starte Stream-Verarbeitung...');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      let chunkCount = 0;
      const totalExpectedChunks = 100; // Schätzung der Gesamtchunks

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('Stream beendet');
            break;
          }

          console.log('Chunk empfangen:', value);
          const chunk = decoder.decode(value);
          console.log('Decodierter Chunk:', chunk);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              console.log('Verarbeite Zeile:', line);
              const data = JSON.parse(line.replace(/^data: /, '').trim());
              console.log('Parsed Daten:', data);
              
              if (data.result) {
                result += data.result;
                console.log('Aktualisiere UI mit neuem Text');
                setComparisonResult(result);
                
                // Verbesserte Fortschrittsberechnung
                chunkCount++;
                const progress = Math.min(100, (chunkCount / totalExpectedChunks) * 100);
                setStreamStatus(prev => ({
                  ...prev,
                  progress
                }));
              }
            } catch (e) {
              console.error('Fehler beim Parsen der Stream-Daten:', e, 'Zeile:', line);
            }
          }
        }
      } finally {
        console.log('Schließe Stream');
        reader.releaseLock();
      }

      console.log('Stream-Verarbeitung abgeschlossen');
      setStreamStatus(prev => ({
        ...prev,
        isComplete: true,
        progress: 100
      }));
    } catch (err) {
      console.error('Fehler in handleCompare:', err);
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
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
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