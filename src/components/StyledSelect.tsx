import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface StyledOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

export interface StyledOptionGroup {
  groupLabel: string;
  options: StyledOption[];
}

interface StyledSelectProps {
  value: string;
  onChange: (newValue: string) => void;
  options?: StyledOption[];
  groups?: StyledOptionGroup[];
  icon?: React.ReactNode;
  prefixLabel?: string;
  showBadgeInTrigger?: boolean;
  className?: string;
  buttonClassName?: string;
  menuWidthClass?: string;
  align?: 'left' | 'right';
}

export const StyledSelect: React.FC<StyledSelectProps> = ({
  value,
  onChange,
  options,
  groups,
  icon,
  prefixLabel,
  showBadgeInTrigger = false,
  className = '',
  buttonClassName = '',
  menuWidthClass = 'w-72 sm:w-80',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Flatten all options to find the currently selected one
  const allFlatOptions: StyledOption[] = React.useMemo(() => {
    if (options) return options;
    if (groups) return groups.flatMap((g) => g.options);
    return [];
  }, [options, groups]);

  const selectedOption =
    allFlatOptions.find((o) => o.value === value) ?? allFlatOptions[0];

  // Close on click outside or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        style={{ backgroundColor: '#1b1610' }}
        className={`flex items-center justify-between gap-2 bg-[#1b1610] hover:bg-[#261f16] text-[#f5efe6] border ${
          isOpen
            ? 'border-amber-400 ring-2 ring-amber-500/30'
            : 'border-[#3d3122] hover:border-amber-500/50'
        } rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer select-none ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {icon && <span className="text-amber-400 shrink-0">{icon}</span>}
          {prefixLabel && (
            <span className="text-[11px] font-mono text-[#a89882] shrink-0">
              {prefixLabel}
            </span>
          )}
          <span className="truncate text-amber-100">
            {selectedOption?.label ?? value}
          </span>
          {showBadgeInTrigger && selectedOption?.badge && (
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2c2318] text-amber-300 border border-amber-500/30 shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-amber-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-amber-300' : ''
          }`}
        />
      </button>

      {/* Solid Opaque Dropdown Menu */}
      {isOpen && (
        <div
          style={{ backgroundColor: '#16120d' }}
          className={`absolute z-[100] mt-1.5 ${menuWidthClass} max-h-[70vh] overflow-y-auto rounded-2xl bg-[#16120d] border-2 border-[#52412c] shadow-[0_20px_50px_rgba(0,0,0,0.95)] py-1.5 divide-y divide-[#2c2318] ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {groups
            ? groups.map((group, gIdx) => (
                <div key={gIdx} className="py-1" style={{ backgroundColor: '#16120d' }}>
                  <div
                    style={{ backgroundColor: '#0f0c08' }}
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border-y border-[#261f16]"
                  >
                    {group.groupLabel}
                  </div>
                  <div className="mt-0.5 flex flex-col">
                    {group.options.map((opt) => {
                      const isSelected = opt.value === value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelect(opt.value)}
                          style={{
                            backgroundColor: isSelected ? '#2b2113' : '#16120d',
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 text-xs transition-colors ${
                            isSelected
                              ? 'text-amber-200 font-bold'
                              : 'text-[#e5dac9] hover:bg-[#241d15] hover:text-white'
                          }`}
                        >
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="truncate">{opt.label}</span>
                            {opt.sublabel && (
                              <span className="text-[10px] text-[#9b8b75] truncate font-normal">
                                {opt.sublabel}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {opt.badge && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                  isSelected
                                    ? 'bg-amber-500 text-[#0f0d0a] font-bold'
                                    : 'bg-[#241d14] text-[#b8a68e]'
                                }`}
                              >
                                {opt.badge}
                              </span>
                            )}
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            : options?.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      backgroundColor: isSelected ? '#2b2113' : '#16120d',
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 text-xs transition-colors ${
                      isSelected
                        ? 'text-amber-200 font-bold'
                        : 'text-[#e5dac9] hover:bg-[#241d15] hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-[#9b8b75] truncate font-normal">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-amber-500 text-[#0f0d0a] font-bold'
                              : 'bg-[#241d14] text-[#b8a68e]'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
        </div>
      )}
    </div>
  );
};
