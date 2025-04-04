export interface Season {
  id: 'ss' | 'aw';
  name: string;
}

export interface Category {
  id: 'damen' | 'herren' | 'accessoires' | 'schuhe' | 'taschen';
  name: string;
}

// Parameter Limits für Validierung
export const PARAMETER_LIMITS = {
  temperature: { min: 0.0, max: 2.0 },
  topP: { min: 0.0, max: 1.0 },
  presencePenalty: { min: -2.0, max: 2.0 },
  frequencyPenalty: { min: -2.0, max: 2.0 },
  maxTokens: { min: 100, max: 4000 }
} as const;

export interface SeoSettings {
  hasApiKey: boolean;
  promptTemplate: string;
  openaiApiKey?: string;
  openaiSystemRole: string;
  openaiTemperature: number;
  openaiTopP: number;
  openaiPresencePenalty: number;
  openaiFrequencyPenalty: number;
  openaiMaxTokens: number;
  // Claude-spezifische Einstellungen
  claudeTemperature: number;
  claudeMaxTokens: number;
  claudeModel: string;
}

export interface SeoTextRequest {
  brand: string;
  season: string;
  category: string;
  llm?: 'chatgpt' | 'claude' | 'both';
} 