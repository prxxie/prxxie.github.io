declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

class SokobanSynth {
  ctx: AudioContext | null = null;
  muted = false;

  init(): void {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume().catch((err: unknown) => {
        console.warn("Failed to resume AudioContext:", err);
      });
    }
  }

  setMuted(val: boolean): void {
    this.muted = val;
  }

  playMove(): void {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  playPush(): void {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playError(): void {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(130, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playWin(): void {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }
}

export const synth = new SokobanSynth();
