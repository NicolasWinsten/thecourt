import { useState, useMemo, useEffect } from 'react';
import type { HistoricalFigure, TierCategory } from './types';
import TierRow from './components/TierRow';
import FigureInput from './components/FigureInput';
import ShareButtons from './components/ShareButtons';
import { encodeToUrl, decodeFromUrl } from './utils/urlEncoding';
import './App.css';

function App() {
  const [figures, setFigures] = useState<HistoricalFigure[]>([]);
  const [draggedFigure, setDraggedFigure] = useState<HistoricalFigure | null>(null);

  // Load from URL on mount
  useEffect(() => {
    const decoded = decodeFromUrl();
    if (decoded && decoded.length > 0) {
      setFigures(decoded);
    }
  }, []);

  // Update URL whenever figures change
  useEffect(() => {
    if (figures.length > 0) {
      const encoded = encodeToUrl(figures);
      window.history.replaceState(null, '', `?list=${encoded}`);
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [figures]);

  const existingNames = useMemo(
    () => new Set(figures.map(f => f.name.toLowerCase())),
    [figures]
  );

  const figuresByTier = useMemo(() => {
    return {
      goated: figures.filter(f => f.tier === 'goated'),
      flawed: figures.filter(f => f.tier === 'flawed'),
      bad: figures.filter(f => f.tier === 'bad'),
      irredeemable: figures.filter(f => f.tier === 'irredeemable'),
      unranked: figures.filter(f => f.tier === 'unranked')
    };
  }, [figures]);

  const handleAddFigure = (figure: HistoricalFigure) => {
    setFigures([...figures, figure]);
  };

  const handleRemoveFigure = (id: string) => {
    setFigures(figures.filter(f => f.id !== id));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, figure: HistoricalFigure) => {
    setDraggedFigure(figure);
    e.dataTransfer.effectAllowed = 'move';
    document.addEventListener('dragend', handleDragEnd);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only remove class if we're leaving the drop zone entirely
    if (e.currentTarget === e.target) {
      e.currentTarget.classList.remove('drag-over');
    }
  };

  const handleDragEnd = () => {
    // Clean up any remaining drag-over classes
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
    setDraggedFigure(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, tier: TierCategory) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    if (!draggedFigure) return;

    setFigures(
      figures.map(f =>
        f.id === draggedFigure.id ? { ...f, tier } : f
      )
    );
    setDraggedFigure(null);
  };

  const handleClear = () => {
    if (figures.length === 0) return;
    if (window.confirm('Are you sure you want to clear all figures?')) {
      setFigures([]);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚖️ The Court of Public Opinion</h1>
        <p>Sort historical figures into tiers and share your opinions</p>
      </header>

      <main className="app-main">
        <FigureInput onAddFigure={handleAddFigure} existingNames={existingNames} />

        <div className="tier-list-container">
          {(['goated', 'flawed', 'bad', 'irredeemable', 'unranked'] as TierCategory[]).map(
            (tier) => (
              <TierRow
                key={tier}
                tier={tier}
                figures={figuresByTier[tier]}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
                onRemove={handleRemoveFigure}
              />
            )
          )}
        </div>

        <div className="action-buttons">
          <button
            className="clear-btn"
            onClick={handleClear}
            disabled={figures.length === 0}
          >
            🗑️ Clear All
          </button>
        </div>

        {figures.length > 0 && <ShareButtons />}

        {figures.length > 0 && (
          <div className="stats">
            <p>Total figures: {figures.length}</p>
            <div className="tier-counts">
              {Object.entries(figuresByTier).map(([tier, tieredFigures]) =>
                tieredFigures.length > 0 ? (
                  <span key={tier}>
                    {tier}: {tieredFigures.length}
                  </span>
                ) : null
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Vibe-coded by{' '}
          <a href="https://nicolaswinsten.com" target="_blank" rel="noopener noreferrer">
            Nicolas Winsten
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
