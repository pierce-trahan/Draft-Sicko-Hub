import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts';
import { Player } from '../types';
import { 
  BarChart3, Users, Award, Sparkles, Filter, ChevronRight, TrendingUp, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface DraftClassOverviewProps {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
}

export default function DraftClassOverview({ players, onSelectPlayer }: DraftClassOverviewProps) {
  // Filters & State
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [binSize, setBinSize] = useState<1 | 2 | 5>(2);
  const [selectedGradeRange, setSelectedGradeRange] = useState<{ min: number; max: number } | null>(null);

  // Available positions list
  const positions = useMemo(() => {
    const set = new Set(players.map(p => p.position));
    return ['ALL', ...Array.from(set).sort()];
  }, [players]);

  // Filter players by selected position
  const filteredPlayers = useMemo(() => {
    if (selectedPosition === 'ALL') return players;
    return players.filter(p => p.position === selectedPosition);
  }, [players, selectedPosition]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const total = filteredPlayers.length;
    if (total === 0) return { avg: 0, elite: 0, round1: 0, day2: 0, developmental: 0 };

    const sum = filteredPlayers.reduce((acc, p) => acc + p.overallGrade, 0);
    const avg = Math.round((sum / total) * 10) / 10;

    const elite = filteredPlayers.filter(p => p.overallGrade >= 95).length;
    const round1 = filteredPlayers.filter(p => p.overallGrade >= 90 && p.overallGrade < 95).length;
    const day2 = filteredPlayers.filter(p => p.overallGrade >= 85 && p.overallGrade < 90).length;
    const developmental = filteredPlayers.filter(p => p.overallGrade < 85).length;

    return {
      avg,
      elite,
      round1,
      day2,
      developmental,
      total
    };
  }, [filteredPlayers]);

  // Generate Histogram Data
  const histogramData = useMemo(() => {
    if (filteredPlayers.length === 0) return [];

    // Find min/max bounds in current filtered players
    const grades = filteredPlayers.map(p => p.overallGrade);
    const minGrade = Math.min(...grades);
    const maxGrade = Math.max(...grades);

    // Round bounds to nice bin edges
    const startEdge = Math.floor(minGrade / binSize) * binSize;
    const endEdge = Math.ceil(maxGrade / binSize) * binSize;

    // Create bins
    const bins: { label: string; min: number; max: number; count: number; players: Player[] }[] = [];
    for (let current = startEdge; current < endEdge; current += binSize) {
      bins.push({
        label: binSize === 1 ? `${current}` : `${current}-${current + binSize - 1}`,
        min: current,
        max: current + binSize - 1,
        count: 0,
        players: []
      });
    }

    // Populate bins
    filteredPlayers.forEach(player => {
      const g = player.overallGrade;
      const matchedBin = bins.find(b => g >= b.min && g <= b.max);
      if (matchedBin) {
        matchedBin.count += 1;
        matchedBin.players.push(player);
      } else {
        // Fallback for upper boundary matches
        const lastBin = bins[bins.length - 1];
        if (lastBin && g >= lastBin.min) {
          lastBin.count += 1;
          lastBin.players.push(player);
        }
      }
    });

    return bins;
  }, [filteredPlayers, binSize]);

  // Currently focused players (either from clicked bin, or default to all filtered sorted by grade)
  const focusedPlayers = useMemo(() => {
    if (selectedGradeRange) {
      return filteredPlayers
        .filter(p => p.overallGrade >= selectedGradeRange.min && p.overallGrade <= selectedGradeRange.max)
        .sort((a, b) => b.overallGrade - a.overallGrade);
    }
    return [...filteredPlayers].sort((a, b) => b.overallGrade - a.overallGrade);
  }, [filteredPlayers, selectedGradeRange]);

  // Position distribution stats for the secondary panel
  const positionDistribution = useMemo(() => {
    const distribution: Record<string, { count: number; sum: number; avg: number; eliteCount: number }> = {};
    players.forEach(p => {
      if (!distribution[p.position]) {
        distribution[p.position] = { count: 0, sum: 0, avg: 0, eliteCount: 0 };
      }
      distribution[p.position].count += 1;
      distribution[p.position].sum += p.overallGrade;
      if (p.overallGrade >= 90) {
        distribution[p.position].eliteCount += 1;
      }
    });

    return Object.entries(distribution)
      .map(([pos, data]) => ({
        position: pos,
        count: data.count,
        avg: Math.round((data.sum / data.count) * 10) / 10,
        eliteCount: data.eliteCount
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [players]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Panel */}
      <div className="border border-slate-800 bg-slate-900 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 select-none pointer-events-none">
          <BarChart3 className="w-48 h-48 text-emerald-500" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 animate-pulse" />
            V2.5 Talent Analysis
          </div>
          <h1 className="text-3xl font-serif font-semibold tracking-tight text-slate-100 italic">
            Draft Class Overview & Talent Concentration
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Analyze the grade distribution across the entire prospect pool. Customize bin ranges, filter by position, and click individual bars on the histogram to immediately pinpoint concentrated tiers of talent.
          </p>
        </div>
      </div>

      {/* Control Bar & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Controls Card */}
        <div className="border border-slate-800 bg-slate-900 p-5 rounded-2xl flex flex-col justify-between space-y-4 lg:col-span-1">
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-500" />
              Distribution Controls
            </h3>
            
            {/* Position Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs text-slate-400 font-medium">Position Pool</label>
              <select
                value={selectedPosition}
                onChange={(e) => {
                  setSelectedPosition(e.target.value);
                  setSelectedGradeRange(null); // Reset range focus on filter change
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-semibold"
              >
                {positions.map(pos => (
                  <option key={pos} value={pos}>
                    {pos === 'ALL' ? 'All Positions' : pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Bin Size Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs text-slate-400 font-medium">Histogram Bin Size</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-1 border border-slate-800 rounded-lg">
                {([1, 2, 5] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setBinSize(size);
                      setSelectedGradeRange(null); // Reset focus
                    }}
                    className={`py-1.5 text-xs font-mono font-bold uppercase transition-all rounded ${
                      binSize === size
                        ? 'bg-emerald-500 text-slate-950 shadow font-extrabold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {size} Pt
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/60 text-[11px] text-slate-400 font-mono leading-relaxed space-y-2">
            <div className="flex items-center gap-1 text-emerald-500 font-bold">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>How to use:</span>
            </div>
            <p>
              Click on any bar in the histogram to focus on prospects with that grade range. Click the focused active range below to clear.
            </p>
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:col-span-3 gap-4">
          <div 
            onClick={() => setSelectedGradeRange(null)}
            className="border border-slate-800 bg-slate-900 p-4 rounded-2xl flex flex-col justify-between transition-all hover:border-slate-700 cursor-pointer"
          >
            <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400">Average Grade</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-serif italic font-bold text-slate-100">{summaryMetrics.avg}</span>
              <span className="text-xs font-mono text-slate-400">/100</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">Based on {summaryMetrics.total} prospects</span>
          </div>

          <div 
            onClick={() => setSelectedGradeRange({ min: 95, max: 100 })}
            className={`border bg-slate-900 p-4 rounded-2xl flex flex-col justify-between transition-all cursor-pointer ${
              selectedGradeRange?.min === 95 
                ? 'border-emerald-500/80 bg-emerald-500/5' 
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Elite Tiers (95+)
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-serif italic font-bold text-slate-100">{summaryMetrics.elite}</span>
              <span className="text-xs font-mono text-slate-400">
                ({summaryMetrics.total ? Math.round((summaryMetrics.elite / summaryMetrics.total) * 100) : 0}%)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">Blue-Chip prospects</span>
          </div>

          <div 
            onClick={() => setSelectedGradeRange({ min: 90, max: 94 })}
            className={`border bg-slate-900 p-4 rounded-2xl flex flex-col justify-between transition-all cursor-pointer ${
              selectedGradeRange?.min === 90 && selectedGradeRange?.max === 94
                ? 'border-emerald-500/80 bg-emerald-500/5' 
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400">Day 1 Starters (90-94)</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-serif italic font-bold text-slate-100">{summaryMetrics.round1}</span>
              <span className="text-xs font-mono text-slate-400">
                ({summaryMetrics.total ? Math.round((summaryMetrics.round1 / summaryMetrics.total) * 100) : 0}%)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">High first-round expectations</span>
          </div>

          <div 
            onClick={() => setSelectedGradeRange({ min: 85, max: 89 })}
            className={`border bg-slate-900 p-4 rounded-2xl flex flex-col justify-between transition-all cursor-pointer ${
              selectedGradeRange?.min === 85 && selectedGradeRange?.max === 89
                ? 'border-emerald-500/80 bg-emerald-500/5' 
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400">Day 2 Impact (85-89)</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-serif italic font-bold text-slate-100">{summaryMetrics.day2}</span>
              <span className="text-xs font-mono text-slate-400">
                ({summaryMetrics.total ? Math.round((summaryMetrics.day2 / summaryMetrics.total) * 100) : 0}%)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">Rounds 2-3 value concentration</span>
          </div>
        </div>
      </div>

      {/* Main Histogram Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Histogram Card */}
        <div className="border border-slate-800 bg-slate-900 rounded-2xl p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-sans">
                Grade Distribution Histogram
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Distribution of overall draft scout grades in {binSize === 1 ? '1-point' : `${binSize}-point`} increments
              </p>
            </div>
            {selectedGradeRange && (
              <button
                onClick={() => setSelectedGradeRange(null)}
                className="text-[10px] font-mono text-emerald-500 hover:text-emerald-400 underline uppercase font-bold shrink-0 cursor-pointer"
              >
                Clear Focus Filter
              </button>
            )}
          </div>

          {/* Recharts Histogram */}
          <div className="h-80 w-full bg-slate-950/30 rounded-xl p-2 border border-slate-850">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={histogramData}
                margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
                onClick={(data: any) => {
                  if (data && data.activePayload && data.activePayload.length > 0) {
                    const activeBin = data.activePayload[0].payload;
                    setSelectedGradeRange({ min: activeBin.min, max: activeBin.max });
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245, 240, 238, 0.04)" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="rgba(245, 240, 238, 0.4)" 
                  fontSize={10}
                  fontFamily="Geist Mono"
                  tickLine={false}
                />
                <YAxis 
                  stroke="rgba(245, 240, 238, 0.4)" 
                  fontSize={10}
                  fontFamily="Geist Mono"
                  allowDecimals={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 111, 60, 0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percent = summaryMetrics.total ? Math.round((data.count / summaryMetrics.total) * 1000) / 10 : 0;
                      return (
                        <div className="bg-slate-900 border border-slate-800 p-3 shadow-xl rounded-lg space-y-1 font-mono text-xs">
                          <p className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">
                            Grade Range: {data.min === data.max ? data.min : `${data.min} - ${data.max}`}
                          </p>
                          <p className="text-slate-100 font-serif italic text-sm font-bold">
                            {data.count} Prospects
                          </p>
                          <p className="text-emerald-500 text-[10px]">
                            {percent}% of current pool
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                >
                  {histogramData.map((entry, index) => {
                    // Check if current bar is within selected range focus
                    const isFocused = selectedGradeRange 
                      ? (entry.min >= selectedGradeRange.min && entry.max <= selectedGradeRange.max)
                      : false;
                    const hasSelectedRange = selectedGradeRange !== null;

                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          isFocused 
                            ? 'var(--color-emerald-500)' 
                            : hasSelectedRange 
                              ? 'rgba(245, 240, 238, 0.15)' 
                              : 'var(--color-emerald-500)'
                        }
                        opacity={isFocused ? 1 : hasSelectedRange ? 0.35 : 0.85}
                        className="transition-all duration-300 hover:opacity-100"
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 opacity-85 rounded-sm" />
              <span>Normal Distribution Bar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-700 opacity-35 rounded-sm" />
              <span>Unfocused Grade Range</span>
            </div>
            {selectedGradeRange && (
              <div className="ml-auto text-emerald-500 font-bold flex items-center gap-1">
                <span className="animate-ping w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Active Filter: Grades {selectedGradeRange.min}-{selectedGradeRange.max}</span>
              </div>
            )}
          </div>
        </div>

        {/* Position Average Grades comparison card */}
        <div className="border border-slate-800 bg-slate-900 rounded-2xl p-5 lg:col-span-1 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-sans flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Positional Talent Levels
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Average overall scout grades by positional group
            </p>
          </div>

          {/* Quick list table comparing position depth */}
          <div className="flex-1 space-y-2 mt-2 max-h-72 overflow-y-auto pr-1">
            {positionDistribution.map((posStat, idx) => {
              // Calculate width percentage relative to max grade (which would be 100)
              const widthPct = (posStat.avg / 100) * 100;
              const isSelectedPos = selectedPosition === posStat.position;
              
              return (
                <div 
                  key={posStat.position}
                  onClick={() => {
                    setSelectedPosition(posStat.position);
                    setSelectedGradeRange(null); // Clear focused range
                  }}
                  className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelectedPos 
                      ? 'bg-emerald-500/5 border-emerald-500/40' 
                      : 'border-slate-850 hover:bg-slate-950/40 bg-slate-950/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200">{posStat.position}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{posStat.count} Players</span>
                      {posStat.eliteCount > 0 && (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1 font-bold rounded">
                          {posStat.eliteCount} Elite (90+)
                        </span>
                      )}
                      <span className="font-bold text-slate-100">{posStat.avg}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelectedPos ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setSelectedPosition('ALL')}
            className="w-full py-1.5 text-center text-[10px] font-mono font-bold uppercase border border-slate-800 hover:border-slate-700 bg-slate-950/20 text-slate-400 hover:text-white transition-all rounded-lg cursor-pointer"
          >
            Reset Position Filter
          </button>
        </div>
      </div>

      {/* Detail List Panel representing the focused grade bucket */}
      <div className="border border-slate-800 bg-slate-900 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 font-sans">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>Prospect Analysis Pool ({focusedPlayers.length})</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {selectedGradeRange 
                ? `Showing prospects graded between ${selectedGradeRange.min} and ${selectedGradeRange.max}` 
                : 'Showing all prospects matching chosen filters, sorted by overall scout grade'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedGradeRange && (
              <button
                onClick={() => setSelectedGradeRange(null)}
                className="text-[10px] font-mono font-bold uppercase text-slate-400 hover:text-white bg-slate-950/80 px-2 py-1 rounded border border-slate-850 cursor-pointer"
              >
                Show All Grades
              </button>
            )}
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
              SORT: GRADE DESC
            </span>
          </div>
        </div>

        {/* Players List Grid */}
        {focusedPlayers.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl">
            <p className="text-sm text-slate-500 font-mono">No prospects match the selected grade range or positional filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {focusedPlayers.map((player) => {
              // Custom archetypes formatting
              const arch = player.archetype;
              const archClass = 
                arch === 'Day 1 Starter' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                arch === 'Blue Chip Prospect' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                arch === 'Raw Developmental' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                arch === 'Specialist' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                arch === 'High Floor Starter' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                arch === 'Boom-or-Bust' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                arch === 'Sleeper' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                'bg-slate-500/10 text-slate-400 border-slate-500/20';

              return (
                <div 
                  key={player.id}
                  onClick={() => onSelectPlayer(player)}
                  className="p-3 border border-slate-850 bg-slate-950/20 rounded-xl hover:bg-slate-950/50 hover:border-slate-700/60 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-1.5 py-0.5 border border-slate-850 rounded">
                        {player.position}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                        {player.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 truncate">
                      <span>{player.school}</span>
                      <span>•</span>
                      <span>{player.year}</span>
                    </div>
                    {arch && (
                      <span className={`inline-block px-1.5 py-0.5 text-[8px] font-bold font-mono border rounded-sm uppercase tracking-wide ${archClass}`}>
                        {arch}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-500 uppercase block leading-none">Grade</span>
                      <span className="text-base font-serif italic font-bold text-slate-200">{player.overallGrade}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
