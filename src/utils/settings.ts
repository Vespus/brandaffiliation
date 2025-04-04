import { SeoSettings, OPENAI_DEFAULTS, CLAUDE_DEFAULTS } from '@/types/seo';

// Speichere den aktuellen Wert für die Laufzeit
let currentClaudeMaxTokens: number | null = null;

export async function getSettings(): Promise<SeoSettings> {
  // Wenn kein Laufzeit-Wert gesetzt ist, verwende die Environment Variable
  if (currentClaudeMaxTokens === null) {
    const envMaxTokens = process.env.CLAUDE_MAX_TOKENS;
    currentClaudeMaxTokens = envMaxTokens ? parseInt(envMaxTokens) : CLAUDE_DEFAULTS.maxTokens;
  }

  const settings: SeoSettings = {
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    promptTemplate: process.env.SEO_PROMPT_TEMPLATE || '',
    openaiSystemRole: process.env.OPENAI_SYSTEM_ROLE || OPENAI_DEFAULTS.systemRole,
    openaiTemperature: parseFloat(process.env.OPENAI_TEMPERATURE || '') || OPENAI_DEFAULTS.temperature,
    openaiTopP: parseFloat(process.env.OPENAI_TOP_P || '') || OPENAI_DEFAULTS.topP,
    openaiPresencePenalty: parseFloat(process.env.OPENAI_PRESENCE_PENALTY || '') || OPENAI_DEFAULTS.presencePenalty,
    openaiFrequencyPenalty: parseFloat(process.env.OPENAI_FREQUENCY_PENALTY || '') || OPENAI_DEFAULTS.frequencyPenalty,
    openaiMaxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '') || OPENAI_DEFAULTS.maxTokens,
    // Claude-Parameter
    claudeTemperature: parseFloat(process.env.CLAUDE_TEMPERATURE || '') || CLAUDE_DEFAULTS.temperature,
    claudeMaxTokens: currentClaudeMaxTokens,
    claudeModel: process.env.CLAUDE_MODEL || CLAUDE_DEFAULTS.model
  };

  return settings;
}

// Funktion zum Aktualisieren des max_tokens Wertes während der Laufzeit
export function updateClaudeMaxTokens(newValue: number): void {
  currentClaudeMaxTokens = newValue;
} 