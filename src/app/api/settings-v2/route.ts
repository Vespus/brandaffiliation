import { NextResponse } from 'next/server';
import { getAllSettings, getSetting, setSetting, resetAllSettings, checkApiKeys, validateNumericSetting } from '@/utils/settingsStateV2';

// Liste aller Env Variablen die wir verwalten
const MANAGED_ENV_VARS = [
  'SEO_SYSTEM_ROLE',
  'SEO_PROMPT_TEMPLATE',
  'OPENAI_MAX_TOKENS',
  'OPENAI_TEMPERATURE',
  'OPENAI_TOP_P',
  'OPENAI_PRESENCE_PENALTY',
  'OPENAI_FREQUENCY_PENALTY',
  'CLAUDE_MAX_TOKENS',
  'CLAUDE_TEMPERATURE',
  'CLAUDE_MODEL'
];

export async function GET() {
  try {
    const settings = getAllSettings();
    const response: { [key: string]: any } = {};
    
    // Für jede verwaltete Env Variable
    for (const key of MANAGED_ENV_VARS) {
      const customValue = getSetting(key);
      const envValue = process.env[key];
      
      // Wenn ein Custom Value existiert, diesen verwenden, sonst den Env Value
      response[key] = customValue !== null ? customValue : envValue || null;
    }

    // API Key Status hinzufügen
    response.apiKeys = checkApiKeys();

    return NextResponse.json(response);
  } catch (error) {
    console.error('Fehler beim Abrufen der Settings:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!MANAGED_ENV_VARS.includes(key)) {
      return NextResponse.json(
        { error: 'Ungültige Setting-Variable' },
        { status: 400 }
      );
    }

    // Validierung für numerische Werte
    if (typeof value === 'number' && !validateNumericSetting(key, value)) {
      return NextResponse.json(
        { error: 'Ungültiger Wert für diese Setting-Variable' },
        { status: 400 }
      );
    }

    setSetting(key, value);

    return NextResponse.json({
      success: true,
      key,
      value
    });
  } catch (error) {
    console.error('Fehler beim Setzen des Settings:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    resetAllSettings();
    return NextResponse.json({
      success: true,
      message: 'Alle Settings wurden zurückgesetzt'
    });
  } catch (error) {
    console.error('Fehler beim Zurücksetzen der Settings:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
} 