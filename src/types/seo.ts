export interface Season {
  id: 'ss' | 'aw';
  name: string;
}

export interface Category {
  id: 'damen' | 'herren' | 'accessoires' | 'schuhe' | 'taschen';
  name: string;
}

export interface SeoSettings {
  promptTemplate: string;
}

export interface SeoTextRequest {
  brand: {
    Marke: string;
    'Kurzcharakteristik 1': string;
    'Kurzcharakteristik 2': string;
    'Kurzcharakteristik 3 (optional)': string;
    Preis: number;
    Design: number;
    Bekanntheit: number;
    Sortimentsbreite: number;
    Positionierung: number;
  };
  season: Season;
  category: Category;
} 