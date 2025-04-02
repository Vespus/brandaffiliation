'use client';

import { useState, useEffect } from 'react';

interface Settings {
  hasApiKey: boolean;
  promptTemplate: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    hasApiKey: false,
    promptTemplate: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        setSettings({
          hasApiKey: data.hasApiKey,
          promptTemplate: data.promptTemplate || '',
        });
      } catch (error) {
        console.error('Fehler beim Laden der Einstellungen:', error);
        setError('Fehler beim Laden der Einstellungen');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Einstellungen</h1>

      <div className="space-y-6">
        {/* OpenAI API Key Status */}
        <div>
          <h2 className="text-xl font-semibold mb-4">OpenAI API Key Status</h2>
          <div className={`p-4 rounded-lg ${
            settings.hasApiKey ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
          }`}>
            {settings.hasApiKey 
              ? 'OpenAI API Key ist konfiguriert und aktiv.' 
              : 'OpenAI API Key ist nicht konfiguriert. Bitte konfigurieren Sie den API Key in den Vercel Projekteinstellungen.'}
          </div>
        </div>

        {/* Prompt Template (Read-only) */}
        <div>
          <h2 className="text-xl font-semibold mb-4">SEO Prompt Template</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {settings.promptTemplate || 'Kein Prompt Template konfiguriert.'}
            </pre>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Das Prompt Template wird in den Vercel Projekteinstellungen verwaltet. 
            Änderungen können nur dort vorgenommen werden.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Verfügbare Platzhalter: {'{brand}'}, {'{category}'}, {'{season}'}, {'{char1}'}, {'{char2}'}, {'{char3}'}, {'{price}'}, {'{design}'}, {'{fame}'}, {'{range}'}, {'{positioning}'}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 