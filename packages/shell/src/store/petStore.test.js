import { describe, it, expect, beforeEach } from 'vitest';
import { usePetStore } from './petStore';

describe('Pet Zustand Store', () => {
  beforeEach(() => {
    usePetStore.setState({
      hunger: 50,
      happiness: 50,
      status: 'idle',
      isSleeping: false
    });
  });

  it('should initialize with default states', () => {
    const state = usePetStore.getState();
    expect(state.hunger).toBe(50);
    expect(state.happiness).toBe(50);
  });

  it('should reduce hunger on feed()', () => {
    usePetStore.getState().feed();
    expect(usePetStore.getState().hunger).toBe(30);
    expect(usePetStore.getState().status).toBe('eating');
  });

  it('should increase happiness on play()', () => {
    usePetStore.getState().play();
    expect(usePetStore.getState().happiness).toBe(70);
    expect(usePetStore.getState().status).toBe('playing');
  });

  it('should decay stats on tick()', () => {
    usePetStore.getState().tick();
    expect(usePetStore.getState().hunger).toBe(55);
    expect(usePetStore.getState().happiness).toBe(45);
  });
});
