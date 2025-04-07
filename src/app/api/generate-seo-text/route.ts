import { NextResponse } from 'next/server';
import { SeoTextRequest } from '@/types/seo';
import { getSetting } from '@/utils/settingsStateV2';

export const runtime = 'edge'; // Wichtig für längere Ausführungszeiten

// Hilfsfunktion für Fehlerbehandlung
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ein unbekannter Fehler ist aufgetreten';
}

async function generateWithClaude(prompt: string) {
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
      model: getSetting('CLAUDE_MODEL') || process.env.CLAUDE_MODEL,
      max_tokens: getSetting('CLAUDE_MAX_TOKENS') || parseInt(process.env.CLAUDE_MAX_TOKENS || '4096'),
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: getSetting('CLAUDE_TEMPERATURE') || parseFloat(process.env.CLAUDE_TEMPERATURE || '0.7')
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
    const body = await request.json() as SeoTextRequest;

    // Hole den Prompt-Template aus den Settings
    const promptTemplate = (getSetting('SEO_PROMPT_TEMPLATE') || process.env.SEO_PROMPT_TEMPLATE || '').toString();
    if (!promptTemplate) {
      throw new Error('Prompt-Template ist nicht konfiguriert');
    }

    // Generiere den Prompt aus dem Template
    let prompt = promptTemplate;
    
    // Übersetze die Skalenwerte in beschreibende Texte
    const priceLevels = ['günstig', 'preisgünstig', 'mittleres Preissegment', 'premium', 'luxuriös'];
    const designLevels = ['einfach', 'klassisch', 'zeitlos', 'modern', 'innovativ'];
    const fameLevels = ['neu', 'aufstrebend', 'etabliert', 'bekannt', 'Premium-Marke'];
    const rangeLevels = ['fokussiert', 'spezialisiert', 'breit', 'sehr breit', 'universell'];
    const positioningLevels = ['Mass Market', 'Premium', 'Luxus'];

    // Erstelle den Prompt mit den Markendaten
    prompt = prompt
      .replace('{brand}', body.brand)
      .replace('{category}', body.category)
      .replace('{season}', body.season)
      .replace('{char1}', body.brandDetails?.char1 || '')
      .replace('{char2}', body.brandDetails?.char2 || '')
      .replace('{char3}', body.brandDetails?.char3 || 'N/A')
      .replace('{price}', priceLevels[parseInt(body.brandDetails?.price || '1') - 1])
      .replace('{design}', designLevels[parseInt(body.brandDetails?.design || '1') - 1])
      .replace('{fame}', fameLevels[parseInt(body.brandDetails?.fame || '1') - 1])
      .replace('{range}', rangeLevels[parseInt(body.brandDetails?.range || '1') - 1])
      .replace('{positioning}', positioningLevels[parseInt(body.brandDetails?.positioning || '1') - 1]);

    // Debug-Ausgabe des generierten Prompts
    console.log('Generierter Prompt:', prompt);

    let results: { chatgpt?: string; claude?: string } = {};

    // Generiere Text basierend auf der LLM-Auswahl
    if (!body.llm || body.llm === 'chatgpt' || body.llm === 'both') {
      try {
        // Debug-Ausgabe der OpenAI API-Parameter
        const openaiParams = {
          model: 'gpt-4',
          temperature: getSetting('OPENAI_TEMPERATURE') || parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
          top_p: getSetting('OPENAI_TOP_P') || parseFloat(process.env.OPENAI_TOP_P || '0.9'),
          presence_penalty: getSetting('OPENAI_PRESENCE_PENALTY') || parseFloat(process.env.OPENAI_PRESENCE_PENALTY || '0.6'),
          frequency_penalty: getSetting('OPENAI_FREQUENCY_PENALTY') || parseFloat(process.env.OPENAI_FREQUENCY_PENALTY || '0.3'),
          max_tokens: getSetting('OPENAI_MAX_TOKENS') || parseInt(process.env.OPENAI_MAX_TOKENS || '3000')
        };

        console.log('OpenAI API Parameter:', openaiParams);

        const chatgptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: getSetting('SEO_SYSTEM_ROLE') || process.env.SEO_SYSTEM_ROLE
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            ...openaiParams
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
          model: getSetting('CLAUDE_MODEL') || process.env.CLAUDE_MODEL,
          max_tokens: getSetting('CLAUDE_MAX_TOKENS') || parseInt(process.env.CLAUDE_MAX_TOKENS || '4096'),
          temperature: getSetting('CLAUDE_TEMPERATURE') || parseFloat(process.env.CLAUDE_TEMPERATURE || '0.7')
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