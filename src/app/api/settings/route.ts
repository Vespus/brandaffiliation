import { NextResponse } from 'next/server';
import { SeoSettings, PARAMETER_LIMITS } from '@/types/seo';
import { getSettings } from '@/utils/settings';

// Hilfsfunktion zur Validierung der Werte
function validateValue(value: number, limits: { min: number; max: number }): number {
  return Math.min(Math.max(value, limits.min), limits.max);
}

// Hilfsfunktion zum sicheren Parsen von Zahlen
function safeParseInt(value: any, defaultValue: number): number {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value.toString());
  return isNaN(parsed) ? defaultValue : parsed;
}

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Fehler beim Laden der Einstellungen:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Einstellungen' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const updates = await request.json();
    console.log('Erhaltene Updates:', updates); // Debug-Log
    
    // Validiere die Eingabedaten
    const settings: SeoSettings = {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      promptTemplate: updates.promptTemplate || process.env.SEO_PROMPT_TEMPLATE || '',
      openaiSystemRole: updates.openaiSystemRole || process.env.OPENAI_SYSTEM_ROLE || '',
      openaiTemperature: validateValue(
        parseFloat(updates.openaiTemperature || process.env.OPENAI_TEMPERATURE || '0.7'),
        PARAMETER_LIMITS.temperature
      ),
      openaiTopP: validateValue(
        parseFloat(updates.openaiTopP || process.env.OPENAI_TOP_P || '1.0'),
        PARAMETER_LIMITS.topP
      ),
      openaiPresencePenalty: validateValue(
        parseFloat(updates.openaiPresencePenalty || process.env.OPENAI_PRESENCE_PENALTY || '0.0'),
        PARAMETER_LIMITS.presencePenalty
      ),
      openaiFrequencyPenalty: validateValue(
        parseFloat(updates.openaiFrequencyPenalty || process.env.OPENAI_FREQUENCY_PENALTY || '0.0'),
        PARAMETER_LIMITS.frequencyPenalty
      ),
      openaiMaxTokens: validateValue(
        parseInt(updates.openaiMaxTokens || process.env.OPENAI_MAX_TOKENS || '800'),
        PARAMETER_LIMITS.maxTokens
      ),
      // Claude-Parameter
      claudeTemperature: validateValue(
        parseFloat(updates.claudeTemperature?.toString() || process.env.CLAUDE_TEMPERATURE || '0.7'),
        PARAMETER_LIMITS.temperature
      ),
      claudeMaxTokens: validateValue(
        safeParseInt(updates.claudeMaxTokens, parseInt(process.env.CLAUDE_MAX_TOKENS || '800')),
        PARAMETER_LIMITS.maxTokens
      ),
      claudeModel: updates.claudeModel || process.env.CLAUDE_MODEL || 'claude-2'
    };
    
    // Debug-Ausgabe der aktuellen Einstellungen
    console.log('Aktuelle API-Einstellungen:', {
      openai: {
        temperature: settings.openaiTemperature,
        top_p: settings.openaiTopP,
        presence_penalty: settings.openaiPresencePenalty,
        frequency_penalty: settings.openaiFrequencyPenalty,
        max_tokens: settings.openaiMaxTokens
      },
      claude: {
        temperature: settings.claudeTemperature,
        max_tokens: settings.claudeMaxTokens,
        model: settings.claudeModel
      }
    });
    
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Fehler beim Speichern der Einstellungen:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Einstellungen' },
      { status: 500 }
    );
  }
} 