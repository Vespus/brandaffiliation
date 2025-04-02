'use client';

import { useState, useEffect } from 'react';
import { SeoSettings } from '@/types/seo';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SeoSettings>({
    openaiApiKey: '',
    promptTemplate: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Lade Einstellungen von der API
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        // Lade gespeicherte Einstellungen aus localStorage als Fallback
        const savedSettings = localStorage.getItem('seoSettings');
        let localSettings = {};
        
        if (savedSettings) {
          try {
            localSettings = JSON.parse(savedSettings);
          } catch (e) {
            console.error('Fehler beim Laden der lokalen Einstellungen:', e);
          }
        }

        setSettings({
          openaiApiKey: data.hasApiKey ? '********' : '',
          promptTemplate: data.promptTemplate || '',
          ...localSettings
        });
      } catch (error) {
        console.error('Fehler beim Laden der Einstellungen:', error);
        setMessage({
          type: 'error',
          text: 'Fehler beim Laden der Einstellungen'
        });
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Speichere Einstellungen im localStorage
      localStorage.setItem('seoSettings', JSON.stringify(settings));
      
      // Speichere API-Key in der Umgebungsvariable (nur für die aktuelle Sitzung)
      process.env.OPENAI_API_KEY = settings.openaiApiKey;
      
      setMessage({
        type: 'success',
        text: 'Einstellungen erfolgreich gespeichert'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Fehler beim Speichern der Einstellungen'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Einstellungen</h1>

      <div className="space-y-6">
        {/* OpenAI API Key */}
        <div>
          <h2 className="text-xl font-semibold mb-4">OpenAI API Key</h2>
          <input
            type="password"
            value={settings.openaiApiKey}
            onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="sk-..."
          />
          <p className="mt-2 text-sm text-gray-600">
            Der API-Key wird nur lokal gespeichert und nicht an Server gesendet.
          </p>
        </div>

        {/* Prompt Template */}
        <div>
          <h2 className="text-xl font-semibold mb-4">SEO Prompt Template</h2>
          <textarea
            value={settings.promptTemplate}
            onChange={(e) => setSettings({ ...settings, promptTemplate: e.target.value })}
            className="w-full p-2 border rounded-lg h-64"
            placeholder="Geben Sie hier Ihr Prompt-Template ein..."
          />
          <p className="mt-2 text-sm text-gray-600">
            Verfügbare Platzhalter: {'{brand}'}, {'{category}'}, {'{season}'}, {'{char1}'}, {'{char2}'}, {'{char3}'}, {'{price}'}, {'{design}'}, {'{fame}'}, {'{range}'}, {'{positioning}'}
          </p>
        </div>

        {/* Speichern Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
            saving ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {saving ? 'Speichere...' : 'Einstellungen speichern'}
        </button>

        {/* Statusmeldung */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
} 