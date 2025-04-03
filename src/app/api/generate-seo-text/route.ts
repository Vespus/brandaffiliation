import { NextResponse } from 'next/server';
import { SeoTextRequest } from '@/types/seo';
import { getSettings } from '../settings/route';

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
    const body = await request.json() as SeoTextRequest & { llm?: 'chatgpt' | 'claude' | 'both' };
    const settings = await getSettings();

    // Generiere den Prompt aus dem Template
    const prompt = settings.promptTemplate
      .replace('{{brand}}', body.brand)
      .replace('{{season}}', body.season)
      .replace('{{category}}', body.category);

    let results: { chatgpt?: string; claude?: string } = {};

    // Generiere Text basierend auf der LLM-Auswahl
    if (!body.llm || body.llm === 'chatgpt' || body.llm === 'both') {
      try {
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
        results.chatgpt = `Fehler bei der ChatGPT-Generierung: ${error.message}`;
      }
    }

    if (body.llm === 'claude' || body.llm === 'both') {
      try {
        results.claude = await generateWithClaude(prompt);
      } catch (error) {
        console.error('Claude Fehler:', error);
        results.claude = `Fehler bei der Claude-Generierung: ${error.message}`;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('API Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
} 