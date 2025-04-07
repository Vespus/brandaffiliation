import LLM_CONFIG from '../../public/api-parameter';

// Typen für die Settings
type SettingValue = string | number | null;

interface Settings {
  [key: string]: SettingValue;
}

// Globaler State für alle Settings
let settings: Settings = {};

// Funktion zum Abrufen aller Settings
export function getAllSettings(): Settings {
  return settings;
}

// Funktion zum Abrufen eines einzelnen Settings
export function getSetting(key: string): SettingValue {
  return settings[key] ?? null;
}

// Funktion zum Setzen eines Settings
export function setSetting(key: string, value: SettingValue): void {
  settings[key] = value;
}

// Funktion zum Zurücksetzen aller Settings
export function resetAllSettings(): void {
  settings = {};
}

// Funktion zur Validierung numerischer Werte
export function validateNumericSetting(key: string, value: number): boolean {
  const openaiConfig = LLM_CONFIG.openai[key as keyof typeof LLM_CONFIG.openai];
  const claudeConfig = LLM_CONFIG.claude[key as keyof typeof LLM_CONFIG.claude];
  const config = openaiConfig || claudeConfig;

  if (!config || config.type !== 'slider') return false;

  return value >= config.range[0] && value <= config.range[1];
}

// Funktion zum Prüfen ob API Keys gesetzt sind
export function checkApiKeys(): { openai: boolean; anthropic: boolean } {
  return {
    openai: Boolean(process.env.OPENAI_API_KEY),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY)
  };
} 