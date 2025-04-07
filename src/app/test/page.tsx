'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [testValue, setTestValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTestValue() {
      try {
        const response = await fetch('/api/test');
        if (!response.ok) {
          throw new Error('Fehler beim Laden des Test-Wertes');
        }
        const data = await response.json();
        setTestValue(data.value);
      } catch (err) {
        setError('Fehler beim Laden des Test-Wertes');
      } finally {
        setLoading(false);
      }
    }

    fetchTestValue();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test-Route</h1>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">VERCEL_TEST Umgebungsvariable:</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm font-mono">{testValue || 'Nicht gesetzt'}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 