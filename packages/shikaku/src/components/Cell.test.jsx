import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Cell from './Cell';

describe('Cell Component', () => {
  it('renders correctly with no clue', () => {
    render(<Cell x={0} y={0} clue={undefined} isCovered={false} onPointerDown={() => {}} onPointerEnter={() => {}} onPointerUp={() => {}} />);
    expect(screen.queryByText(/[0-9]/)).not.toBeInTheDocument();
  });

  it('renders a clue when provided', () => {
    render(<Cell x={0} y={0} clue={4} isCovered={false} onPointerDown={() => {}} onPointerEnter={() => {}} onPointerUp={() => {}} />);
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('4')).toHaveClass('font-bold');
  });

  it('opacity is reduced when covered', () => {
    render(<Cell x={0} y={0} clue={4} isCovered={true} onPointerDown={() => {}} onPointerEnter={() => {}} onPointerUp={() => {}} />);
    expect(screen.getByText('4')).toHaveClass('opacity-30');
    expect(screen.getByText('4')).not.toHaveClass('font-bold');
  });

  it('fires callbacks on pointer events', () => {
    const handlePointerDown = vi.fn();
    const handlePointerEnter = vi.fn();
    const handlePointerUp = vi.fn();

    render(
      <Cell
        x={2}
        y={3}
        clue={6}
        isCovered={false}
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
        onPointerUp={handlePointerUp}
      />
    );

    const cellDiv = screen.getByText('6').closest('div');
    expect(cellDiv).toBeInTheDocument();

    fireEvent.pointerDown(cellDiv);
    expect(handlePointerDown).toHaveBeenCalledWith(2, 3);

    fireEvent.pointerEnter(cellDiv);
    expect(handlePointerEnter).toHaveBeenCalledWith(2, 3);

    fireEvent.pointerUp(cellDiv);
    expect(handlePointerUp).toHaveBeenCalled();
  });
});
