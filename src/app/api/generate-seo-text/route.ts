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

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validiere die erforderlichen Felder
    if (!body.apiKey) {
      return NextResponse.json(
        { error: 'API-Key ist erforderlich' },
        { status: 400 }
      );
    }

    if (!body.promptTemplate) {
      return NextResponse.json(
        { error: 'Prompt-Template ist erforderlich' },
        { status: 400 }
      );
    }

    // Initialisiere OpenAI mit dem API-Key aus dem Request
    const openai = new OpenAI({
      apiKey: body.apiKey
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
      const generatedText = completion.choices[0].message.content;

      if (!generatedText) {
        throw new Error('Keine Antwort von OpenAI erhalten');
      }

      // Sende erfolgreiche Antwort
      return NextResponse.json({ text: generatedText });

    } catch (openaiError) {
      console.error('OpenAI API Fehler:', openaiError);
      
      // Spezifische Fehlerbehandlung für OpenAI Fehler
      if (openaiError instanceof Error) {
        return NextResponse.json(
          { error: `OpenAI Fehler: ${openaiError.message}` },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Fehler bei der Kommunikation mit OpenAI' },
        { status: 400 }
      );
    }

  } catch (error) {
    // Allgemeine Fehlerbehandlung
    console.error('Server Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Server Fehler' },
      { status: 500 }
    );
  }
} 