import type { HistoricalFigure } from '../types';
import { fetchWikipediaImage } from '../services/wikipediaService';

const tierEncoding: Record<HistoricalFigure['tier'], number> = {
  goated: 0,
  flawed: 1,
  bad: 2,
  irredeemable: 3,
  unranked: 4
};

const encodeTier = (tier: HistoricalFigure['tier']): number => {
  return tierEncoding[tier];
}

const decodeTier = (value: number): HistoricalFigure['tier'] => {
  const entry = Object.entries(tierEncoding).find(([_, v]) => v === value);
  return entry ? (entry[0] as HistoricalFigure['tier']) : 'unranked';
}

export const encodeToUrl = (figures: HistoricalFigure[]): string => {
  return encodeURIComponent(figures.map(({name, tier}) => `${name}~${encodeTier(tier)}`).join('|'));
};

export const decodeFromUrl = async (): Promise<HistoricalFigure[] | null> => {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('list');
  
  if (!encoded) {
    return null;
  }
  
  try {
    const data = decodeURIComponent(encoded).split('|').map(item => {
      const [name, tierNumber] = item.split('~');
      return { name, tier: parseInt(tierNumber, 10) };
    });
    
    const figureNames = data.map((item: any) => item.name);
    
    // Batch fetch all images in a single request
    const imageUrls = await fetchWikipediaImage(figureNames);
    
    return data.map((item: any, index: number) => ({
      id: `${item.name}-${index}`,
      name: item.name,
      tier: decodeTier(item.tier),
      imageUrl: imageUrls[index] || undefined
    }));
  } catch (error) {
    console.error('Error decoding URL:', error);
    return null;
  }
};
