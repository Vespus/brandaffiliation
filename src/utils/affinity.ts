import { Brand } from '@/types/brands';

// Tokenisierungsfunktion für Textvergleiche
const tokenizeText = (text: string): string[] => {
  if (!text) return [];
  return text.toLowerCase()
    .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
};

// Textbasierte Ähnlichkeitsberechnung
export const calculateTextSimilarity = (brand1: Brand, brand2: Brand) => {
  // Alle Charakteristiken zusammenfassen
  const characteristics1 = [
    brand1['Kurzcharakteristik 1'],
    brand1['Kurzcharakteristik 2']
  ].filter(Boolean);
  
  const characteristics2 = [
    brand2['Kurzcharakteristik 1'],
    brand2['Kurzcharakteristik 2']
  ].filter(Boolean);
  
  const text1 = characteristics1.join(' ').toLowerCase();
  const text2 = characteristics2.join(' ').toLowerCase();
  
  // Tokenisierung: Text in Wörter aufteilen
  const words1 = tokenizeText(text1);
  const words2 = tokenizeText(text2);
  
  // Gemeinsame Wörter finden
  const commonWords = words1.filter(word => words2.includes(word));
  
  // Alle eindeutigen Wörter sammeln
  const uniqueWords = Array.from(new Set([...words1, ...words2]));
  
  if (uniqueWords.length === 0) return { similarity: 0, commonWords: [] };
  
  // Ähnlichkeitswert berechnen
  const similarity = commonWords.length / uniqueWords.length;
  
  return { 
    similarity, 
    commonWords 
  };
};

// Definition der Skalengewichtungen als Standardwerte
const DEFAULT_SCALE_WEIGHTS = {
  Preis: 0.3,           // 30% Gewichtung
  Design: 0.2,          // 20% Gewichtung
  Bekanntheit: 0.2,     // 20% Gewichtung
  Sortimentsbreite: 0.15, // 15% Gewichtung
  Positionierung: 0.15   // 15% Gewichtung
} as const;

// Skalenbasierte Ähnlichkeitsberechnung
export const calculateScaleSimilarity = (
  brand1: Brand, 
  brand2: Brand,
  customWeights?: Record<string, number>
) => {
  const weights = customWeights || DEFAULT_SCALE_WEIGHTS;
  const scales = Object.keys(weights) as Array<keyof typeof weights>;
  
  let totalWeightedDistance = 0;
  const scaleDetails: Record<string, {
    brand1Value: number;
    brand2Value: number;
    difference: number;
    similarity: number;
    weight: number;
  }> = {};
  let totalWeight = 0;
  
  // Überprüfe jede Skala
  for (const scale of scales) {
    // Überprüfe, ob beide Marken Werte für diese Skala haben
    if (brand1[scale] !== undefined && brand1[scale] !== null && 
        brand2[scale] !== undefined && brand2[scale] !== null) {
      
      const weight = weights[scale];
      totalWeight += weight;
      
      // Berechne euklidischen Abstand für diese Skala
      const diff = brand1[scale] - brand2[scale];
      const squaredDiff = diff * diff;
      totalWeightedDistance += squaredDiff * weight;
      
      // Speichere Details zur Ähnlichkeit dieser Skala
      scaleDetails[scale] = {
        brand1Value: brand1[scale],
        brand2Value: brand2[scale],
        difference: Math.abs(diff),
        // Normalisierte Ähnlichkeit (0 = völlig unterschiedlich, 1 = identisch)
        similarity: 1 - (Math.abs(diff) / 4),
        weight
      };
    }
  }
  
  // Wenn keine gültigen Skalen gefunden wurden, return 0 Ähnlichkeit
  if (totalWeight === 0) {
    return { 
      similarity: 0, 
      scaleDetails: {} 
    };
  }
  
  // Berechne gewichteten euklidischen Abstand
  const distance = Math.sqrt(totalWeightedDistance / totalWeight);
  
  // Berechne eine Gesamtähnlichkeit (0 = völlig unterschiedlich, 1 = identisch)
  // Der maximale gewichtete euklidische Abstand ist sqrt(16) = 4
  const maxPossibleDistance = 4;
  const similarity = 1 - (distance / maxPossibleDistance);
  
  return {
    similarity,
    scaleDetails
  };
};

// Kombinierte Affinitätsberechnung
export const calculateAffinity = (
  brand1: Brand, 
  brand2: Brand, 
  textWeight: number = 0.4,
  scaleWeights?: Record<string, number>
) => {
  const textSimilarity = calculateTextSimilarity(brand1, brand2);
  const scaleSimilarity = calculateScaleSimilarity(brand1, brand2, scaleWeights);
  
  // Gewichtete Kombination der Ähnlichkeiten
  const weightedSimilarity = (textSimilarity.similarity * textWeight) + 
                           (scaleSimilarity.similarity * (1 - textWeight));
  
  return {
    overallSimilarity: weightedSimilarity,
    textSimilarity,
    scaleSimilarity
  };
}; 