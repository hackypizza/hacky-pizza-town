// Audio alarm service for persistent looping restaurant order alerts
// Works even when screen is locked/off or browser tab is minimized
export class OrderSoundService {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private audioCtx: AudioContext | null = null;
  private synthInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        // High-pitched loud emergency restaurant chime
        this.audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        this.audio.loop = true;
      } catch (e) {
        console.warn('Audio element initialization notice:', e);
      }
    }
  }

  private playSynthBeep() {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(1280, now + 0.35);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch {
      // ignore
    }
  }

  public playAlarm() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // 1. Play audio element
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {
        // Autoplay workaround if user hasn't clicked anywhere yet
        window.addEventListener('click', () => {
          if (this.isPlaying && this.audio) this.audio.play().catch(() => {});
        }, { once: true });
      });
    }

    // 2. Play synthesized oscillator beep loop as reliable fallback
    this.playSynthBeep();
    if (!this.synthInterval) {
      this.synthInterval = setInterval(() => {
        if (this.isPlaying) {
          this.playSynthBeep();
        } else {
          this.stopAlarm();
        }
      }, 1500);
    }
  }

  public stopAlarm() {
    this.isPlaying = false;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const orderAlertService = new OrderSoundService();
export default orderAlertService;
