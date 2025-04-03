export interface Season {
  id: 'ss' | 'aw';
  name: string;
}

export interface Category {
  id: 'damen' | 'herren' | 'accessoires' | 'schuhe' | 'taschen';
  name: string;
}

// OpenAI Parameter Konstanten
export const OPENAI_DEFAULTS = {
  systemRole: "Du bist ein erfahrener SEO-Textautor für Mode und Lifestyle.",
  temperature: 0.7,
  topP: 1.0,
  presencePenalty: 0.3,
  frequencyPenalty: 0.3,
  maxTokens: 800
} as const;

export const OPENAI_LIMITS = {
  temperature: { min: 0.0, max: 2.0 },
  topP: { min: 0.0, max: 1.0 },
  presencePenalty: { min: -2.0, max: 2.0 },
  frequencyPenalty: { min: -2.0, max: 2.0 },
  maxTokens: { min: 100, max: 4000 }
} as const;

export interface SeoSettings {
  hasApiKey: boolean;
  promptTemplate: string;
  openaiSystemRole: string;
  openaiTemperature: number;
  openaiTopP: number;
  openaiPresencePenalty: number;
  openaiFrequencyPenalty: number;
  openaiMaxTokens: number;
}

export interface SeoTextRequest {
  brand: {
    Marke: string;
    'Kurzcharakteristik 1': string;
    'Kurzcharakteristik 2': string;
    'Kurzcharakteristik 3 (optional)': string;
    Preis: number;
    Design: number;
    Bekanntheit: number;
    Sortimentsbreite: number;
    Positionierung: number;
  };
  season: Season;
  category: Category;
} 