'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import LLM_CONFIG from '../../../public/api-parameter';

// Typdefinitionen für die Konfiguration
interface BaseConfig {
  label: string;
  type: string;
  default: any;
  recommended: any;
  quicktip: string;
}

interface SliderConfig extends BaseConfig {
  type: 'slider';
  range: [number, number];
  step?: number;
  default: number;
  recommended: number;
}

interface DropdownConfig extends BaseConfig {
  type: 'dropdown';
  options: Array<{ value: string; label: string }>;
  default: string;
  recommended: string;
}

type ConfigType = SliderConfig | DropdownConfig;

interface Settings {
  [key: string]: any;
  apiKeys?: {
    openai: boolean;
    anthropic: boolean;
  };
}

export default function SettingsV2Page() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [localSliderValues, setLocalSliderValues] = useState<{[key: string]: number}>({});

  // Lade die Settings beim ersten Render
  useEffect(() => {
    fetchSettings();
  }, []);

  // Initialisiere lokale Slider-Werte wenn Settings geladen werden
  useEffect(() => {
    const sliderValues: {[key: string]: number} = {};
    Object.entries(settings).forEach(([key, value]) => {
      if (typeof value === 'number') {
        sliderValues[key] = value;
      }
    });
    setLocalSliderValues(sliderValues);
  }, [settings]);

  // Lade die aktuellen Settings
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings-v2');
      if (!response.ok) throw new Error('Fehler beim Laden der Settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      toast.error('Settings konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  // Update ein einzelnes Setting
  const updateSetting = async (key: string, value: any) => {
    try {
      const response = await fetch('/api/settings-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) throw new Error('Fehler beim Speichern');
      
      await fetchSettings();
      toast.success('Setting erfolgreich aktualisiert');
    } catch (error) {
      toast.error('Setting konnte nicht aktualisiert werden');
    }
  };

  // Reset alle Settings
  const resetAllSettings = async () => {
    try {
      const response = await fetch('/api/settings-v2', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Fehler beim Zurücksetzen');
      
      await fetchSettings(); // Aktualisiere alle Settings
      toast.success('Alle Settings wurden zurückgesetzt');
    } catch (error) {
      toast.error('Settings konnten nicht zurückgesetzt werden');
    }
  };

  // Lokale Slider-Änderung ohne API-Call
  const handleSliderChange = (key: string, value: number) => {
    setLocalSliderValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Finale Slider-Änderung mit API-Call
  const handleSliderCommit = (key: string, value: number) => {
    updateSetting(key, value);
  };

  // Render einen Slider mit Label und Quicktip
  const renderSlider = (key: string, config: SliderConfig) => (
    <div className="mb-6" key={key}>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium">{config.label}</label>
        <span className="text-sm text-gray-500">
          Aktuell: {localSliderValues[key]?.toFixed(2) || settings[key]} (Empfohlen: {config.recommended})
        </span>
      </div>
      <input
        type="range"
        min={config.range[0]}
        max={config.range[1]}
        step={config.step || 1}
        value={localSliderValues[key] ?? settings[key] ?? config.default}
        onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
        onMouseUp={(e) => handleSliderCommit(key, parseFloat((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) => handleSliderCommit(key, parseFloat((e.target as HTMLInputElement).value))}
        className="w-full"
      />
      <p className="text-xs text-gray-500 mt-1">{config.quicktip}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Erweiterte Einstellungen</h1>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="chatgpt">ChatGPT</TabsTrigger>
          <TabsTrigger value="claude">Claude</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
        </TabsList>

        {/* Allgemein Tab */}
        <TabsContent value="general">
          <div className="space-y-4 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">API Status</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${settings.apiKeys?.openai ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>OpenAI API Key: {settings.apiKeys?.openai ? 'Verfügbar' : 'Nicht verfügbar'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${settings.apiKeys?.anthropic ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>Anthropic API Key: {settings.apiKeys?.anthropic ? 'Verfügbar' : 'Nicht verfügbar'}</span>
              </div>
            </div>
            <button
              onClick={resetAllSettings}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Alle Einstellungen zurücksetzen
            </button>
          </div>
        </TabsContent>

        {/* ChatGPT Tab */}
        <TabsContent value="chatgpt">
          <div className="space-y-4 p-4 bg-white rounded-lg shadow">
            {Object.entries(LLM_CONFIG.openai).map(([key, config]) => {
              const typedConfig = config as ConfigType;
              if (typedConfig.type === 'slider') {
                return renderSlider(key, typedConfig);
              }
              return null;
            })}
          </div>
        </TabsContent>

        {/* Claude Tab */}
        <TabsContent value="claude">
          <div className="space-y-4 p-4 bg-white rounded-lg shadow">
            {Object.entries(LLM_CONFIG.claude).map(([key, config]) => {
              const typedConfig = config as ConfigType;
              if (typedConfig.type === 'slider') {
                return renderSlider(key, typedConfig);
              } else if (typedConfig.type === 'dropdown') {
                return (
                  <div className="mb-6" key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">{typedConfig.label}</label>
                    </div>
                    <select
                      value={settings[key] || typedConfig.default}
                      onChange={(e) => updateSetting(key, e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {(typedConfig as DropdownConfig).options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">{typedConfig.quicktip}</p>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts">
          <div className="space-y-4 p-4 bg-white rounded-lg shadow">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">System Role</label>
              <textarea
                value={settings.SEO_SYSTEM_ROLE || ''}
                onChange={(e) => updateSetting('SEO_SYSTEM_ROLE', e.target.value)}
                className="w-full h-32 p-2 border rounded"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Prompt Template</label>
              <textarea
                value={settings.SEO_PROMPT_TEMPLATE || ''}
                onChange={(e) => updateSetting('SEO_PROMPT_TEMPLATE', e.target.value)}
                className="w-full h-32 p-2 border rounded"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 