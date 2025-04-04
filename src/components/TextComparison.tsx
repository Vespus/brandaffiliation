import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
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
      <Button
        onClick={handleCompare}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Vergleiche Texte...
          </>
        ) : (
          'Texte vergleichen'
        )}
      </Button>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {comparisonResult && (
        <Card className="p-6">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{comparisonResult}</ReactMarkdown>
          </div>
        </Card>
      )}
    </div>
  );
} 