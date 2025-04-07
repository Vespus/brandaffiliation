// Globaler State für die Test-Variable
let testValue: string | null = null;

// Funktion zum Abrufen des aktuellen Wertes
export function getTestValue(): string | null {
  return testValue;
}

// Funktion zum Setzen eines neuen Wertes
export function setTestValue(value: string | null): void {
  testValue = value;
}

// Funktion zum Zurücksetzen auf den Standardwert
export function resetTestValue(): void {
  testValue = null;
} 