import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  HISTORICAL_REPERTOIRE,
  RepertoirePiece,
  RepertoireStep,
} from '../lib/repertoire';
import {
  ComputedTemperament,
  TemperamentPreset,
} from '../lib/temperament';
import { InstrumentVoiceId } from '../lib/audioEngine';
import { SplitKeyMode } from './HistoricalKeyboard';
import { StyledSelect, StyledOptionGroup, StyledOption } from './StyledSelect';
import {
  Play,
  Square,
  Repeat,
  ArrowLeftRight,
  Disc3,
  Wand2,
  Pause,
} from 'lucide-react';

interface RepertoireAndABPlayerProps {
  allPresets: TemperamentPreset[];
  activePresetId: string;
  onSelectPreset: (preset: TemperamentPreset) => void;
  onChangeVoice: (voiceId: InstrumentVoiceId) => void;
  computed: ComputedTemperament;
  splitKeyMode: SplitKeyMode;
  onPlayStepNotes: (
    notes: Array<{ noteKey: string; freqHz: number; pitchClass: number; label: string }>,
    arpeggioDelayMs?: number
  ) => void;
  onStopAll: () => void;
}

export const RepertoireAndABPlayer: React.FC<RepertoireAndABPlayerProps> = ({
  allPresets,
  activePresetId,
  onSelectPreset,
  onChangeVoice,
  computed,
  splitKeyMode,
  onPlayStepNotes,
  onStopAll,
}) => {
  const [slotAId, setSlotAId] = useState<string>('quarter-meantone');
  const [slotBId, setSlotBId] = useState<string>('vallotti');
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');

  const [selectedPieceId, setSelectedPieceId] = useState<string>(
    HISTORICAL_REPERTOIRE[0].id
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPausedOnStep, setIsPausedOnStep] = useState<boolean>(false);
  const [loopEnabled, setLoopEnabled] = useState<boolean>(true);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const stepTimerRef = useRef<number | null>(null);
  const computedRef = useRef<ComputedTemperament>(computed);
  computedRef.current = computed;
  const splitKeyModeRef = useRef<SplitKeyMode>(splitKeyMode);
  splitKeyModeRef.current = splitKeyMode;
  const loopEnabledRef = useRef<boolean>(loopEnabled);
  loopEnabledRef.current = loopEnabled;

  const selectedPiece: RepertoirePiece =
    HISTORICAL_REPERTOIRE.find((p) => p.id === selectedPieceId) ??
    HISTORICAL_REPERTOIRE[0];

  const slotAPreset = allPresets.find((p) => p.id === slotAId) ?? allPresets[0];
  const slotBPreset = allPresets.find((p) => p.id === slotBId) ?? allPresets[1];

  const presetOptionGroups: StyledOptionGroup[] = useMemo(() => {
    const categories: Array<{ key: TemperamentPreset['category']; title: string }> = [
      { key: 'Custom', title: '★ My Saved Custom Temperaments' },
      { key: 'Meantone', title: 'Meantone Temperaments (1523–1720)' },
      { key: 'German & Bach-Era', title: 'German & Bach-Era Organ/Clavier' },
      { key: 'Italian, French & English', title: 'Italian, French & English' },
      { key: 'Pythagorean, Medieval & Just', title: 'Pythagorean, Medieval & Just' },
      { key: 'Equal', title: 'Modern Equal Temperament' },
    ];
    return categories
      .map((cat) => ({
        groupLabel: cat.title,
        options: allPresets
          .filter((p) => p.category === cat.key)
          .map((p) => ({
            value: p.id,
            label: p.name,
            sublabel: p.author,
            badge: p.year,
          })),
      }))
      .filter((g) => g.options.length > 0);
  }, [allPresets]);

  const repertoireOptions: StyledOption[] = useMemo(
    () =>
      HISTORICAL_REPERTOIRE.map((piece) => ({
        value: piece.id,
        label: `${piece.composer}: ${piece.title}`,
        sublabel: piece.description,
        badge: piece.year,
      })),
    []
  );

  useEffect(() => {
    if (activePresetId === slotAId) {
      setActiveSlot('A');
    } else if (activePresetId === slotBId) {
      setActiveSlot('B');
    }
  }, [activePresetId, slotAId, slotBId]);

  const activateSlot = useCallback(
    (slot: 'A' | 'B') => {
      setActiveSlot(slot);
      const targetId = slot === 'A' ? slotAId : slotBId;
      const found = allPresets.find((p) => p.id === targetId);
      if (found) {
        onSelectPreset(found);
      }
    },
    [slotAId, slotBId, allPresets, onSelectPreset]
  );

  const toggleAB = useCallback(() => {
    activateSlot(activeSlot === 'A' ? 'B' : 'A');
  }, [activeSlot, activateSlot]);

  const resolveStepFrequencies = useCallback((step: RepertoireStep) => {
    const comp = computedRef.current;
    const splitMode = splitKeyModeRef.current;

    return step.notes.map((n, idx) => {
      const noteData = comp.notesByPitchClass[n.pitchClass];
      const canUseSplit =
        splitMode === 'all-five' ||
        (splitMode === 'two-historical' && (n.pitchClass === 3 || n.pitchClass === 8));

      const useSplitAlt =
        canUseSplit &&
        n.accidental !== undefined &&
        n.accidental !== noteData.accidentalChoice &&
        noteData.splitAltFreqOctave4 !== undefined;

      const baseOct4Freq = useSplitAlt
        ? noteData.splitAltFreqOctave4!
        : noteData.freqOctave4;
      const freqHz = baseOct4Freq * Math.pow(2, n.octave - 4);
      const displayName = useSplitAlt ? noteData.splitAltName! : noteData.name;
      const noteKey = useSplitAlt
        ? `${n.pitchClass}-alt-${n.octave}-${idx}`
        : `${n.pitchClass}-${n.octave}`;

      return {
        noteKey,
        freqHz,
        pitchClass: n.pitchClass,
        label: `${displayName}${n.octave}`,
      };
    });
  }, []);

  const triggerStep = useCallback(
    (piece: RepertoirePiece, stepIdx: number, autoAdvance: boolean) => {
      if (stepTimerRef.current) {
        window.clearTimeout(stepTimerRef.current);
        stepTimerRef.current = null;
      }

      const step = piece.steps[stepIdx];
      if (!step) return;

      setCurrentStepIndex(stepIdx);
      const resolvedNotes = resolveStepFrequencies(step);
      onPlayStepNotes(resolvedNotes, step.arpeggioDelayMs);

      if (autoAdvance) {
        stepTimerRef.current = window.setTimeout(() => {
          const nextIdx = stepIdx + 1;
          if (nextIdx < piece.steps.length) {
            triggerStep(piece, nextIdx, true);
          } else if (loopEnabledRef.current) {
            triggerStep(piece, 0, true);
          } else {
            setIsPlaying(false);
            setCurrentStepIndex(0);
            onStopAll();
          }
        }, step.durationMs);
      }
    },
    [resolveStepFrequencies, onPlayStepNotes, onStopAll]
  );

  const handleStop = useCallback(() => {
    if (stepTimerRef.current) {
      window.clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    setIsPlaying(false);
    setIsPausedOnStep(false);
    setCurrentStepIndex(0);
    onStopAll();
  }, [onStopAll]);

  const handlePlay = () => {
    setIsPlaying(true);
    setIsPausedOnStep(false);
    triggerStep(
      selectedPiece,
      currentStepIndex >= selectedPiece.steps.length ? 0 : currentStepIndex,
      true
    );
  };

  const handleFreezeStep = (stepIdx: number) => {
    if (stepTimerRef.current) {
      window.clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    setIsPlaying(false);
    setIsPausedOnStep(true);
    triggerStep(selectedPiece, stepIdx, false);
  };

  const handleLoadRecommendedSetup = (piece: RepertoirePiece) => {
    setSlotAId(piece.recommendedTemperamentA);
    setSlotBId(piece.recommendedTemperamentB);
    setActiveSlot('A');
    const presetA = allPresets.find((p) => p.id === piece.recommendedTemperamentA);
    if (presetA) onSelectPreset(presetA);
    onChangeVoice(piece.recommendedVoice);
  };

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) {
        window.clearTimeout(stepTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#1a150f] to-[#14110c] border border-[#3a2e1f] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      {/* Top Row: Instant A/B Temperament Switcher */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-3.5 border-b border-[#2c2419]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-200">
              Instant A / B Temperament Comparator
            </h3>
            <p className="text-[11px] text-[#a89882]">
              Hot-swap between two temperaments mid-chord or mid-piece to hear the exact tuning difference
            </p>
          </div>
        </div>

        {/* Slot A & Slot B Controls */}
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto shrink-0">
          {/* SLOT A */}
          <div
            className={`flex items-center gap-1.5 p-1.5 rounded-xl border transition-all ${activeSlot === 'A' && activePresetId === slotAId
              ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
              : 'bg-[#110e0a] border-[#2c2419]'
              }`}
          >
            <button
              onClick={() => activateSlot('A')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${activeSlot === 'A' && activePresetId === slotAId
                ? 'bg-amber-500 text-[#0f0d0a]'
                : 'bg-[#211b13] text-[#d6c5ad] hover:text-white'
                }`}
            >
              SLOT A
            </button>
            <StyledSelect
              value={slotAId}
              groups={presetOptionGroups}
              onChange={(val) => {
                setSlotAId(val);
                setActiveSlot('A');
                const found = allPresets.find((p) => p.id === val);
                if (found) onSelectPreset(found);
              }}
              buttonClassName="py-1 px-2.5 w-[170px] sm:w-[195px]"
              menuWidthClass="w-80"
            />
          </div>

          {/* Quick Flip A <-> B Button */}
          <button
            onClick={toggleAB}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0f0d0a] font-extrabold text-xs shadow-md transition-all active:scale-95 whitespace-nowrap shrink-0"
            title="Instantly flip between Slot A and Slot B"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
            Flip A ⇄ B
          </button>

          {/* SLOT B */}
          <div
            className={`flex items-center gap-1.5 p-1.5 rounded-xl border transition-all ${activeSlot === 'B' && activePresetId === slotBId
              ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
              : 'bg-[#110e0a] border-[#2c2419]'
              }`}
          >
            <button
              onClick={() => activateSlot('B')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${activeSlot === 'B' && activePresetId === slotBId
                ? 'bg-emerald-500 text-[#0f0d0a]'
                : 'bg-[#211b13] text-[#d6c5ad] hover:text-white'
                }`}
            >
              SLOT B
            </button>
            <StyledSelect
              value={slotBId}
              groups={presetOptionGroups}
              onChange={(val) => {
                setSlotBId(val);
                setActiveSlot('B');
                const found = allPresets.find((p) => p.id === val);
                if (found) onSelectPreset(found);
              }}
              buttonClassName="py-1 px-2.5 w-[170px] sm:w-[195px]"
              menuWidthClass="w-80"
              align="right"
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Historical Repertoire Sequencer & Measure Scrubber */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-nowrap items-center justify-between gap-2 overflow-x-auto pb-0.5">
          <div className="flex flex-nowrap items-center gap-2 shrink-0">
            <Disc3
              className={`w-4 h-4 text-amber-400 shrink-0 ${isPlaying ? 'animate-spin' : ''}`}
            />
            <span className="hidden xl:inline text-xs font-bold uppercase tracking-wider text-[#d6c5ad] whitespace-nowrap">
              Repertoire:
            </span>
            <StyledSelect
              value={selectedPieceId}
              options={repertoireOptions}
              onChange={(newId) => {
                setSelectedPieceId(newId);
                setCurrentStepIndex(0);
                const found = HISTORICAL_REPERTOIRE.find((p) => p.id === newId);
                if (found && isPlaying) {
                  triggerStep(found, 0, true);
                }
              }}
              buttonClassName="w-[240px] sm:w-[320px]"
              menuWidthClass="w-80 sm:w-[420px]"
            />

            <button
              onClick={() => handleLoadRecommendedSetup(selectedPiece)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#241d14] hover:bg-[#33291d] text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              title="Load the recommended instrument stop and A/B temperaments for this piece"
            >
              <Wand2 className="w-3.5 h-3.5 shrink-0" />
              Load Recommended
            </button>
          </div>

          {/* Transport Controls — fixed widths so nothing shifts when playback state changes */}
          <div className="flex flex-nowrap items-center gap-2 shrink-0">
            {/* Play ⇄ Stop toggle */}
            <button
              onClick={isPlaying || isPausedOnStep ? handleStop : handlePlay}
              className={`w-[118px] justify-center flex items-center gap-1.5 py-1.5 rounded-xl font-bold text-xs shadow-md transition-colors whitespace-nowrap ${
                isPlaying || isPausedOnStep
                  ? 'bg-red-500 hover:bg-red-400 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-[#0f0d0a]'
              }`}
            >
              {isPlaying || isPausedOnStep ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Play Excerpt
                </>
              )}
            </button>

            {/* Hold — always visible, enabled only while auto-playing */}
            <button
              onClick={() => handleFreezeStep(currentStepIndex)}
              disabled={!isPlaying}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold text-xs transition-colors whitespace-nowrap ${
                isPlaying
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40'
                  : 'bg-[#120f0b] text-[#5e5243] border-[#262017] cursor-not-allowed'
              }`}
              title="Freeze and sustain the current chord so you can toggle A/B"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              Hold
            </button>

            <button
              onClick={() => setLoopEnabled((v) => !v)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap ${
                loopEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#120f0b] text-[#8c7d69] border-[#262017]'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              Loop
            </button>
          </div>
        </div>

        {/* Listening Guide Note */}
        <div className="bg-[#110e0a] border border-[#282016] rounded-xl p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[#e5dac9] font-medium">{selectedPiece.description}</span>
            <p className="text-amber-300/90 mt-1">
              💡 <strong>Listening Tip:</strong> {selectedPiece.whatToListenFor}
            </p>
          </div>
          <div className="shrink-0 text-[11px] font-mono text-[#a89882] bg-[#19140e] px-3 py-1.5 rounded-lg border border-[#2c2419]">
            Active:{' '}
            <strong className="text-amber-300">
              {activePresetId === slotAId
                ? `A (${slotAPreset.name})`
                : activePresetId === slotBId
                  ? `B (${slotBPreset.name})`
                  : 'Custom'}
            </strong>
          </div>
        </div>

        {/* Interactive Step / Measure Progression Pills */}
        <div className="flex flex-nowrap gap-1.5 pt-1 pb-1 overflow-x-auto">
          {selectedPiece.steps.map((step, idx) => {
            const isCurrent = (isPlaying || isPausedOnStep) && currentStepIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (isCurrent) {
                    handleStop();
                  } else {
                    handleFreezeStep(idx);
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all text-left flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isCurrent
                    ? 'bg-red-500 text-white border-red-300 font-bold shadow-sm scale-[1.02]'
                    : 'bg-[#120f0b] text-[#c2b29b] border-[#282016] hover:border-amber-500/40 hover:text-[#f5efe6]'
                }`}
                title={
                  isCurrent
                    ? 'Tap to stop holding this chord'
                    : 'Tap to hold this harmony continuously and compare Slot A vs Slot B'
                }
              >
                {isCurrent && <Square className="w-3 h-3 fill-current shrink-0" />}
                <span>{step.harmonyLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
