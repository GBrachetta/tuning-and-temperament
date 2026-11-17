import React from 'react';
import {
  ComputedTemperament,
  CommaUnit,
  formatCommaLabel,
  getFifthPurityColor,
  getThirdPurityColor,
} from '../lib/temperament';

interface CircleOfFifthsWheelProps {
  computed: ComputedTemperament;
  commaUnit: CommaUnit;
  selectedFifthIndex: number;
  onSelectFifth: (circleIndex: number, playDyad: boolean) => void;
  selectedThirdIndex: number | null;
  onSelectThird: (circleIndex: number) => void;
  activePitchClasses: Set<number>;
  onNodeClick: (circleIndex: number) => void;
  onToggleSpelling: (circleIndex: number) => void;
  showMinorThirds: boolean;
}

export const CircleOfFifthsWheel: React.FC<CircleOfFifthsWheelProps> = ({
  computed,
  commaUnit,
  selectedFifthIndex,
  onSelectFifth,
  selectedThirdIndex,
  onSelectThird,
  activePitchClasses,
  onNodeClick,
  onToggleSpelling,
  showMinorThirds,
}) => {
  const size = 500;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 192;
  const badgeR = 224;
  const thirdInnerR = 152;

  // Angle in radians for Circle of Fifths index 0..11 (0 = 12 o'clock = -PI/2)
  const getAngle = (idx: number) => (idx * (2 * Math.PI)) / 12 - Math.PI / 2;

  const getCoords = (idx: number, radius: number) => {
    const a = getAngle(idx);
    return {
      x: cx + radius * Math.cos(a),
      y: cy + radius * Math.sin(a),
    };
  };

  const selectedFifth = computed.fifths[selectedFifthIndex];
  const selectedThird =
    selectedThirdIndex !== null
      ? showMinorThirds
        ? computed.minorThirds[selectedThirdIndex]
        : computed.majorThirds[selectedThirdIndex]
      : null;

  return (
    <div className="relative w-full max-w-[520px] mx-auto select-none">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.65)]"
      >
        <defs>
          <radialGradient id="wheelBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e1912" />
            <stop offset="72%" stopColor="#14110d" />
            <stop offset="100%" stopColor="#0c0a08" />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer decorative brass bezel */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR + 48}
          fill="url(#wheelBg)"
          stroke="#3d3222"
          strokeWidth="2"
        />
        <circle
          cx={cx}
          cy={cy}
          r={outerR}
          fill="none"
          stroke="#2c2419"
          strokeWidth="14"
        />
        <circle
          cx={cx}
          cy={cy}
          r={thirdInnerR}
          fill="none"
          stroke="#262017"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Inner Third Chords (Major Thirds i -> i+4, or Minor Thirds i -> i+9) */}
        {(showMinorThirds ? computed.minorThirds : computed.majorThirds).map((third, i) => {
          const p1 = getCoords(third.fromCircleIndex, thirdInnerR);
          const p2 = getCoords(third.toCircleIndex, thirdInnerR);
          const color = getThirdPurityColor(third.deviationFromPureCents);
          const isSelected = selectedThirdIndex === i;
          const isWolfThird = Math.abs(third.deviationFromPureCents) > 25;
          const isPureThird = Math.abs(third.deviationFromPureCents) <= 1.2;

          // Midpoint for label
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;

          return (
            <g
              key={`third-${i}`}
              className="cursor-pointer group"
              onClick={() => onSelectThird(i)}
            >
              {/* Invisible wider hit area for touch/mouse */}
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="transparent"
                strokeWidth="16"
              />
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={color}
                strokeWidth={isSelected ? 4 : isPureThird ? 2.8 : 1.9}
                strokeOpacity={isSelected ? 1 : isPureThird ? 0.88 : 0.55}
                strokeDasharray={isWolfThird ? '5 4' : undefined}
                filter={isSelected || isPureThird ? 'url(#glow)' : undefined}
                className="transition-all duration-200 group-hover:stroke-opacity-100 group-hover:stroke-[3.5px]"
              />
              {/* Small pill on third chord showing cent deviation */}
              <g transform={`translate(${mx}, ${my})`}>
                <rect
                  x="-20"
                  y="-8"
                  width="40"
                  height="16"
                  rx="8"
                  fill="#120f0b"
                  fillOpacity="0.88"
                  stroke={color}
                  strokeWidth={isSelected ? 1.5 : 0.8}
                  strokeOpacity={isSelected ? 1 : 0.65}
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill={color}
                  fontSize="8.5"
                  fontWeight="600"
                  fontFamily="ui-monospace, monospace"
                >
                  {third.deviationFromPureCents >= 0 ? '+' : ''}
                  {third.deviationFromPureCents.toFixed(1)}¢
                </text>
              </g>
            </g>
          );
        })}

        {/* 12 Fifth Arcs around the perimeter */}
        {computed.fifths.map((fifth, i) => {
          const next = (i + 1) % 12;
          const a1 = getAngle(i) + 0.095;
          const a2 = getAngle(next) - 0.095;
          const x1 = cx + outerR * Math.cos(a1);
          const y1 = cy + outerR * Math.sin(a1);
          const x2 = cx + outerR * Math.cos(a2);
          const y2 = cy + outerR * Math.sin(a2);

          const midAngle = getAngle(i) + Math.PI / 12;
          const bx = cx + badgeR * Math.cos(midAngle);
          const by = cy + badgeR * Math.sin(midAngle);

          const isSelected = selectedFifthIndex === i;
          const isWolf = computed.wolfCircleIndex === i;
          const color = getFifthPurityColor(fifth.deviationFromPureCents);
          const label = formatCommaLabel(fifth.deviationFromPureCents, commaUnit);

          const pathD = `M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2}`;

          return (
            <g
              key={`fifth-${i}`}
              className="cursor-pointer group"
              onClick={() => onSelectFifth(i, true)}
            >
              {/* Wide touch target */}
              <path d={pathD} fill="none" stroke="transparent" strokeWidth="28" />

              {/* Visible Fifth Arc */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={isSelected ? 10 : 6.5}
                strokeLinecap="round"
                strokeOpacity={isSelected ? 1 : 0.82}
                strokeDasharray={isWolf && Math.abs(fifth.deviationFromPureCents) > 8 ? '6 4' : undefined}
                filter={isSelected ? 'url(#glow)' : undefined}
                className="transition-all duration-150 group-hover:stroke-[9px] group-hover:stroke-opacity-100"
              />

              {/* Outer Comma Fraction Badge */}
              <g transform={`translate(${bx}, ${by})`}>
                <rect
                  x="-24"
                  y="-10"
                  width="48"
                  height="20"
                  rx="6"
                  fill={isSelected ? color : '#1b1610'}
                  stroke={color}
                  strokeWidth={isSelected ? 2 : 1.2}
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill={isSelected ? '#0f0d0a' : color}
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="ui-monospace, monospace"
                >
                  {isWolf && Math.abs(fifth.deviationFromPureCents) > 10 ? `🐺 ${label}` : label}
                </text>
              </g>
            </g>
          );
        })}

        {/* Central Hub Readout */}
        <circle
          cx={cx}
          cy={cy}
          r={58}
          fill="#15120d"
          fillOpacity="0.94"
          stroke="#3d3222"
          strokeWidth="1.5"
        />
        {selectedThird ? (
          <g>
            <text
              x={cx}
              y={cy - 24}
              textAnchor="middle"
              fill="#a89882"
              fontSize="9.5"
              fontWeight="600"
              letterSpacing="0.06em"
            >
              {showMinorThirds ? 'MINOR 3RD (6:5)' : 'MAJOR 3RD (5:4)'}
            </text>
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fill="#f5efe6"
              fontSize="16"
              fontWeight="700"
            >
              {selectedThird.fromName} – {selectedThird.toName}
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              fill={getThirdPurityColor(selectedThird.deviationFromPureCents)}
              fontSize="12"
              fontWeight="700"
              fontFamily="ui-monospace, monospace"
            >
              {selectedThird.deviationFromPureCents >= 0 ? '+' : ''}
              {selectedThird.deviationFromPureCents.toFixed(2)}¢
            </text>
            <text
              x={cx}
              y={cy + 30}
              textAnchor="middle"
              fill="#c2b29b"
              fontSize="10"
              fontFamily="ui-monospace, monospace"
            >
              Beats: {selectedThird.beatRateHz.toFixed(1)} Hz
            </text>
          </g>
        ) : (
          <g>
            <text
              x={cx}
              y={cy - 24}
              textAnchor="middle"
              fill="#a89882"
              fontSize="9.5"
              fontWeight="600"
              letterSpacing="0.06em"
            >
              FIFTH (3:2)
            </text>
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fill="#f5efe6"
              fontSize="16"
              fontWeight="700"
            >
              {selectedFifth.fromName} – {selectedFifth.toName}
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              fill={getFifthPurityColor(selectedFifth.deviationFromPureCents)}
              fontSize="12"
              fontWeight="700"
              fontFamily="ui-monospace, monospace"
            >
              {selectedFifth.deviationFromPureCents >= 0 ? '+' : ''}
              {selectedFifth.deviationFromPureCents.toFixed(2)}¢
            </text>
            <text
              x={cx}
              y={cy + 30}
              textAnchor="middle"
              fill="#c2b29b"
              fontSize="10"
              fontFamily="ui-monospace, monospace"
            >
              Beats: {selectedFifth.beatRateHz.toFixed(2)} Hz
            </text>
          </g>
        )}

        {/* 12 Note Nodes around the Circle */}
        {computed.notesByCircle.map((node) => {
          const { x, y } = getCoords(node.circleIndex, outerR);
          const isActive = activePitchClasses.has(node.pitchClass);
          const isPartOfSelectedFifth =
            node.circleIndex === selectedFifthIndex ||
            node.circleIndex === (selectedFifthIndex + 1) % 12;
          const isAccidental = node.circleIndex >= 6 && node.circleIndex <= 10;

          return (
            <g key={`node-${node.circleIndex}`} transform={`translate(${x}, ${y})`}>
              {/* Outer highlight ring when note is sounding */}
              {isActive && (
                <circle
                  r="25"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  filter="url(#glow)"
                />
              )}

              {/* Main Note Circle */}
              <circle
                r="20"
                fill={isActive ? '#f59e0b' : isPartOfSelectedFifth ? '#292116' : '#18140e'}
                stroke={
                  isActive
                    ? '#fde68a'
                    : isPartOfSelectedFifth
                    ? '#f59e0b'
                    : '#4a3d2a'
                }
                strokeWidth={isActive || isPartOfSelectedFifth ? '2.5' : '1.8'}
                className="cursor-pointer transition-colors duration-150 hover:stroke-amber-400"
                onClick={() => onNodeClick(node.circleIndex)}
              />

              {/* Note Name */}
              <text
                x="0"
                y="-2"
                textAnchor="middle"
                fill={isActive ? '#0f0d0a' : '#f5efe6'}
                fontSize="13"
                fontWeight="700"
                className="pointer-events-none"
              >
                {node.name}
              </text>

              {/* Deviation from 12-TET (relative to C) */}
              <text
                x="0"
                y="10"
                textAnchor="middle"
                fill={isActive ? '#1c1917' : '#b8a68e'}
                fontSize="8.5"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
                className="pointer-events-none"
              >
                {node.centsDeviationFrom12TET_C >= 0 ? '+' : ''}
                {node.centsDeviationFrom12TET_C.toFixed(1)}¢
              </text>

              {/* Small Enharmonic Toggle badge for black keys (6..10) */}
              {isAccidental && (
                <g
                  transform="translate(15, -15)"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSpelling(node.circleIndex);
                  }}
                >
                  <circle
                    r="8.5"
                    fill="#2b2318"
                    stroke="#6b573b"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#d6c5ad"
                    fontSize="7.5"
                    fontWeight="700"
                  >
                    {node.accidentalChoice === 'sharp' ? node.flatName : node.sharpName}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
