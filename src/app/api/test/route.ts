import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const testValue = process.env.VERCEL_TEST;
    
    return NextResponse.json({
      value: testValue || null
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Test-Wertes:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
} 