import React from 'react';
import {
  ComputedTemperament,
  CommaUnit,
  SYNTONIC_COMMA_CENTS,
  PYTHAGOREAN_COMMA_CENTS,
  formatCommaLabel,
  getFifthPurityColor,
} from '../lib/temperament';
import { Volume2, Square, Lock, Sparkles, Sliders } from 'lucide-react';

interface FifthDesignerPanelProps {
  computed: ComputedTemperament;
  selectedFifthIndex: number;
  onSelectFifth: (idx: number, playDyad: boolean) => void;
  commaUnit: CommaUnit;
  onChangeCommaUnit: (unit: CommaUnit) => void;
  onUpdateFifthCents: (fifthIndex: number, newDeviationCents: number) => void;
  onApplyToAllEleven: (deviationCents: number) => void;
  onSetWolfIndex: (wolfIndex: number) => void;
  onAuditionFifth: (fifthIndex: number) => void;
  isSelectedFifthPlaying: boolean;
}

const FRACTION_PRESETS = [
  { label: '-1/3', num: -1, den: 3 },
  { label: '-2/7', num: -2, den: 7 },
  { label: '-1/4', num: -1, den: 4 },
  { label: '-1/5', num: -1, den: 5 },
  { label: '-1/6', num: -1, den: 6 },
  { label: '-1/8', num: -1, den: 8 },
  { label: '-1/12', num: -1, den: 12 },
  { label: 'Pure (0)', num: 0, den: 1 },
  { label: '+1/12', num: 1, den: 12 },
  { label: '+1/6', num: 1, den: 6 },
];

export const FifthDesignerPanel: React.FC<FifthDesignerPanelProps> = ({
  computed,
  selectedFifthIndex,
  onSelectFifth,
  commaUnit,
  onChangeCommaUnit,
  onUpdateFifthCents,
  onApplyToAllEleven,
  onSetWolfIndex,
  onAuditionFifth,
  isSelectedFifthPlaying,
}) => {
  const fifth = computed.fifths[selectedFifthIndex];
  const isWolf = computed.wolfCircleIndex === selectedFifthIndex;
  const activeCommaCents =
    commaUnit === 'pythagorean' ? PYTHAGOREAN_COMMA_CENTS : SYNTONIC_COMMA_CENTS;

  const currentColor = getFifthPurityColor(fifth.deviationFromPureCents);

  return (
    <div className="bg-[#17130e] border border-[#332a1d] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      {/* Header & Comma Unit Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2a2218] pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-200/90">
            Comma-Splitting Workbench
          </h3>
        </div>

        <div className="flex items-center bg-[#0f0d0a] p-1 rounded-lg border border-[#2c2419] text-xs">
          <button
            onClick={() => onChangeCommaUnit('syntonic')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              commaUnit === 'syntonic'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-[#a89882] hover:text-[#f5efe6]'
            }`}
            title="Syntonic Comma (81/80 = 21.506¢) — the basis of Meantone and Kirnberger"
          >
            Syntonic (21.5¢)
          </button>
          <button
            onClick={() => onChangeCommaUnit('pythagorean')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              commaUnit === 'pythagorean'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-[#a89882] hover:text-[#f5efe6]'
            }`}
            title="Pythagorean Comma (531441/524288 = 23.460¢) — the basis of Werckmeister, Vallotti & 12-TET"
          >
            Pythag. (23.5¢)
          </button>
          <button
            onClick={() => onChangeCommaUnit('cents')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              commaUnit === 'cents'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-[#a89882] hover:text-[#f5efe6]'
            }`}
          >
            Cents (¢)
          </button>
        </div>
      </div>

      {/* Selected Fifth Detail Card */}
      <div className="bg-[#120f0b] border border-[#2d2419] rounded-xl p-3.5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1.5 rounded-lg font-bold text-lg tracking-tight border"
              style={{
                backgroundColor: `${currentColor}18`,
                borderColor: `${currentColor}66`,
                color: currentColor,
              }}
            >
              {fifth.fromName} – {fifth.toName}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#f5efe6]">
                  {fifth.sizeCents.toFixed(2)}¢
                </span>
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#211b13]"
                  style={{ color: currentColor }}
                >
                  {formatCommaLabel(fifth.deviationFromPureCents, commaUnit)} (
                  {fifth.deviationFromPureCents >= 0 ? '+' : ''}
                  {fifth.deviationFromPureCents.toFixed(2)}¢)
                </span>
              </div>
              <div className="text-xs text-[#a89882] mt-0.5 flex items-center gap-2">
                <span>
                  Beat rate (Octave 4):{' '}
                  <strong className="text-[#f5efe6] font-mono">
                    {fifth.beatRateHz.toFixed(2)} Hz
                  </strong>
                </span>
                {fifth.beatRateHz > 0.05 && (
                  <span
                    className="inline-block w-2 h-2 rounded-full bg-amber-400"
                    style={{
                      animation: `pulse ${Math.max(0.08, 1 / fifth.beatRateHz).toFixed(3)}s infinite ease-in-out`,
                    }}
                    title={`Pulsing at ${fifth.beatRateHz.toFixed(1)} beats/sec`}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAuditionFifth(selectedFifthIndex)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                isSelectedFifthPlaying
                  ? 'bg-red-500/25 hover:bg-red-500/35 text-red-200 border-red-500/50'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40'
              }`}
            >
              {isSelectedFifthPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Stop 5th
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  Play 5th
                </>
              )}
            </button>

            {!isWolf ? (
              <button
                onClick={() => onSetWolfIndex(selectedFifthIndex)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#211b13] hover:bg-[#2c2419] text-[#c2b29b] border border-[#3a2f21] text-xs transition-colors"
                title="Make this fifth automatically absorb the closure remainder (Wolf fifth)"
              >
                <Lock className="w-3.5 h-3.5" />
                Set as Closure
              </button>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30 text-xs font-medium">
                <Lock className="w-3.5 h-3.5" />
                Closure / Wolf Fifth
              </span>
            )}
          </div>
        </div>

        {isWolf ? (
          <div className="text-xs text-amber-200/80 bg-amber-500/10 border border-amber-500/25 rounded-lg p-2.5 leading-relaxed">
            <strong>{fifth.fromName} – {fifth.toName}</strong> is currently the automatic{' '}
            <strong>Closure (Wolf) Fifth</strong> so that all octaves remain pure 2:1. Select any
            other fifth on the wheel to adjust it, or click <em>"Set as Closure"</em> on another
            fifth to relocate the wolf!
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#a89882]">
                <span>
                  Quick Fraction ({commaUnit === 'pythagorean' ? 'Pythagorean' : 'Syntonic'} Comma):
                </span>
                <button
                  onClick={() => onApplyToAllEleven(fifth.deviationFromPureCents)}
                  className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-medium underline underline-offset-2"
                  title="Set all 11 non-closure fifths to this exact tempering (creates a regular meantone temperament)"
                >
                  <Sparkles className="w-3 h-3" />
                  Apply this value to all 11 fifths
                </button>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {FRACTION_PRESETS.map((fp) => {
                  const targetCents = (fp.num / fp.den) * activeCommaCents;
                  const isActive = Math.abs(fifth.deviationFromPureCents - targetCents) < 0.12;
                  return (
                    <button
                      key={fp.label}
                      onClick={() => onUpdateFifthCents(selectedFifthIndex, targetCents)}
                      className={`py-1.5 px-1 rounded-md font-mono text-xs font-semibold border transition-all ${
                        isActive
                          ? 'bg-amber-500 text-[#0f0d0a] border-amber-300 shadow-sm'
                          : 'bg-[#1b1610] text-[#d6c5ad] border-[#332a1d] hover:border-amber-500/50 hover:text-white'
                      }`}
                    >
                      {fp.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] font-mono text-[#a89882] w-12 text-right">-12.0¢</span>
              <input
                type="range"
                min={-12}
                max={8}
                step={0.05}
                value={Math.max(-12, Math.min(8, fifth.deviationFromPureCents))}
                onChange={(e) =>
                  onUpdateFifthCents(selectedFifthIndex, parseFloat(e.target.value))
                }
                className="flex-1 accent-amber-500 h-2 bg-[#262017] rounded-lg cursor-pointer"
              />
              <span className="text-[11px] font-mono text-[#a89882] w-12">+8.0¢</span>
            </div>
          </>
        )}
      </div>

      {/* All 12 Fifths Mini Bar Strip */}
      <div>
        <div className="text-[11px] text-[#a89882] mb-2 flex items-center justify-between">
          <span>All 12 Fifths around Circle (tap to play, tap again to stop):</span>
          <span className="font-mono">Sum = -23.46¢ (-1 Pythag. comma)</span>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
          {computed.fifths.map((f, idx) => {
            const isSel = idx === selectedFifthIndex;
            const isPlayingThis = isSel && isSelectedFifthPlaying;
            const isW = idx === computed.wolfCircleIndex;
            const col = getFifthPurityColor(f.deviationFromPureCents);
            return (
              <button
                key={idx}
                onClick={() => onSelectFifth(idx, true)}
                className={`flex flex-col items-center justify-between p-1.5 rounded-lg border text-center transition-all ${
                  isPlayingThis
                    ? 'bg-red-500/20 border-red-400 ring-1 ring-red-400/50'
                    : isSel
                    ? 'bg-[#2a2116] border-amber-400 ring-1 ring-amber-400/50'
                    : 'bg-[#120f0b] border-[#262017] hover:border-[#4a3d2a]'
                }`}
              >
                <span className="text-[10px] font-bold text-[#e5dac9] truncate w-full">
                  {isPlayingThis ? '■ ' : ''}
                  {f.fromName}–{f.toName}
                </span>
                <span
                  className="text-[10px] font-mono font-semibold mt-0.5"
                  style={{ color: col }}
                >
                  {formatCommaLabel(f.deviationFromPureCents, commaUnit)}
                </span>
                {isW && (
                  <span className="text-[8px] uppercase tracking-tighter text-red-400 font-bold">
                    Closure
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
