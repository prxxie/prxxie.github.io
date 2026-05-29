import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { synth } from "./synth";

describe("RetroSynth", () => {
  interface MockOsc {
    connect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    type: string;
    frequency: { setValueAtTime: ReturnType<typeof vi.fn> };
  }
  interface MockGain {
    connect: ReturnType<typeof vi.fn>;
    gain: {
      setValueAtTime: ReturnType<typeof vi.fn>;
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
  }
  let mockOscillator: MockOsc;
  let mockGain: MockGain;
  let mockAudioContextCtor: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      type: "sine",
      frequency: {
        setValueAtTime: vi.fn(),
      },
    };

    mockGain = {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockAudioContextCtor = vi.fn().mockImplementation(() => ({
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGain),
      destination: {},
      currentTime: 10,
      state: "suspended",
      resume: vi.fn(),
    }));

    vi.stubGlobal("AudioContext", mockAudioContextCtor);
    vi.stubGlobal("webkitAudioContext", undefined);

    synth.ctx = null;
    synth.muted = false;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should initialize the AudioContext on first play/init call and resume if suspended", () => {
    expect(synth.ctx).toBeNull();
    synth.init();
    expect(synth.ctx).not.toBeNull();
    expect(mockAudioContextCtor).toHaveBeenCalledTimes(1);
    expect(synth.ctx!.resume).toHaveBeenCalledTimes(1);
  });

  it("should not call resume if AudioContext is already running", () => {
    mockAudioContextCtor.mockImplementationOnce(() => ({
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGain),
      destination: {},
      currentTime: 10,
      state: "running",
      resume: vi.fn(),
    }));
    synth.init();
    expect(synth.ctx!.resume).not.toHaveBeenCalled();
  });

  it("should not initialize or play sounds when muted", () => {
    synth.setMuted(true);
    synth.playPlace();
    expect(synth.ctx).toBeNull();
    expect(mockAudioContextCtor).not.toHaveBeenCalled();
  });

  it("should play place sound with correct parameters", () => {
    synth.playPlace();

    expect(mockAudioContextCtor).toHaveBeenCalled();
    expect(mockOscillator.type).toBe("sine");
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenNthCalledWith(
      1,
      523.25,
      10
    );
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenNthCalledWith(
      2,
      659.25,
      10.05
    );
    expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.15, 10);
    expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      0.001,
      10.15
    );
    expect(mockOscillator.start).toHaveBeenCalledWith(10);
    expect(mockOscillator.stop).toHaveBeenCalledWith(10.15);
  });

  it("should play error sound with correct parameters", () => {
    synth.playError();

    expect(mockAudioContextCtor).toHaveBeenCalled();
    expect(mockOscillator.type).toBe("sawtooth");
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
      150,
      10
    );
    expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.2, 10);
    expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      0.001,
      10.12
    );
    expect(mockOscillator.start).toHaveBeenCalledWith(10);
    expect(mockOscillator.stop).toHaveBeenCalledWith(10.12);
  });

  it("should play win sound notes sequence", () => {
    synth.playWin();

    expect(mockAudioContextCtor).toHaveBeenCalled();
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledTimes(4);
    expect(mockOscillator.start).toHaveBeenCalledTimes(4);
    expect(mockOscillator.stop).toHaveBeenCalledTimes(4);
  });

  it("should play click sound with correct parameters", () => {
    synth.playClick();

    expect(mockAudioContextCtor).toHaveBeenCalled();
    expect(mockOscillator.type).toBe("sine");
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
      800,
      10
    );
    expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.05, 10);
    expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      0.001,
      10.02
    );
    expect(mockOscillator.start).toHaveBeenCalledWith(10);
    expect(mockOscillator.stop).toHaveBeenCalledWith(10.02);
  });
});
