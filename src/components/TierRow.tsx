import React from 'react';
import type { HistoricalFigure, TierCategory } from '../types';
import FigureCard from './FigureCard';
import './TierRow.css';

interface TierRowProps {
  tier: TierCategory;
  figures: HistoricalFigure[];
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, tier: TierCategory) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, figure: HistoricalFigure) => void;
  onRemove: (id: string) => void;
}

const tierColors: Record<TierCategory, string> = {
  goated: '#FFD700',
  flawed: '#87CEEB',
  bad: '#FFA500',
  irredeemable: '#DC143C',
  unranked: '#E0E0E0'
};

const tierLabels: Record<TierCategory, string> = {
  goated: '🐐 GOATED',
  flawed: '⚖️ Flawed but Net Positive',
  bad: '❌ Mostly Bad',
  irredeemable: '💀 Irredeemable',
  unranked: '❓ Unranked'
};

const TierRow: React.FC<TierRowProps> = ({
  tier,
  figures,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onRemove
}) => {
  return (
    <div className="tier-row">
      <div className="tier-label" style={{ backgroundColor: tierColors[tier] }}>
        <span>{tierLabels[tier]}</span>
      </div>
      <div
        className="tier-drop-zone"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, tier)}
      >
        {figures.map((figure) => (
          <FigureCard
            key={figure.id}
            figure={figure}
            onDragStart={onDragStart}
            onRemove={onRemove}
          />
        ))}
        {figures.length === 0 && (
          <div className="empty-placeholder">Drag figures here</div>
        )}
      </div>
    </div>
  );
};

export default TierRow;
