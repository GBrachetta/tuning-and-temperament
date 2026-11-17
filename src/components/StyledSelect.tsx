import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [menuPos, setMenuPos] = useState<{
    top: number;
    left?: number;
    right?: number;
    maxHeight: number;
  }>({ top: 0, left: 0, maxHeight: 400 });

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Flatten all options to find the currently selected one
  const allFlatOptions: StyledOption[] = React.useMemo(() => {
    if (options) return options;
    if (groups) return groups.flatMap((g) => g.options);
    return [];
  }, [options, groups]);

  const selectedOption =
    allFlatOptions.find((o) => o.value === value) ?? allFlatOptions[0];

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 16;
    const maxHeight = Math.max(180, Math.min(480, spaceBelow));
    const top = rect.bottom + 6;

    if (align === 'right') {
      setMenuPos({
        top,
        right: Math.max(8, window.innerWidth - rect.right),
        maxHeight,
      });
    } else {
      setMenuPos({
        top,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 320)),
        maxHeight,
      });
    }
  }, [align]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = (e: Event) => {
      // Ignore scrolling inside the dropdown menu itself
      if (menuRef.current && e.target instanceof Node && menuRef.current.contains(e.target)) {
        return;
      }
      updatePosition();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const renderOption = (opt: StyledOption) => {
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
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
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

      {/* Portaled Solid Opaque Dropdown Menu (never clipped by overflow-x-auto containers) */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${menuPos.top}px`,
              left: menuPos.left !== undefined ? `${menuPos.left}px` : undefined,
              right: menuPos.right !== undefined ? `${menuPos.right}px` : undefined,
              maxHeight: `${menuPos.maxHeight}px`,
              backgroundColor: '#16120d',
              zIndex: 9999,
            }}
            className={`${menuWidthClass} max-w-[calc(100vw-16px)] overflow-y-auto rounded-2xl bg-[#16120d] border-2 border-[#52412c] shadow-[0_20px_50px_rgba(0,0,0,0.95)] py-1.5 divide-y divide-[#2c2318]`}
          >
            {groups
              ? groups.map((group, gIdx) => (
                  <div
                    key={gIdx}
                    className="py-1"
                    style={{ backgroundColor: '#16120d' }}
                  >
                    <div
                      style={{ backgroundColor: '#0f0c08' }}
                      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border-y border-[#261f16]"
                    >
                      {group.groupLabel}
                    </div>
                    <div className="mt-0.5 flex flex-col">
                      {group.options.map(renderOption)}
                    </div>
                  </div>
                ))
              : options?.map(renderOption)}
          </div>,
          document.body
        )}
    </div>
  );
};
