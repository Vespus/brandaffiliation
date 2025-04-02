import { NextResponse } from 'next/server';

export async function GET() {
  // Sende nur die Information, ob die Variablen gesetzt sind
  return NextResponse.json({
    hasApiKey: !!process.env.OPENAI_API_KEY,
    promptTemplate: process.env.SEO_PROMPT_TEMPLATE || ''
  });
} 