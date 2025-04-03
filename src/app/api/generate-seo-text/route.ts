import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SeoTextRequest, OPENAI_DEFAULTS, OPENAI_LIMITS } from '@/types/seo';

const DEFAULT_PROMPT_TEMPLATE = `Erstelle einen SEO-optimierten Text für die Marke {brand} in der Kategorie {category} für die Saison {season}.

Markeninformationen:
- Kurzcharakteristik 1: {char1}
- Kurzcharakteristik 2: {char2}
- Kurzcharakteristik 3: {char3}

Markenprofil:
- Preisniveau: {price}
- Design: {design}
- Bekanntheit: {fame}
- Sortimentsbreite: {range}
- Positionierung: {positioning}

Der Text sollte:
1. Natürlich und flüssig lesbar sein
2. Die wichtigsten Keywords für SEO enthalten
3. Die Markenidentität und -werte widerspiegeln
4. Die Zielgruppe ansprechen
5. Call-to-Actions enthalten

Bitte generiere einen Text von 300-400 Wörtern.`;

export const runtime = 'edge'; // Wichtig für längere Ausführungszeiten

export async function POST(request: Request) {
  try {
    // Prüfe ob API Key in Umgebungsvariablen vorhanden ist
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API-Key ist nicht konfiguriert' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validiere das Prompt-Template
    if (!body.promptTemplate) {
      return NextResponse.json(
        { error: 'Prompt-Template ist erforderlich' },
        { status: 400 }
      );
    }

    // Initialisiere OpenAI mit dem API-Key aus den Umgebungsvariablen
    const openai = new OpenAI({
      apiKey: apiKey,
      timeout: 60000, // 60 Sekunden Timeout
    });

    try {
      // Hole die aktuellen Einstellungen
      let settings;
      try {
        const settingsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/settings`);
        if (!settingsResponse.ok) {
          throw new Error('Fehler beim Laden der Einstellungen');
        }
        settings = await settingsResponse.json();
      } catch (settingsError) {
        console.error('Fehler beim Laden der Einstellungen:', settingsError);
        // Verwende Standardwerte bei Fehler
        settings = {
          openaiSystemRole: OPENAI_DEFAULTS.systemRole,
          openaiTemperature: OPENAI_DEFAULTS.temperature,
          openaiTopP: OPENAI_DEFAULTS.topP,
          openaiPresencePenalty: OPENAI_DEFAULTS.presencePenalty,
          openaiFrequencyPenalty: OPENAI_DEFAULTS.frequencyPenalty,
          openaiMaxTokens: OPENAI_DEFAULTS.maxTokens
        };
      }

      // Validiere die Einstellungen
      const validatedSettings = {
        openaiSystemRole: settings.openaiSystemRole || OPENAI_DEFAULTS.systemRole,
        openaiTemperature: Math.min(Math.max(
          settings.openaiTemperature || OPENAI_DEFAULTS.temperature,
          OPENAI_LIMITS.temperature.min
        ), OPENAI_LIMITS.temperature.max),
        openaiTopP: Math.min(Math.max(
          settings.openaiTopP || OPENAI_DEFAULTS.topP,
          OPENAI_LIMITS.topP.min
        ), OPENAI_LIMITS.topP.max),
        openaiPresencePenalty: Math.min(Math.max(
          settings.openaiPresencePenalty || OPENAI_DEFAULTS.presencePenalty,
          OPENAI_LIMITS.presencePenalty.min
        ), OPENAI_LIMITS.presencePenalty.max),
        openaiFrequencyPenalty: Math.min(Math.max(
          settings.openaiFrequencyPenalty || OPENAI_DEFAULTS.frequencyPenalty,
          OPENAI_LIMITS.frequencyPenalty.min
        ), OPENAI_LIMITS.frequencyPenalty.max),
        openaiMaxTokens: Math.min(Math.max(
          settings.openaiMaxTokens || OPENAI_DEFAULTS.maxTokens,
          OPENAI_LIMITS.maxTokens.min
        ), OPENAI_LIMITS.maxTokens.max)
      };

      // Versuche die OpenAI API aufzurufen
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: validatedSettings.openaiSystemRole
          },
          {
            role: "user",
            content: body.promptTemplate
          }
        ],
        temperature: validatedSettings.openaiTemperature,
        top_p: validatedSettings.openaiTopP,
        presence_penalty: validatedSettings.openaiPresencePenalty,
        frequency_penalty: validatedSettings.openaiFrequencyPenalty,
        max_tokens: validatedSettings.openaiMaxTokens,
      });

      // Extrahiere den generierten Text
      const generatedText = completion.choices[0]?.message?.content;

      if (!generatedText) {
        throw new Error('Keine Antwort von OpenAI erhalten');
      }

      // Sende erfolgreiche Antwort
      return new NextResponse(
        JSON.stringify({ text: generatedText }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

    } catch (openaiError) {
      console.error('OpenAI API Fehler:', openaiError);
      
      // Spezifische Fehlerbehandlung für OpenAI Fehler
      let errorMessage = 'Fehler bei der Kommunikation mit OpenAI';
      let statusCode = 400;

      if (openaiError instanceof Error) {
        errorMessage = openaiError.message;
        // Timeout oder Netzwerkfehler
        if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
          statusCode = 504;
        }
      }
      
      return new NextResponse(
        JSON.stringify({ error: errorMessage }),
        {
          status: statusCode,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

  } catch (error) {
    // Allgemeine Fehlerbehandlung
    console.error('Server Fehler:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Interner Server Fehler' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 