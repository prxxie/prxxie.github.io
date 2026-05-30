let audioCtx: AudioContext | null = null;
let isAudioMuted = true;

const STORAGE_KEY = "prxxie_audio_muted";

export function getAudioMuted(): boolean {
  return isAudioMuted;
}

export function setAudioMuted(muted: boolean): void {
  isAudioMuted = muted;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(muted));
  } catch (e) {
    console.warn("Failed to persist audio preference", e);
  }
}

try {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      isAudioMuted = JSON.parse(saved) === true;
    }
  }
} catch (e) {
  console.error("Failed to load audio preference", e);
}

export function playBeepSound(frequency = 440, duration = 0.08): void {
  if (isAudioMuted) return;
  try {
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtor) return;
    if (!audioCtx) {
      audioCtx = new AudioCtor();
    }
    if (audioCtx.state === "suspended") {
      void audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {
    console.warn("Failed to play synth sound:", err);
  }
}
