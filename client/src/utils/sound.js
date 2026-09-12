// Playful, Bouncy, Arcade-Quality Procedural Audio Synthesizer

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientGain = null;
    this.ambientNodes = null;
    this.isAmbientPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isAmbientPlaying) {
      this.stopAmbient();
    }
    return this.isMuted;
  }

  // Bouncy Bubble Pop
  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    const baseFreq = 500 + Math.random() * 200;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + 0.07);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Playful Bubbly Tap / Boing
  playBoing() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.16);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  // Smooth Message Send Swoosh
  playSend() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // Upbeat Arcade Chime
  playChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.45);
    });
  }

  // High Score / Game Victory Fanfare
  playSuccess() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major upbeat arpeggio
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.14, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.65);
    });
  }

  // Soft Dissolve Chime (Plays when 12s ephemeral message vaporizes)
  playDissolve() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [987.77, 783.99, 659.25, 493.88]; // B5 -> G5 -> E5 -> B4 ethereal descent

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.88, now + idx * 0.04 + 0.35);

      gain.gain.setValueAtTime(0.06, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.4);
    });
  }

  // Gentle Room Join Chime (Warm welcoming entrance tone)
  playJoin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5 warm welcome arpeggio

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.1, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.6);
    });
  }

  // Lo-Fi Calming Ambiance Toggle
  toggleAmbient() {
    if (this.isAmbientPlaying) {
      this.stopAmbient();
      return false;
    } else {
      this.startAmbient();
      return true;
    }
  }

  startAmbient() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.035, this.ctx.currentTime);

    const freqs = [130.81, 196.00, 261.63, 329.63]; // C3 Major 7 chord
    const oscs = [];

    freqs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.connect(masterGain);
      osc.start();
      oscs.push(osc);
    });

    masterGain.connect(this.ctx.destination);
    this.ambientGain = masterGain;
    this.ambientNodes = oscs;
    this.isAmbientPlaying = true;
  }

  stopAmbient() {
    if (this.ambientNodes) {
      this.ambientNodes.forEach(node => {
        try { node.stop(); } catch (e) {}
      });
      this.ambientNodes = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
    this.isAmbientPlaying = false;
  }
}

export const sounds = new SoundEngine();
