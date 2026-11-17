import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  HISTORICAL_PRESETS,
  TemperamentPreset,
  CommaUnit,
  computeTemperament,
  PURE_FIFTH_CENTS,
  PURE_MAJOR_THIRD_CENTS,
  PURE_MINOR_THIRD_CENTS,
} from './lib/temperament';
import {
  audioEngine,
  INSTRUMENT_VOICES,
  InstrumentVoiceId,
} from './lib/audioEngine';
import { CircleOfFifthsWheel } from './components/CircleOfFifthsWheel';
import { FifthDesignerPanel } from './components/FifthDesignerPanel';
import {
  HistoricalKeyboard,
  SplitKeyMode,
  KEYBOARD_SHORTCUTS,
} from './components/HistoricalKeyboard';
import { KeyColorAndTuningTable } from './components/KeyColorAndTuningTable';
import { CustomTemperamentModal } from './components/CustomTemperamentModal';
import { RepertoireAndABPlayer } from './components/RepertoireAndABPlayer';
import { StyledSelect, StyledOptionGroup, StyledOption } from './components/StyledSelect';
import {
  Compass,
  Volume2,
  BookOpen,
  RotateCcw,
  Radio,
  Sparkles,
  Activity,
  PlusCircle,
  Square,
} from 'lucide-react';

const HISTORICAL_PITCH_PRESETS = [
  { label: '392 Hz', sublabel: 'French Baroque (Ton de Chapelle)', hz: 392 },
  { label: '415 Hz', sublabel: 'Baroque Harpsichord / Chamber', hz: 415 },
  { label: '430 Hz', sublabel: 'Classical Fortepiano', hz: 430 },
  { label: '440 Hz', sublabel: 'Modern Concert Pitch', hz: 440 },
  { label: '465 Hz', sublabel: 'Chorton / North German Organ', hz: 465 },
];

const CUSTOM_STORAGE_KEY = 'temperament_lab_custom_presets_v1';

interface ActiveSoundingNote {
  noteKey: string;
  pitchClass: number;
  freqHz: number;
  label: string;
}

export function App() {
  const initialPreset = HISTORICAL_PRESETS[0];

  const [savedCustomPresets, setSavedCustomPresets] = useState<TemperamentPreset[]>(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const allPresets = useMemo(
    () => [...savedCustomPresets, ...HISTORICAL_PRESETS],
    [savedCustomPresets]
  );

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [isCustomModified, setIsCustomModified] = useState<boolean>(false);
  const [fifthDeviationsCents, setFifthDeviationsCents] = useState<number[]>(
    initialPreset.fifthDeviationsCents
  );
  const [wolfCircleIndex, setWolfCircleIndex] = useState<number>(
    initialPreset.wolfCircleIndex
  );
  const [commaUnit, setCommaUnit] = useState<CommaUnit>(initialPreset.commaUnit);
  const [spellings, setSpellings] = useState<Record<number, 'sharp' | 'flat'>>(
    initialPreset.spellings
  );
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);

  // Reference Pitch & Instrument Registration
  const [a4ReferenceHz, setA4ReferenceHz] = useState<number>(415);
  const [voiceId, setVoiceId] = useState<InstrumentVoiceId>('organ-principal');

  // Wheel & Inspector state
  const [selectedFifthIndex, setSelectedFifthIndex] = useState<number>(0); // C-G
  const [selectedThirdIndex, setSelectedThirdIndex] = useState<number | null>(null);
  const [showMinorThirds, setShowMinorThirds] = useState<boolean>(false);

  // Keyboard & Drone state
  const [latchMode, setLatchMode] = useState<boolean>(true);
  const [splitKeyMode, setSplitKeyMode] = useState<SplitKeyMode>('two-historical');
  const [selectedRootPitchClass, setSelectedRootPitchClass] = useState<number>(0); // C
  const [activeNotesMap, setActiveNotesMap] = useState<Map<string, ActiveSoundingNote>>(
    new Map()
  );
  const [activePlaybackTag, setActivePlaybackTag] = useState<string | null>(null);
  const [midiStatus, setMidiStatus] = useState<string | null>(null);
  const cadenceTimersRef = useRef<number[]>([]);

  // Options for custom styled dropdowns
  const presetOptionGroups: StyledOptionGroup[] = useMemo(() => {
    const categories: Array<{ key: TemperamentPreset['category']; title: string }> = [
      { key: 'Custom', title: '★ My Saved Custom Temperaments' },
      { key: 'Meantone', title: 'Meantone Temperaments (1523–1720)' },
      { key: 'German & Bach-Era', title: 'German & Bach-Era Organ/Clavier (1511–1779)' },
      { key: 'Italian, French & English', title: 'Italian, French & English (1726–1800)' },
      { key: 'Pythagorean, Medieval & Just', title: 'Pythagorean, Medieval & Just Intonation' },
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

  const voiceOptionGroups: StyledOptionGroup[] = useMemo(() => {
    const cats: Array<{ key: 'Organ' | 'Harpsichord' | 'Lab'; label: string }> = [
      { key: 'Organ', label: 'Baroque & Renaissance Pipe Organ Stops' },
      { key: 'Harpsichord', label: 'Historical Harpsichords (Clavecin / Cimbalo)' },
      { key: 'Lab', label: 'Acoustic Calibration Waveform' },
    ];
    return cats.map((c) => ({
      groupLabel: c.label,
      options: INSTRUMENT_VOICES.filter((v) => v.category === c.key).map((v) => ({
        value: v.id,
        label: v.name,
        sublabel: v.description,
        badge: v.shortName,
      })),
    }));
  }, []);

  const pitchOptions: StyledOption[] = useMemo(
    () =>
      HISTORICAL_PITCH_PRESETS.map((p) => ({
        value: String(p.hz),
        label: p.label,
        sublabel: p.sublabel,
      })),
    []
  );

  // Compute full temperament data
  const computed = useMemo(
    () =>
      computeTemperament(
        fifthDeviationsCents,
        wolfCircleIndex,
        a4ReferenceHz,
        spellings
      ),
    [fifthDeviationsCents, wolfCircleIndex, a4ReferenceHz, spellings]
  );

  const currentPreset: TemperamentPreset | undefined = useMemo(
    () => allPresets.find((p) => p.id === selectedPresetId),
    [allPresets, selectedPresetId]
  );

  // Dynamically retune all currently sounding oscillators whenever temperament changes
  useEffect(() => {
    if (activeNotesMap.size === 0) return;

    setActiveNotesMap((prev) => {
      const next = new Map(prev);
      for (const [noteKey, info] of next.entries()) {
        const parts = noteKey.split('-');
        const pc = parseInt(parts[0], 10);
        const isAlt = parts[1] === 'alt';
        const octave = parseInt(parts[isAlt ? 2 : 1], 10);
        const noteData = computed.notesByPitchClass[pc];
        if (!noteData || isNaN(octave)) continue;

        const baseFreq =
          isAlt && noteData.splitAltFreqOctave4
            ? noteData.splitAltFreqOctave4
            : noteData.freqOctave4;
        const newFreq = baseFreq * Math.pow(2, octave - 4);
        const newLabel = `${isAlt && noteData.splitAltName ? noteData.splitAltName : noteData.name}${octave}`;

        audioEngine.updateNoteFrequency(noteKey, newFreq);
        next.set(noteKey, {
          ...info,
          freqHz: newFreq,
          label: newLabel,
        });
      }
      return next;
    });
  }, [computed]);

  // Select a temperament preset
  const handleSelectPreset = useCallback((preset: TemperamentPreset) => {
    setSelectedPresetId(preset.id);
    setIsCustomModified(false);
    setFifthDeviationsCents([...preset.fifthDeviationsCents]);
    setWolfCircleIndex(preset.wolfCircleIndex);
    setCommaUnit(preset.commaUnit);
    setSpellings({ ...preset.spellings });
  }, []);

  // Save a new user custom preset to localStorage
  const handleSaveCustomPreset = (newPreset: TemperamentPreset) => {
    const updated = [newPreset, ...savedCustomPresets];
    setSavedCustomPresets(updated);
    try {
      localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage quota errors
    }
    handleSelectPreset(newPreset);
  };

  const handleDeleteCustomPreset = (id: string) => {
    const updated = savedCustomPresets.filter((p) => p.id !== id);
    setSavedCustomPresets(updated);
    try {
      localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    if (selectedPresetId === id) {
      handleSelectPreset(HISTORICAL_PRESETS[0]);
    }
  };

  // Update a single fifth's cent deviation
  const handleUpdateFifthCents = (fifthIdx: number, newDeviationCents: number) => {
    if (fifthIdx === wolfCircleIndex) return;
    setIsCustomModified(true);
    setFifthDeviationsCents((prev) => {
      const next = [...prev];
      next[fifthIdx] = newDeviationCents;
      return next;
    });
  };

  // Apply a deviation to all 11 non-wolf fifths
  const handleApplyToAllEleven = (deviationCents: number) => {
    setIsCustomModified(true);
    setFifthDeviationsCents((prev) =>
      prev.map((_, i) => (i === wolfCircleIndex ? 0 : deviationCents))
    );
  };

  // Apply a full 12-fifth array from the Formula Editor
  const handleApplyFifthArray = (fifthsCents: number[], wolfIdx: number) => {
    setIsCustomModified(true);
    setWolfCircleIndex(wolfIdx);
    setFifthDeviationsCents([...fifthsCents]);
  };

  // Change which fifth absorbs the closure remainder
  const handleSetWolfIndex = (newWolfIdx: number) => {
    setIsCustomModified(true);
    setWolfCircleIndex(newWolfIdx);
  };

  // Toggle sharp/flat spelling on accidental nodes (6..10)
  const handleToggleSpelling = (circleIndex: number) => {
    setSpellings((prev) => ({
      ...prev,
      [circleIndex]: prev[circleIndex] === 'flat' ? 'sharp' : 'flat',
    }));
  };

  // Change synth voice
  const handleVoiceChange = useCallback((newVoice: InstrumentVoiceId) => {
    setVoiceId(newVoice);
    audioEngine.setVoice(newVoice);
  }, []);

  const clearCadenceTimers = () => {
    for (const id of cadenceTimersRef.current) {
      window.clearTimeout(id);
    }
    cadenceTimersRef.current = [];
  };

  const handleStopAll = useCallback(() => {
    clearCadenceTimers();
    audioEngine.stopAll();
    setActiveNotesMap(new Map());
    setActivePlaybackTag(null);
  }, []);

  // Play a step from the Historical Repertoire Player
  const handlePlayRepertoireStep = useCallback(
    (
      notes: Array<{ noteKey: string; freqHz: number; pitchClass: number; label: string }>,
      arpeggioDelayMs?: number
    ) => {
      clearCadenceTimers();
      audioEngine.stopAll();
      setActivePlaybackTag('repertoire');

      if (!arpeggioDelayMs) {
        const nextMap = new Map<string, ActiveSoundingNote>();
        for (const n of notes) {
          audioEngine.noteOn(n.noteKey, n.freqHz, true);
          nextMap.set(n.noteKey, n);
        }
        setActiveNotesMap(nextMap);
      } else {
        setActiveNotesMap(new Map());
        notes.forEach((n, idx) => {
          const t = window.setTimeout(() => {
            audioEngine.noteOn(n.noteKey, n.freqHz, true);
            setActiveNotesMap((prev) => {
              const next = new Map(prev);
              next.set(n.noteKey, n);
              return next;
            });
          }, idx * arpeggioDelayMs);
          cadenceTimersRef.current.push(t);
        });
      }
    },
    []
  );

  const handleNoteTrigger = useCallback(
    (noteKey: string, freqHz: number, pitchClass: number, label: string) => {
      setActiveNotesMap((prev) => {
        const next = new Map(prev);
        if (latchMode && next.has(noteKey)) {
          audioEngine.noteOff(noteKey);
          next.delete(noteKey);
        } else {
          audioEngine.noteOn(noteKey, freqHz, latchMode);
          next.set(noteKey, { noteKey, pitchClass, freqHz, label });
        }
        return next;
      });
    },
    [latchMode]
  );

  const handleNoteRelease = useCallback((noteKey: string) => {
    audioEngine.noteOff(noteKey);
    setActiveNotesMap((prev) => {
      const next = new Map(prev);
      next.delete(noteKey);
      return next;
    });
  }, []);

  const handlePlayChordPreset = useCallback(
    (
      type: 'major' | 'minor' | 'fifth' | 'third' | 'cadence',
      rootPitchClass: number
    ) => {
      const tag = `chord-${type}-${rootPitchClass}`;
      // Toggle off if already playing this exact chord/cadence preset!
      if (activeNotesMap.size > 0 && activePlaybackTag === tag) {
        handleStopAll();
        return;
      }

      clearCadenceTimers();
      audioEngine.stopAll();
      setActivePlaybackTag(tag);

      const playVoicing = (intervalsSemitones: number[], baseOctave: number = 4) => {
        const nextMap = new Map<string, ActiveSoundingNote>();
        for (const semitones of intervalsSemitones) {
          const totalSemis = rootPitchClass + semitones;
          const pc = ((totalSemis % 12) + 12) % 12;
          const oct = baseOctave + Math.floor(totalSemis / 12);
          const noteData = computed.notesByPitchClass[pc];
          const freq = noteData.freqOctave4 * Math.pow(2, oct - 4);
          const noteKey = `${pc}-${oct}`;
          const label = `${noteData.name}${oct}`;
          audioEngine.noteOn(noteKey, freq, true);
          nextMap.set(noteKey, { noteKey, pitchClass: pc, freqHz: freq, label });
        }
        setActiveNotesMap(nextMap);

        if (!latchMode) {
          const t = window.setTimeout(() => {
            handleStopAll();
          }, 2200);
          cadenceTimersRef.current.push(t);
        }
      };

      if (type === 'major') {
        playVoicing([0, 4, 7], 4);
      } else if (type === 'minor') {
        playVoicing([0, 3, 7], 4);
      } else if (type === 'third') {
        playVoicing([0, 4], 4);
      } else if (type === 'fifth') {
        playVoicing([0, 7], 4);
      } else if (type === 'cadence') {
        const baseOctave = rootPitchClass >= 6 ? 3 : 4;
        const steps = [
          { semis: [-12, 4, 7, 12], delay: 0 },     // I
          { semis: [-7, 2, 9, 12], delay: 850 },    // ii6/5 (Subdominant six-five)
          { semis: [-5, 4, 7, 12], delay: 1700 },   // V6/4 (Cadential 6/4 suspension)
          { semis: [-5, 5, 7, 11], delay: 2450 },   // V7 (4-3 resolution to Leading Tone)
          { semis: [-12, 4, 7, 12], delay: 3300 },  // I (Complete Tonic resolution)
        ];

        steps.forEach((step, idx) => {
          const t = window.setTimeout(() => {
            audioEngine.stopAll();
            const nextMap = new Map<string, ActiveSoundingNote>();
            for (const s of step.semis) {
              const total = rootPitchClass + s;
              const pc = ((total % 12) + 12) % 12;
              const oct = baseOctave + Math.floor(total / 12);
              const noteData = computed.notesByPitchClass[pc];
              const freq = noteData.freqOctave4 * Math.pow(2, oct - 4);
              const noteKey = `${pc}-${oct}`;
              const label = `${noteData.name}${oct}`;
              audioEngine.noteOn(noteKey, freq, true);
              nextMap.set(noteKey, { noteKey, pitchClass: pc, freqHz: freq, label });
            }
            setActiveNotesMap(nextMap);

            if (idx === steps.length - 1 && !latchMode) {
              const endT = window.setTimeout(() => handleStopAll(), 2400);
              cadenceTimersRef.current.push(endT);
            }
          }, step.delay);
          cadenceTimersRef.current.push(t);
        });
      }
    },
    [computed, latchMode, activeNotesMap.size, activePlaybackTag, handleStopAll]
  );

  const handleSelectFifth = useCallback(
    (circleIdx: number, playDyad: boolean) => {
      const tag = `fifth-${circleIdx}`;
      setSelectedFifthIndex(circleIdx);
      setSelectedThirdIndex(null);

      if (!playDyad) return;

      // Toggle off if already playing this exact fifth!
      if (activeNotesMap.size > 0 && activePlaybackTag === tag) {
        handleStopAll();
        return;
      }

      clearCadenceTimers();
      audioEngine.stopAll();
      setActivePlaybackTag(tag);

      const n1 = computed.notesByCircle[circleIdx];
      const n2 = computed.notesByCircle[(circleIdx + 1) % 12];
      const f1 = n1.freqOctave4;
      const f2 = n2.freqOctave4 < f1 ? n2.freqOctave4 * 2 : n2.freqOctave4;
      const oct2 = n2.freqOctave4 < f1 ? 5 : 4;

      const k1 = `${n1.pitchClass}-4`;
      const k2 = `${n2.pitchClass}-${oct2}`;

      audioEngine.noteOn(k1, f1, true);
      audioEngine.noteOn(k2, f2, true);

      const nextMap = new Map<string, ActiveSoundingNote>();
      nextMap.set(k1, { noteKey: k1, pitchClass: n1.pitchClass, freqHz: f1, label: `${n1.name}4` });
      nextMap.set(k2, { noteKey: k2, pitchClass: n2.pitchClass, freqHz: f2, label: `${n2.name}${oct2}` });
      setActiveNotesMap(nextMap);

      if (!latchMode) {
        const t = window.setTimeout(() => handleStopAll(), 1800);
        cadenceTimersRef.current.push(t);
      }
    },
    [computed, latchMode, activeNotesMap.size, activePlaybackTag, handleStopAll]
  );

  const handleSelectThird = useCallback(
    (circleIdx: number) => {
      const tag = `third-${showMinorThirds ? 'min' : 'maj'}-${circleIdx}`;
      // Toggle off if already playing this exact third spoke!
      if (activeNotesMap.size > 0 && activePlaybackTag === tag) {
        handleStopAll();
        return;
      }

      setSelectedThirdIndex(circleIdx);
      clearCadenceTimers();
      audioEngine.stopAll();
      setActivePlaybackTag(tag);

      const thirdList = showMinorThirds ? computed.minorThirds : computed.majorThirds;
      const interval = thirdList[circleIdx];
      const n1 = computed.notesByCircle[interval.fromCircleIndex];
      const n2 = computed.notesByCircle[interval.toCircleIndex];

      const f1 = n1.freqOctave4;
      const f2 = n2.freqOctave4 < f1 ? n2.freqOctave4 * 2 : n2.freqOctave4;
      const oct2 = n2.freqOctave4 < f1 ? 5 : 4;

      const k1 = `${n1.pitchClass}-4`;
      const k2 = `${n2.pitchClass}-${oct2}`;

      audioEngine.noteOn(k1, f1, true);
      audioEngine.noteOn(k2, f2, true);

      const nextMap = new Map<string, ActiveSoundingNote>();
      nextMap.set(k1, { noteKey: k1, pitchClass: n1.pitchClass, freqHz: f1, label: `${n1.name}4` });
      nextMap.set(k2, { noteKey: k2, pitchClass: n2.pitchClass, freqHz: f2, label: `${n2.name}${oct2}` });
      setActiveNotesMap(nextMap);

      if (!latchMode) {
        const t = window.setTimeout(() => handleStopAll(), 1800);
        cadenceTimersRef.current.push(t);
      }
    },
    [computed, showMinorThirds, latchMode, activeNotesMap.size, activePlaybackTag, handleStopAll]
  );

  const handleWheelNodeClick = useCallback(
    (circleIdx: number) => {
      const node = computed.notesByCircle[circleIdx];
      setSelectedRootPitchClass(node.pitchClass);
      handlePlayChordPreset('major', node.pitchClass);
    },
    [computed, handlePlayChordPreset]
  );

  useEffect(() => {
    const downKeys = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }
      if (e.key === 'Escape') {
        handleStopAll();
        return;
      }
      const k = e.key.toLowerCase();
      const binding = KEYBOARD_SHORTCUTS[k];
      if (!binding || downKeys.has(k)) return;
      downKeys.add(k);

      const noteData = computed.notesByPitchClass[binding.pitchClass];
      const freq = noteData.freqOctave4 * Math.pow(2, binding.octave - 4);
      const noteKey = `${binding.pitchClass}-${binding.octave}`;
      handleNoteTrigger(
        noteKey,
        freq,
        binding.pitchClass,
        `${noteData.name}${binding.octave}`
      );
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const binding = KEYBOARD_SHORTCUTS[k];
      if (!binding) return;
      downKeys.delete(k);
      if (!latchMode) {
        const noteKey = `${binding.pitchClass}-${binding.octave}`;
        handleNoteRelease(noteKey);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [computed, latchMode, handleNoteTrigger, handleNoteRelease, handleStopAll]);

  useEffect(() => {
    if (!('requestMIDIAccess' in navigator)) return;
    let isMounted = true;

    (navigator as unknown as { requestMIDIAccess: () => Promise<MIDIAccess> })
      .requestMIDIAccess()
      .then((access) => {
        if (!isMounted) return;
        const bindInputs = () => {
          const inputs = Array.from(access.inputs.values());
          if (inputs.length > 0) {
            setMidiStatus(`MIDI Connected (${inputs[0].name || 'Keyboard'})`);
          } else {
            setMidiStatus(null);
          }
          for (const input of inputs) {
            input.onmidimessage = (msg: MIDIMessageEvent) => {
              if (!msg.data || msg.data.length < 3) return;
              const [status, midiNote, velocity] = msg.data;
              const command = status & 0xf0;
              const pc = midiNote % 12;
              const octave = Math.floor(midiNote / 12) - 1;
              const noteKey = `${pc}-${octave}`;
              const noteData = computed.notesByPitchClass[pc];
              const freq = noteData.freqOctave4 * Math.pow(2, octave - 4);

              if (command === 0x90 && velocity > 0) {
                audioEngine.noteOn(noteKey, freq, false);
                setActiveNotesMap((prev) => {
                  const next = new Map(prev);
                  next.set(noteKey, {
                    noteKey,
                    pitchClass: pc,
                    freqHz: freq,
                    label: `${noteData.name}${octave}`,
                  });
                  return next;
                });
              } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
                audioEngine.noteOff(noteKey);
                setActiveNotesMap((prev) => {
                  const next = new Map(prev);
                  next.delete(noteKey);
                  return next;
                });
              }
            };
          }
        };
        bindInputs();
        access.onstatechange = bindInputs;
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [computed]);

  const activePitchClasses = useMemo(() => {
    const s = new Set<number>();
    for (const item of activeNotesMap.values()) {
      s.add(item.pitchClass);
    }
    return s;
  }, [activeNotesMap]);

  const activeNoteKeysSet = useMemo(
    () => new Set(activeNotesMap.keys()),
    [activeNotesMap]
  );

  const activeNotesSorted = useMemo(
    () => Array.from(activeNotesMap.values()).sort((a, b) => a.freqHz - b.freqHz),
    [activeNotesMap]
  );

  const liveDyadMetrics = useMemo(() => {
    if (activeNotesSorted.length < 2) return null;
    const low = activeNotesSorted[0];
    const high = activeNotesSorted[1];
    const cents = 1200 * Math.log2(high.freqHz / low.freqHz);

    const modCents = cents % 1200;
    if (Math.abs(modCents - PURE_FIFTH_CENTS) < 55) {
      const dev = modCents - PURE_FIFTH_CENTS;
      const beats = Math.abs(3 * low.freqHz - 2 * high.freqHz);
      return {
        intervalName: 'Fifth (3:2)',
        pair: `${low.label} – ${high.label}`,
        cents,
        devLabel: `${dev >= 0 ? '+' : ''}${dev.toFixed(2)}¢ from pure 3:2`,
        beatsHz: beats,
        partialsLabel: '3rd partial vs 2nd partial',
      };
    }
    if (Math.abs(modCents - PURE_MAJOR_THIRD_CENTS) < 55) {
      const dev = modCents - PURE_MAJOR_THIRD_CENTS;
      const beats = Math.abs(5 * low.freqHz - 4 * high.freqHz);
      return {
        intervalName: 'Major Third (5:4)',
        pair: `${low.label} – ${high.label}`,
        cents,
        devLabel: `${dev >= 0 ? '+' : ''}${dev.toFixed(2)}¢ from pure 5:4`,
        beatsHz: beats,
        partialsLabel: '5th partial vs 4th partial',
      };
    }
    if (Math.abs(modCents - PURE_MINOR_THIRD_CENTS) < 55) {
      const dev = modCents - PURE_MINOR_THIRD_CENTS;
      const beats = Math.abs(6 * low.freqHz - 5 * high.freqHz);
      return {
        intervalName: 'Minor Third (6:5)',
        pair: `${low.label} – ${high.label}`,
        cents,
        devLabel: `${dev >= 0 ? '+' : ''}${dev.toFixed(2)}¢ from pure 6:5`,
        beatsHz: beats,
        partialsLabel: '6th partial vs 5th partial',
      };
    }
    return {
      intervalName: 'Interval',
      pair: `${low.label} – ${high.label}`,
      cents,
      devLabel: `${cents.toFixed(1)} cents`,
      beatsHz: null,
      partialsLabel: `${low.freqHz.toFixed(1)} Hz & ${high.freqHz.toFixed(1)} Hz`,
    };
  }, [activeNotesSorted]);

  return (
    <div className="min-h-screen bg-[#0f0d0a] text-[#f5efe6] flex flex-col">
      {/* Top Navigation & Registration Header */}
      <header className="sticky top-0 z-30 bg-[#14110c]/95 backdrop-blur-md border-b border-[#2e251a] px-4 py-2.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5">
          {/* Brand Title + Global Quick Stop Button */}
          <div className="flex items-center gap-2.5 min-w-0 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-[#0f0d0a] shadow-md shrink-0">
              <Compass className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#f5efe6] whitespace-nowrap">
                  Clavier & Organ Temperament Lab
                </h1>
                {activeNotesMap.size > 0 && (
                  <button
                    onClick={handleStopAll}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold shadow-sm transition-colors whitespace-nowrap"
                    title="Silence all sounding notes (or press Esc)"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    Stop ({activeNotesMap.size})
                  </button>
                )}
                {midiStatus && activeNotesMap.size === 0 && (
                  <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium whitespace-nowrap">
                    <Radio className="w-3 h-3 animate-pulse" />
                    {midiStatus}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#a89882] hidden xl:block truncate">
                21 Historical Temperaments • Live A/B Repertoire Player • Split-Key Synthesis
              </p>
            </div>
          </div>

          {/* Global Custom-Styled Selectors */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <StyledSelect
                value={selectedPresetId}
                groups={presetOptionGroups}
                onChange={(val) => {
                  const found = allPresets.find((p) => p.id === val);
                  if (found) handleSelectPreset(found);
                }}
                buttonClassName="w-[185px] sm:w-[215px]"
                menuWidthClass="w-80 sm:w-96"
              />

              {isCustomModified && currentPreset && (
                <button
                  onClick={() => handleSelectPreset(currentPreset)}
                  className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs flex items-center gap-1 shrink-0"
                  title="Reset fifths to original preset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0f0d0a] text-xs font-bold shadow-sm transition-colors whitespace-nowrap shrink-0"
                title="Design a temperament by formula, save your own preset, or export TypeScript code"
              >
                <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Custom / Save</span>
              </button>
            </div>

            <StyledSelect
              value={voiceId}
              groups={voiceOptionGroups}
              onChange={(val) => handleVoiceChange(val as InstrumentVoiceId)}
              icon={<Volume2 className="w-3.5 h-3.5" />}
              buttonClassName="w-[175px] sm:w-[205px]"
              menuWidthClass="w-80 sm:w-96"
              align="right"
            />

            <StyledSelect
              value={String(a4ReferenceHz)}
              options={pitchOptions}
              onChange={(val) => setA4ReferenceHz(Number(val))}
              prefixLabel="A4="
              buttonClassName="w-[108px]"
              menuWidthClass="w-64"
              align="right"
            />
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 py-4 sm:py-6 flex flex-col gap-5">
        {/* Historical Repertoire Player + Instant A/B Temperament Comparator */}
        <RepertoireAndABPlayer
          allPresets={allPresets}
          activePresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
          onChangeVoice={handleVoiceChange}
          computed={computed}
          splitKeyMode={splitKeyMode}
          onPlayStepNotes={handlePlayRepertoireStep}
          onStopAll={handleStopAll}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Interactive Circle of Fifths Wheel */}
          <div className="lg:col-span-5 bg-[#17130e] border border-[#332a1d] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-200/90">
                  Circle of Fifths & Thirds
                </h2>
                <p className="text-[11px] text-[#9b8b75]">
                  Tap arcs/chords/nodes to play, tap again to stop
                </p>
              </div>

              <div className="flex items-center bg-[#0f0d0a] p-1 rounded-lg border border-[#2c2419] text-[11px]">
                <button
                  onClick={() => {
                    setShowMinorThirds(false);
                    setSelectedThirdIndex(null);
                  }}
                  className={`px-2 py-1 rounded font-semibold transition-colors ${
                    !showMinorThirds
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-[#a89882] hover:text-[#f5efe6]'
                  }`}
                >
                  Maj 3rds (5:4)
                </button>
                <button
                  onClick={() => {
                    setShowMinorThirds(true);
                    setSelectedThirdIndex(null);
                  }}
                  className={`px-2 py-1 rounded font-semibold transition-colors ${
                    showMinorThirds
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-[#a89882] hover:text-[#f5efe6]'
                  }`}
                >
                  Min 3rds (6:5)
                </button>
              </div>
            </div>

            <CircleOfFifthsWheel
              computed={computed}
              commaUnit={commaUnit}
              selectedFifthIndex={selectedFifthIndex}
              onSelectFifth={handleSelectFifth}
              selectedThirdIndex={selectedThirdIndex}
              onSelectThird={handleSelectThird}
              activePitchClasses={activePitchClasses}
              onNodeClick={handleWheelNodeClick}
              onToggleSpelling={handleToggleSpelling}
              showMinorThirds={showMinorThirds}
            />

            <div className="w-full flex flex-wrap items-center justify-center gap-3 mt-2 pt-2.5 border-t border-[#262017] text-[11px] text-[#b8a68e]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
                Pure 5th (0¢)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
                Tempered 5th
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                Pure 3rd (0¢)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                Wide/Pythag. 3rd
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                Wolf Interval
              </span>
            </div>
          </div>

          {/* Right Column: Historical Context Card + Comma-Splitting Designer + Live Acoustic Monitor */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {currentPreset && (
              <div className="bg-gradient-to-r from-[#1c1610] to-[#17130e] border border-[#382d1e] rounded-2xl p-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <h2 className="font-serif text-base sm:text-lg font-bold text-[#f5efe6]">
                      {currentPreset.name}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                      {currentPreset.author}, {currentPreset.year}
                    </span>
                    {isCustomModified && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Modified (Click "Custom / Save" to keep!)
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-[#a89882] font-semibold">
                    {currentPreset.category}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#e5dac9] leading-relaxed">
                  {currentPreset.description}
                </p>
                <p className="text-xs text-[#a89882] mt-1.5 leading-relaxed">
                  {currentPreset.historicalContext}
                </p>
              </div>
            )}

            <FifthDesignerPanel
              computed={computed}
              selectedFifthIndex={selectedFifthIndex}
              onSelectFifth={handleSelectFifth}
              commaUnit={commaUnit}
              onChangeCommaUnit={setCommaUnit}
              onUpdateFifthCents={handleUpdateFifthCents}
              onApplyToAllEleven={handleApplyToAllEleven}
              onSetWolfIndex={handleSetWolfIndex}
              onAuditionFifth={(idx) => handleSelectFifth(idx, true)}
              isSelectedFifthPlaying={
                activeNotesMap.size > 0 && activePlaybackTag === `fifth-${selectedFifthIndex}`
              }
            />

            <div className="bg-[#17130e] border border-[#332a1d] rounded-2xl p-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Activity
                  className={`w-4 h-4 ${
                    activeNotesSorted.length > 0
                      ? 'text-emerald-400 animate-pulse'
                      : 'text-[#7d6f5d]'
                  }`}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c2b29b]">
                  Live Acoustic Monitor:
                </span>
                {activeNotesSorted.length === 0 ? (
                  <span className="text-xs text-[#8c7d69]">
                    Play any chord on the manual or tap an interval on the wheel to inspect harmonics & beats
                  </span>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {activeNotesSorted.map((n) => (
                      <span
                        key={n.noteKey}
                        className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40 text-xs font-mono font-bold"
                      >
                        {n.label} ({n.freqHz.toFixed(1)} Hz)
                      </span>
                    ))}
                    <button
                      onClick={handleStopAll}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/25 hover:bg-red-500/40 text-red-200 border border-red-500/40 text-xs font-semibold transition-colors ml-1"
                    >
                      <Square className="w-2.5 h-2.5 fill-current" />
                      Stop
                    </button>
                  </div>
                )}
              </div>

              {liveDyadMetrics && (
                <div className="flex items-center gap-3 bg-[#100d09] px-3 py-1.5 rounded-xl border border-[#2c2419] text-xs font-mono">
                  <span className="text-amber-300 font-bold">{liveDyadMetrics.intervalName}:</span>
                  <span className="text-[#f5efe6]">{liveDyadMetrics.devLabel}</span>
                  {liveDyadMetrics.beatsHz !== null && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                      Beats: {liveDyadMetrics.beatsHz.toFixed(2)} Hz
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Playable Historical Harpsichord & Organ Manual */}
        <HistoricalKeyboard
          computed={computed}
          activeNoteKeys={activeNoteKeysSet}
          activePlaybackTag={activePlaybackTag}
          latchMode={latchMode}
          onToggleLatchMode={() => setLatchMode((v) => !v)}
          splitKeyMode={splitKeyMode}
          onChangeSplitKeyMode={setSplitKeyMode}
          onNoteTrigger={handleNoteTrigger}
          onNoteRelease={handleNoteRelease}
          onStopAll={handleStopAll}
          onPlayChordPreset={handlePlayChordPreset}
          selectedRootPitchClass={selectedRootPitchClass}
          onSelectRootPitchClass={setSelectedRootPitchClass}
        />

        {/* Key Color Landscape, Strobe Tuner Cent Offsets & Aural Beat Rate Tables */}
        <KeyColorAndTuningTable
          computed={computed}
          a4ReferenceHz={a4ReferenceHz}
          activeNoteKeys={activeNoteKeysSet}
          activePlaybackTag={activePlaybackTag}
          onPlayChordPreset={handlePlayChordPreset}
          onAuditionSingleNote={(pc, freq, label) =>
            handleNoteTrigger(`${pc}-4`, freq, pc, label)
          }
        />
      </main>

      {/* Custom Temperament Formula Editor, Saver & Code Exporter Modal */}
      <CustomTemperamentModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        computed={computed}
        commaUnit={commaUnit}
        spellings={spellings}
        savedCustomPresets={savedCustomPresets}
        onSaveCustomPreset={handleSaveCustomPreset}
        onDeleteCustomPreset={handleDeleteCustomPreset}
        onApplyFifthArray={handleApplyFifthArray}
      />
    </div>
  );
}

export default App;
