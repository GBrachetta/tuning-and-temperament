import React, { useState } from 'react';
import {
  CommaUnit,
  ComputedTemperament,
  FIFTH_PAIR_LABELS,
  TemperamentPreset,
  formatCommaLabel,
  parseFifthTokenToCents,
} from '../lib/temperament';
import { X, Save, Code2, Check, Sparkles, Trash2 } from 'lucide-react';

interface CustomTemperamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  computed: ComputedTemperament;
  commaUnit: CommaUnit;
  spellings: Record<number, 'sharp' | 'flat'>;
  savedCustomPresets: TemperamentPreset[];
  onSaveCustomPreset: (preset: TemperamentPreset) => void;
  onDeleteCustomPreset: (id: string) => void;
  onApplyFifthArray: (fifthsCents: number[], wolfIdx: number) => void;
}

export const CustomTemperamentModal: React.FC<CustomTemperamentModalProps> = ({
  isOpen,
  onClose,
  computed,
  commaUnit,
  spellings,
  savedCustomPresets,
  onSaveCustomPreset,
  onDeleteCustomPreset,
  onApplyFifthArray,
}) => {
  const [name, setName] = useState('My Custom Temperament');
  const [author, setAuthor] = useState('Custom');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [description, setDescription] = useState(
    'Custom keyboard temperament designed in the Clavier & Organ Temperament Lab.'
  );
  const [historicalContext, setHistoricalContext] = useState(
    'Designed for harpsichord and organ.'
  );

  // Quick text recipe parser state
  const [recipeInputs, setRecipeInputs] = useState<string[]>(() =>
    computed.fifthDeviationsCents.map((c) => formatCommaLabel(c, commaUnit).replace('Pure (0)', '0'))
  );
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `custom-${Date.now()}`;
    const newPreset: TemperamentPreset = {
      id,
      name: name.trim() || 'Untitled Temperament',
      author: author.trim() || 'Custom',
      year: year.trim() || '2026',
      category: 'Custom',
      commaUnit,
      wolfCircleIndex: computed.wolfCircleIndex,
      fifthDeviationsCents: [...computed.fifthDeviationsCents],
      spellings: { ...spellings },
      description: description.trim(),
      historicalContext: historicalContext.trim(),
      isUserCustom: true,
    };
    onSaveCustomPreset(newPreset);
    onClose();
  };

  const handleRecipeApply = () => {
    const parsed = recipeInputs.map((token, idx) => {
      if (idx === computed.wolfCircleIndex) return 0;
      const val = parseFifthTokenToCents(token, commaUnit);
      return val ?? computed.fifthDeviationsCents[idx];
    });
    onApplyFifthArray(parsed, computed.wolfCircleIndex);
  };

  // Generate clean TypeScript snippet for src/lib/temperament.ts
  const nonZeroEntries = computed.fifthDeviationsCents
    .map((val, idx) => {
      if (idx === computed.wolfCircleIndex || Math.abs(val) < 0.05) return null;
      const comment = FIFTH_PAIR_LABELS[idx];
      const lbl = formatCommaLabel(val, commaUnit);
      if (lbl.endsWith('s') && lbl.includes('/')) {
        const frac = lbl.slice(0, -1); // e.g. -1/4
        return `  ${idx}: ${frac.replace('/', '*sc/')}, // ${comment} (${lbl})`;
      }
      if (lbl.endsWith('p') && lbl.includes('/')) {
        const frac = lbl.slice(0, -1);
        return `  ${idx}: ${frac.replace('/', '*pc/')}, // ${comment} (${lbl})`;
      }
      return `  ${idx}: ${val.toFixed(3)}, // ${comment} (cents)`;
    })
    .filter(Boolean)
    .join('\n      ');

  const tsSnippet = `{
  id: '${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}',
  name: '${name.replace(/'/g, "\\'")}',
  year: '${year}',
  author: '${author.replace(/'/g, "\\'")}',
  category: 'German & Bach-Era',
  commaUnit: '${commaUnit}',
  wolfCircleIndex: ${computed.wolfCircleIndex}, // ${FIFTH_PAIR_LABELS[computed.wolfCircleIndex]}
  fifthDeviationsCents: makeFifthsWithClosure(
    {
      ${nonZeroEntries || '// All 11 fifths pure (0)'}
    },
    ${computed.wolfCircleIndex}
  ),
  spellings: ${JSON.stringify(spellings)},
  description: '${description.replace(/'/g, "\\'")}',
  historicalContext: '${historicalContext.replace(/'/g, "\\'")}'
},`;

  const copySnippet = () => {
    navigator.clipboard.writeText(tsSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#17130e] border border-[#3d3122] rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2c2419] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#f5efe6]">
              Create, Save & Export Your Own Temperament
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#241e16] hover:bg-[#332a1e] text-[#c2b29b]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Quick 12-Fifth Formula Editor */}
        <div className="bg-[#120f0b] border border-[#2c2419] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                1. Quick 12-Fifth Formula Editor
              </h3>
              <p className="text-[11px] text-[#a89882]">
                Type fractions of a Syntonic comma (<code>-1/4s</code>, <code>-1/5s</code>),
                Pythagorean comma (<code>-1/6p</code>, <code>-1/12p</code>), pure (<code>0</code>),
                or cents (<code>-4.5c</code>):
              </p>
            </div>
            <button
              onClick={handleRecipeApply}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold transition-colors"
            >
              Apply Formula to Wheel
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {FIFTH_PAIR_LABELS.map((pairLabel, idx) => {
              const isWolf = idx === computed.wolfCircleIndex;
              return (
                <div key={idx} className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#c2b29b] flex items-center justify-between">
                    <span>
                      #{idx} {pairLabel}
                    </span>
                    {isWolf && <span className="text-[9px] text-red-400">Closure</span>}
                  </label>
                  <input
                    type="text"
                    disabled={isWolf}
                    value={
                      isWolf
                        ? `${computed.fifthDeviationsCents[idx].toFixed(1)}¢`
                        : recipeInputs[idx]
                    }
                    onChange={(e) => {
                      const next = [...recipeInputs];
                      next[idx] = e.target.value;
                      setRecipeInputs(next);
                    }}
                    className={`px-2 py-1 rounded border text-xs font-mono ${
                      isWolf
                        ? 'bg-[#1c1512] border-red-500/30 text-red-300 opacity-75 cursor-not-allowed'
                        : 'bg-[#1b1610] border-[#382e20] text-[#f5efe6] focus:border-amber-400 focus:outline-none'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Save to Browser Library */}
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            2. Save to Your App Preset Library
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[11px] text-[#a89882] mb-1">Temperament Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#120f0b] border border-[#332a1d] rounded-lg px-3 py-1.5 text-xs text-[#f5efe6] focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#a89882] mb-1">Author / Tuner</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-[#120f0b] border border-[#332a1d] rounded-lg px-3 py-1.5 text-xs text-[#f5efe6] focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#a89882] mb-1">Year / Era</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-[#120f0b] border border-[#332a1d] rounded-lg px-3 py-1.5 text-xs text-[#f5efe6] focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#a89882] mb-1">
                Technical Summary (Fifths & Thirds)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#120f0b] border border-[#332a1d] rounded-lg px-3 py-1.5 text-xs text-[#f5efe6] focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#a89882] mb-1">
                Historical / Musical Notes
              </label>
              <textarea
                rows={2}
                value={historicalContext}
                onChange={(e) => setHistoricalContext(e.target.value)}
                className="w-full bg-[#120f0b] border border-[#332a1d] rounded-lg px-3 py-1.5 text-xs text-[#f5efe6] focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0f0d0a] font-bold text-xs shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              Save to Preset Dropdown
            </button>
          </div>
        </form>

        {/* Saved User Presets List (if any) */}
        {savedCustomPresets.length > 0 && (
          <div className="border-t border-[#2c2419] pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#a89882] mb-2">
              Your Saved Custom Temperaments ({savedCustomPresets.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {savedCustomPresets.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 bg-[#120f0b] border border-[#332a1d] rounded-lg px-3 py-1.5 text-xs"
                >
                  <span className="font-semibold text-amber-200">{p.name}</span>
                  <button
                    onClick={() => onDeleteCustomPreset(p.id)}
                    className="text-red-400 hover:text-red-300"
                    title="Delete custom preset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Ready-to-Paste Code Snippet for src/lib/temperament.ts */}
        <div className="border-t border-[#2c2419] pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                3. Code Snippet for <code>src/lib/temperament.ts</code>
              </h3>
            </div>
            <button
              onClick={copySnippet}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#241e16] hover:bg-[#332a1e] text-amber-200 border border-[#3d3122] text-xs font-semibold transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                'Copy TypeScript Object'
              )}
            </button>
          </div>
          <pre className="bg-[#0b0907] border border-[#262017] rounded-xl p-3 text-[11px] font-mono text-[#d6c5ad] overflow-x-auto leading-relaxed">
            {tsSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
