import { NextResponse } from 'next/server';
import { SeoSettings, PARAMETER_LIMITS } from '@/types/seo';
import { getSettings } from '@/utils/settings';

// Hilfsfunktion zur Validierung der Werte
function validateValue(value: number, limits: { min: number; max: number }): number {
  return Math.min(Math.max(value, limits.min), limits.max);
}

// Hilfsfunktion zum Validieren von Env-Variablen
function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Environment Variable ${name} ist nicht konfiguriert`);
  }
  return value;
}

// Hilfsfunktion zum sicheren Parsen von Zahlen
function safeParseFloat(name: string, value: string): number {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    throw new Error(`${name}: Ungültiger numerischer Wert "${value}"`);
  }
  return parsed;
}

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Fehler beim Laden der Einstellungen:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler beim Laden der Einstellungen' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const updates = await request.json();
    console.log('Erhaltene Updates:', updates);
    
    // Validiere die Eingabedaten
    const settings: SeoSettings = {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      promptTemplate: updates.promptTemplate || validateEnvVar('SEO_PROMPT_TEMPLATE', process.env.SEO_PROMPT_TEMPLATE),
      openaiSystemRole: updates.openaiSystemRole || validateEnvVar('OPENAI_SYSTEM_ROLE', process.env.OPENAI_SYSTEM_ROLE),
      openaiTemperature: validateValue(
        safeParseFloat('OPENAI_TEMPERATURE',
          updates.openaiTemperature?.toString() || validateEnvVar('OPENAI_TEMPERATURE', process.env.OPENAI_TEMPERATURE)
        ),
        PARAMETER_LIMITS.temperature
      ),
      openaiTopP: validateValue(
        safeParseFloat('OPENAI_TOP_P',
          updates.openaiTopP?.toString() || validateEnvVar('OPENAI_TOP_P', process.env.OPENAI_TOP_P)
        ),
        PARAMETER_LIMITS.topP
      ),
      openaiPresencePenalty: validateValue(
        safeParseFloat('OPENAI_PRESENCE_PENALTY',
          updates.openaiPresencePenalty?.toString() || validateEnvVar('OPENAI_PRESENCE_PENALTY', process.env.OPENAI_PRESENCE_PENALTY)
        ),
        PARAMETER_LIMITS.presencePenalty
      ),
      openaiFrequencyPenalty: validateValue(
        safeParseFloat('OPENAI_FREQUENCY_PENALTY',
          updates.openaiFrequencyPenalty?.toString() || validateEnvVar('OPENAI_FREQUENCY_PENALTY', process.env.OPENAI_FREQUENCY_PENALTY)
        ),
        PARAMETER_LIMITS.frequencyPenalty
      ),
      openaiMaxTokens: validateValue(
        parseInt(updates.openaiMaxTokens?.toString() || validateEnvVar('OPENAI_MAX_TOKENS', process.env.OPENAI_MAX_TOKENS)),
        PARAMETER_LIMITS.maxTokens
      ),
      // Claude-Parameter
      claudeTemperature: validateValue(
        safeParseFloat('CLAUDE_TEMPERATURE',
          updates.claudeTemperature?.toString() || validateEnvVar('CLAUDE_TEMPERATURE', process.env.CLAUDE_TEMPERATURE)
        ),
        PARAMETER_LIMITS.temperature
      ),
      claudeMaxTokens: validateValue(
        parseInt(updates.claudeMaxTokens?.toString() || validateEnvVar('CLAUDE_MAX_TOKENS', process.env.CLAUDE_MAX_TOKENS)),
        PARAMETER_LIMITS.maxTokens
      ),
      claudeModel: updates.claudeModel || validateEnvVar('CLAUDE_MODEL', process.env.CLAUDE_MODEL)
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
      { error: error instanceof Error ? error.message : 'Fehler beim Speichern der Einstellungen' },
      { status: 500 }
    );
  }
} 