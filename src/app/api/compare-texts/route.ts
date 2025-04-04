import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSettings } from '@/utils/settings';
import { processStream } from '@/utils/stream';

// Konfiguration für längere Timeouts
export const maxDuration = 60; // 5 Minuten
export const dynamic = 'force-dynamic';

// Hilfsfunktion für Fehlerbehandlung
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ein unbekannter Fehler ist aufgetreten';
}

// Funktion zum Einlesen des Prompts aus der Markdown-Datei
async function loadPromptTemplate(): Promise<string> {
  try {
    const promptPath = path.join(process.cwd(), 'public', 'markentext-vergleich_md');
    const promptTemplate = fs.readFileSync(promptPath, 'utf8');
    return promptTemplate;
  } catch (error) {
    console.error('Fehler beim Einlesen des Prompt-Templates:', error);
    throw new Error('Prompt-Template konnte nicht geladen werden');
  }
}

// Funktion zum Ersetzen der Variablen im Prompt
function replacePromptVariables(
  prompt: string, 
  openaiText: string, 
  anthropicText: string, 
  textTopic?: string
): string {
  return prompt
    .replace('{{OPENAI_TEXT}}', openaiText)
    .replace('{{ANTHROPIC_TEXT}}', anthropicText)
    .replace('{{TEXT_TOPIC}}', textTopic || '');
}

// Mock-Funktion für den Textvergleich in Entwicklungsumgebungen
function mockTextComparison(openaiText: string, anthropicText: string, textTopic?: string): string {
  return `# Textvergleich: ${textTopic || 'SEO-Texte'}

## Zusammenfassung
Dies ist ein Mock-Vergleich für Entwicklungszwecke. In einer Produktionsumgebung würde dieser Vergleich von Claude durchgeführt werden.

## Text 1 (ChatGPT)
${openaiText.substring(0, 100)}...

## Text 2 (Claude)
${anthropicText.substring(0, 100)}...

## Bewertung

### Sprachliche Qualität
- Text 1: 7/10 - Gut strukturiert, aber einige Verbesserungsmöglichkeiten
- Text 2: 8/10 - Elegant und präzise formuliert

### SEO-Optimierung
- Text 1: 8/10 - Gute Keyword-Platzierung
- Text 2: 7/10 - Verbesserungspotenzial bei der Struktur

### Zielgruppenansprache
- Text 1: 7/10 - Passend zur Zielgruppe
- Text 2: 8/10 - Sehr gut auf die Zielgruppe abgestimmt

### Markenpositionierung
- Text 1: 8/10 - Klare Positionierung im Premium-Segment
- Text 2: 9/10 - Hervorragende Positionierung mit klarem Mehrwert

### Handlungsaufforderung
- Text 1: 7/10 - Klarer Call-to-Action
- Text 2: 8/10 - Überzeugender Call-to-Action mit Mehrwert

## Gesamtbewertung
- Text 1: 7.4/10
- Text 2: 8.0/10

## Fazit
Beide Texte sind gut gelungen, aber Text 2 (Claude) hat eine leicht bessere Gesamtbewertung. Die Stärken von Text 2 liegen in der Zielgruppenansprache und der Markenpositionierung. Text 1 könnte in diesen Bereichen noch verbessert werden.

## Verbesserungsvorschläge für Text 1
- Stärkere Betonung der Zielgruppenbedürfnisse
- Klarere Positionierung im Premium-Segment
- Verbesserung der Handlungsaufforderung mit konkretem Mehrwert`;
}

// Funktion zum Senden des Prompts an die Claude API
async function compareTextsWithClaude(prompt: string) {
  const settings = await getSettings();
  
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY ist nicht konfiguriert');
  }

  console.log('Sende Anfrage an Claude API...');
  const startTime = Date.now();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: settings.claudeModel || 'claude-3-opus-20240229',
        max_tokens: settings.claudeMaxTokens || 6000,
        stream: true,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: settings.claudeTemperature || 0.7
      })
    });

    const endTime = Date.now();
    console.log(`Claude API Antwortzeit: ${endTime - startTime}ms`);

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API Fehler:', error);
      throw new Error(`Claude API Fehler: ${error.message || 'Unbekannter Fehler'}`);
    }

    if (!response.body) {
      throw new Error('Keine Antwort von der Claude API erhalten');
    }

    return response.body;
  } catch (error) {
    console.error('Fehler bei Claude API Anfrage:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  console.log('Textvergleich API aufgerufen');
  const startTime = Date.now();

  try {
    // Validiere den Request-Body
    const body = await request.json();
    const { openaiText, anthropicText, textTopic } = body;

    if (!openaiText || !anthropicText) {
      return NextResponse.json(
        { error: 'Beide Texte müssen vorhanden sein' },
        { status: 400 }
      );
    }

    // Prüfe, ob wir in einer Entwicklungsumgebung sind und kein API-Schlüssel konfiguriert ist
    if (process.env.NODE_ENV === 'development' && !process.env.ANTHROPIC_API_KEY) {
      console.log('Entwicklungsmodus: Verwende Mock-Vergleich');
      const mockResult = mockTextComparison(openaiText, anthropicText, textTopic);
      return NextResponse.json({ result: mockResult });
    }

    // Lade das Prompt-Template
    let promptTemplate: string;
    try {
      promptTemplate = await loadPromptTemplate();
    } catch (error) {
      console.error('Fehler beim Laden des Prompt-Templates:', error);
      return NextResponse.json(
        { error: 'Prompt-Template konnte nicht geladen werden' },
        { status: 500 }
      );
    }
    
    // Ersetze die Variablen im Prompt
    const prompt = replacePromptVariables(promptTemplate, openaiText, anthropicText, textTopic);
    console.log('Prompt vorbereitet:', prompt.substring(0, 100) + '...');
    
    // Hole den Stream von der Claude API
    console.log('Rufe Claude API auf...');
    const stream = await compareTextsWithClaude(prompt);
    console.log('Stream von Claude API erhalten');
    
    // Erstelle einen TransformStream für die Verarbeitung
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        console.log('Transformiere Chunk:', chunk);
        // Konvertiere den Chunk zu Text
        const text = new TextDecoder().decode(chunk);
        console.log('Decodierter Text:', text.substring(0, 100) + '...');
        
        // Verarbeite jede Zeile im Chunk
        const lines = text.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            // Entferne "data: " Präfix und parse JSON
            const jsonStr = line.replace(/^data: /, '').trim();
            if (!jsonStr) continue;
            
            const data = JSON.parse(jsonStr);
            console.log('Verarbeite Daten:', data);
            
            // Wenn es ein Content-Block ist, sende den Text
            if (data.type === 'content_block_delta' && data.delta?.text) {
              const responseData = `data: ${JSON.stringify({ result: data.delta.text })}\n\n`;
              console.log('Sende Chunk:', responseData);
              controller.enqueue(new TextEncoder().encode(responseData));
            }
          } catch (e) {
            console.error('Fehler beim Verarbeiten des Chunks:', e);
          }
        }
      }
    });

    // Verbinde den Stream mit dem TransformStream
    console.log('Verbinde Streams...');
    const responseStream = stream.pipeThrough(transformStream);
    console.log('Streams verbunden');
    
    // Erstelle und gib den Response-Stream zurück
    console.log('Erstelle Response...');
    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API Fehler:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
} 