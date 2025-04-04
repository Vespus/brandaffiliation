import { NextResponse } from 'next/server';
import { SeoTextRequest } from '@/types/seo';
import { getSettings } from '@/utils/settings';

export const runtime = 'edge'; // Wichtig für längere Ausführungszeiten

// Hilfsfunktion für Fehlerbehandlung
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ein unbekannter Fehler ist aufgetreten';
}

async function generateWithClaude(prompt: string) {
  const settings = await getSettings();
  
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY ist nicht konfiguriert');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: settings.claudeModel,
      max_tokens: settings.claudeMaxTokens,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: settings.claudeTemperature
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API Fehler: ${error.message || 'Unbekannter Fehler'}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as SeoTextRequest & {
      brandDetails?: {
        char1: string;
        char2: string;
        char3?: string;
        price: string;
        design: string;
        fame: string;
        range: string;
        positioning: string;
      }
    };
    const settings = await getSettings();

    // Generiere den Prompt aus dem Template mit einer sichereren Methode
    let prompt = settings.promptTemplate;
    const replacements = {
      '{brand}': body.brand,
      '{season}': body.season,
      '{category}': body.category,
      '{char1}': body.brandDetails?.char1 || '',
      '{char2}': body.brandDetails?.char2 || '',
      '{char3}': body.brandDetails?.char3 || '',
      '{price}': body.brandDetails?.price || '',
      '{design}': body.brandDetails?.design || '',
      '{fame}': body.brandDetails?.fame || '',
      '{range}': body.brandDetails?.range || '',
      '{positioning}': body.brandDetails?.positioning || ''
    };

    // Führe die Ersetzungen einzeln durch
    Object.entries(replacements).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    });

    // Debug-Ausgabe des generierten Prompts
    console.log('Generierter Prompt:', prompt);

    let results: { chatgpt?: string; claude?: string } = {};

    // Generiere Text basierend auf der LLM-Auswahl
    if (!body.llm || body.llm === 'chatgpt' || body.llm === 'both') {
      try {
        // Debug-Ausgabe der OpenAI API-Parameter
        console.log('OpenAI API Parameter:', {
          model: 'gpt-4',
          temperature: settings.openaiTemperature,
          top_p: settings.openaiTopP,
          presence_penalty: settings.openaiPresencePenalty,
          frequency_penalty: settings.openaiFrequencyPenalty,
          max_tokens: settings.openaiMaxTokens
        });

        const chatgptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: settings.openaiSystemRole
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: settings.openaiTemperature,
            top_p: settings.openaiTopP,
            presence_penalty: settings.openaiPresencePenalty,
            frequency_penalty: settings.openaiFrequencyPenalty,
            max_tokens: settings.openaiMaxTokens
          })
        });

        if (!chatgptResponse.ok) {
          const error = await chatgptResponse.json();
          throw new Error(`OpenAI API Fehler: ${error.message || 'Unbekannter Fehler'}`);
        }

        const chatgptData = await chatgptResponse.json();
        results.chatgpt = chatgptData.choices[0].message.content;
      } catch (error) {
        console.error('ChatGPT Fehler:', error);
        results.chatgpt = `Fehler bei der ChatGPT-Generierung: ${getErrorMessage(error)}`;
      }
    }

    if (body.llm === 'claude' || body.llm === 'both') {
      try {
        // Debug-Ausgabe der Claude API-Parameter
        console.log('Claude API Parameter:', {
          model: settings.claudeModel,
          max_tokens: settings.claudeMaxTokens,
          temperature: settings.claudeTemperature
        });

        results.claude = await generateWithClaude(prompt);
      } catch (error) {
        console.error('Claude Fehler:', error);
        results.claude = `Fehler bei der Claude-Generierung: ${getErrorMessage(error)}`;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('API Fehler:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
} 