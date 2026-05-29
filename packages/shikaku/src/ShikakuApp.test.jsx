import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShikakuApp from './ShikakuApp';
import { useShikakuStore } from './store/useShikakuStore';
import { synth } from './engine/synth';

// Mock synth to avoid audio issues
vi.mock('./engine/synth', () => ({
  synth: {
    playClick: vi.fn(),
    playWin: vi.fn(),
    playPlace: vi.fn(),
    playError: vi.fn(),
  },
}));

describe('ShikakuApp Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useShikakuStore.setState({
      puzzle: null,
      regions: [],
      dragStart: null,
      dragEnd: null,
      elapsedTime: 0,
      timerActive: false,
      isWon: false,
      starsAchieved: 0,
      completedLevels: {},
      loadSave: vi.fn(),
      loadLevel: vi.fn((levels, idx) => {
        useShikakuStore.setState({
          puzzle: levels[idx],
          timerActive: true,
        });
      }),
    });
  });

  it('renders LevelSelect initially', () => {
    render(<ShikakuApp />);
    expect(screen.getByText('SELECT LEVEL')).toBeInTheDocument();
    // HUD shouldn't be rendered
    expect(screen.queryByText('◀ BACK')).not.toBeInTheDocument();
  });

  it('transitions to HUD and Board when level is selected', () => {
    render(<ShikakuApp />);

    // Click on level 1 button
    fireEvent.click(screen.getByText('1').closest('button'));

    // Should transition: HUD and Board are now visible
    expect(screen.getByText('◀ BACK')).toBeInTheDocument();
    expect(screen.queryByText('SELECT LEVEL')).not.toBeInTheDocument();
  });

  it('navigates back to LevelSelect when BACK is clicked', () => {
    render(<ShikakuApp />);

    // Click on level 1 button
    fireEvent.click(screen.getByText('1').closest('button'));
    expect(screen.getByText('◀ BACK')).toBeInTheDocument();

    // Click back button
    fireEvent.click(screen.getByText('◀ BACK'));

    // Should go back to level select
    expect(screen.getByText('SELECT LEVEL')).toBeInTheDocument();
    expect(screen.queryByText('◀ BACK')).not.toBeInTheDocument();
  });

  it('triggers synth.playWin() when isWon becomes true', () => {
    render(<ShikakuApp />);

    // Click level 1 button
    fireEvent.click(screen.getByText('1').closest('button'));

    // Force isWon state to true in store
    act(() => {
      useShikakuStore.setState({ isWon: true });
    });

    // Check if playWin was called
    expect(synth.playWin).toHaveBeenCalled();
  });
});
