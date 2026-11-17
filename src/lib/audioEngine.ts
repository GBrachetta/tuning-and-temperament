// Web Audio Microtonal Synthesizer for Harpsichord, Baroque Organ & Harmonic Analysis

export type InstrumentVoiceId =
  | 'organ-principal'
  | 'organ-plenum'
  | 'organ-flute'
  | 'harpsichord-flemish'
  | 'harpsichord-single'
  | 'regal-reed'
  | 'harmonic-lab';

export interface InstrumentVoiceSpec {
  id: InstrumentVoiceId;
  name: string;
  shortName: string;
  category: 'Organ' | 'Harpsichord' | 'Lab';
  description: string;
  sustained: boolean;
  /** Harmonic amplitudes [DC(0), f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12] */
  harmonics: number[];
  /** Optional second choir (e.g. 4' octave stop at 2x frequency) */
  octaveChoirGain?: number;
}

export const INSTRUMENT_VOICES: InstrumentVoiceSpec[] = [
  {
    id: 'organ-principal',
    name: "Baroque Organ Principal 8'",
    shortName: "Principal 8'",
    category: 'Organ',
    description: 'Open metal labial pipe (Montre / Prinzipal). Strong 1st–6th harmonics make 3:2 fifth and 5:4 third beats crystal clear.',
    sustained: true,
    harmonics: [0, 1.0, 0.68, 0.48, 0.36, 0.28, 0.20, 0.10, 0.08, 0.04, 0.03, 0.01, 0.01],
  },
  {
    id: 'organ-plenum',
    name: "Organ Plenum (8' + Octave 4')",
    shortName: "Organ 8'+4'",
    category: 'Organ',
    description: 'Principal 8\' coupled with Octave 4\' (Prestant) for noble Baroque organ polyphony and chorales.',
    sustained: true,
    harmonics: [0, 1.0, 0.72, 0.52, 0.42, 0.32, 0.25, 0.14, 0.12, 0.07, 0.05, 0.03, 0.02],
    octaveChoirGain: 0.35,
  },
  {
    id: 'harpsichord-flemish',
    name: "Flemish Harpsichord (8' + 4')",
    shortName: "Harpsichord 8'+4'",
    category: 'Harpsichord',
    description: 'Ruckers-style double choir plucked with bird quill. Crisp attack and shimmering upper partials that lock together in pure thirds.',
    sustained: false,
    harmonics: [0, 1.0, 0.85, 0.70, 0.58, 0.48, 0.38, 0.28, 0.22, 0.17, 0.13, 0.09, 0.07],
    octaveChoirGain: 0.28,
  },
  {
    id: 'harpsichord-single',
    name: "Italian Harpsichord (Single 8' Brass)",
    shortName: "Italian 8'",
    category: 'Harpsichord',
    description: 'Cypress & brass-strung single 8\' register with warm, singing decay ideal for Frescobaldi and Scarlatti.',
    sustained: false,
    harmonics: [0, 1.0, 0.78, 0.62, 0.48, 0.38, 0.26, 0.16, 0.12, 0.08, 0.05, 0.03, 0.02],
  },
  {
    id: 'organ-flute',
    name: "Organ Holzgedackt 8' (Stopped Flute)",
    shortName: "Gedackt 8'",
    category: 'Organ',
    description: 'Stopped oak pipe emphasizing odd harmonics (1st, 3rd, 5th) with gentle even partials—sweet and intimate.',
    sustained: true,
    harmonics: [0, 1.0, 0.22, 0.55, 0.18, 0.32, 0.10, 0.12, 0.04, 0.04, 0.01, 0.01, 0.0],
  },
  {
    id: 'regal-reed',
    name: "Renaissance Regal / Krummhorn 8'",
    shortName: "Regal Reed 8'",
    category: 'Organ',
    description: 'Brass beating-reed stop rich in upper overtones. Makes pure meantone chords buzz with golden warmth and wolf intervals roar.',
    sustained: true,
    harmonics: [0, 0.70, 0.90, 0.95, 0.85, 0.78, 0.65, 0.50, 0.42, 0.34, 0.26, 0.18, 0.14],
  },
  {
    id: 'harmonic-lab',
    name: 'Harmonic Tuner Lab (Partials 1–6)',
    shortName: 'Lab 1–6f',
    category: 'Lab',
    description: 'Calibrated laboratory waveform containing only Partials 1, 2, 3, 4, 5, and 6 so you can count exact beat rates by ear.',
    sustained: true,
    harmonics: [0, 1.0, 0.65, 0.50, 0.42, 0.36, 0.30, 0, 0, 0, 0, 0, 0],
  },
];

interface ActiveVoiceNode {
  noteKey: string;
  freqHz: number;
  osc1: OscillatorNode;
  osc2?: OscillatorNode;
  gainNode: GainNode;
  filterNode: BiquadFilterNode;
  decayTimeout?: number;
}

class MicrotonalAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private periodicWaves: Map<InstrumentVoiceId, PeriodicWave> = new Map();
  private activeNotes: Map<string, ActiveVoiceNode> = new Map();
  private currentVoice: InstrumentVoiceId = 'organ-principal';
  private masterVolume: number = 0.65;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -14;
      this.compressor.knee.value = 12;
      this.compressor.ratio.value = 4;
      this.compressor.attack.value = 0.005;
      this.compressor.release.value = 0.15;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVolume;

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);

      this.buildPeriodicWaves();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private buildPeriodicWaves() {
    if (!this.ctx) return;
    for (const spec of INSTRUMENT_VOICES) {
      const real = new Float32Array(spec.harmonics.length);
      const imag = new Float32Array(spec.harmonics.length);
      for (let i = 1; i < spec.harmonics.length; i++) {
        imag[i] = spec.harmonics[i];
      }
      const wave = this.ctx.createPeriodicWave(real, imag, { disableNormalization: false });
      this.periodicWaves.set(spec.id, wave);
    }
  }

  public setVoice(voiceId: InstrumentVoiceId) {
    this.currentVoice = voiceId;
    if (!this.ctx) return;
    const wave = this.periodicWaves.get(voiceId);
    if (!wave) return;
    for (const active of this.activeNotes.values()) {
      active.osc1.setPeriodicWave(wave);
      if (active.osc2) {
        active.osc2.setPeriodicWave(wave);
      }
    }
  }

  public getVoice(): InstrumentVoiceId {
    return this.currentVoice;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.02);
    }
  }

  /**
   * Starts playing a note identified by `noteKey` at exact `freqHz`.
   * If `forceSustain` is true (e.g. Drone/Hold mode), even harpsichord voices sustain gently
   * or re-pluck/sustain so the user can tune intervals hands-free.
   */
  public noteOn(noteKey: string, freqHz: number, forceSustain: boolean = false) {
    const ctx = this.ensureContext();
    if (this.activeNotes.has(noteKey)) {
      this.updateNoteFrequency(noteKey, freqHz);
      return;
    }

    const spec = INSTRUMENT_VOICES.find((v) => v.id === this.currentVoice) ?? INSTRUMENT_VOICES[0];
    const wave = this.periodicWaves.get(spec.id)!;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    osc1.setPeriodicWave(wave);
    osc1.frequency.setValueAtTime(freqHz, now);

    const filterNode = ctx.createBiquadFilter();
    filterNode.type = 'lowpass';

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, now);

    osc1.connect(filterNode);

    let osc2: OscillatorNode | undefined;
    if (spec.octaveChoirGain) {
      osc2 = ctx.createOscillator();
      osc2.setPeriodicWave(wave);
      // Pure 2:1 4-foot choir!
      osc2.frequency.setValueAtTime(freqHz * 2, now);
      const choirGain = ctx.createGain();
      choirGain.gain.setValueAtTime(spec.octaveChoirGain, now);
      osc2.connect(choirGain);
      choirGain.connect(filterNode);
    }

    filterNode.connect(gainNode);
    gainNode.connect(this.masterGain!);

    const isPlucked = !spec.sustained && !forceSustain;

    if (isPlucked) {
      // Harpsichord plucked string envelope & dynamic filter brightness
      filterNode.frequency.setValueAtTime(Math.min(14000, freqHz * 16), now);
      filterNode.frequency.exponentialRampToValueAtTime(Math.max(1200, freqHz * 4.5), now + 2.8);

      gainNode.gain.linearRampToValueAtTime(0.32, now + 0.006);
      gainNode.gain.exponentialRampToValueAtTime(0.14, now + 0.25);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 4.2);
    } else if (!spec.sustained && forceSustain) {
      // Harpsichord in Drone/Latch mode: pluck attack followed by sustained resonant singing
      filterNode.frequency.setValueAtTime(Math.min(12000, freqHz * 14), now);
      filterNode.frequency.exponentialRampToValueAtTime(Math.max(2200, freqHz * 6.5), now + 0.6);

      gainNode.gain.linearRampToValueAtTime(0.30, now + 0.008);
      gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.35);
    } else {
      // Organ pipe attack with subtle wind speech
      filterNode.frequency.setValueAtTime(Math.min(12000, freqHz * 12), now);
      gainNode.gain.linearRampToValueAtTime(0.24, now + 0.032);
      gainNode.gain.exponentialRampToValueAtTime(0.21, now + 0.12);
    }

    osc1.start(now);
    osc2?.start(now);

    const activeNode: ActiveVoiceNode = {
      noteKey,
      freqHz,
      osc1,
      osc2,
      gainNode,
      filterNode,
    };

    if (isPlucked) {
      activeNode.decayTimeout = window.setTimeout(() => {
        this.noteOff(noteKey, true);
      }, 4300);
    }

    this.activeNotes.set(noteKey, activeNode);
  }

  public noteOff(noteKey: string, immediate: boolean = false) {
    const active = this.activeNotes.get(noteKey);
    if (!active || !this.ctx) return;

    if (active.decayTimeout) {
      clearTimeout(active.decayTimeout);
    }

    this.activeNotes.delete(noteKey);
    const now = this.ctx.currentTime;
    const releaseTime = immediate ? 0.03 : 0.085;

    try {
      active.gainNode.gain.cancelScheduledValues(now);
      active.gainNode.gain.setValueAtTime(Math.max(0.0001, active.gainNode.gain.value), now);
      active.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);
      active.osc1.stop(now + releaseTime + 0.02);
      active.osc2?.stop(now + releaseTime + 0.02);
    } catch {
      // Ignore already stopped oscillators
    }
  }

  public updateNoteFrequency(noteKey: string, newFreqHz: number) {
    const active = this.activeNotes.get(noteKey);
    if (!active || !this.ctx) return;
    active.freqHz = newFreqHz;
    const now = this.ctx.currentTime;
    active.osc1.frequency.setTargetAtTime(newFreqHz, now, 0.012);
    if (active.osc2) {
      active.osc2.frequency.setTargetAtTime(newFreqHz * 2, now, 0.012);
    }
  }

  public stopAll() {
    for (const key of Array.from(this.activeNotes.keys())) {
      this.noteOff(key);
    }
  }

  /**
   * Plays a brief audition dyad or chord for a fixed duration (or toggles if already held)
   */
  public auditionFrequencies(notes: Array<{ key: string; freq: number }>, durationMs: number = 1800) {
    for (const n of notes) {
      this.noteOn(n.key, n.freq, true);
    }
    window.setTimeout(() => {
      for (const n of notes) {
        this.noteOff(n.key);
      }
    }, durationMs);
  }
}

export const audioEngine = new MicrotonalAudioEngine();
