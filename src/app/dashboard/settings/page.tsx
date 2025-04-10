'use client';

import { useState, useEffect } from 'react';
import { SeoSettings, OPENAI_DEFAULTS, OPENAI_LIMITS, CLAUDE_DEFAULTS } from '@/types/seo';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SeoSettings>({
    hasApiKey: false,
    promptTemplate: '',
    openaiSystemRole: OPENAI_DEFAULTS.systemRole,
    openaiTemperature: OPENAI_DEFAULTS.temperature,
    openaiTopP: OPENAI_DEFAULTS.topP,
    openaiPresencePenalty: OPENAI_DEFAULTS.presencePenalty,
    openaiFrequencyPenalty: OPENAI_DEFAULTS.frequencyPenalty,
    openaiMaxTokens: OPENAI_DEFAULTS.maxTokens,
    // Claude Parameter
    claudeTemperature: CLAUDE_DEFAULTS.temperature,
    claudeMaxTokens: CLAUDE_DEFAULTS.maxTokens,
    claudeModel: CLAUDE_DEFAULTS.model
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Fehler beim Laden der Einstellungen:', error);
        setError('Fehler beim Laden der Einstellungen');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Einstellungen');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setError('Fehler beim Speichern der Einstellungen');
    } finally {
      setSaving(false);
    }
  };

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

        {/* OpenAI System Role */}
        <div>
          <h2 className="text-xl font-semibold mb-4">OpenAI System Role</h2>
          <textarea
            value={settings.openaiSystemRole}
            onChange={(e) => setSettings({ ...settings, openaiSystemRole: e.target.value })}
            className="w-full h-32 p-4 border rounded-lg font-mono text-sm"
            placeholder="System-Rolle für OpenAI"
          />
          <p className="mt-2 text-sm text-gray-600">
            Die System-Rolle definiert das Verhalten und die Expertise des KI-Modells.
          </p>
        </div>

        {/* OpenAI Parameter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              Temperature
              <span className="ml-2 text-gray-400 cursor-help" title="Steuert die Kreativität der Ausgabe. Niedrigere Werte (0.4-0.7) für konsistentere, vorhersehbare SEO-Texte. Höhere Werte (0.9-1.2) für kreativere, variablere Texte.">
                ⓘ
              </span>
            </h3>
            <input
              type="range"
              min={OPENAI_LIMITS.temperature.min}
              max={OPENAI_LIMITS.temperature.max}
              step="0.1"
              value={settings.openaiTemperature}
              onChange={(e) => setSettings({ ...settings, openaiTemperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Kreativ: {settings.openaiTemperature.toFixed(1)}</span>
              <span>Empfehlung: 0.4-0.7</span>
            </div>
          </div>

          {/* Top P */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              Top P
              <span className="ml-2 text-gray-400 cursor-help" title="Nucleus Sampling - Filtert Token basierend auf kumulativer Wahrscheinlichkeit. Standardwert 1.0 ist meist optimal. Reduzierung auf 0.8-0.9 für mehr Variation bei gleichbleibender Qualität.">
                ⓘ
              </span>
            </h3>
            <input
              type="range"
              min={OPENAI_LIMITS.topP.min}
              max={OPENAI_LIMITS.topP.max}
              step="0.1"
              value={settings.openaiTopP}
              onChange={(e) => setSettings({ ...settings, openaiTopP: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Wert: {settings.openaiTopP.toFixed(1)}</span>
              <span>Empfehlung: 0.8-1.0</span>
            </div>
          </div>

          {/* Presence Penalty */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              Presence Penalty
              <span className="ml-2 text-gray-400 cursor-help" title="Bestraft die Wiederholung von Themen. Werte 0.2-0.4 sind optimal für SEO-Texte. Hilft bei der Vermeidung von thematischen Schleifen.">
                ⓘ
              </span>
            </h3>
            <input
              type="range"
              min={OPENAI_LIMITS.presencePenalty.min}
              max={OPENAI_LIMITS.presencePenalty.max}
              step="0.1"
              value={settings.openaiPresencePenalty}
              onChange={(e) => setSettings({ ...settings, openaiPresencePenalty: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Wert: {settings.openaiPresencePenalty.toFixed(1)}</span>
              <span>Empfehlung: 0.2-0.4</span>
            </div>
          </div>

          {/* Frequency Penalty */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              Frequency Penalty
              <span className="ml-2 text-gray-400 cursor-help" title="Bestraft die Wiederholung einzelner Wörter/Phrasen. Werte 0.2-0.5 sind ideal für SEO. Besonders wichtig bei längeren Texten.">
                ⓘ
              </span>
            </h3>
            <input
              type="range"
              min={OPENAI_LIMITS.frequencyPenalty.min}
              max={OPENAI_LIMITS.frequencyPenalty.max}
              step="0.1"
              value={settings.openaiFrequencyPenalty}
              onChange={(e) => setSettings({ ...settings, openaiFrequencyPenalty: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Wert: {settings.openaiFrequencyPenalty.toFixed(1)}</span>
              <span>Empfehlung: 0.2-0.5</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              Max Tokens
              <span className="ml-2 text-gray-400 cursor-help" title="Begrenzt die Länge des generierten Textes. 512-800 für Kategorietexte, 1000+ für Blogartikel. Wichtig für die Kostenkontrolle.">
                ⓘ
              </span>
            </h3>
            <input
              type="number"
              min={OPENAI_LIMITS.maxTokens.min}
              max={OPENAI_LIMITS.maxTokens.max}
              value={settings.openaiMaxTokens}
              onChange={(e) => setSettings({ ...settings, openaiMaxTokens: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
            />
            <div className="text-sm text-gray-600 mt-1">
              Empfehlung: 512-800 für Kategorietexte, 1000+ für Blogartikel
            </div>
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

        {/* Claude Parameter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Claude Temperature */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              Claude Temperature
              <span className="ml-2 text-gray-400 cursor-help" title="Steuert die Kreativität der Ausgabe von Claude. Niedrigere Werte (0.4-0.7) für konsistentere, vorhersehbare Texte. Höhere Werte (0.9-1.2) für kreativere, variablere Texte.">
                ⓘ
              </span>
            </h3>
            <input
              type="range"
              min={OPENAI_LIMITS.temperature.min}
              max={OPENAI_LIMITS.temperature.max}
              step="0.1"
              value={settings.claudeTemperature}
              onChange={(e) => setSettings({ ...settings, claudeTemperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Kreativ: {settings.claudeTemperature.toFixed(1)}</span>
              <span>Empfehlung: 0.4-0.7</span>
            </div>
          </div>

          {/* Claude Max Tokens */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              Claude Max Tokens
              <span className="ml-2 text-gray-400 cursor-help" title="Begrenzt die Länge des generierten Textes von Claude. 512-800 für Kategorietexte, 1000+ für Blogartikel. Wichtig für die Kostenkontrolle.">
                ⓘ
              </span>
            </h3>
            <input
              type="number"
              min={OPENAI_LIMITS.maxTokens.min}
              max={OPENAI_LIMITS.maxTokens.max}
              value={settings.claudeMaxTokens}
              onChange={(e) => setSettings({ ...settings, claudeMaxTokens: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
            />
            <div className="text-sm text-gray-600 mt-1">
              Empfehlung: 512-800 für Kategorietexte, 1000+ für Blogartikel
            </div>
          </div>

          {/* Claude Model */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              Claude Model
              <span className="ml-2 text-gray-400 cursor-help" title="Wählt das Modell für Claude aus. Claude ist ein KI-Modell, das auf GPT-3 basiert. Es gibt verschiedene Modelle mit unterschiedlichen Eigenschaften.">
                ⓘ
              </span>
            </h3>
            <select
              value={settings.claudeModel}
              onChange={(e) => setSettings({ ...settings, claudeModel: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value={CLAUDE_DEFAULTS.model}>Claude</option>
              {/* Add more options as needed */}
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-lg text-white font-semibold ${
              saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {saving ? 'Speichern...' : 'Einstellungen speichern'}
          </button>
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