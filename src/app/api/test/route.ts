import { NextResponse } from 'next/server';
import { getTestValue, setTestValue } from '@/utils/testState';

export async function GET() {
  try {
    // Zuerst prüfen, ob ein benutzerdefinierter Wert im Speicher existiert
    const customValue = getTestValue();
    
    // Wenn kein benutzerdefinierter Wert existiert, den Wert aus der Umgebungsvariable verwenden
    const envValue = process.env.VERCEL_TEST;
    
    return NextResponse.json({
      value: customValue !== null ? customValue : envValue || null
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Test-Wertes:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { value } = body;
    
    // Setze den neuen Wert im globalen State
    setTestValue(value);
    
    return NextResponse.json({
      success: true,
      value: value
    });
  } catch (error) {
    console.error('Fehler beim Setzen des Test-Wertes:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
} 