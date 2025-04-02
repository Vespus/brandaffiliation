import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SeoTextRequest } from '@/types/seo';

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
      // Versuche die OpenAI API aufzurufen
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Du bist ein erfahrener SEO-Textautor für Mode und Lifestyle."
          },
          {
            role: "user",
            content: body.promptTemplate
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
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