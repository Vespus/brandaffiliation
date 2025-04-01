export type PreisSkala = 1 | 2 | 3 | 4 | 5;
export type DesignSkala = 1 | 2 | 3 | 4 | 5;
export type BekannheitSkala = 1 | 2 | 3 | 4 | 5;
export type SortimentsbreiteSkala = 1 | 2 | 3 | 4 | 5;
export type PositionierungSkala = 1 | 2 | 3;

export interface Brand {
  Marke: string;
  'Kurzcharakteristik 1': string;
  'Kurzcharakteristik 2': string;
  'Kurzcharakteristik 3 (optional)': string;
  Preis: PreisSkala;
  Design: DesignSkala;
  Bekanntheit: BekannheitSkala;
  Sortimentsbreite: SortimentsbreiteSkala;
  Positionierung: PositionierungSkala;
} 