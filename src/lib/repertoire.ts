// Curated Historical Keyboard Repertoire Excerpts for Live Temperament Comparison

import { InstrumentVoiceId } from './audioEngine';

export interface RepertoireNoteEvent {
  /** Pitch class 0..11 (0 = C, 1 = C#/Db, ..., 11 = B) */
  pitchClass: number;
  /** Octave number (3 = C3..B3, 4 = C4..B4, 5 = C5..B5) */
  octave: number;
  /** Optional explicit enharmonic request ('sharp' | 'flat') so split-key instruments can play true Ab vs G# */
  accidental?: 'sharp' | 'flat';
}

export interface RepertoireStep {
  /** Label of the harmony or measure (e.g. "m.1 C Major", "E Major (G♯)") */
  harmonyLabel: string;
  /** Duration in milliseconds at 1.0x tempo */
  durationMs: number;
  /** Notes sounding simultaneously or arpeggiated in this step */
  notes: RepertoireNoteEvent[];
  /** If arpeggioDelayMs > 0, notes enter sequentially and sustain through the step (like Bach BWV 846) */
  arpeggioDelayMs?: number;
}

export interface RepertoirePiece {
  id: string;
  title: string;
  composer: string;
  year: string;
  recommendedVoice: InstrumentVoiceId;
  recommendedTemperamentA: string;
  recommendedTemperamentB: string;
  description: string;
  whatToListenFor: string;
  steps: RepertoireStep[];
}

export const HISTORICAL_REPERTOIRE: RepertoirePiece[] = [
  {
    id: 'bach-bwv846',
    title: 'Prelude in C Major, BWV 846 (WTC Book I)',
    composer: 'Johann Sebastian Bach',
    year: '1722',
    recommendedVoice: 'harpsichord-flemish',
    recommendedTemperamentA: 'lehman-bach-1722',
    recommendedTemperamentB: 'equal-12tet',
    description: 'The opening 11 measures of The Well-Tempered Clavier, modulating from C Major through D minor, G Major, E minor, and A minor.',
    whatToListenFor: 'Toggle A/B between Bach/Vallotti/Kirnberger and 12-TET: listen to how calm and resonant the opening C–E–G arpeggio is when C–E is near-pure (+5.9¢ or 0¢) vs. the restless 10 Hz beating of 12-TET (+13.7¢).',
    steps: [
      {
        harmonyLabel: 'm.1 — C Major (I)',
        durationMs: 1850,
        arpeggioDelayMs: 190,
        notes: [
          { pitchClass: 0, octave: 4 },
          { pitchClass: 4, octave: 4 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 0, octave: 5 },
          { pitchClass: 4, octave: 5 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 0, octave: 5 },
          { pitchClass: 4, octave: 5 },
        ],
      },
      {
        harmonyLabel: 'm.2 — D minor 7 / C (ii⁴₂)',
        durationMs: 1850,
        arpeggioDelayMs: 190,
        notes: [
          { pitchClass: 0, octave: 4 },
          { pitchClass: 2, octave: 4 },
          { pitchClass: 9, octave: 4 },
          { pitchClass: 2, octave: 5 },
          { pitchClass: 5, octave: 5 },
          { pitchClass: 9, octave: 4 },
          { pitchClass: 2, octave: 5 },
          { pitchClass: 5, octave: 5 },
        ],
      },
      {
        harmonyLabel: 'm.3 — G Dominant 7 / B (V⁶₅)',
        durationMs: 1850,
        arpeggioDelayMs: 190,
        notes: [
          { pitchClass: 11, octave: 3 },
          { pitchClass: 2, octave: 4 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 2, octave: 5 },
          { pitchClass: 5, octave: 5 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 2, octave: 5 },
          { pitchClass: 5, octave: 5 },
        ],
      },
      {
        harmonyLabel: 'm.4 — C Major (I)',
        durationMs: 1850,
        arpeggioDelayMs: 190,
        notes: [
          { pitchClass: 0, octave: 4 },
          { pitchClass: 4, octave: 4 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 0, octave: 5 },
          { pitchClass: 4, octave: 5 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 0, octave: 5 },
          { pitchClass: 4, octave: 5 },
        ],
      },
      {
        harmonyLabel: 'm.5 — A minor / C (vi⁶)',
        durationMs: 1850,
        arpeggioDelayMs: 190,
        notes: [
          { pitchClass: 0, octave: 4 },
          { pitchClass: 4, octave: 4 },
          { pitchClass: 9, octave: 4 },
          { pitchClass: 4, octave: 5 },
          { pitchClass: 9, octave: 5 },
          { pitchClass: 9, octave: 4 },
          { pitchClass: 4, octave: 5 },
          { pitchClass: 9, octave: 5 },
        ],
      },
      {
        harmonyLabel: 'm.6 — D Dominant 7 / C (V⁴₂ of V)',
        durationMs: 1850,
        arpeggioDelayMs: 190,
        notes: [
          { pitchClass: 0, octave: 4 },
          { pitchClass: 2, octave: 4 },
          { pitchClass: 6, octave: 4, accidental: 'sharp' },
          { pitchClass: 9, octave: 4 },
          { pitchClass: 2, octave: 5 },
          { pitchClass: 6, octave: 4, accidental: 'sharp' },
          { pitchClass: 9, octave: 4 },
          { pitchClass: 2, octave: 5 },
        ],
      },
      {
        harmonyLabel: 'm.7 — G Major / B (V⁶)',
        durationMs: 1850,
        arpeggioDelayMs: 190,
        notes: [
          { pitchClass: 11, octave: 3 },
          { pitchClass: 2, octave: 4 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 2, octave: 5 },
          { pitchClass: 7, octave: 5 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 2, octave: 5 },
          { pitchClass: 7, octave: 5 },
        ],
      },
      {
        harmonyLabel: 'm.8 — C Major 7 / B',
        durationMs: 1850,
        arpeggioDelayMs: 190,
        notes: [
          { pitchClass: 11, octave: 3 },
          { pitchClass: 0, octave: 4 },
          { pitchClass: 4, octave: 4 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 0, octave: 5 },
          { pitchClass: 4, octave: 4 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 0, octave: 5 },
        ],
      },
      {
        harmonyLabel: 'm.9 — A minor 7 (ii7 of G)',
        durationMs: 1850,
        arpeggioDelayMs: 190,
        notes: [
          { pitchClass: 9, octave: 3 },
          { pitchClass: 0, octave: 4 },
          { pitchClass: 4, octave: 4 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 0, octave: 5 },
          { pitchClass: 4, octave: 4 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 0, octave: 5 },
        ],
      },
      {
        harmonyLabel: 'm.10 — D Dominant 7 (V7 of G)',
        durationMs: 1850,
        arpeggioDelayMs: 190,
        notes: [
          { pitchClass: 2, octave: 3 },
          { pitchClass: 9, octave: 3 },
          { pitchClass: 2, octave: 4 },
          { pitchClass: 6, octave: 4, accidental: 'sharp' },
          { pitchClass: 0, octave: 5 },
          { pitchClass: 2, octave: 4 },
          { pitchClass: 6, octave: 4, accidental: 'sharp' },
          { pitchClass: 0, octave: 5 },
        ],
      },
      {
        harmonyLabel: 'm.11 — G Major Arrival (V)',
        durationMs: 2400,
        arpeggioDelayMs: 190,
        notes: [
          { pitchClass: 7, octave: 3 },
          { pitchClass: 11, octave: 3 },
          { pitchClass: 2, octave: 4 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 11, octave: 4 },
          { pitchClass: 2, octave: 4 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 11, octave: 4 },
        ],
      },
    ],
  },
  {
    id: 'frescobaldi-elevazione',
    title: 'Toccata Cromatica per l’Elevazione (Fiori Musicali)',
    composer: 'Girolamo Frescobaldi',
    year: '1635',
    recommendedVoice: 'organ-principal',
    recommendedTemperamentA: 'quarter-meantone',
    recommendedTemperamentB: 'vallotti',
    description: 'Sustained Italian Baroque organ polyphony featuring radiant meantone major triads (E, A, D, G, C, F) and an expressive chromatic excursion to A♭ and E♭.',
    whatToListenFor: 'In 1/4-Comma Meantone (Slot A), notice how the E Major, A Major, D Major, and C Major chords lock into completely beatless, celestial stillness—and then hear what happens on step 7 (A♭ Major) with Split Keys ON vs. OFF!',
    steps: [
      {
        harmonyLabel: '1. E Major (Pure E–G♯–B)',
        durationMs: 2400,
        notes: [
          { pitchClass: 4, octave: 3 },
          { pitchClass: 11, octave: 3 },
          { pitchClass: 4, octave: 4 },
          { pitchClass: 8, octave: 4, accidental: 'sharp' },
        ],
      },
      {
        harmonyLabel: '2. A minor → A Major (Pure A–C♯–E)',
        durationMs: 2400,
        notes: [
          { pitchClass: 9, octave: 3 },
          { pitchClass: 4, octave: 4 },
          { pitchClass: 9, octave: 4 },
          { pitchClass: 1, octave: 5, accidental: 'sharp' },
        ],
      },
      {
        harmonyLabel: '3. D Major (Pure D–F♯–A)',
        durationMs: 2400,
        notes: [
          { pitchClass: 2, octave: 3 },
          { pitchClass: 9, octave: 3 },
          { pitchClass: 2, octave: 4 },
          { pitchClass: 6, octave: 4, accidental: 'sharp' },
        ],
      },
      {
        harmonyLabel: '4. G Major (Pure G–B–D)',
        durationMs: 2400,
        notes: [
          { pitchClass: 7, octave: 3 },
          { pitchClass: 2, octave: 4 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 11, octave: 4 },
        ],
      },
      {
        harmonyLabel: '5. C Major (Pure C–E–G)',
        durationMs: 2400,
        notes: [
          { pitchClass: 0, octave: 3 },
          { pitchClass: 7, octave: 3 },
          { pitchClass: 0, octave: 4 },
          { pitchClass: 4, octave: 4 },
        ],
      },
      {
        harmonyLabel: '6. F Major (Pure F–A–C)',
        durationMs: 2400,
        notes: [
          { pitchClass: 5, octave: 3 },
          { pitchClass: 0, octave: 4 },
          { pitchClass: 5, octave: 4 },
          { pitchClass: 9, octave: 4 },
        ],
      },
      {
        harmonyLabel: '7. Chromatic Shift: A♭ Major (A♭–C–E♭ — Try Split Key Toggle!)',
        durationMs: 2800,
        notes: [
          { pitchClass: 8, octave: 3, accidental: 'flat' },
          { pitchClass: 3, octave: 4, accidental: 'flat' },
          { pitchClass: 8, octave: 4, accidental: 'flat' },
          { pitchClass: 0, octave: 5 },
        ],
      },
      {
        harmonyLabel: '8. G Major Phrygian Half-Cadence (G–B–D)',
        durationMs: 2400,
        notes: [
          { pitchClass: 7, octave: 3 },
          { pitchClass: 2, octave: 4 },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 11, octave: 4 },
        ],
      },
      {
        harmonyLabel: '9. Final Tierce de Picardie: A Major (A–C♯–E)',
        durationMs: 3000,
        notes: [
          { pitchClass: 9, octave: 3 },
          { pitchClass: 4, octave: 4 },
          { pitchClass: 9, octave: 4 },
          { pitchClass: 1, octave: 5, accidental: 'sharp' },
        ],
      },
    ],
  },
  {
    id: 'buxtehude-fsharp-minor',
    title: 'Praeludium in F♯ Minor, BuxWV 146 (Opening Grave)',
    composer: 'Dieterich Buxtehude',
    year: 'c. 1690',
    recommendedVoice: 'organ-plenum',
    recommendedTemperamentA: 'schnitger-norden',
    recommendedTemperamentB: 'quarter-meantone',
    description: 'Buxtehude’s daring North German organ masterpiece in F♯ minor, featuring C♯ Major dominants and a blazing F♯ Major Picardy cadence.',
    whatToListenFor: 'Compare Arp Schnitger’s Norden organ temperament (Slot A) against strict 1/4-Comma Meantone (Slot B). In strict meantone without split keys, C♯ Major and F♯ Major howl with wolf intervals; in Schnitger or Werckmeister III, they ring out with dark, fiery grandeur!',
    steps: [
      {
        harmonyLabel: '1. F♯ minor Tonic (F♯–A–C♯)',
        durationMs: 2200,
        notes: [
          { pitchClass: 6, octave: 3, accidental: 'sharp' },
          { pitchClass: 1, octave: 4, accidental: 'sharp' },
          { pitchClass: 6, octave: 4, accidental: 'sharp' },
          { pitchClass: 9, octave: 4 },
        ],
      },
      {
        harmonyLabel: '2. D Major Sixth (F♯–D–A)',
        durationMs: 2000,
        notes: [
          { pitchClass: 6, octave: 3, accidental: 'sharp' },
          { pitchClass: 2, octave: 4 },
          { pitchClass: 9, octave: 4 },
          { pitchClass: 2, octave: 5 },
        ],
      },
      {
        harmonyLabel: '3. B minor Subdominant (B–D–F♯)',
        durationMs: 2000,
        notes: [
          { pitchClass: 11, octave: 3 },
          { pitchClass: 6, octave: 4, accidental: 'sharp' },
          { pitchClass: 11, octave: 4 },
          { pitchClass: 2, octave: 5 },
        ],
      },
      {
        harmonyLabel: '4. C♯ Major Dominant (C♯–E♯/F–G♯)',
        durationMs: 2500,
        notes: [
          { pitchClass: 1, octave: 3, accidental: 'sharp' },
          { pitchClass: 8, octave: 3, accidental: 'sharp' },
          { pitchClass: 1, octave: 4, accidental: 'sharp' },
          { pitchClass: 5, octave: 4 },
        ],
      },
      {
        harmonyLabel: '5. F♯ Major Picardy Resolution (F♯–A♯–C♯)',
        durationMs: 3200,
        notes: [
          { pitchClass: 6, octave: 3, accidental: 'sharp' },
          { pitchClass: 1, octave: 4, accidental: 'sharp' },
          { pitchClass: 6, octave: 4, accidental: 'sharp' },
          { pitchClass: 10, octave: 4, accidental: 'sharp' },
        ],
      },
    ],
  },
  {
    id: 'couperin-barricades',
    title: 'Les Barricades Mistérieuses (B♭ Major)',
    composer: 'François Couperin',
    year: '1717',
    recommendedVoice: 'harpsichord-flemish',
    recommendedTemperamentA: 'rameau-ordinaire',
    recommendedTemperamentB: 'equal-12tet',
    description: 'Luminous French clavecin style brisé in B♭ Major, weaving chains of 2–3 suspensions across B♭, E♭, C minor, and F Major.',
    whatToListenFor: 'In Rameau’s Tempérament Ordinaire (Slot A), B♭–D and F–A are pure meantone thirds while E♭–G has a warm French shimmer.',
    steps: [
      {
        harmonyLabel: '1. B♭ Major (B♭–D–F)',
        durationMs: 1800,
        arpeggioDelayMs: 140,
        notes: [
          { pitchClass: 10, octave: 3, accidental: 'flat' },
          { pitchClass: 2, octave: 4 },
          { pitchClass: 5, octave: 4 },
          { pitchClass: 10, octave: 4, accidental: 'flat' },
        ],
      },
      {
        harmonyLabel: '2. E♭ Major 6/4 Suspension (B♭–E♭–G)',
        durationMs: 1800,
        arpeggioDelayMs: 140,
        notes: [
          { pitchClass: 10, octave: 3, accidental: 'flat' },
          { pitchClass: 3, octave: 4, accidental: 'flat' },
          { pitchClass: 7, octave: 4 },
          { pitchClass: 10, octave: 4, accidental: 'flat' },
        ],
      },
      {
        harmonyLabel: '3. F Dominant 7 / A (A–E♭–F–C)',
        durationMs: 1800,
        arpeggioDelayMs: 140,
        notes: [
          { pitchClass: 9, octave: 3 },
          { pitchClass: 3, octave: 4, accidental: 'flat' },
          { pitchClass: 5, octave: 4 },
          { pitchClass: 0, octave: 5 },
        ],
      },
      {
        harmonyLabel: '4. G minor 7 (G–D–F–B♭)',
        durationMs: 1800,
        arpeggioDelayMs: 140,
        notes: [
          { pitchClass: 7, octave: 3 },
          { pitchClass: 2, octave: 4 },
          { pitchClass: 5, octave: 4 },
          { pitchClass: 10, octave: 4, accidental: 'flat' },
        ],
      },
      {
        harmonyLabel: '5. E♭ Major (E♭–G–B♭)',
        durationMs: 1800,
        arpeggioDelayMs: 140,
        notes: [
          { pitchClass: 3, octave: 3, accidental: 'flat' },
          { pitchClass: 7, octave: 3 },
          { pitchClass: 3, octave: 4, accidental: 'flat' },
          { pitchClass: 7, octave: 4 },
        ],
      },
      {
        harmonyLabel: '6. F Major Dominant (F–A–C–F)',
        durationMs: 1800,
        arpeggioDelayMs: 140,
        notes: [
          { pitchClass: 5, octave: 3 },
          { pitchClass: 0, octave: 4 },
          { pitchClass: 5, octave: 4 },
          { pitchClass: 9, octave: 4 },
        ],
      },
      {
        harmonyLabel: '7. B♭ Major Resolution (B♭–D–F–B♭)',
        durationMs: 2600,
        arpeggioDelayMs: 140,
        notes: [
          { pitchClass: 10, octave: 3, accidental: 'flat' },
          { pitchClass: 5, octave: 4 },
          { pitchClass: 10, octave: 4, accidental: 'flat' },
          { pitchClass: 2, octave: 5 },
        ],
      },
    ],
  },
  {
    id: 'circle-of-fifths-promenade',
    title: 'All 12 Major Triads around the Circle of Fifths',
    composer: 'Acoustic Key-Color Tour',
    year: 'C → G → D → A → E → B → F♯ → D♭ → A♭ → E♭ → B♭ → F',
    recommendedVoice: 'organ-principal',
    recommendedTemperamentA: 'vallotti',
    recommendedTemperamentB: 'quarter-meantone',
    description: 'Steps clockwise through all 12 Major Triads around the Circle of Fifths so you can hear the gradual transformation of key color.',
    whatToListenFor: 'In Vallotti (Slot A), hear the smooth journey from serene C/G/D major to bright, fiery B/F♯/D♭ major and back. Flip to 1/4-Comma Meantone (Slot B) to hear 8 pure triads contrasted with the dramatic wolf keys!',
    steps: [
      { harmonyLabel: '1. C Major', durationMs: 1600, notes: [{ pitchClass: 0, octave: 4 }, { pitchClass: 4, octave: 4 }, { pitchClass: 7, octave: 4 }] },
      { harmonyLabel: '2. G Major', durationMs: 1600, notes: [{ pitchClass: 7, octave: 3 }, { pitchClass: 11, octave: 3 }, { pitchClass: 2, octave: 4 }] },
      { harmonyLabel: '3. D Major', durationMs: 1600, notes: [{ pitchClass: 2, octave: 4 }, { pitchClass: 6, octave: 4, accidental: 'sharp' }, { pitchClass: 9, octave: 4 }] },
      { harmonyLabel: '4. A Major', durationMs: 1600, notes: [{ pitchClass: 9, octave: 3 }, { pitchClass: 1, octave: 4, accidental: 'sharp' }, { pitchClass: 4, octave: 4 }] },
      { harmonyLabel: '5. E Major', durationMs: 1600, notes: [{ pitchClass: 4, octave: 4 }, { pitchClass: 8, octave: 4, accidental: 'sharp' }, { pitchClass: 11, octave: 4 }] },
      { harmonyLabel: '6. B Major', durationMs: 1600, notes: [{ pitchClass: 11, octave: 3 }, { pitchClass: 3, octave: 4, accidental: 'sharp' }, { pitchClass: 6, octave: 4, accidental: 'sharp' }] },
      { harmonyLabel: '7. F♯ Major', durationMs: 1600, notes: [{ pitchClass: 6, octave: 3, accidental: 'sharp' }, { pitchClass: 10, octave: 3, accidental: 'sharp' }, { pitchClass: 1, octave: 4, accidental: 'sharp' }] },
      { harmonyLabel: '8. D♭ Major', durationMs: 1600, notes: [{ pitchClass: 1, octave: 4, accidental: 'flat' }, { pitchClass: 5, octave: 4 }, { pitchClass: 8, octave: 4, accidental: 'flat' }] },
      { harmonyLabel: '9. A♭ Major', durationMs: 1600, notes: [{ pitchClass: 8, octave: 3, accidental: 'flat' }, { pitchClass: 0, octave: 4 }, { pitchClass: 3, octave: 4, accidental: 'flat' }] },
      { harmonyLabel: '10. E♭ Major', durationMs: 1600, notes: [{ pitchClass: 3, octave: 4, accidental: 'flat' }, { pitchClass: 7, octave: 4 }, { pitchClass: 10, octave: 4, accidental: 'flat' }] },
      { harmonyLabel: '11. B♭ Major', durationMs: 1600, notes: [{ pitchClass: 10, octave: 3, accidental: 'flat' }, { pitchClass: 2, octave: 4 }, { pitchClass: 5, octave: 4 }] },
      { harmonyLabel: '12. F Major', durationMs: 1600, notes: [{ pitchClass: 5, octave: 3 }, { pitchClass: 9, octave: 3 }, { pitchClass: 0, octave: 4 }] },
    ],
  },
];
