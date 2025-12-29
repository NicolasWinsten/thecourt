import React, { useState, useEffect, useRef } from 'react';
import type { HistoricalFigure } from '../types';
import { fetchWikipediaImage, searchWikipediaSuggestions, resolveWikipediaName } from '../services/wikipediaService';
import './FigureInput.css';

interface FigureInputProps {
  onAddFigure: (figure: HistoricalFigure) => void;
  existingNames: Set<string>;
}

const FigureInput: React.FC<FigureInputProps> = ({ onAddFigure, existingNames }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      const results = await searchWikipediaSuggestions(input);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedSuggestion(-1);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [input]);

  // Auto-scroll selected suggestion into view
  useEffect(() => {
    if (selectedSuggestion >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.querySelector(
        `.suggestion-item:nth-child(${selectedSuggestion + 1})`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedSuggestion]);

  const addFigureToList = async (figureName: string, shouldResolve: boolean = false) => {
    let name = figureName.trim();

    if (existingNames.has(name.toLowerCase())) {
      setError('This figure is already in your list');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Resolve the name to its proper Wikipedia entry if needed
      if (shouldResolve) {
        console.log('Resolving name for:', name);
        const resolvedName = await resolveWikipediaName(name);
        if (!resolvedName) {
          setError('Could not find this figure on Wikipedia');
          return;
        }
        name = resolvedName;

        // Check again with resolved name
        if (existingNames.has(name.toLowerCase())) {
          setError('This figure is already in your list');
          return;
        }
      }

      const imageUrl = await fetchWikipediaImage([name]);

      const newFigure: HistoricalFigure = {
        id: Date.now().toString(),
        name,
        imageUrl: imageUrl[0] || undefined,
        tier: 'unranked'
      };

      onAddFigure(newFigure);
      setInput('');
      setShowSuggestions(false);
      setSuggestions([]);
      setLoading(false);
      // Refocus the input field after state updates complete
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err) {
      setError('Error fetching figure. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    addFigureToList(suggestion, false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        const indexToSelect = selectedSuggestion >= 0 ? selectedSuggestion : 0;
        if (suggestions[indexToSelect]) {
          handleSelectSuggestion(suggestions[indexToSelect]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = input.trim();

    if (!name) {
      setError('Please enter a name');
      return;
    }

    await addFigureToList(name, true);
  };

  return (
    <form className="figure-input" onSubmit={handleSubmit}>
      <div className="input-group">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay to allow clicking on suggestions
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder="Enter a historical figure's name..."
            disabled={loading}
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown" ref={suggestionsRef}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`suggestion-item ${
                    index === selectedSuggestion ? 'selected' : ''
                  }`}
                  onMouseDown={() => handleSelectSuggestion(suggestion)}
                  onMouseEnter={() => setSelectedSuggestion(index)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Figure'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};

export default FigureInput;
