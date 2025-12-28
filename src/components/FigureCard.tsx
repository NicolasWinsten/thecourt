import React from 'react';
import type { HistoricalFigure } from '../types';
import './FigureCard.css';

interface FigureCardProps {
  figure: HistoricalFigure;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, figure: HistoricalFigure) => void;
  onRemove: (id: string) => void;
}

const FigureCard: React.FC<FigureCardProps> = ({ figure, onDragStart, onRemove }) => {
  return (
    <div
      className="figure-card"
      draggable
      onDragStart={(e) => onDragStart(e, figure)}
    >
      {figure.imageUrl && (
        <img src={figure.imageUrl} alt={figure.name} className="figure-image" />
      )}
      <div className="figure-info">
        <h4>{figure.name}</h4>
        <button
          className="remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(figure.id);
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default FigureCard;
