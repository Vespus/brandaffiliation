import { PreisSkala, DesignSkala, BekannheitSkala, SortimentsbreiteSkala, PositionierungSkala } from '@/types/brands';

export const preisLabels: Record<number, string> = {
  1: 'sehr günstig',
  2: 'günstig-mittleres Segment',
  3: 'mittlere Preislage',
  4: 'gehoben',
  5: 'Luxus'
};

export const designLabels: Record<number, string> = {
  1: 'klassisch/traditionell',
  2: 'leicht modernisiert',
  3: 'modern',
  4: 'modisch-trendig',
  5: 'avantgardistisch'
};

export const bekannheitLabels: Record<number, string> = {
  1: 'Nische',
  2: 'klein-regional',
  3: 'Große Zahl treuer Markenfans',
  4: 'weit verbreitet',
  5: 'globaler Mainstream'
};

export const sortimentsbreiteLabels: Record<number, string> = {
  1: 'nur 1 Produktkategorie',
  2: 'wenige Kategorien',
  3: 'moderat diversifiziert',
  4: 'breites Sortiment',
  5: 'sehr breit (inkl. Unterlinien)'
};

export const positionierungLabels: Record<number, string> = {
  1: 'sportiv/casual',
  2: 'Mix aus Business & Casual',
  3: 'Business-orientiert'
}; 