import React, { useState } from 'react';
import {
  ComputedTemperament,
  getThirdPurityColor,
  getFifthPurityColor,
} from '../lib/temperament';
import { BarChart3, Table2, Ear, Volume2, Square } from 'lucide-react';

interface KeyColorAndTuningTableProps {
  computed: ComputedTemperament;
  a4ReferenceHz: number;
  activeNoteKeys: Set<string>;
  activePlaybackTag: string | null;
  onPlayChordPreset: (
    type: 'major' | 'minor' | 'fifth' | 'third' | 'cadence',
    rootPitchClass: number
  ) => void;
  onAuditionSingleNote: (pitchClass: number, freqHz: number, label: string) => void;
}

export const KeyColorAndTuningTable: React.FC<KeyColorAndTuningTableProps> = ({
  computed,
  a4ReferenceHz,
  activeNoteKeys,
  activePlaybackTag,
  onPlayChordPreset,
  onAuditionSingleNote,
}) => {
  const [activeTab, setActiveTab] = useState<'key-colors' | 'tuning-sheet' | 'ear-bearing'>(
    'key-colors'
  );

  return (
    <div className="bg-[#17130e] border border-[#332a1d] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2a2218] pb-3">
        <div className="flex items-center gap-1.5 bg-[#0f0d0a] p-1 rounded-xl border border-[#2c2419]">
          <button
            onClick={() => setActiveTab('key-colors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'key-colors'
                ? 'bg-amber-500 text-[#0f0d0a]'
                : 'text-[#b8a68e] hover:text-[#f5efe6]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Key Color & Triad Purity
          </button>
          <button
            onClick={() => setActiveTab('tuning-sheet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tuning-sheet'
                ? 'bg-amber-500 text-[#0f0d0a]'
                : 'text-[#b8a68e] hover:text-[#f5efe6]'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            Strobe Tuner Cent Offsets
          </button>
          <button
            onClick={() => setActiveTab('ear-bearing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ear-bearing'
                ? 'bg-amber-500 text-[#0f0d0a]'
                : 'text-[#b8a68e] hover:text-[#f5efe6]'
            }`}
          >
            <Ear className="w-3.5 h-3.5" />
            Aural Bearing & Beat Rates (Hz)
          </button>
        </div>

        <span className="text-xs text-[#a89882] font-mono">
          Reference Pitch: <strong className="text-amber-300">A4 = {a4ReferenceHz} Hz</strong>
        </span>
      </div>

      {/* TAB 1: Key Color & Triad Purity Landscape */}
      {activeTab === 'key-colors' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[#b8a68e] leading-relaxed">
            In historical temperaments, each key possesses a distinct emotional character (
            <em>Affekt</em>) governed by the purity of its <strong>Major Third (5:4 = 386.3¢)</strong>{' '}
            and <strong>Fifth (3:2 = 702.0¢)</strong>. Tap any triad card below to play (and tap again
            to stop).
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {computed.triads.map((triad) => {
              const thirdColor = getThirdPurityColor(triad.majorThirdDeviationCents);
              const fifthColor = getFifthPurityColor(triad.majorFifthDeviationCents);
              const barPercent = Math.min(100, Math.abs(triad.majorThirdDeviationCents) * 2.2);
              const isMajPlaying =
                activeNoteKeys.size > 0 &&
                activePlaybackTag === `chord-major-${triad.rootPitchClass}`;
              const isMinPlaying =
                activeNoteKeys.size > 0 &&
                activePlaybackTag === `chord-minor-${triad.rootPitchClass}`;

              return (
                <div
                  key={triad.rootCircleIndex}
                  className={`bg-[#120f0b] border rounded-xl p-3 flex flex-col justify-between gap-2 transition-all group ${
                    isMajPlaying || isMinPlaying
                      ? 'border-amber-400 ring-1 ring-amber-400/40'
                      : 'border-[#2a2218] hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#f5efe6]">
                      {triad.rootName} <span className="text-xs font-normal text-[#9b8b75]">Maj</span>
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onPlayChordPreset('major', triad.rootPitchClass)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                          isMajPlaying
                            ? 'bg-red-500 text-white font-bold'
                            : 'bg-amber-500/15 hover:bg-amber-500/30 text-amber-300'
                        }`}
                        title={
                          isMajPlaying
                            ? `Stop ${triad.rootName} Major Triad`
                            : `Play ${triad.rootName} Major Triad`
                        }
                      >
                        {isMajPlaying ? '■ Stop' : 'Maj'}
                      </button>
                      <button
                        onClick={() => onPlayChordPreset('minor', triad.rootPitchClass)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                          isMinPlaying
                            ? 'bg-red-500 text-white font-bold'
                            : 'bg-[#231d15] hover:bg-[#332a1e] text-[#c2b29b]'
                        }`}
                        title={
                          isMinPlaying
                            ? `Stop ${triad.rootName} Minor Triad`
                            : `Play ${triad.rootName} Minor Triad`
                        }
                      >
                        {isMinPlaying ? '■ Stop' : 'min'}
                      </button>
                    </div>
                  </div>

                  {/* Third Purity Indicator */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#9b8b75]">Maj 3rd:</span>
                      <span className="font-mono font-bold" style={{ color: thirdColor }}>
                        {triad.majorThirdDeviationCents >= 0 ? '+' : ''}
                        {triad.majorThirdDeviationCents.toFixed(1)}¢
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#211b13] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(8, barPercent)}%`,
                          backgroundColor: thirdColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Fifth & Beat Rate Readout */}
                  <div className="flex items-center justify-between text-[10px] text-[#a89882] border-t border-[#211b13] pt-1.5 font-mono">
                    <span>
                      5th:{' '}
                      <strong style={{ color: fifthColor }}>
                        {triad.majorFifthDeviationCents >= 0 ? '+' : ''}
                        {triad.majorFifthDeviationCents.toFixed(1)}¢
                      </strong>
                    </span>
                    <span>3rd: {triad.majorThirdBeatsHz.toFixed(1)}Hz</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Practical Tuning Sheet (Cent Offsets for Electronic Strobe Tuners) */}
      {activeTab === 'tuning-sheet' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2e251a] text-[#a89882] uppercase tracking-wider text-[10px]">
                <th className="py-2 px-3">Note</th>
                <th className="py-2 px-3">Freq (Octave 4)</th>
                <th className="py-2 px-3">Tuner Offset (A = 0¢)</th>
                <th className="py-2 px-3">Tuner Offset (C = 0¢)</th>
                <th className="py-2 px-3">Cents from C</th>
                <th className="py-2 px-3">Split Subsemitone (Alt)</th>
                <th className="py-2 px-3 text-right">Reference Tone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#221c14] font-mono">
              {computed.notesByPitchClass.map((n) => {
                const isDroneActive = activeNoteKeys.has(`${n.pitchClass}-4`);
                return (
                  <tr key={n.pitchClass} className="hover:bg-[#1e1812] transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-sm text-[#f5efe6]">
                      {n.name}4
                    </td>
                    <td className="py-2.5 px-3 text-amber-300 font-semibold">
                      {n.freqOctave4.toFixed(2)} Hz
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-200 border border-amber-500/30 font-bold">
                        {n.centsDeviationFrom12TET_A >= 0 ? '+' : ''}
                        {n.centsDeviationFrom12TET_A.toFixed(1)}¢
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#d6c5ad]">
                      {n.centsDeviationFrom12TET_C >= 0 ? '+' : ''}
                      {n.centsDeviationFrom12TET_C.toFixed(1)}¢
                    </td>
                    <td className="py-2.5 px-3 text-[#9b8b75]">{n.centsFromC.toFixed(2)}¢</td>
                    <td className="py-2.5 px-3 text-[#b8a68e]">
                      {n.splitAltName ? (
                        <span>
                          <strong className="text-[#f5efe6]">{n.splitAltName}4</strong>:{' '}
                          {n.splitAltFreqOctave4!.toFixed(1)} Hz (
                          {n.splitAltDeviationFrom12TET_C! >= 0 ? '+' : ''}
                          {n.splitAltDeviationFrom12TET_C!.toFixed(1)}¢)
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() =>
                          onAuditionSingleNote(n.pitchClass, n.freqOctave4, `${n.name}4`)
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-sans font-semibold text-xs transition-colors ${
                          isDroneActive
                            ? 'bg-red-500 hover:bg-red-400 text-white'
                            : 'bg-[#261f16] hover:bg-amber-500 hover:text-[#0f0d0a] text-amber-300'
                        }`}
                      >
                        {isDroneActive ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            Stop {n.name}4
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            Drone {n.name}4
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Aural Bearing & Beat Rates Table */}
      {activeTab === 'ear-bearing' && (
        <div className="overflow-x-auto">
          <p className="text-xs text-[#b8a68e] mb-3 leading-relaxed">
            When setting a temperament by ear on a harpsichord or organ, tuners listen to the{' '}
            <strong>beats per second (Hz)</strong> between overlapping harmonics: the 3rd partial of
            the root against the 2nd partial of the Fifth (<code>|3f₁ − 2f₂|</code>), and the 5th
            partial of the root against the 4th partial of the Major Third (<code>|5f₁ − 4f₂|</code>).
          </p>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2e251a] text-[#a89882] uppercase tracking-wider text-[10px]">
                <th className="py-2 px-3">Circle Step</th>
                <th className="py-2 px-3">Fifth Interval</th>
                <th className="py-2 px-3">Fifth Tempering</th>
                <th className="py-2 px-3">5th Beat Rate (Octave 4)</th>
                <th className="py-2 px-3">Check Major Third</th>
                <th className="py-2 px-3">3rd Deviation</th>
                <th className="py-2 px-3">3rd Beat Rate (Octave 4)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#221c14] font-mono">
              {computed.fifths.map((f, i) => {
                const m3 = computed.majorThirds[i];
                const fifthCol = getFifthPurityColor(f.deviationFromPureCents);
                const thirdCol = getThirdPurityColor(m3.deviationFromPureCents);
                return (
                  <tr key={i} className="hover:bg-[#1e1812] transition-colors">
                    <td className="py-2 px-3 text-[#9b8b75]">#{i + 1}</td>
                    <td className="py-2 px-3 font-sans font-bold text-[#f5efe6]">
                      {f.fromName}4 – {f.toName}4
                    </td>
                    <td className="py-2 px-3 font-semibold" style={{ color: fifthCol }}>
                      {f.qualityLabel} ({f.deviationFromPureCents >= 0 ? '+' : ''}
                      {f.deviationFromPureCents.toFixed(2)}¢)
                    </td>
                    <td className="py-2 px-3 text-[#f5efe6]">
                      <strong>{f.beatRateHz.toFixed(2)} Hz</strong>{' '}
                      <span className="text-[10px] text-[#9b8b75]">
                        ({f.deviationFromPureCents < -0.05 ? 'narrow' : f.deviationFromPureCents > 0.05 ? 'wide' : 'pure'})
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans font-bold text-[#f5efe6]">
                      {m3.fromName}4 – {m3.toName}4
                    </td>
                    <td className="py-2 px-3 font-semibold" style={{ color: thirdCol }}>
                      {m3.deviationFromPureCents >= 0 ? '+' : ''}
                      {m3.deviationFromPureCents.toFixed(2)}¢
                    </td>
                    <td className="py-2 px-3 text-[#f5efe6]">
                      <strong>{m3.beatRateHz.toFixed(1)} Hz</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
