import React from 'react';
import { PlayerTraits } from '../types';

interface RadarChartProps {
  traits: PlayerTraits;
  color?: string; // Hex color for the trait fill
}

const TRAIT_KEYS = [
  { key: 'athleticism', label: 'Athleticism' },
  { key: 'technique', label: 'Technique' },
  { key: 'production', label: 'Production' },
  { key: 'footballIQ', label: 'Football IQ' },
  { key: 'sizeAndFrame', label: 'Size & Frame' }
] as const;

export default function RadarChart({ traits, color = '#10B981' }: RadarChartProps) {
  const size = 300;
  const center = size / 2;
  const maxRadius = 100;

  // Convert polar coordinates to Cartesian
  const getCoordinates = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2; // Start from top
    const radius = (value / 100) * maxRadius;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [20, 40, 60, 80, 100];

  // Draw grid pentagons
  const gridPolygons = gridLevels.map((level) => {
    const points = Array.from({ length: 5 })
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level);
        return `${x},${y}`;
      })
      .join(' ');
    return points;
  });

  // Data points polygon
  const playerPoints = TRAIT_KEYS.map(({ key }, i) => {
    const val = traits[key] || 50;
    const { x, y } = getCoordinates(i, val);
    return `${x},${y}`;
  }).join(' ');

  // Get coordinates for label placements (slightly outer)
  const getLabelCoordinates = (index: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const radius = maxRadius + 22;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-slate-900/40 rounded-xl border border-slate-800">
      <div className="relative w-full max-w-[320px] aspect-square">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible"
        >
          {/* Grid lines (Concentric Pentagons) */}
          {gridPolygons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              fill="none"
              stroke="#A1A09C"
              strokeWidth="1"
              strokeDasharray={idx === 4 ? "0" : "2,2"}
            />
          ))}

          {/* Grid values text */}
          {gridLevels.map((level) => {
            const { x, y } = getCoordinates(0, level);
            return (
              <text
                key={level}
                x={x + 4}
                y={y + 12}
                fill="#444444"
                fontSize="9"
                className="font-mono"
              >
                {level}
              </text>
            );
          })}

          {/* Spokes/Axes */}
          {Array.from({ length: 5 }).map((_, i) => {
            const outer = getCoordinates(i, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="#A1A09C"
                strokeWidth="1"
              />
            );
          })}

          {/* Player Data Polygon Area */}
          <polygon
            points={playerPoints}
            fill={`${color}30`}
            stroke={color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Individual trait dots */}
          {TRAIT_KEYS.map(({ key }, i) => {
            const val = traits[key] || 50;
            const { x, y } = getCoordinates(i, val);
            return (
              <g key={key} className="group cursor-help">
                <circle
                  cx={x}
                  cy={y}
                  r="4.5"
                  fill={color}
                  stroke="#0F172A"
                  strokeWidth="1.5"
                />
                {/* Tooltip on dot */}
                <title>{`${val}/99`}</title>
              </g>
            );
          })}

          {/* Labels */}
          {TRAIT_KEYS.map(({ key, label }, i) => {
            const { x, y } = getLabelCoordinates(i);
            const val = traits[key] || 50;
            
            // Adjust text alignments dynamically depending on quadrant
            let textAnchor = "middle";
            if (i === 1 || i === 2) textAnchor = "start";
            if (i === 3 || i === 4) textAnchor = "end";
            
            let dy = "0.33em";
            if (i === 0) dy = "-0.2em"; // Top label nudge up
            if (i === 2 || i === 3) dy = "1em"; // Bottom labels nudge down

            return (
              <g key={key}>
                <text
                  x={x}
                  y={y}
                  dy={dy}
                  fill="#141414"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor={textAnchor}
                  className="font-sans select-none"
                >
                  {label}
                </text>
                <text
                  x={x}
                  y={y}
                  dy={dy}
                  dx={i === 1 || i === 2 ? "-0.2em" : i === 3 || i === 4 ? "0.2em" : "0"}
                  fill={color}
                  fontSize="10"
                  fontWeight="700"
                  textAnchor={textAnchor === "start" ? "end" : textAnchor === "end" ? "start" : "middle"}
                  className="font-mono"
                >
                  {/* Small offset rating value */}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Trait Value List for mobile accessibility/clarity */}
      <div className="grid grid-cols-5 gap-1 w-full text-center mt-3 border-t border-slate-800/80 pt-2.5">
        {TRAIT_KEYS.map(({ key, label }) => (
          <div key={key} className="flex flex-col">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider truncate">
              {label.split(' ')[0]}
            </span>
            <span
              className="text-xs font-bold font-mono"
              style={{ color }}
            >
              {traits[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
