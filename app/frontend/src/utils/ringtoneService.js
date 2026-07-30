// Web Audio API Ringtone & Audio Sound Service for Driver Ride Requests

class RingtoneService {
  constructor() {
    this.audioCtx = null;
    this.ringInterval = null;
    this.isPlaying = false;
    this.isMuted = localStorage.getItem("driver_ringtone_muted") === "true";
  }

  // Lazy initialize AudioContext on user action / gesture
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Synthesize a single audio note tone
   * @param {number} freq Frequency in Hz
   * @param {string} type Oscillator type ('sine', 'triangle', 'square')
   * @param {number} duration Duration in seconds
   * @param {number} startTime Delay offset in seconds
   * @param {number} vol Volume (0.0 to 1.0)
   */
  playNote(freq, type = "sine", duration = 0.15, startTime = 0, vol = 0.3) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      // Volume envelope (Attack - Decay)
      gain.gain.setValueAtTime(0.001, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    } catch (e) {
      console.warn("Audio play note error:", e);
    }
  }

  /**
   * Start playing repeating incoming ride request ringtone
   */
  startIncomingRingtone() {
    if (this.isPlaying || this.isMuted) return;
    this.isPlaying = true;

    const playRingPattern = () => {
      if (!this.isPlaying) return;
      // Driver Ringtone Alert Pattern: High alert chimes (G5 & C6)
      this.playNote(784.00, "sine", 0.15, 0, 0.4);
      this.playNote(1046.50, "sine", 0.15, 0.12, 0.45);
      this.playNote(784.00, "sine", 0.15, 0.28, 0.4);
      this.playNote(1046.50, "sine", 0.25, 0.40, 0.5);
    };

    // Play initial pattern immediately
    playRingPattern();

    // Repeat every 1.2 seconds while incoming request is active
    if (this.ringInterval) clearInterval(this.ringInterval);
    this.ringInterval = setInterval(() => {
      if (this.isPlaying && !this.isMuted) {
        playRingPattern();
      } else if (!this.isPlaying) {
        this.stopRingtone();
      }
    }, 1200);
  }

  /**
   * Stop incoming ringtone
   */
  stopRingtone() {
    this.isPlaying = false;
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  /**
   * Play positive sound chime when driver receives/accepts ride request
   */
  playAcceptSound() {
    this.stopRingtone();
    if (this.isMuted) return;

    // Pleasant ascending celebratory chime (C5 -> E5 -> G5 -> C6)
    this.playNote(523.25, "triangle", 0.12, 0, 0.4);
    this.playNote(659.25, "triangle", 0.12, 0.08, 0.45);
    this.playNote(784.00, "triangle", 0.12, 0.16, 0.5);
    this.playNote(1046.50, "sine", 0.35, 0.24, 0.6);
  }

  /**
   * Play decline sound when ride request is declined or cancelled
   */
  playDeclineSound() {
    this.stopRingtone();
    if (this.isMuted) return;

    // Descending notice tone (A4 -> F4)
    this.playNote(440.00, "sine", 0.15, 0, 0.3);
    this.playNote(349.23, "sine", 0.25, 0.12, 0.3);
  }

  /**
   * Test play the incoming ringtone sound for 2 seconds followed by accept sound
   */
  testRingtone() {
    this.getAudioContext();
    const wasMuted = this.isMuted;
    this.isMuted = false;
    this.startIncomingRingtone();

    setTimeout(() => {
      this.stopRingtone();
      this.playAcceptSound();
      this.isMuted = wasMuted;
    }, 1800);
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("driver_ringtone_muted", this.isMuted.toString());
    if (this.isMuted) {
      this.stopRingtone();
    }
    return this.isMuted;
  }

  getIsMuted() {
    return this.isMuted;
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const ringtoneService = new RingtoneService();
