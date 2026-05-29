import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import HUD from './HUD';
import { useShikakuStore } from '../store/useShikakuStore';

// Mock synth to avoid audio issues
vi.mock('../engine/synth', () => ({
  synth: {
    playClick: vi.fn(),
  },
}));

describe('HUD Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useShikakuStore.setState({
      puzzle: { id: 'easy-1' },
      elapsedTime: 0,
      isWon: false,
      starsAchieved: 2,
      undo: vi.fn(),
      resetLevel: vi.fn(),
      getHint: vi.fn(),
      tickTimer: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders level ID, formatted time, and stars', () => {
    const handleBack = vi.fn();
    render(<HUD onBack={handleBack} />);

    expect(screen.getByText('LVL: EASY-1')).toBeInTheDocument();
    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('★★☆')).toBeInTheDocument(); // 2 stars achieved, 1 empty
  });

  it('handles BACK button click', () => {
    const handleBack = vi.fn();
    render(<HUD onBack={handleBack} />);

    fireEvent.click(screen.getByText('◀ BACK'));
    expect(handleBack).toHaveBeenCalled();
  });

  it('handles UNDO, RESET, and HINT buttons click', () => {
    const undoMock = vi.fn();
    const resetMock = vi.fn();
    const hintMock = vi.fn();

    useShikakuStore.setState({
      undo: undoMock,
      resetLevel: resetMock,
      getHint: hintMock,
    });

    render(<HUD onBack={vi.fn()} />);

    fireEvent.click(screen.getByText('UNDO'));
    expect(undoMock).toHaveBeenCalled();

    fireEvent.click(screen.getByText('RESET'));
    expect(resetMock).toHaveBeenCalled();

    fireEvent.click(screen.getByText('HINT'));
    expect(hintMock).toHaveBeenCalled();
  });

  it('ticks the timer interval', () => {
    const tickTimerMock = vi.fn();
    useShikakuStore.setState({
      tickTimer: tickTimerMock,
    });

    render(<HUD onBack={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(tickTimerMock).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(tickTimerMock).toHaveBeenCalledTimes(3);
  });
});
