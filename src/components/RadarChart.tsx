import React from 'react';
import { PlayerTraits } from '../types';
import { getSchema } from '../utils/traitGrading';

export interface RadarChartProps {
  traits?: PlayerTraits;
  color?: string; // Hex color for the trait fill
  positionTraits?: Record<string, number>;
  position?: string;
  axes?: { key: string; label: string }[];
}

const DEFAULT_TRAIT_KEYS = [
  { key: 'athleticism', label: 'Athleticism' },
  { key: 'technique', label: 'Technique' },
  { key: 'production', label: 'Production' },
  { key: 'footballIQ', label: 'Football IQ' },
  { key: 'sizeAndFrame', label: 'Size & Frame' },
] as const;

export default function RadarChart({
  traits,
  color = '#10B981',
  positionTraits,
  position,
  axes: customAxes,
}: RadarChartProps) {
  // Determine axis definitions:
  // 1. Explicit custom axes
  // 2. Position sub-traits schema if position & positionTraits are provided
  // 3. Fall back to standard 5 pillars
  let activeAxes: { key: string; label: string }[] = DEFAULT_TRAIT_KEYS.map((k) => ({ ...k }));

  if (customAxes && customAxes.length >= 3) {
    activeAxes = customAxes;
  } else if (positionTraits && position) {
    const schema = getSchema(position);
    if (schema && schema.length >= 3) {
      activeAxes = schema.map((t) => ({ key: t.key, label: t.label }));
    }
  }

  const numAxes = activeAxes.length;
  const size = 300;
  const center = size / 2;
  const maxRadius = 100;

  // Convert polar coordinates to Cartesian for N axes
  const getCoordinates = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / numAxes - Math.PI / 2; // Start from top
    const radius = (Math.max(0, Math.min(100, value)) / 100) * maxRadius;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  // Helper to extract numeric value for an axis key
  const getValue = (key: string): number => {
    if (positionTraits && key in positionTraits) {
      return positionTraits[key];
    }
    if (traits && key in traits) {
      return (traits as any)[key] ?? 50;
    }
    return 50;
  };

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [20, 40, 60, 80, 100];

  // Draw grid polygons for N axes
  const gridPolygons = gridLevels.map((level) => {
    return Array.from({ length: numAxes })
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level);
        return `${x},${y}`;
      })
      .join(' ');
  });

  // Data polygon points
  const playerPoints = activeAxes
    .map(({ key }, i) => {
      const val = getValue(key);
      const { x, y } = getCoordinates(i, val);
      return `${x},${y}`;
    })
    .join(' ');

  // Get coordinates for label placement (slightly outer)
  const getLabelCoordinates = (index: number) => {
    const angle = (index * 2 * Math.PI) / numAxes - Math.PI / 2;
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
          {/* Grid lines (Concentric Polygons) */}
          {gridPolygons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              fill="none"
              stroke="#A1A09C"
              strokeWidth="1"
              strokeDasharray={idx === 4 ? '0' : '2,2'}
            />
          ))}

          {/* Grid level labels */}
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
          {Array.from({ length: numAxes }).map((_, i) => {
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

          {/* Individual trait vertex dots */}
          {activeAxes.map(({ key, label }, i) => {
            const val = getValue(key);
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
                <title>{`${label}: ${val}/99`}</title>
              </g>
            );
          })}

          {/* Labels */}
          {activeAxes.map(({ key, label }, i) => {
            const { x, y } = getLabelCoordinates(i);

            let textAnchor = 'middle';
            if (x < center - 10) textAnchor = 'end';
            else if (x > center + 10) textAnchor = 'start';

            let dy = '0.33em';
            if (y < center - 20) dy = '-0.2em';
            else if (y > center + 20) dy = '1em';

            return (
              <g key={key}>
                <text
                  x={x}
                  y={y}
                  dy={dy}
                  fill="#141414"
                  fontSize={numAxes > 7 ? '9' : '11'}
                  fontWeight="600"
                  textAnchor={textAnchor}
                  className="font-sans select-none"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Trait Value Summary Grid */}
      <div
        className={`grid ${
          numAxes > 5 ? 'grid-cols-4 md:grid-cols-5' : 'grid-cols-5'
        } gap-1 w-full text-center mt-3 border-t border-slate-800/80 pt-2.5`}
      >
        {activeAxes.map(({ key, label }) => (
          <div key={key} className="flex flex-col">
            <span
              className="text-[9px] text-slate-400 font-medium uppercase tracking-wider truncate"
              title={label}
            >
              {label.split(' ')[0]}
            </span>
            <span
              className="text-xs font-bold font-mono"
              style={{ color }}
            >
              {getValue(key)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
