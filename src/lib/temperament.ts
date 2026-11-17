// Core Mathematical & Historical Temperament Engine for Keyboards (Harpsichord & Organ)

export const PURE_FIFTH_CENTS = 1200 * Math.log2(3 / 2); // 701.9550008653874
export const PURE_FOURTH_CENTS = 1200 - PURE_FIFTH_CENTS; // 498.0449991346126
export const PURE_MAJOR_THIRD_CENTS = 1200 * Math.log2(5 / 4); // 386.3137138648348
export const PURE_MINOR_THIRD_CENTS = 1200 * Math.log2(6 / 5); // 315.64128700055255
export const SYNTONIC_COMMA_CENTS = 1200 * Math.log2(81 / 80); // 21.50628959671485
export const PYTHAGOREAN_COMMA_CENTS = 1200 * Math.log2(531441 / 524288); // 23.460010384649014
export const SCHISMA_CENTS = PYTHAGOREAN_COMMA_CENTS - SYNTONIC_COMMA_CENTS; // 1.95372078793416

export type CommaUnit = 'syntonic' | 'pythagorean' | 'cents';

export type TemperamentCategory =
  | 'Custom'
  | 'Meantone'
  | 'German & Bach-Era'
  | 'Italian, French & English'
  | 'Pythagorean, Medieval & Just'
  | 'Equal';

// Circle of Fifths ordering starting at C (0) clockwise
export interface CircleNodeInfo {
  circleIndex: number; // 0..11 around circle of fifths
  pitchClass: number;  // 0..11 chromatic semitones from C
  sharpName: string;
  flatName: string;
  defaultAccidental: 'sharp' | 'flat' | 'natural';
}

export const CIRCLE_OF_FIFTHS: CircleNodeInfo[] = [
  { circleIndex: 0,  pitchClass: 0,  sharpName: 'C',  flatName: 'C',  defaultAccidental: 'natural' },
  { circleIndex: 1,  pitchClass: 7,  sharpName: 'G',  flatName: 'G',  defaultAccidental: 'natural' },
  { circleIndex: 2,  pitchClass: 2,  sharpName: 'D',  flatName: 'D',  defaultAccidental: 'natural' },
  { circleIndex: 3,  pitchClass: 9,  sharpName: 'A',  flatName: 'A',  defaultAccidental: 'natural' },
  { circleIndex: 4,  pitchClass: 4,  sharpName: 'E',  flatName: 'E',  defaultAccidental: 'natural' },
  { circleIndex: 5,  pitchClass: 11, sharpName: 'B',  flatName: 'B',  defaultAccidental: 'natural' },
  { circleIndex: 6,  pitchClass: 6,  sharpName: 'F♯', flatName: 'G♭', defaultAccidental: 'sharp' },
  { circleIndex: 7,  pitchClass: 1,  sharpName: 'C♯', flatName: 'D♭', defaultAccidental: 'sharp' },
  { circleIndex: 8,  pitchClass: 8,  sharpName: 'G♯', flatName: 'A♭', defaultAccidental: 'sharp' },
  { circleIndex: 9,  pitchClass: 3,  sharpName: 'D♯', flatName: 'E♭', defaultAccidental: 'flat' },
  { circleIndex: 10, pitchClass: 10, sharpName: 'A♯', flatName: 'B♭', defaultAccidental: 'flat' },
  { circleIndex: 11, pitchClass: 5,  sharpName: 'F',  flatName: 'F',  defaultAccidental: 'natural' },
];

export const FIFTH_PAIR_LABELS = [
  'C–G', 'G–D', 'D–A', 'A–E', 'E–B', 'B–F♯',
  'F♯–C♯', 'C♯–G♯', 'G♯–E♭', 'E♭–B♭', 'B♭–F', 'F–C'
];

export interface TemperamentPreset {
  id: string;
  name: string;
  year: string;
  author: string;
  category: TemperamentCategory;
  commaUnit: CommaUnit;
  wolfCircleIndex: number; // Which fifth absorbs the remainder (usually 8: G#-Eb)
  /**
   * Array of 12 fifth deviations in CENTS from a pure 3:2 fifth (701.955c),
   * indexed by Circle of Fifths position 0..11:
   * 0: C-G, 1: G-D, 2: D-A, 3: A-E, 4: E-B, 5: B-F#,
   * 6: F#-C#, 7: C#-G#, 8: G#-Eb, 9: Eb-Bb, 10: Bb-F, 11: F-C
   */
  fifthDeviationsCents: number[];
  /** Preferred spelling ('sharp' or 'flat') for nodes 6,7,8,9,10 */
  spellings: Record<number, 'sharp' | 'flat'>;
  description: string;
  historicalContext: string;
  isUserCustom?: boolean;
}

const sc = SYNTONIC_COMMA_CENTS;
const pc = PYTHAGOREAN_COMMA_CENTS;

export function makeFifthsWithClosure(
  elevenFifths: Record<number, number>,
  wolfIndex: number = 8
): number[] {
  const arr = new Array(12).fill(0);
  let sumOthers = 0;
  for (let i = 0; i < 12; i++) {
    if (i !== wolfIndex) {
      arr[i] = elevenFifths[i] ?? 0;
      sumOthers += arr[i];
    }
  }
  // Total sum of all 12 fifth deviations from pure 3:2 must equal -PYTHAGOREAN_COMMA_CENTS
  arr[wolfIndex] = -PYTHAGOREAN_COMMA_CENTS - sumOthers;
  return arr;
}

export const HISTORICAL_PRESETS: TemperamentPreset[] = [
  // ============================================================================
  // 1. MEANTONE TEMPERAMENTS (RENAISSANCE & BAROQUE)
  // ============================================================================
  {
    id: 'quarter-meantone',
    name: '1/4-Comma Meantone',
    year: '1523',
    author: 'Pietro Aaron',
    category: 'Meantone',
    commaUnit: 'syntonic',
    wolfCircleIndex: 8, // G# - Eb
    fifthDeviationsCents: makeFifthsWithClosure(
      { 0: -sc/4, 1: -sc/4, 2: -sc/4, 3: -sc/4, 4: -sc/4, 5: -sc/4, 6: -sc/4, 7: -sc/4, 9: -sc/4, 10: -sc/4, 11: -sc/4 },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'sharp', 9: 'flat', 10: 'flat' },
    description: '11 fifths narrowed by 1/4 syntonic comma (-5.38¢), yielding 8 completely pure, beatless 5:4 major thirds (C–E, G–B, D–F♯, A–C♯, E–G♯, F–A, B♭–D, E♭–G).',
    historicalContext: 'The standard Renaissance and early Baroque keyboard tuning for organs and harpsichords across Europe (Sweelinck, Frescobaldi, Byrd, Praetorius). Distant keys produce the famous howling "Wolf" fifth (G♯–E♭, +35.68¢ wide) unless split keys are used.'
  },
  {
    id: 'zarlino-2-7-meantone',
    name: '2/7-Comma Meantone (Zarlino)',
    year: '1558',
    author: 'Gioseffo Zarlino',
    category: 'Meantone',
    commaUnit: 'syntonic',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      { 0: -2*sc/7, 1: -2*sc/7, 2: -2*sc/7, 3: -2*sc/7, 4: -2*sc/7, 5: -2*sc/7, 6: -2*sc/7, 7: -2*sc/7, 9: -2*sc/7, 10: -2*sc/7, 11: -2*sc/7 },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'sharp', 9: 'flat', 10: 'flat' },
    description: '11 fifths narrowed by 2/7 syntonic comma (-6.14¢). Produces 100% pure 6:5 minor thirds (315.64¢), while major thirds are 1/7 comma narrower than pure (-3.07¢).',
    historicalContext: 'Published by Venetian theorist Gioseffo Zarlino in Le Istitutioni Harmoniche (1558). Gives minor triads an extraordinary dark, beatless purity and makes chromatic semitones intensely expressive.'
  },
  {
    id: 'salinas-1-3-meantone',
    name: '1/3-Comma Meantone (Salinas)',
    year: '1577',
    author: 'Francisco de Salinas',
    category: 'Meantone',
    commaUnit: 'syntonic',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      { 0: -sc/3, 1: -sc/3, 2: -sc/3, 3: -sc/3, 4: -sc/3, 5: -sc/3, 6: -sc/3, 7: -sc/3, 9: -sc/3, 10: -sc/3, 11: -sc/3 },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'sharp', 9: 'flat', 10: 'flat' },
    description: '11 fifths narrowed by 1/3 syntonic comma (-7.17¢). Minor thirds are completely pure (315.64¢), and the 19-tone cycle nearly closes.',
    historicalContext: 'Described by blind Spanish organist and theorist Francisco de Salinas (De musica libri septem, 1577). Particularly suited to 19-notes-per-octave split-key harpsichords (cimbalo cromatico).'
  },
  {
    id: 'fifth-meantone',
    name: '1/5-Comma Meantone',
    year: '1596',
    author: 'Abraham Verheijen / Lemme Rossi',
    category: 'Meantone',
    commaUnit: 'syntonic',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      { 0: -sc/5, 1: -sc/5, 2: -sc/5, 3: -sc/5, 4: -sc/5, 5: -sc/5, 6: -sc/5, 7: -sc/5, 9: -sc/5, 10: -sc/5, 11: -sc/5 },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'sharp', 9: 'flat', 10: 'flat' },
    description: '11 fifths narrowed by 1/5 syntonic comma (-4.30¢). Major thirds (+4.30¢) and fifths (-4.30¢) share the exact same gentle deviation from pure.',
    historicalContext: 'Praised by French, Dutch, and Italian builders for balancing sweet major thirds with cleaner fifths and a significantly reduced wolf (+23.85¢).'
  },
  {
    id: 'sixth-meantone-silbermann',
    name: '1/6-Comma Meantone (Silbermann)',
    year: 'c. 1720',
    author: 'Gottfried Silbermann',
    category: 'Meantone',
    commaUnit: 'syntonic',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      { 0: -sc/6, 1: -sc/6, 2: -sc/6, 3: -sc/6, 4: -sc/6, 5: -sc/6, 6: -sc/6, 7: -sc/6, 9: -sc/6, 10: -sc/6, 11: -sc/6 },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'sharp', 9: 'flat', 10: 'flat' },
    description: '11 fifths narrowed by 1/6 syntonic comma (-3.58¢). Major thirds sit 1/3 comma (+7.17¢) above pure, giving brighter triads and a milder wolf fifth (+15.97¢).',
    historicalContext: 'Used by legendary Saxon organ builder Gottfried Silbermann (whom J.S. Bach famously teased about his wolf keys) and widely favored on 18th-century German and English organs.'
  },

  // ============================================================================
  // 2. GERMAN & BACH-ERA ORGAN / CLAVIER TEMPERAMENTS
  // ============================================================================
  {
    id: 'schlick-1511',
    name: 'Arnolt Schlick (Spiegel der Orgelmacher)',
    year: '1511',
    author: 'Arnolt Schlick',
    category: 'German & Bach-Era',
    commaUnit: 'syntonic',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      {
        11: -sc/5, 0: -sc/5, 1: -sc/5, 2: -sc/5, 3: -sc/5, 4: -sc/5, // F-C-G-D-A-E-B
        5: -sc/10, 6: -sc/10, // B-F#-C#
        9: -sc/10, 10: -sc/10, // Eb-Bb-F
        7: +sc/10, // C#-Ab compromised halfway!
      },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'flat', 9: 'flat', 10: 'flat' },
    description: 'Diatonic fifths F–B narrowed by ~1/5 comma, flanking fifths by ~1/10 comma, and G♯/A♭ placed precisely halfway between E–G♯ and A♭–E♭.',
    historicalContext: 'The earliest printed organ temperament in history (Mainz, 1511). Schlick explicitly instructs tuning G♯/A♭ as a compromise ("neither a good third to E nor a good fifth to E♭") so there is no unplayable wolf!'
  },
  {
    id: 'schnitger-norden',
    name: 'Modified Meantone (Arp Schnitger / Norden)',
    year: '1688',
    author: 'Arp Schnitger / H. Vogel',
    category: 'German & Bach-Era',
    commaUnit: 'syntonic',
    wolfCircleIndex: 7, // C# - G#
    fifthDeviationsCents: makeFifthsWithClosure(
      {
        11: -sc/5, 0: -sc/5, 1: -sc/5, 2: -sc/5, 3: -sc/5, 4: -sc/5, 5: -sc/5, 6: -sc/5, // F to C# (-1/5sc)
        9: 0, 10: 0, // Eb-Bb-F pure
        8: +sc/5,    // G#-Eb slightly wide
      },
      7
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'sharp', 9: 'flat', 10: 'flat' },
    description: '8 fifths (F to C♯) narrowed by 1/5 syntonic comma, 2 pure fifths (E♭–B♭–F), and 2 slightly wide fifths across G♯/A♭.',
    historicalContext: 'Representative of North German Hanseatic organs of Buxtehude, Bruhns, and Lübeck. Keeps meantone purity in common keys while making F♯ major and C♯ major thrillingly playable without a wolf.'
  },
  {
    id: 'werckmeister-iii',
    name: 'Werckmeister III (Correct T. #1)',
    year: '1691',
    author: 'Andreas Werckmeister',
    category: 'German & Bach-Era',
    commaUnit: 'pythagorean',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      { 0: -pc/4, 1: -pc/4, 2: -pc/4, 5: -pc/4 },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'sharp', 9: 'flat', 10: 'flat' },
    description: '4 fifths (C–G, G–D, D–A, B–F♯) narrowed by 1/4 Pythagorean comma (-5.87¢); the remaining 8 fifths are completely pure (0¢).',
    historicalContext: 'The most famous early German "Good Temperament" (Musicalische Temperatur, 1691). Eliminates the wolf so all 24 keys are playable, while giving C, F, and G major warm konsonanz and remote keys expressive tension.'
  },
  {
    id: 'werckmeister-iv',
    name: 'Werckmeister IV (Septenaria)',
    year: '1691',
    author: 'Andreas Werckmeister',
    category: 'German & Bach-Era',
    commaUnit: 'pythagorean',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      {
        0: -pc/3, 2: -pc/3, 4: -pc/3, 6: -pc/3, 10: -pc/3, // 5 fifths narrowed by 1/3 comma
        9: +pc/3, // Eb-Bb wide by +1/3 comma (and closure 8 G#-Eb also becomes +1/3 comma!)
      },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'sharp', 9: 'flat', 10: 'flat' },
    description: '5 fifths (C–G, D–A, E–B, F♯–C♯, B♭–F) narrowed by 1/3 comma (-7.82¢), 2 fifths (G♯–E♭, E♭–B♭) widened by +1/3 comma (+7.82¢), and 5 pure fifths.',
    historicalContext: 'Werckmeister’s second corrective temperament, praised for making diatonic keys sound closely akin to meantone while remaining playable (with dramatic bite) in remote keys.'
  },
  {
    id: 'werckmeister-v',
    name: 'Werckmeister V',
    year: '1691',
    author: 'Andreas Werckmeister',
    category: 'German & Bach-Era',
    commaUnit: 'pythagorean',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      {
        2: -pc/4, 3: -pc/4, 6: -pc/4, 7: -pc/4, 11: -pc/4, // 5 fifths narrowed by 1/4 comma
        // Closure 8 (G#-Eb) automatically becomes +1/4 comma wide!
      },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'flat', 9: 'flat', 10: 'flat' },
    description: '5 fifths (D–A, A–E, F♯–C♯, C♯–G♯, F–C) narrowed by 1/4 Pythagorean comma (-5.87¢), 1 fifth (G♯–E♭) widened by +1/4 comma, and 6 pure fifths.',
    historicalContext: 'A remarkably balanced temperament from Werckmeister’s 1691 treatise where no major third exceeds a Pythagorean ditone and sharp keys are unusually sweet.'
  },
  {
    id: 'lehman-bach-1722',
    name: 'Bach "WTC Scroll" (Lehman)',
    year: '1722 / 2005',
    author: 'J.S. Bach / Bradley Lehman',
    category: 'German & Bach-Era',
    commaUnit: 'pythagorean',
    wolfCircleIndex: 10, // Bb-F is pure
    fifthDeviationsCents: makeFifthsWithClosure(
      {
        11: -pc/6, 0: -pc/6, 1: -pc/6, 2: -pc/6, 3: -pc/6, // F-C-G-D-A-E at -1/6pc
        4: 0, 5: 0, 6: 0, // E-B-F#-C# pure
        7: -pc/12, 8: -pc/12, 9: -pc/12, // C#-G#-Eb-Bb at -1/12pc
      },
      10
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'flat', 9: 'flat', 10: 'flat' },
    description: '5 fifths (F–C–G–D–A–E) at -1/6 Pythagorean comma, 3 pure fifths (E–B–F♯–C♯), 3 fifths (C♯–G♯–E♭–B♭) at -1/12 comma, and 1 pure fifth (B♭–F).',
    historicalContext: 'Decoded by harpsichordist Bradley Lehman (2005) from the 11 loops drawn by J.S. Bach at the top of the 1722 autograph title page of The Well-Tempered Clavier. Gives distinct flavors to sharp vs. flat keys.'
  },
  {
    id: 'kellner-bach',
    name: 'Kellner "Bach" Temperament',
    year: '1975',
    author: 'Herbert Anton Kellner',
    category: 'German & Bach-Era',
    commaUnit: 'pythagorean',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      { 0: -pc/5, 1: -pc/5, 2: -pc/5, 3: -pc/5, 5: -pc/5 },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'flat', 9: 'flat', 10: 'flat' },
    description: '5 fifths (C–G, G–D, D–A, A–E, and B–F♯) narrowed by 1/5 Pythagorean comma (-4.69¢); the other 7 fifths are completely pure.',
    historicalContext: 'A cousin of Werckmeister III that tempers A–E so C–E is much sweeter (+2.7¢ above pure), widely used on modern harpsichords and chamber organs for Bach’s works.'
  },
  {
    id: 'kirnberger-ii',
    name: 'Kirnberger II',
    year: '1771',
    author: 'Johann Philipp Kirnberger',
    category: 'German & Bach-Era',
    commaUnit: 'syntonic',
    wolfCircleIndex: 6, // F#-C# absorbs the schisma
    fifthDeviationsCents: makeFifthsWithClosure(
      { 2: -sc/2, 3: -sc/2 }, // D-A and A-E narrowed by 1/2 syntonic comma (-10.75c)
      6
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'flat', 9: 'flat', 10: 'flat' },
    description: '9 pure fifths! Only D–A and A–E are narrowed by 1/2 syntonic comma (-10.75¢) so C–E, G–B, and D–F♯ are pure/sweet, with the tiny schisma (-1.95¢) on F♯–C♯.',
    historicalContext: 'Published by Bach’s student Kirnberger in Die Kunst des reinen Satzes in der Musik (1771). Easy to tune by ear without beats until splitting the comma between D–A–E, producing dramatic key contrasts.'
  },
  {
    id: 'kirnberger-iii',
    name: 'Kirnberger III',
    year: '1779',
    author: 'Johann Philipp Kirnberger',
    category: 'German & Bach-Era',
    commaUnit: 'syntonic',
    wolfCircleIndex: 6, // F# - C# absorbs the tiny schisma
    fifthDeviationsCents: makeFifthsWithClosure(
      { 0: -sc/4, 1: -sc/4, 2: -sc/4, 3: -sc/4 },
      6
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'flat', 9: 'flat', 10: 'flat' },
    description: 'C–G, G–D, D–A, A–E narrowed by 1/4 syntonic comma (-5.38¢) so C–E is 100% pure (386.31¢); F♯–C♯ narrowed by the tiny schisma (-1.95¢); 7 pure fifths.',
    historicalContext: 'Described in a 1779 letter from Kirnberger to Forkel. Captures a pure meantone C–E triad alongside effortless tuning of 7 pure fifths, creating a vivid hierarchy of key colors.'
  },
  {
    id: 'neidhardt-dorf',
    name: 'Neidhardt "Für ein Dorf" (Village)',
    year: '1724',
    author: 'Johann Georg Neidhardt',
    category: 'German & Bach-Era',
    commaUnit: 'pythagorean',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      {
        0: -pc/6, 1: -pc/6, 2: -pc/6, 3: -pc/6, // C-G-D-A-E at -1/6pc
        4: -pc/12, 5: -pc/12, 6: -pc/12, 9: -pc/12, // E-B-F#-C# and Eb-Bb at -1/12pc
      },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'flat', 9: 'flat', 10: 'flat' },
    description: '4 fifths (C–G–D–A–E) at -1/6 Pythagorean comma, 4 fifths at -1/12 comma, and 4 pure fifths.',
    historicalContext: 'From Neidhardt’s Sectio Canonis Harmonici (1724). He graded his organ temperaments socially: "Village" gives maximum sweetness to everyday chorale keys (C, G, D, F) and spicy color to rare keys.'
  },
  {
    id: 'neidhardt-grosse-stadt',
    name: 'Neidhardt "Große Stadt" (Large City)',
    year: '1724',
    author: 'Johann Georg Neidhardt',
    category: 'German & Bach-Era',
    commaUnit: 'pythagorean',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      {
        0: -pc/6, 1: -pc/6, 2: -pc/6, 3: -pc/6,
        4: -pc/12, 5: -pc/12, 6: -pc/12, 7: -pc/12,
        10: -pc/12, 11: -pc/12
      },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'flat', 9: 'flat', 10: 'flat' },
    description: '4 fifths (C–G–D–A–E) at -1/6 Pythagorean comma, 6 fifths at -1/12 comma, and 2 pure fifths (G♯–E♭–B♭).',
    historicalContext: 'Specifically designed by Neidhardt for large town parish organs (such as J.S. Bach’s Leipzig churches), allowing effortless transposition with subtle, noble key colors.'
  },

  // ============================================================================
  // 3. ITALIAN, FRENCH & ENGLISH 18TH-CENTURY TEMPERAMENTS
  // ============================================================================
  {
    id: 'vallotti',
    name: 'Vallotti',
    year: '1754',
    author: 'Francescantonio Vallotti',
    category: 'Italian, French & English',
    commaUnit: 'pythagorean',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      { 11: -pc/6, 0: -pc/6, 1: -pc/6, 2: -pc/6, 3: -pc/6, 4: -pc/6 },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'flat', 9: 'flat', 10: 'flat' },
    description: '6 diatonic fifths (F–C–G–D–A–E–B) narrowed by 1/6 Pythagorean comma (-3.91¢); the 6 chromatic fifths (B–F♯–C♯–G♯–E♭–B♭–F) are completely pure.',
    historicalContext: 'Today one of the most popular historical harpsichord and chamber organ temperaments for late Baroque music (Handel, Vivaldi, Bach). Smoothly graduates from sweet F/C/G major (+5.87¢ thirds) to brilliant F♯/B major (+21.5¢ Pythagorean thirds).'
  },
  {
    id: 'young-ii',
    name: 'Thomas Young II',
    year: '1800',
    author: 'Thomas Young',
    category: 'Italian, French & English',
    commaUnit: 'pythagorean',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      { 0: -pc/6, 1: -pc/6, 2: -pc/6, 3: -pc/6, 4: -pc/6, 5: -pc/6 },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'flat', 9: 'flat', 10: 'flat' },
    description: 'Identical geometry to Vallotti, rotated one fifth clockwise: C–G–D–A–E–B–F♯ are narrowed by 1/6 Pythagorean comma (-3.91¢), while F♯–C♯–A♭–E♭–B♭–F–C are pure.',
    historicalContext: 'Presented to the Royal Society in London (1800) by physicist Thomas Young. Centers maximum sweetness symmetrically on C and G major.'
  },
  {
    id: 'young-i',
    name: 'Thomas Young I',
    year: '1800',
    author: 'Thomas Young',
    category: 'Italian, French & English',
    commaUnit: 'syntonic',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      {
        0: -3*sc/16, 1: -3*sc/16, 2: -3*sc/16, 3: -3*sc/16, // C-G-D-A-E at -3/16sc
        11: -sc/16, 10: -sc/16, 4: -sc/16, 5: -sc/16,       // Bb-F-C and E-B-F# at -1/16sc
        6: 0, 7: 0, 9: 0,                                    // Pure fifths in remote keys
      },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'flat', 9: 'flat', 10: 'flat' },
    description: '4 fifths (C–G–D–A–E) at -3/16 syntonic comma, 4 flanking fifths at -1/16 comma, and 4 nearly pure fifths.',
    historicalContext: 'Young’s own preferred mathematical temperament, creating a smooth sinusoidal graduation of third purity around the entire Circle of Fifths.'
  },
  {
    id: 'rameau-ordinaire',
    name: 'Tempérament Ordinaire (Rameau)',
    year: '1726',
    author: 'Jean-Philippe Rameau',
    category: 'Italian, French & English',
    commaUnit: 'syntonic',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      {
        10: -sc/4, 11: -sc/4, 0: -sc/4, 1: -sc/4, 2: -sc/4, 3: -sc/4, 4: -sc/4,
        5: -sc/12, 6: -sc/12,
        7: +sc/6, 9: +sc/6
      },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'sharp', 9: 'flat', 10: 'flat' },
    description: '7 fifths (B♭ to B) narrowed by 1/4 syntonic comma for pure French meantone thirds in common keys, with progressively widened fifths in the sharps/flats.',
    historicalContext: 'The quintessential French Baroque harpsichord temperament (Couperin, Rameau, Royer, Duphly). Common keys glow with pure meantone resonance while distant keys produce piquant, expressive French chiaroscuro.'
  },
  {
    id: 'dalembert-rousseau',
    name: "d'Alembert / Rousseau Ordinaire",
    year: '1752',
    author: "Jean le Rond d'Alembert / J.-J. Rousseau",
    category: 'Italian, French & English',
    commaUnit: 'syntonic',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      {
        0: -sc/4, 1: -sc/4, 2: -sc/4, 3: -sc/4, // C-G-D-A-E pure C-E
        4: -sc/6, 5: -sc/6, 11: -sc/6, 10: -sc/6, // flanking fifths milder
        6: 0, 9: 0,
        7: +sc/8,
      },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'flat', 9: 'flat', 10: 'flat' },
    description: 'C–G–D–A–E narrowed by 1/4 comma for a pure C–E third, with gradually less-narrowed fifths on both sides and gently wide fifths in the remote sharps/flats.',
    historicalContext: 'Documented in the Encyclopédie (1752) as the practical tuning method of mid-18th-century Parisian clavecinistes.'
  },

  // ============================================================================
  // 4. PYTHAGOREAN, MEDIEVAL & JUST INTONATION
  // ============================================================================
  {
    id: 'pythagorean-arnaut',
    name: 'Medieval Pythagorean (B–G♭ Wolf)',
    year: 'c. 1440',
    author: 'Henri Arnaut de Zwolle',
    category: 'Pythagorean, Medieval & Just',
    commaUnit: 'pythagorean',
    wolfCircleIndex: 5, // B - F#/Gb wolf!
    fifthDeviationsCents: makeFifthsWithClosure({}, 5),
    spellings: { 6: 'flat', 7: 'flat', 8: 'flat', 9: 'flat', 10: 'flat' },
    description: '11 pure 3:2 fifths tuned counter-clockwise from B down to G♭, placing the Pythagorean comma (-23.46¢) between B and G♭. Creates 4 pure "schismatic" thirds (D–F♯, A–C♯, E–G♯, B–D♯)!',
    historicalContext: 'Described in the treatise of Henri Arnaut de Zwolle (c. 1440) and used for the Buxheimer Orgelbuch and Guillaume Dufay’s era. By spelling the black keys as flats, B–E♭, F♯–B♭, C♯–F, and G♯–C become nearly beatless 5:4 thirds (384.4¢)!'
  },
  {
    id: 'pythagorean',
    name: 'Pythagorean Tuning (G♯–E♭ Wolf)',
    year: 'c. 500 BC / 1450',
    author: 'Pythagoras / Medieval Organ',
    category: 'Pythagorean, Medieval & Just',
    commaUnit: 'pythagorean',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure({}, 8),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'sharp', 9: 'flat', 10: 'flat' },
    description: '11 completely pure 3:2 fifths (0¢) and 1 wolf fifth (G♯–E♭) narrowed by the full Pythagorean comma (-23.46¢).',
    historicalContext: 'The medieval Gothic organ tuning. Hollow, crystalline pure fifths and fourths, with fiery Pythagorean major thirds (+21.51¢) and 4 pure schismatic thirds spanning the G♯–E♭ boundary.'
  },
  {
    id: 'just-5-limit-kepler',
    name: '5-Limit Just Intonation (C-Centered)',
    year: '1581 / 1619',
    author: 'Vincenzo Galilei / Johannes Kepler',
    category: 'Pythagorean, Medieval & Just',
    commaUnit: 'syntonic',
    wolfCircleIndex: 8,
    fifthDeviationsCents: makeFifthsWithClosure(
      {
        0: 0,      // C-G pure 3:2
        1: 0,      // G-D pure (D = 9/8)
        2: -sc,    // D-A narrowed by full syntonic comma so A = 5/3!
        3: 0,      // A-E pure so E = 5/4!
        4: 0,      // E-B pure so B = 15/8!
        5: 0,      // B-F# pure so F# = 45/32
        6: -sc,    // F#-C# narrowed by sc
        7: 0,      // C#-G# pure so G# = 25/16
        11: 0,     // F-C pure so F = 4/3
        10: -sc,   // Bb-F narrowed by -sc so Bb = 9/5 (pure minor 3rd G-Bb = 6:5!)
        9: 0,      // Eb-Bb pure so Eb = 6/5!
      },
      8
    ),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'sharp', 9: 'flat', 10: 'flat' },
    description: 'Pure 5-limit ratios relative to C: C(1:1), D(9:8), E♭(6:5), E(5:4), F(4:3), F♯(45:32), G(3:2), G♯(25:16), A(5:3), B♭(9:5), B(15:8).',
    historicalContext: 'Gives zero-beat, acoustically pure Major Triads on C, F, and G, and pure Minor Triads on A, E, and C—at the cost of a full syntonic comma (-21.51¢) wolf fifth on D–A!'
  },

  // ============================================================================
  // 5. EQUAL TEMPERAMENT
  // ============================================================================
  {
    id: 'equal-12tet',
    name: 'Equal Temperament (12-TET)',
    year: '1584 / 1917',
    author: 'Zhu Zaiyu / Stevin / Modern Standard',
    category: 'Equal',
    commaUnit: 'pythagorean',
    wolfCircleIndex: 8,
    fifthDeviationsCents: new Array(12).fill(-PYTHAGOREAN_COMMA_CENTS / 12),
    spellings: { 6: 'sharp', 7: 'sharp', 8: 'flat', 9: 'flat', 10: 'flat' },
    description: 'Every fifth is narrowed equally by 1/12 Pythagorean comma (-1.955¢). Every major third is +13.686¢ wider than a pure 5:4 ratio.',
    historicalContext: 'Known thoroughly in the 16th–18th centuries as a theoretical limit, it eliminates all key-color differences at the cost of making every major third beat rapidly (~7 to 14 Hz in the middle octave).'
  }
];

export interface NoteTuningData {
  circleIndex: number;
  pitchClass: number;
  name: string;
  sharpName: string;
  flatName: string;
  accidentalChoice: 'sharp' | 'flat' | 'natural';
  /** Cents from C in the same octave (0 to 1200) */
  centsFromC: number;
  /** Cents deviation from 12-TET relative to C (C = 0) */
  centsDeviationFrom12TET_C: number;
  /** Cents deviation from 12-TET relative to A (A = 0) */
  centsDeviationFrom12TET_A: number;
  /** Frequency in Hz in octave 4 (C4..B4) for the given A4 reference pitch */
  freqOctave4: number;
  /** If split sharps are enabled, the alternate enharmonic pitch in Octave 4 */
  splitAltName?: string;
  splitAltFreqOctave4?: number;
  splitAltCentsFromC?: number;
  splitAltDeviationFrom12TET_C?: number;
}

export interface IntervalAnalysis {
  fromCircleIndex: number;
  toCircleIndex: number;
  fromName: string;
  toName: string;
  sizeCents: number;
  deviationFromPureCents: number;
  /** Beat rate in Hz in middle octave (C4–C5) */
  beatRateHz: number;
  qualityLabel: string;
}

export interface TriadAnalysis {
  rootPitchClass: number;
  rootCircleIndex: number;
  rootName: string;
  majorThirdDeviationCents: number;
  majorFifthDeviationCents: number;
  majorThirdBeatsHz: number;
  majorFifthBeatsHz: number;
  majorRoughnessScore: number; // Combined acoustic impurity metric
  minorThirdDeviationCents: number;
  minorRoughnessScore: number;
}

export interface ComputedTemperament {
  fifthDeviationsCents: number[];
  wolfCircleIndex: number;
  notesByCircle: NoteTuningData[];
  notesByPitchClass: NoteTuningData[];
  fifths: IntervalAnalysis[];
  majorThirds: IntervalAnalysis[];
  minorThirds: IntervalAnalysis[];
  triads: TriadAnalysis[];
}

/**
 * Computes all note frequencies, cent offsets, interval beat rates, and triad colors
 * from the 12 fifth deviations around the Circle of Fifths.
 */
export function computeTemperament(
  fifthDeviationsCents: number[],
  wolfCircleIndex: number,
  a4ReferenceHz: number,
  spellings: Record<number, 'sharp' | 'flat'> = { 6: 'sharp', 7: 'sharp', 8: 'sharp', 9: 'flat', 10: 'flat' }
): ComputedTemperament {
  // Ensure closure so octaves are pure 2:1
  const normalizedFifths = [...fifthDeviationsCents];
  let sumOthers = 0;
  for (let i = 0; i < 12; i++) {
    if (i !== wolfCircleIndex) {
      sumOthers += normalizedFifths[i];
    }
  }
  normalizedFifths[wolfCircleIndex] = -PYTHAGOREAN_COMMA_CENTS - sumOthers;

  const centsFromCByCircle = new Array<number>(12).fill(0);
  centsFromCByCircle[0] = 0;

  let cumulative = 0;
  for (let i = 0; i < 11; i++) {
    const fifthSize = PURE_FIFTH_CENTS + normalizedFifths[i];
    cumulative = (cumulative + fifthSize) % 1200;
    if (cumulative < 0) cumulative += 1200;
    centsFromCByCircle[i + 1] = cumulative;
  }

  // Circle index 3 is A. Let's find A's offset from C so we can anchor A4 = a4ReferenceHz
  const aCentsFromC = centsFromCByCircle[3]; // ~900 cents
  const aDevFrom12TET_C = aCentsFromC - 900;

  // C4 frequency when A4 = a4ReferenceHz:
  const c4Freq = a4ReferenceHz * Math.pow(2, -aCentsFromC / 1200);

  // Regular fifth size near the wolf for computing split-key subsemitones
  const regularFifthDeviation = (normalizedFifths[(wolfCircleIndex + 11) % 12] + normalizedFifths[(wolfCircleIndex + 1) % 12]) / 2;
  const regularFifthSize = PURE_FIFTH_CENTS + regularFifthDeviation;

  const notesByCircle: NoteTuningData[] = CIRCLE_OF_FIFTHS.map((info) => {
    const idx = info.circleIndex;
    const centsFromC = centsFromCByCircle[idx];
    const equalCents = info.pitchClass * 100;
    let devC = centsFromC - equalCents;
    if (devC > 600) devC -= 1200;
    if (devC < -600) devC += 1200;

    const devA = devC - aDevFrom12TET_C;
    const freqOctave4 = c4Freq * Math.pow(2, centsFromC / 1200);

    const choice = info.defaultAccidental === 'natural'
      ? 'natural'
      : (spellings[idx] ?? info.defaultAccidental);
    const name = choice === 'flat' ? info.flatName : info.sharpName;

    let splitAltName: string | undefined;
    let splitAltCentsFromC: number | undefined;
    let splitAltFreqOctave4: number | undefined;
    let splitAltDeviationFrom12TET_C: number | undefined;

    if (idx >= 6 && idx <= 10) {
      if (idx <= wolfCircleIndex) {
        splitAltName = info.flatName;
        const stepsDownFrom9 = 9 - idx;
        let altCents = (centsFromCByCircle[9] - stepsDownFrom9 * regularFifthSize) % 1200;
        if (altCents < 0) altCents += 1200;
        splitAltCentsFromC = altCents;
      } else {
        splitAltName = info.sharpName;
        const stepsUpFrom8 = idx - 8;
        let altCents = (centsFromCByCircle[8] + stepsUpFrom8 * regularFifthSize) % 1200;
        if (altCents < 0) altCents += 1200;
        splitAltCentsFromC = altCents;
      }
      splitAltFreqOctave4 = c4Freq * Math.pow(2, splitAltCentsFromC / 1200);
      let altDev = splitAltCentsFromC - equalCents;
      if (altDev > 600) altDev -= 1200;
      if (altDev < -600) altDev += 1200;
      splitAltDeviationFrom12TET_C = altDev;
    }

    return {
      circleIndex: idx,
      pitchClass: info.pitchClass,
      name,
      sharpName: info.sharpName,
      flatName: info.flatName,
      accidentalChoice: choice,
      centsFromC,
      centsDeviationFrom12TET_C: devC,
      centsDeviationFrom12TET_A: devA,
      freqOctave4,
      splitAltName,
      splitAltFreqOctave4,
      splitAltCentsFromC,
      splitAltDeviationFrom12TET_C,
    };
  });

  const notesByPitchClass = [...notesByCircle].sort((a, b) => a.pitchClass - b.pitchClass);

  // Fifths analysis (circleIndex i to (i+1)%12)
  const fifths: IntervalAnalysis[] = [];
  for (let i = 0; i < 12; i++) {
    const next = (i + 1) % 12;
    const n1 = notesByCircle[i];
    const n2 = notesByCircle[next];
    const dev = normalizedFifths[i];
    const sizeCents = PURE_FIFTH_CENTS + dev;
    const f1 = n1.freqOctave4;
    const f2 = f1 * Math.pow(2, sizeCents / 1200);
    const beatRateHz = Math.abs(3 * f1 - 2 * f2);

    fifths.push({
      fromCircleIndex: i,
      toCircleIndex: next,
      fromName: n1.name,
      toName: n2.name,
      sizeCents,
      deviationFromPureCents: dev,
      beatRateHz,
      qualityLabel: formatCommaLabel(dev),
    });
  }

  // Major Thirds analysis (circleIndex i to (i+4)%12)
  const majorThirds: IntervalAnalysis[] = [];
  for (let i = 0; i < 12; i++) {
    const target = (i + 4) % 12;
    const n1 = notesByCircle[i];
    const n2 = notesByCircle[target];
    let sizeCents = n2.centsFromC - n1.centsFromC;
    if (sizeCents < 0) sizeCents += 1200;
    const dev = sizeCents - PURE_MAJOR_THIRD_CENTS;
    const f1 = n1.freqOctave4;
    const f2 = f1 * Math.pow(2, sizeCents / 1200);
    const beatRateHz = Math.abs(5 * f1 - 4 * f2);

    majorThirds.push({
      fromCircleIndex: i,
      toCircleIndex: target,
      fromName: n1.name,
      toName: n2.name,
      sizeCents,
      deviationFromPureCents: dev,
      beatRateHz,
      qualityLabel: `${dev >= 0 ? '+' : ''}${dev.toFixed(1)}¢`,
    });
  }

  // Minor Thirds analysis (circleIndex i to (i+9)%12)
  const minorThirds: IntervalAnalysis[] = [];
  for (let i = 0; i < 12; i++) {
    const target = (i + 9) % 12;
    const n1 = notesByCircle[i];
    const n2 = notesByCircle[target];
    let sizeCents = n2.centsFromC - n1.centsFromC;
    if (sizeCents < 0) sizeCents += 1200;
    const dev = sizeCents - PURE_MINOR_THIRD_CENTS;
    const f1 = n1.freqOctave4;
    const f2 = f1 * Math.pow(2, sizeCents / 1200);
    const beatRateHz = Math.abs(6 * f1 - 5 * f2);

    minorThirds.push({
      fromCircleIndex: i,
      toCircleIndex: target,
      fromName: n1.name,
      toName: n2.name,
      sizeCents,
      deviationFromPureCents: dev,
      beatRateHz,
      qualityLabel: `${dev >= 0 ? '+' : ''}${dev.toFixed(1)}¢`,
    });
  }

  // Triads analysis around the Circle of Fifths
  const triads: TriadAnalysis[] = [];
  for (let i = 0; i < 12; i++) {
    const n = notesByCircle[i];
    const maj3 = majorThirds[i];
    const min3 = minorThirds[i];
    const fifth = fifths[i];

    const majorRoughnessScore = Math.sqrt(
      Math.pow(maj3.deviationFromPureCents, 2) + Math.pow(fifth.deviationFromPureCents * 1.6, 2)
    );
    const minorRoughnessScore = Math.sqrt(
      Math.pow(min3.deviationFromPureCents, 2) + Math.pow(fifth.deviationFromPureCents * 1.6, 2)
    );

    triads.push({
      rootPitchClass: n.pitchClass,
      rootCircleIndex: i,
      rootName: n.name,
      majorThirdDeviationCents: maj3.deviationFromPureCents,
      majorFifthDeviationCents: fifth.deviationFromPureCents,
      majorThirdBeatsHz: maj3.beatRateHz,
      majorFifthBeatsHz: fifth.beatRateHz,
      majorRoughnessScore,
      minorThirdDeviationCents: min3.deviationFromPureCents,
      minorRoughnessScore,
    });
  }

  return {
    fifthDeviationsCents: normalizedFifths,
    wolfCircleIndex,
    notesByCircle,
    notesByPitchClass,
    fifths,
    majorThirds,
    minorThirds,
    triads,
  };
}

/**
 * Parses a shorthand comma token like "-1/4s", "-1/6p", "0", "-5.38c", or "-1/5"
 * into cents deviation from a pure fifth.
 */
export function parseFifthTokenToCents(token: string, defaultUnit: CommaUnit = 'syntonic'): number | null {
  const cleaned = token.trim().toLowerCase();
  if (!cleaned || cleaned === '0' || cleaned === 'pure') return 0;

  let unit: CommaUnit = defaultUnit;
  let numPart = cleaned;
  if (cleaned.endsWith('s') || cleaned.endsWith('sc')) {
    unit = 'syntonic';
    numPart = cleaned.replace(/sc?$/, '');
  } else if (cleaned.endsWith('p') || cleaned.endsWith('pc')) {
    unit = 'pythagorean';
    numPart = cleaned.replace(/pc?$/, '');
  } else if (cleaned.endsWith('c') || cleaned.endsWith('¢')) {
    unit = 'cents';
    numPart = cleaned.replace(/[c¢]$/, '');
  }

  let scalar: number;
  if (numPart.includes('/')) {
    const [numStr, denStr] = numPart.split('/');
    const n = parseFloat(numStr);
    const d = parseFloat(denStr);
    if (isNaN(n) || isNaN(d) || d === 0) return null;
    scalar = n / d;
  } else {
    scalar = parseFloat(numPart);
    if (isNaN(scalar)) return null;
  }

  if (unit === 'cents') return scalar;
  if (unit === 'pythagorean') return scalar * PYTHAGOREAN_COMMA_CENTS;
  return scalar * SYNTONIC_COMMA_CENTS;
}

/**
 * Formats a cent deviation of a fifth into a human-readable historical comma fraction if close
 */
export function formatCommaLabel(devCents: number, preferredUnit: CommaUnit = 'syntonic'): string {
  if (Math.abs(devCents) < 0.08) return 'Pure (0)';

  const fractions = [
    { num: 1, den: 16 },
    { num: 1, den: 12 },
    { num: 1, den: 10 },
    { num: 1, den: 8 },
    { num: 1, den: 6 },
    { num: 3, den: 16 },
    { num: 1, den: 5 },
    { num: 1, den: 4 },
    { num: 2, den: 7 },
    { num: 1, den: 3 },
    { num: 1, den: 2 },
    { num: 1, den: 1 },
  ];

  const sign = devCents < 0 ? '-' : '+';
  const absCents = Math.abs(devCents);

  const unitsToCheck: Array<{ unit: 'syntonic' | 'pythagorean'; commaVal: number; sym: string }> =
    preferredUnit === 'pythagorean'
      ? [
          { unit: 'pythagorean', commaVal: PYTHAGOREAN_COMMA_CENTS, sym: 'p' },
          { unit: 'syntonic', commaVal: SYNTONIC_COMMA_CENTS, sym: 's' },
        ]
      : [
          { unit: 'syntonic', commaVal: SYNTONIC_COMMA_CENTS, sym: 's' },
          { unit: 'pythagorean', commaVal: PYTHAGOREAN_COMMA_CENTS, sym: 'p' },
        ];

  if (preferredUnit !== 'cents') {
    for (const { commaVal, sym } of unitsToCheck) {
      for (const f of fractions) {
        const target = (f.num / f.den) * commaVal;
        if (Math.abs(absCents - target) < 0.14) {
          const fracStr = f.den === 1 ? `${f.num}` : `${f.num}/${f.den}`;
          return `${sign}${fracStr}${sym}`;
        }
      }
    }
  }

  return `${devCents >= 0 ? '+' : ''}${devCents.toFixed(1)}¢`;
}

export function getThirdPurityColor(deviationFromPureCents: number): string {
  const absDev = Math.abs(deviationFromPureCents);
  if (absDev <= 1.2) return '#10b981'; // Emerald (Pure!)
  if (absDev <= 6.5) return '#34d399'; // Mint/Green
  if (absDev <= 10.5) return '#a3e635'; // Lime
  if (absDev <= 15.0) return '#f59e0b'; // Amber (12-TET territory)
  if (absDev <= 22.5) return '#f97316'; // Orange (Pythagorean territory)
  return '#ef4444'; // Wolf / extreme
}

export function getFifthPurityColor(deviationFromPureCents: number): string {
  const absDev = Math.abs(deviationFromPureCents);
  if (absDev <= 0.25) return '#38bdf8'; // Pure 3:2 (Sky Blue)
  if (absDev <= 2.3) return '#2dd4bf';  // Mild (1/12 comma)
  if (absDev <= 6.5) return '#fbbf24';  // Meantone / Well-tempered fifth (-1/6 to -2/7 comma)
  if (absDev <= 12.0) return '#f97316'; // Heavily tempered
  return '#ef4444';                     // Wolf fifth
}
