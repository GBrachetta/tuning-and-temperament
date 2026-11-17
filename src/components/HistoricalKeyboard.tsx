import React from 'react';
import { ComputedTemperament, NoteTuningData } from '../lib/temperament';
import { Piano, Pin, VolumeX, SplitSquareVertical, Music, Square } from 'lucide-react';

export type SplitKeyMode = 'none' | 'two-historical' | 'all-five';

interface HistoricalKeyboardProps {
  computed: ComputedTemperament;
  activeNoteKeys: Set<string>;
  activePlaybackTag: string | null;
  latchMode: boolean;
  onToggleLatchMode: () => void;
  splitKeyMode: SplitKeyMode;
  onChangeSplitKeyMode: (mode: SplitKeyMode) => void;
  onNoteTrigger: (noteKey: string, freqHz: number, pitchClass: number, label: string) => void;
  onNoteRelease: (noteKey: string, pitchClass: number) => void;
  onStopAll: () => void;
  onPlayChordPreset: (type: 'major' | 'minor' | 'fifth' | 'third' | 'cadence', rootPitchClass: number) => void;
  selectedRootPitchClass: number;
  onSelectRootPitchClass: (pc: number) => void;
}

const WHITE_PITCH_CLASSES = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B
const BLACK_KEY_LAYOUT: Array<{ pitchClass: number; leftPercent: number; circleIndex: number }> = [
  { pitchClass: 1,  leftPercent: 9.8,  circleIndex: 7 },  // C#/Db
  { pitchClass: 3,  leftPercent: 24.3, circleIndex: 9 },  // Eb/D#
  { pitchClass: 6,  leftPercent: 52.6, circleIndex: 6 },  // F#/Gb
  { pitchClass: 8,  leftPercent: 66.8, circleIndex: 8 },  // G#/Ab
  { pitchClass: 10, leftPercent: 81.1, circleIndex: 10 }, // Bb/A#
];

export const KEYBOARD_SHORTCUTS: Record<string, { pitchClass: number; octave: number }> = {
  a: { pitchClass: 0, octave: 4 },
  w: { pitchClass: 1, octave: 4 },
  s: { pitchClass: 2, octave: 4 },
  e: { pitchClass: 3, octave: 4 },
  d: { pitchClass: 4, octave: 4 },
  f: { pitchClass: 5, octave: 4 },
  t: { pitchClass: 6, octave: 4 },
  g: { pitchClass: 7, octave: 4 },
  y: { pitchClass: 8, octave: 4 },
  h: { pitchClass: 9, octave: 4 },
  u: { pitchClass: 10, octave: 4 },
  j: { pitchClass: 11, octave: 4 },
  k: { pitchClass: 0, octave: 5 },
  o: { pitchClass: 1, octave: 5 },
  l: { pitchClass: 2, octave: 5 },
  p: { pitchClass: 3, octave: 5 },
  ';': { pitchClass: 4, octave: 5 },
};

export const HistoricalKeyboard: React.FC<HistoricalKeyboardProps> = ({
  computed,
  activeNoteKeys,
  activePlaybackTag,
  latchMode,
  onToggleLatchMode,
  splitKeyMode,
  onChangeSplitKeyMode,
  onNoteTrigger,
  onNoteRelease,
  onStopAll,
  onPlayChordPreset,
  selectedRootPitchClass,
  onSelectRootPitchClass,
}) => {
  const octaves = [3, 4]; // Two full octaves (C3 to C5)

  const getNoteData = (pc: number): NoteTuningData => computed.notesByPitchClass[pc];

  const getFreqForOctave = (baseOctave4Freq: number, octave: number) =>
    baseOctave4Freq * Math.pow(2, octave - 4);

  const isSplitEnabledForKey = (pitchClass: number): boolean => {
    if (splitKeyMode === 'none') return false;
    if (splitKeyMode === 'two-historical') {
      return pitchClass === 3 || pitchClass === 8;
    }
    return true;
  };

  const handlePointerDown = (
    e: React.PointerEvent,
    noteKey: string,
    freq: number,
    pitchClass: number,
    label: string
  ) => {
    e.preventDefault();
    onNoteTrigger(noteKey, freq, pitchClass, label);
  };

  const handlePointerUp = (e: React.PointerEvent, noteKey: string, pitchClass: number) => {
    e.preventDefault();
    if (!latchMode) {
      onNoteRelease(noteKey, pitchClass);
    }
  };

  const selectedRootNote = getNoteData(selectedRootPitchClass);

  const isPresetActive = (type: 'major' | 'minor' | 'fifth' | 'third' | 'cadence') =>
    activeNoteKeys.size > 0 && activePlaybackTag === `chord-${type}-${selectedRootPitchClass}`;

  return (
    <div className="bg-[#17130e] border border-[#332a1d] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-3.5">
      {/* Top Controls Bar */}
      <div className="flex flex-nowrap items-center justify-between gap-2 border-b border-[#2a2218] pb-3 overflow-x-auto">
        <div className="flex items-center gap-2.5 shrink-0">
          <Piano className="w-4 h-4 text-amber-400 shrink-0" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-200/90 whitespace-nowrap">
            Clavier Manual (C3 – C5)
          </h3>
          <span className="hidden xl:inline-block text-[11px] text-[#9b8b75] bg-[#100d09] px-2 py-0.5 rounded border border-[#262017] whitespace-nowrap">
            Keys: A W S E D F T G Y H U J K
          </span>
        </div>

        <div className="flex flex-nowrap items-center gap-2 shrink-0">
          {/* Split Sharps Selector */}
          <div className="flex items-center bg-[#0f0d0a] p-1 rounded-lg border border-[#2c2419] text-xs whitespace-nowrap">
            <SplitSquareVertical className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-1 shrink-0" />
            <button
              onClick={() => onChangeSplitKeyMode('none')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                splitKeyMode === 'none'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-[#a89882] hover:text-[#f5efe6]'
              }`}
            >
              12 Keys
            </button>
            <button
              onClick={() => onChangeSplitKeyMode('two-historical')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                splitKeyMode === 'two-historical'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-[#a89882] hover:text-[#f5efe6]'
              }`}
              title="Split D♯/E♭ and G♯/A♭ into front and back keys (14 notes/octave), standard on Renaissance & Baroque Italian/North German organs and harpsichords"
            >
              Split G♯/A♭ & D♯/E♭
            </button>
            <button
              onClick={() => onChangeSplitKeyMode('all-five')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                splitKeyMode === 'all-five'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-[#a89882] hover:text-[#f5efe6]'
              }`}
              title="Cimbalo Cromatico: split all 5 accidental keys into sharp and flat subsemitones (17 notes/octave)"
            >
              All 5 Split
            </button>
          </div>

          {/* Drone / Latch Toggle */}
          <button
            onClick={onToggleLatchMode}
            className={`w-[132px] justify-center flex items-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
              latchMode
                ? 'bg-amber-500 text-[#0f0d0a] border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-[#1f1912] text-[#d6c5ad] border-[#382e20] hover:border-amber-500/40'
            }`}
            title="Hold notes continuously so you can adjust fifths on the wheel and hear the beats change live"
          >
            <Pin className="w-3.5 h-3.5" />
            {latchMode ? 'Drone Hold: ON' : 'Drone Hold: OFF'}
          </button>

          {/* Stop All — always rendered so the toolbar never shifts */}
          <button
            onClick={onStopAll}
            disabled={activeNoteKeys.size === 0}
            className={`w-[112px] justify-center flex items-center gap-1 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
              activeNoteKeys.size > 0
                ? 'bg-red-500 hover:bg-red-400 text-white border-red-400'
                : 'bg-[#120f0b] text-[#5e5243] border-[#262017] cursor-not-allowed'
            }`}
          >
            <VolumeX className="w-3.5 h-3.5" />
            Stop All{activeNoteKeys.size > 0 ? ` (${activeNoteKeys.size})` : ''}
          </button>
        </div>
      </div>

      {/* Quick Chord & Cadence Auditioner — two stable non-wrapping rows */}
      <div className="flex flex-col gap-2 bg-[#120f0b] p-2.5 rounded-xl border border-[#282016]">
        <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto">
          <span className="text-xs text-[#a89882] mr-1 flex items-center gap-1 whitespace-nowrap shrink-0">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            Root Key:
          </span>
          {computed.notesByPitchClass.map((n) => (
            <button
              key={n.pitchClass}
              onClick={() => onSelectRootPitchClass(n.pitchClass)}
              className={`min-w-[32px] px-2 py-1 rounded text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                selectedRootPitchClass === n.pitchClass
                  ? 'bg-amber-500 text-[#0f0d0a]'
                  : 'bg-[#1c1711] text-[#c2b29b] hover:bg-[#2a2218]'
              }`}
            >
              {n.name}
            </button>
          ))}
        </div>

        <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto">
          {(
            [
              { type: 'major', label: `${selectedRootNote.name} Major`, w: 'w-[96px]', idle: 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30' },
              { type: 'minor', label: `${selectedRootNote.name} Minor`, w: 'w-[96px]', idle: 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/30' },
              { type: 'third', label: 'Maj 3rd', w: 'w-[80px]', idle: 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30' },
              { type: 'fifth', label: '5th', w: 'w-[72px]', idle: 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border-purple-500/30' },
              { type: 'cadence', label: `▶ Baroque Cadence in ${selectedRootNote.name}`, w: 'w-[200px]', idle: 'bg-amber-500 hover:bg-amber-400 text-[#0f0d0a] border-amber-400 font-bold' },
            ] as const
          ).map((b) => {
            const active = isPresetActive(b.type);
            return (
              <button
                key={b.type}
                onClick={() => onPlayChordPreset(b.type, selectedRootPitchClass)}
                className={`${b.w} justify-center flex items-center gap-1 py-1 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active ? 'bg-red-500 hover:bg-red-400 text-white border-red-400 font-bold' : b.idle
                }`}
              >
                {active ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    Stop
                  </>
                ) : (
                  b.label
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Physical Two-Octave Boxwood & Ebony Manual */}
      <div className="relative w-full overflow-x-auto pb-1">
        <div className="min-w-[600px] flex h-44 sm:h-48 rounded-xl overflow-hidden border-2 border-[#3d3020] bg-[#0b0907] p-1.5 shadow-inner">
          {octaves.map((octave) => (
            <div key={octave} className="relative flex-1 flex h-full">
              {/* 7 White Natural Keys */}
              {WHITE_PITCH_CLASSES.map((pc) => {
                const noteData = getNoteData(pc);
                const freq = getFreqForOctave(noteData.freqOctave4, octave);
                const noteKey = `${pc}-${octave}`;
                const isActive = activeNoteKeys.has(noteKey);

                return (
                  <div
                    key={noteKey}
                    onPointerDown={(e) =>
                      handlePointerDown(e, noteKey, freq, pc, `${noteData.name}${octave}`)
                    }
                    onPointerUp={(e) => handlePointerUp(e, noteKey, pc)}
                    onPointerLeave={(e) => {
                      if (!latchMode && activeNoteKeys.has(noteKey)) {
                        handlePointerUp(e, noteKey, pc);
                      }
                    }}
                    className={`relative flex-1 h-full mx-[1px] rounded-b-lg border flex flex-col justify-end items-center pb-2.5 select-none cursor-pointer transition-all ${
                      isActive
                        ? 'bg-gradient-to-b from-amber-300 to-amber-500 border-amber-200 translate-y-[2px] shadow-inner'
                        : 'bg-gradient-to-b from-[#e8d5b5] via-[#dfc69e] to-[#cda976] hover:from-[#f0e0c4] hover:to-[#d8b888] border-[#6e5636] shadow-[inset_0_-6px_8px_rgba(0,0,0,0.22)]'
                    }`}
                  >
                    <div className="w-full border-t border-[#9c7b4f]/40 mb-auto mt-24" />
                    <span
                      className={`text-xs font-bold ${
                        isActive ? 'text-[#0f0d0a]' : 'text-[#3b2c1a]'
                      }`}
                    >
                      {noteData.name}
                      <sub className="text-[9px]">{octave}</sub>
                    </span>
                    <span
                      className={`text-[9px] font-mono ${
                        isActive ? 'text-[#1c140a]' : 'text-[#695134]'
                      }`}
                    >
                      {freq.toFixed(1)}Hz
                    </span>
                  </div>
                );
              })}

              {/* 5 Black Accidental Keys */}
              {BLACK_KEY_LAYOUT.map(({ pitchClass, leftPercent }) => {
                const noteData = getNoteData(pitchClass);
                const primaryFreq = getFreqForOctave(noteData.freqOctave4, octave);
                const primaryKey = `${pitchClass}-${octave}`;
                const isPrimaryActive = activeNoteKeys.has(primaryKey);

                const isSplit =
                  isSplitEnabledForKey(pitchClass) &&
                  noteData.splitAltFreqOctave4 !== undefined &&
                  noteData.splitAltName !== undefined;

                if (!isSplit) {
                  return (
                    <div
                      key={primaryKey}
                      style={{ left: `${leftPercent}%`, width: '8.4%' }}
                      onPointerDown={(e) =>
                        handlePointerDown(
                          e,
                          primaryKey,
                          primaryFreq,
                          pitchClass,
                          `${noteData.name}${octave}`
                        )
                      }
                      onPointerUp={(e) => handlePointerUp(e, primaryKey, pitchClass)}
                      onPointerLeave={(e) => {
                        if (!latchMode && activeNoteKeys.has(primaryKey)) {
                          handlePointerUp(e, primaryKey, pitchClass);
                        }
                      }}
                      className={`absolute top-0 h-[62%] z-10 rounded-b-md border flex flex-col justify-end items-center pb-2 select-none cursor-pointer transition-all ${
                        isPrimaryActive
                          ? 'bg-gradient-to-b from-amber-400 to-amber-600 border-amber-200 translate-y-[2px]'
                          : 'bg-gradient-to-b from-[#2b241d] via-[#1c1712] to-[#120e0b] hover:from-[#3a3128] border-[#4f4030] shadow-[0_5px_8px_rgba(0,0,0,0.65)]'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold leading-none ${
                          isPrimaryActive ? 'text-[#0f0d0a]' : 'text-[#e8d5b5]'
                        }`}
                      >
                        {noteData.name}
                      </span>
                      <span
                        className={`text-[8px] font-mono mt-0.5 ${
                          isPrimaryActive ? 'text-[#0f0d0a]' : 'text-[#a89882]'
                        }`}
                      >
                        {noteData.centsDeviationFrom12TET_C >= 0 ? '+' : ''}
                        {noteData.centsDeviationFrom12TET_C.toFixed(0)}¢
                      </span>
                    </div>
                  );
                }

                // Split Key rendering
                const altFreq = getFreqForOctave(noteData.splitAltFreqOctave4!, octave);
                const altKey = `${pitchClass}-alt-${octave}`;
                const isAltActive = activeNoteKeys.has(altKey);

                return (
                  <div
                    key={`split-${primaryKey}`}
                    style={{ left: `${leftPercent}%`, width: '8.8%' }}
                    className="absolute top-0 h-[64%] z-10 flex flex-col gap-[2px] select-none"
                  >
                    <div
                      onPointerDown={(e) =>
                        handlePointerDown(
                          e,
                          altKey,
                          altFreq,
                          pitchClass,
                          `${noteData.splitAltName}${octave}`
                        )
                      }
                      onPointerUp={(e) => handlePointerUp(e, altKey, pitchClass)}
                      onPointerLeave={(e) => {
                        if (!latchMode && activeNoteKeys.has(altKey)) {
                          handlePointerUp(e, altKey, pitchClass);
                        }
                      }}
                      title={`Split Back Key: ${noteData.splitAltName}${octave} (${altFreq.toFixed(1)} Hz)`}
                      className={`flex-1 rounded-b-sm border flex flex-col justify-center items-center cursor-pointer transition-all ${
                        isAltActive
                          ? 'bg-amber-400 border-amber-200 text-[#0f0d0a]'
                          : 'bg-gradient-to-b from-[#3d3124] to-[#241c14] hover:from-[#4f4030] border-amber-500/50 text-amber-200 shadow-md'
                      }`}
                    >
                      <span className="text-[9px] font-bold leading-none">
                        {noteData.splitAltName}
                      </span>
                      <span className="text-[7px] font-mono opacity-80">
                        {noteData.splitAltDeviationFrom12TET_C! >= 0 ? '+' : ''}
                        {noteData.splitAltDeviationFrom12TET_C!.toFixed(0)}¢
                      </span>
                    </div>

                    <div
                      onPointerDown={(e) =>
                        handlePointerDown(
                          e,
                          primaryKey,
                          primaryFreq,
                          pitchClass,
                          `${noteData.name}${octave}`
                        )
                      }
                      onPointerUp={(e) => handlePointerUp(e, primaryKey, pitchClass)}
                      onPointerLeave={(e) => {
                        if (!latchMode && activeNoteKeys.has(primaryKey)) {
                          handlePointerUp(e, primaryKey, pitchClass);
                        }
                      }}
                      title={`Split Front Key: ${noteData.name}${octave} (${primaryFreq.toFixed(1)} Hz)`}
                      className={`flex-1 rounded-b-md border flex flex-col justify-center items-center cursor-pointer transition-all ${
                        isPrimaryActive
                          ? 'bg-amber-500 border-amber-200 text-[#0f0d0a]'
                          : 'bg-gradient-to-b from-[#241e18] to-[#120e0b] hover:from-[#332a21] border-[#594836] text-[#e8d5b5] shadow-md'
                      }`}
                    >
                      <span className="text-[9px] font-bold leading-none">{noteData.name}</span>
                      <span className="text-[7px] font-mono opacity-80">
                        {noteData.centsDeviationFrom12TET_C >= 0 ? '+' : ''}
                        {noteData.centsDeviationFrom12TET_C.toFixed(0)}¢
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* High C5 Capstone White Key */}
          {(() => {
            const cData = getNoteData(0);
            const c5Freq = getFreqForOctave(cData.freqOctave4, 5);
            const c5Key = '0-5';
            const isActive = activeNoteKeys.has(c5Key);
            return (
              <div
                onPointerDown={(e) => handlePointerDown(e, c5Key, c5Freq, 0, 'C5')}
                onPointerUp={(e) => handlePointerUp(e, c5Key, 0)}
                className={`w-10 sm:w-12 h-full mx-[1px] rounded-b-lg border flex flex-col justify-end items-center pb-2.5 select-none cursor-pointer transition-all ${
                  isActive
                    ? 'bg-gradient-to-b from-amber-300 to-amber-500 border-amber-200 translate-y-[2px]'
                    : 'bg-gradient-to-b from-[#e8d5b5] via-[#dfc69e] to-[#cda976] border-[#6e5636]'
                }`}
              >
                <span className={`text-xs font-bold ${isActive ? 'text-[#0f0d0a]' : 'text-[#3b2c1a]'}`}>
                  C<sub className="text-[9px]">5</sub>
                </span>
                <span className={`text-[9px] font-mono ${isActive ? 'text-[#1c140a]' : 'text-[#695134]'}`}>
                  {c5Freq.toFixed(0)}Hz
                </span>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
