import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Board from './Board';
import { useShikakuStore } from '../store/useShikakuStore';
import { synth } from '../engine/synth';

// Mock synth to avoid audio issues
vi.mock('../engine/synth', () => ({
  synth: {
    playPlace: vi.fn(),
    playError: vi.fn(),
    playClick: vi.fn(),
  },
}));

describe('Board Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useShikakuStore.setState({
      puzzle: {
        id: 'easy-1',
        width: 3,
        height: 3,
        clues: [
          { x: 0, y: 0, value: 3 },
          { x: 2, y: 2, value: 2 }
        ]
      },
      regions: [],
      dragStart: null,
      dragEnd: null,
      startDrag: vi.fn(),
      updateDrag: vi.fn(),
      commitDrag: vi.fn(),
      cancelDrag: vi.fn(),
      removeRegionAt: vi.fn(),
      isWon: false,
    });
  });

  it('renders nothing when no puzzle loaded', () => {
    useShikakuStore.setState({ puzzle: null });
    const { container } = render(<Board />);
    expect(container.firstChild).toBeNull();
  });

  it('renders cells with clues and background', () => {
    render(<Board />);
    // Clue 3 is present
    expect(screen.getByText('3')).toBeInTheDocument();
    // Clue 2 is present
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders placed regions layer', () => {
    useShikakuStore.setState({
      regions: [
        { id: 'r1', x: 0, y: 0, width: 3, height: 1, color: '#ff0000' }
      ]
    });
    render(<Board />);
    // Placed region shows region size (3 * 1 = 3)
    // There will be a grid cell with clue 3, and a region with text "3"
    const regionTexts = screen.getAllByText('3');
    expect(regionTexts.length).toBeGreaterThanOrEqual(2);
  });

  it('renders win overlay when puzzle is won', () => {
    useShikakuStore.setState({ isWon: true });
    render(<Board />);
    expect(screen.getByText('BOARD SOLVED!')).toBeInTheDocument();
  });

  it('handles global pointerup events and triggers commitDrag success synth sound', () => {
    const commitMock = vi.fn().mockReturnValue({ success: true });
    useShikakuStore.setState({
      dragStart: { x: 0, y: 0 },
      commitDrag: commitMock
    });

    render(<Board />);

    fireEvent.pointerUp(window);
    expect(commitMock).toHaveBeenCalled();
    expect(synth.playPlace).toHaveBeenCalled();
  });

  it('handles global pointerup events and triggers commitDrag error synth sound and shake', () => {
    const commitMock = vi.fn().mockReturnValue({ success: false });
    useShikakuStore.setState({
      dragStart: { x: 0, y: 0 },
      commitDrag: commitMock
    });

    render(<Board />);

    fireEvent.pointerUp(window);
    expect(commitMock).toHaveBeenCalled();
    expect(synth.playError).toHaveBeenCalled();
  });

  it('handles global pointercancel events and triggers cancelDrag', () => {
    const cancelMock = vi.fn();
    useShikakuStore.setState({
      dragStart: { x: 0, y: 0 },
      cancelDrag: cancelMock
    });

    render(<Board />);

    fireEvent(window, new Event('pointercancel'));
    expect(cancelMock).toHaveBeenCalled();
  });

  it('applies responsive sizing inline styles to the board container', () => {
    const { container } = render(<Board />);
    const boardContainer = container.querySelector('.relative.border-4');
    expect(boardContainer).toBeInTheDocument();
    expect(boardContainer).toHaveStyle({
      maxWidth: 'min(85vw, 60vh, 400px)',
      maxHeight: 'min(85vw, 60vh, 400px)'
    });
  });
});
