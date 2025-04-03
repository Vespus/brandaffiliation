import { NextResponse } from 'next/server';
import { OPENAI_DEFAULTS, OPENAI_LIMITS, SeoSettings } from '@/types/seo';

// Hilfsfunktion zur Validierung der Werte
function validateValue(value: number, limits: { min: number; max: number }): number {
  return Math.min(Math.max(value, limits.min), limits.max);
}

export async function GET() {
  // Sende die Einstellungen mit Standardwerten für nicht gesetzte Variablen
  const settings: SeoSettings = {
    hasApiKey: !!process.env.OPENAI_API_KEY,
    promptTemplate: process.env.SEO_PROMPT_TEMPLATE || '',
    openaiSystemRole: process.env.OPENAI_SYSTEM_ROLE || OPENAI_DEFAULTS.systemRole,
    openaiTemperature: validateValue(
      parseFloat(process.env.OPENAI_TEMPERATURE || OPENAI_DEFAULTS.temperature.toString()),
      OPENAI_LIMITS.temperature
    ),
    openaiTopP: validateValue(
      parseFloat(process.env.OPENAI_TOP_P || OPENAI_DEFAULTS.topP.toString()),
      OPENAI_LIMITS.topP
    ),
    openaiPresencePenalty: validateValue(
      parseFloat(process.env.OPENAI_PRESENCE_PENALTY || OPENAI_DEFAULTS.presencePenalty.toString()),
      OPENAI_LIMITS.presencePenalty
    ),
    openaiFrequencyPenalty: validateValue(
      parseFloat(process.env.OPENAI_FREQUENCY_PENALTY || OPENAI_DEFAULTS.frequencyPenalty.toString()),
      OPENAI_LIMITS.frequencyPenalty
    ),
    openaiMaxTokens: validateValue(
      parseInt(process.env.OPENAI_MAX_TOKENS || OPENAI_DEFAULTS.maxTokens.toString()),
      OPENAI_LIMITS.maxTokens
    )
  };

  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validiere die Eingabedaten
    const settings: SeoSettings = {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      promptTemplate: body.promptTemplate || process.env.SEO_PROMPT_TEMPLATE || '',
      openaiSystemRole: body.openaiSystemRole || process.env.OPENAI_SYSTEM_ROLE || OPENAI_DEFAULTS.systemRole,
      openaiTemperature: validateValue(
        parseFloat(body.openaiTemperature || process.env.OPENAI_TEMPERATURE || OPENAI_DEFAULTS.temperature.toString()),
        OPENAI_LIMITS.temperature
      ),
      openaiTopP: validateValue(
        parseFloat(body.openaiTopP || process.env.OPENAI_TOP_P || OPENAI_DEFAULTS.topP.toString()),
        OPENAI_LIMITS.topP
      ),
      openaiPresencePenalty: validateValue(
        parseFloat(body.openaiPresencePenalty || process.env.OPENAI_PRESENCE_PENALTY || OPENAI_DEFAULTS.presencePenalty.toString()),
        OPENAI_LIMITS.presencePenalty
      ),
      openaiFrequencyPenalty: validateValue(
        parseFloat(body.openaiFrequencyPenalty || process.env.OPENAI_FREQUENCY_PENALTY || OPENAI_DEFAULTS.frequencyPenalty.toString()),
        OPENAI_LIMITS.frequencyPenalty
      ),
      openaiMaxTokens: validateValue(
        parseInt(body.openaiMaxTokens || process.env.OPENAI_MAX_TOKENS || OPENAI_DEFAULTS.maxTokens.toString()),
        OPENAI_LIMITS.maxTokens
      )
    };

    // Hier würde normalerweise das Speichern in einer Datenbank erfolgen
    // Da wir Vercel Environment Variables verwenden, können wir nur die GET-Route aktualisieren
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Einstellungen:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Einstellungen' },
      { status: 500 }
    );
  }
} 