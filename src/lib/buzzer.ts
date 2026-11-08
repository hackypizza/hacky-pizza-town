// Universal Web Audio Buzzer Helper
// Browser-compliant high-decibel restaurant buzzer that works reliably without external MP3 loading failures

class RestaurantBuzzer {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;
  public isRinging = false;

  private initCtx() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('AudioContext init notice:', e);
    }
  }

  public startAlert() {
    if (typeof window === 'undefined') return;
    if (this.isRinging) return;
    this.isRinging = true;
    this.initCtx();

    // Loop a 2-tone loud restaurant buzzer beep
    this.intervalId = setInterval(() => {
      try {
        if (!this.ctx) {
          this.initCtx();
        }
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime); // High pitch A5
        osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.15); // E5

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
      } catch (e) {
        console.error('Buzzer beep error:', e);
      }
    }, 800);
  }

  public stopAlert() {
    this.isRinging = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const restaurantBuzzer = new RestaurantBuzzer();
