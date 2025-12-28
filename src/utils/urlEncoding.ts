import type { HistoricalFigure } from '../types';

export const encodeToUrl = (figures: HistoricalFigure[]): string => {
  const data = figures.map(fig => ({
    name: fig.name,
    tier: fig.tier,
    imageUrl: fig.imageUrl
  }));
  
  const json = JSON.stringify(data);
  const compressed = btoa(json);
  return compressed;
};

export const decodeFromUrl = (): HistoricalFigure[] | null => {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('list');
  
  if (!encoded) {
    return null;
  }
  
  try {
    const json = atob(encoded);
    const data = JSON.parse(json);
    
    return data.map((item: any, index: number) => ({
      id: `${item.name}-${index}`,
      name: item.name,
      tier: item.tier,
      imageUrl: item.imageUrl
    }));
  } catch (error) {
    console.error('Error decoding URL:', error);
    return null;
  }
};
