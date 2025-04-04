import { NextResponse } from 'next/server';
import { OPENAI_DEFAULTS, OPENAI_LIMITS, SeoSettings, CLAUDE_DEFAULTS } from '@/types/seo';
import { getSettings, updateClaudeMaxTokens } from '@/utils/settings';

// Hilfsfunktion zur Validierung der Werte
function validateValue(value: number, limits: { min: number; max: number }): number {
  return Math.min(Math.max(value, limits.min), limits.max);
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
    
    // Validiere die Eingabedaten
    const settings: SeoSettings = {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      promptTemplate: updates.promptTemplate || process.env.SEO_PROMPT_TEMPLATE || '',
      openaiSystemRole: updates.openaiSystemRole || process.env.OPENAI_SYSTEM_ROLE || OPENAI_DEFAULTS.systemRole,
      openaiTemperature: validateValue(
        parseFloat(updates.openaiTemperature || process.env.OPENAI_TEMPERATURE || OPENAI_DEFAULTS.temperature.toString()),
        OPENAI_LIMITS.temperature
      ),
      openaiTopP: validateValue(
        parseFloat(updates.openaiTopP || process.env.OPENAI_TOP_P || OPENAI_DEFAULTS.topP.toString()),
        OPENAI_LIMITS.topP
      ),
      openaiPresencePenalty: validateValue(
        parseFloat(updates.openaiPresencePenalty || process.env.OPENAI_PRESENCE_PENALTY || OPENAI_DEFAULTS.presencePenalty.toString()),
        OPENAI_LIMITS.presencePenalty
      ),
      openaiFrequencyPenalty: validateValue(
        parseFloat(updates.openaiFrequencyPenalty || process.env.OPENAI_FREQUENCY_PENALTY || OPENAI_DEFAULTS.frequencyPenalty.toString()),
        OPENAI_LIMITS.frequencyPenalty
      ),
      openaiMaxTokens: validateValue(
        parseInt(updates.openaiMaxTokens || process.env.OPENAI_MAX_TOKENS || OPENAI_DEFAULTS.maxTokens.toString()),
        OPENAI_LIMITS.maxTokens
      ),
      // Claude-Parameter
      claudeTemperature: parseFloat(updates.claudeTemperature || process.env.CLAUDE_TEMPERATURE || CLAUDE_DEFAULTS.temperature.toString()) || CLAUDE_DEFAULTS.temperature,
      claudeMaxTokens: parseInt(updates.claudeMaxTokens || process.env.CLAUDE_MAX_TOKENS || CLAUDE_DEFAULTS.maxTokens.toString()) || CLAUDE_DEFAULTS.maxTokens,
      claudeModel: updates.claudeModel || process.env.CLAUDE_MODEL || CLAUDE_DEFAULTS.model
    };

    // Aktualisiere den max_tokens Wert für die Laufzeit
    if (updates.claudeMaxTokens) {
      updateClaudeMaxTokens(settings.claudeMaxTokens);
      console.log('Claude max_tokens aktualisiert:', settings.claudeMaxTokens);
    }
    
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
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Speichern der Einstellungen:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Einstellungen' },
      { status: 500 }
    );
  }
} 