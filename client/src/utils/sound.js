// Warm, Subtle, Editorial Procedural Audio Synthesizer
// With Master Gain, Lowpass Warmth Filtering, and Persistent Volume Control

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.filterNode = null;
    this.ambientGain = null;
    this.ambientNodes = null;
    this.isAmbientPlaying = false;

    // Retrieve saved volume & mute settings
    const savedVol = typeof localStorage !== 'undefined' ? localStorage.getItem('tbr-sound-volume') : null;
    const savedMute = typeof localStorage !== 'undefined' ? localStorage.getItem('tbr-sound-muted') : null;

    this.volume = savedVol !== null ? Math.max(0, Math.min(1, parseFloat(savedVol))) : 0.5;
    this.isMuted = savedMute === '1';
    this.listeners = new Set();
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // 1. Create Master Gain Node
        this.masterGain = this.ctx.createGain();
        const effectiveGain = this.isMuted ? 0 : this.volume;
        this.masterGain.gain.setValueAtTime(effectiveGain, this.ctx.currentTime);

        // 2. Create Warm Lowpass Filter (eliminates harsh high frequencies)
        this.filterNode = this.ctx.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(2400, this.ctx.currentTime);
        this.filterNode.Q.setValueAtTime(0.7, this.ctx.currentTime);

        // Chain: [Sounds] -> masterGain -> filterNode -> ctx.destination
        this.masterGain.connect(this.filterNode);
        this.filterNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Event subscription for UI reactivity
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn({ volume: this.volume, isMuted: this.isMuted, isAmbient: this.isAmbientPlaying }); } catch (e) {}
    });
  }

  setVolume(vol) {
    this.init();
    const clamped = Math.max(0, Math.min(1, Number(vol)));
    this.volume = clamped;
    if (this.volume === 0) {
      this.isMuted = true;
    } else {
      this.isMuted = false;
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tbr-sound-volume', this.volume.toString());
      localStorage.setItem('tbr-sound-muted', this.isMuted ? '1' : '0');
    }

    this.notify();
    return this.volume;
  }

  getVolume() {
    return this.volume;
  }

  cycleVolume() {
    // Cycles: Mute (0) -> Soft (0.3) -> Normal (0.6) -> Full (1.0)
    if (this.isMuted || this.volume <= 0.05) {
      this.setVolume(0.3);
      this.playPop();
    } else if (this.volume <= 0.45) {
      this.setVolume(0.7);
      this.playPop();
    } else if (this.volume <= 0.8) {
      this.setVolume(1.0);
      this.playPop();
    } else {
      this.setVolume(0);
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    if (this.isMuted && this.isAmbientPlaying) {
      this.stopAmbient();
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tbr-sound-muted', this.isMuted ? '1' : '0');
    }
    this.notify();
    return this.isMuted;
  }

  // Soft, subtle UI blip
  playPop() {
    if (this.isMuted || this.volume <= 0) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    const baseFreq = 440 + Math.random() * 80;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.04);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Subtle gentle tap / transition tone
  playBoing() {
    if (this.isMuted || this.volume <= 0) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.1);

    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Gentle air swoosh for message sending
  playSend() {
    if (this.isMuted || this.volume <= 0) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.07);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Warm, delicate bell chime
  playChime() {
    if (this.isMuted || this.volume <= 0) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.035, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.32);
    });
  }

  // Warm welcoming entrance chime
  playJoinChime() {
    this.playChime();
  }

  // Understated accomplishment chime
  playSuccess() {
    if (this.isMuted || this.volume <= 0) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const notes = [440.00, 554.37, 659.25, 880.00]; // A major arpeggio
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.04, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.42);
    });
  }

  // Soft Dissolve Tone (Plays when 12s ephemeral message vanishes)
  playDissolve() {
    if (this.isMuted || this.volume <= 0) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const notes = [783.99, 659.25, 523.25]; // G5 -> E5 -> C5 gentle fall

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, now + idx * 0.03 + 0.25);

      gain.gain.setValueAtTime(0.03, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.03 + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.03);
      osc.stop(now + idx * 0.03 + 0.3);
    });
  }

  // Gentle Room Join Chime
  playJoin() {
    if (this.isMuted || this.volume <= 0) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const notes = [392.00, 493.88, 587.33]; // G4, B4, D5

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.035, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.42);
    });
  }

  // Calming Lo-Fi Ambient Tone
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
    if (!this.ctx || !this.masterGain) return;

    const ambientGain = this.ctx.createGain();
    ambientGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

    const freqs = [130.81, 196.00, 261.63, 329.63]; // Warm C3 Major 7 chord
    const oscs = [];

    freqs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.connect(ambientGain);
      osc.start();
      oscs.push(osc);
    });

    ambientGain.connect(this.masterGain);
    this.ambientGain = ambientGain;
    this.ambientNodes = oscs;
    this.isAmbientPlaying = true;
    this.notify();
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
    this.notify();
  }
}

export const sounds = new SoundEngine();
