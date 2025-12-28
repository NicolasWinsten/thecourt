export interface HistoricalFigure {
  id: string;
  name: string;
  imageUrl?: string;
  tier: TierCategory;
}

export type TierCategory = 'goated' | 'flawed' | 'bad' | 'irredeemable' | 'unranked';

export interface TierList {
  figures: HistoricalFigure[];
  createdAt: Date;
}
