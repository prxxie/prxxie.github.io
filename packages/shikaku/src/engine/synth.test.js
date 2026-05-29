import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { synth } from './synth';

describe('RetroSynth', () => {
  let mockAudioContext;
  let mockOscillator;
  let mockGain;

  beforeEach(() => {
    mockOscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn()
      }
    };

    mockGain = {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      }
    };

    mockAudioContext = vi.fn().mockImplementation(() => ({
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGain),
      destination: {},
      currentTime: 10,
      state: 'suspended',
      resume: vi.fn()
    }));

    vi.stubGlobal('AudioContext', mockAudioContext);
    vi.stubGlobal('webkitAudioContext', undefined);

    // Reset synth state before each test
    synth.ctx = null;
    synth.muted = false;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize the AudioContext on first play/init call and resume if suspended', () => {
    expect(synth.ctx).toBeNull();
    synth.init();
    expect(synth.ctx).not.toBeNull();
    expect(mockAudioContext).toHaveBeenCalledTimes(1);
    expect(synth.ctx.resume).toHaveBeenCalledTimes(1);
  });

  it('should not call resume if AudioContext is already running', () => {
    mockAudioContext.mockImplementationOnce(() => ({
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGain),
      destination: {},
      currentTime: 10,
      state: 'running',
      resume: vi.fn()
    }));
    synth.init();
    expect(synth.ctx.resume).not.toHaveBeenCalled();
  });

  it('should not initialize or play sounds when muted', () => {
    synth.setMuted(true);
    synth.playPlace();
    expect(synth.ctx).toBeNull();
    expect(mockAudioContext).not.toHaveBeenCalled();
  });

  it('should play place sound with correct parameters', () => {
    synth.playPlace();
    
    expect(mockAudioContext).toHaveBeenCalled();
    expect(mockOscillator.type).toBe('sine');
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenNthCalledWith(1, 523.25, 10);
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenNthCalledWith(2, 659.25, 10.05);
    expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.15, 10);
    expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.001, 10.15);
    expect(mockOscillator.start).toHaveBeenCalledWith(10);
    expect(mockOscillator.stop).toHaveBeenCalledWith(10.15);
  });

  it('should play error sound with correct parameters', () => {
    synth.playError();
    
    expect(mockAudioContext).toHaveBeenCalled();
    expect(mockOscillator.type).toBe('sawtooth');
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(150, 10);
    expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.2, 10);
    expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.001, 10.12);
    expect(mockOscillator.start).toHaveBeenCalledWith(10);
    expect(mockOscillator.stop).toHaveBeenCalledWith(10.12);
  });

  it('should play win sound notes sequence', () => {
    synth.playWin();
    
    expect(mockAudioContext).toHaveBeenCalled();
    // 4 notes in win sound sequence
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledTimes(4);
    expect(mockOscillator.start).toHaveBeenCalledTimes(4);
    expect(mockOscillator.stop).toHaveBeenCalledTimes(4);
  });

  it('should play click sound with correct parameters', () => {
    synth.playClick();
    
    expect(mockAudioContext).toHaveBeenCalled();
    expect(mockOscillator.type).toBe('sine');
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(800, 10);
    expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.05, 10);
    expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.001, 10.02);
    expect(mockOscillator.start).toHaveBeenCalledWith(10);
    expect(mockOscillator.stop).toHaveBeenCalledWith(10.02);
  });
});
