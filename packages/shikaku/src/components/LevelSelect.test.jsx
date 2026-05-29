import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LevelSelect from './LevelSelect';
import { useShikakuStore } from '../store/useShikakuStore';
import { SHIKAKU_LEVELS } from '../levels';

// Mock synth to avoid audio issues
vi.mock('../engine/synth', () => ({
  synth: {
    playClick: vi.fn(),
  },
}));

describe('LevelSelect Component', () => {
  const loadSaveMock = vi.fn();

  beforeEach(() => {
    useShikakuStore.setState({
      completedLevels: {
        'easy-1': { stars: 3, bestTime: 12 },
        'easy-2': { stars: 1, bestTime: 45 },
      },
      loadSave: loadSaveMock,
    });
  });

  it('calls loadSave on mount', () => {
    render(<LevelSelect onSelect={vi.fn()} />);
    expect(loadSaveMock).toHaveBeenCalled();
  });

  it('renders levels correctly', () => {
    render(<LevelSelect onSelect={vi.fn()} />);
    
    expect(screen.getByText('SELECT LEVEL')).toBeInTheDocument();
    
    // Check if some levels from SHIKAKU_LEVELS are listed
    SHIKAKU_LEVELS.forEach((lvl, index) => {
      expect(screen.getByText((index + 1).toString())).toBeInTheDocument();
      expect(screen.getAllByText(`${lvl.width}x${lvl.height}`)[0]).toBeInTheDocument();
    });

    // Check stars rendered for completed levels
    expect(screen.getByText('★★★')).toBeInTheDocument(); // easy-1
    expect(screen.getByText('★☆☆')).toBeInTheDocument(); // easy-2
  });

  it('handles level select button click', () => {
    const handleSelect = vi.fn();
    render(<LevelSelect onSelect={handleSelect} />);

    // Click the first level button (index 1 / easy-1)
    fireEvent.click(screen.getByText('1').closest('button'));
    expect(handleSelect).toHaveBeenCalledWith(0);
  });
});
