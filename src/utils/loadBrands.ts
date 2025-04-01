import Papa from 'papaparse';
import { Brand, PreisSkala, DesignSkala, BekannheitSkala, SortimentsbreiteSkala, PositionierungSkala } from '@/types/brands';

interface RawBrand extends Omit<Brand, 'Preis' | 'Design' | 'Bekanntheit' | 'Sortimentsbreite' | 'Positionierung'> {
  Preis: string;
  Design: string;
  Bekanntheit: string;
  Sortimentsbreite: string;
  Positionierung: string;
}

function parseScale<T extends number>(value: string, max: T): T | null {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1 || num > max) return null;
  return num as T;
}

export async function loadBrands(): Promise<Brand[]> {
  try {
    const response = await fetch('/Markencharakteristiken komplett März 2025.csv');
    const csvText = await response.text();
    
    const results = Papa.parse<RawBrand>(csvText, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
    });

    return results.data
      .map(rawBrand => {
        const preis = parseScale(rawBrand.Preis, 5);
        const design = parseScale(rawBrand.Design, 5);
        const bekanntheit = parseScale(rawBrand.Bekanntheit, 5);
        const sortimentsbreite = parseScale(rawBrand.Sortimentsbreite, 5);
        const positionierung = parseScale(rawBrand.Positionierung, 3);

        // Überspringe ungültige Einträge
        if (!preis || !design || !bekanntheit || !sortimentsbreite || !positionierung) {
          console.warn(`Ungültige Skalenwerte für Marke: ${rawBrand.Marke}`);
          return null;
        }

        return {
          ...rawBrand,
          Preis: preis as PreisSkala,
          Design: design as DesignSkala,
          Bekanntheit: bekanntheit as BekannheitSkala,
          Sortimentsbreite: sortimentsbreite as SortimentsbreiteSkala,
          Positionierung: positionierung as PositionierungSkala,
        };
      })
      .filter((brand): brand is Brand => brand !== null);
  } catch (error) {
    console.error('Fehler beim Laden der Markendaten:', error);
    return [];
  }
} 