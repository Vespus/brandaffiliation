import { SeoSettings, PARAMETER_LIMITS } from '@/types/seo';

// Hilfsfunktion zur Validierung der Env-Variablen
function validateEnvVariable(name: string, value: string | undefined, type: 'number' | 'string'): string {
  if (!value) {
    throw new Error(`Environment Variable ${name} ist nicht konfiguriert`);
  }
  
  if (type === 'number') {
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new Error(`Environment Variable ${name} muss eine gültige Zahl sein`);
    }
  }
  
  return value;
}

// Hilfsfunktion zur Validierung numerischer Werte
function validateNumericValue(name: string, value: string, limits?: { min: number; max: number }): number {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    throw new Error(`${name} muss eine gültige Zahl sein`);
  }
  
  if (limits) {
    if (num < limits.min || num > limits.max) {
      throw new Error(`${name} muss zwischen ${limits.min} und ${limits.max} liegen`);
    }
  }
  
  return num;
}

export async function getSettings(): Promise<SeoSettings> {
  try {
    // Prüfe API Keys
    validateEnvVariable('OPENAI_API_KEY', process.env.OPENAI_API_KEY, 'string');
    validateEnvVariable('ANTHROPIC_API_KEY', process.env.ANTHROPIC_API_KEY, 'string');
    
    // Prüfe OpenAI Parameter
    const openaiTemperature = validateNumericValue(
      'OPENAI_TEMPERATURE',
      validateEnvVariable('OPENAI_TEMPERATURE', process.env.OPENAI_TEMPERATURE, 'number'),
      PARAMETER_LIMITS.temperature
    );
    
    const openaiTopP = validateNumericValue(
      'OPENAI_TOP_P',
      validateEnvVariable('OPENAI_TOP_P', process.env.OPENAI_TOP_P, 'number'),
      PARAMETER_LIMITS.topP
    );
    
    const openaiPresencePenalty = validateNumericValue(
      'OPENAI_PRESENCE_PENALTY',
      validateEnvVariable('OPENAI_PRESENCE_PENALTY', process.env.OPENAI_PRESENCE_PENALTY, 'number'),
      PARAMETER_LIMITS.presencePenalty
    );
    
    const openaiFrequencyPenalty = validateNumericValue(
      'OPENAI_FREQUENCY_PENALTY',
      validateEnvVariable('OPENAI_FREQUENCY_PENALTY', process.env.OPENAI_FREQUENCY_PENALTY, 'number'),
      PARAMETER_LIMITS.frequencyPenalty
    );
    
    const openaiMaxTokens = validateNumericValue(
      'OPENAI_MAX_TOKENS',
      validateEnvVariable('OPENAI_MAX_TOKENS', process.env.OPENAI_MAX_TOKENS, 'number'),
      PARAMETER_LIMITS.maxTokens
    );
    
    // Prüfe Claude Parameter
    const claudeTemperature = validateNumericValue(
      'CLAUDE_TEMPERATURE',
      validateEnvVariable('CLAUDE_TEMPERATURE', process.env.CLAUDE_TEMPERATURE, 'number'),
      PARAMETER_LIMITS.temperature
    );
    
    const claudeMaxTokens = validateNumericValue(
      'CLAUDE_MAX_TOKENS',
      validateEnvVariable('CLAUDE_MAX_TOKENS', process.env.CLAUDE_MAX_TOKENS, 'number'),
      PARAMETER_LIMITS.maxTokens
    );
    
    const claudeModel = validateEnvVariable('CLAUDE_MODEL', process.env.CLAUDE_MODEL, 'string');
    
    // Prüfe weitere Parameter
    const promptTemplate = validateEnvVariable('SEO_PROMPT_TEMPLATE', process.env.SEO_PROMPT_TEMPLATE, 'string');
    const openaiSystemRole = validateEnvVariable('OPENAI_SYSTEM_ROLE', process.env.OPENAI_SYSTEM_ROLE, 'string');

    const settings: SeoSettings = {
      hasApiKey: true,
      promptTemplate,
      openaiSystemRole,
      openaiTemperature,
      openaiTopP,
      openaiPresencePenalty,
      openaiFrequencyPenalty,
      openaiMaxTokens,
      claudeTemperature,
      claudeMaxTokens,
      claudeModel
    };

    return settings;
  } catch (error) {
    console.error('Fehler beim Laden der Einstellungen:', error);
    throw error;
  }
} 