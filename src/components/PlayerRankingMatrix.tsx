import React, { useState } from 'react';
import { Player } from '../types';
import { Award, Zap, ListOrdered, Calendar, ShieldAlert, ArrowRight, Layers, HelpCircle, Sparkles, Flame, ShieldCheck } from 'lucide-react';

export interface DraftValueRange {
  range: string;
  label: string;
  color: string;
  bg: string;
  border: string;
}

export function getDraftRange(grade: number): DraftValueRange {
  if (grade >= 95) {
    return {
      range: "Top 5 Pick",
      label: "Elite Franchise Cornerstone",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30"
    };
  } else if (grade >= 90) {
    return {
      range: "Top 15 Pick",
      label: "Blue Chip Pro Bowler",
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/30"
    };
  } else if (grade >= 85) {
    return {
      range: "1st Round",
      label: "Day 1 High-End Starter",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30"
    };
  } else if (grade >= 80) {
    return {
      range: "2nd Round",
      label: "Red Chip Contributor",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/30"
    };
  } else if (grade >= 75) {
    return {
      range: "3rd-4th Round",
      label: "Quality Developmental Starter",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30"
    };
  } else if (grade >= 65) {
    return {
      range: "5th-7th Round",
      label: "Rotational Asset / Special Teamer",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30"
    };
  } else {
    return {
      range: "Undrafted Free Agent",
      label: "Priority FA / Camp Candidate",
      color: "text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/20"
    };
  }
}

interface PlayerRankingMatrixProps {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  onAddToCompare?: (player: Player) => void;
}

export default function PlayerRankingMatrix({ players, onSelectPlayer, onAddToCompare }: PlayerRankingMatrixProps) {
  // Available standard positions
  const positions = ['QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DT', 'LB', 'CB', 'S'];
  const [selectedPos, setSelectedPos] = useState<string>('QB');
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'list' | 'heatmap'>('list');
  const [showOnlyOutliers, setShowOnlyOutliers] = useState<boolean>(false);

  // Group players by position and sort by overallGrade in descending order
  const getPlayersByPosition = (pos: string) => {
    return [...players]
      .filter(p => p.position === pos || p.position.includes(pos))
      .sort((a, b) => b.overallGrade - a.overallGrade);
  };

  // Grouped active players
  const activePlayers = getPlayersByPosition(selectedPos);

  // Calculate Value Outliers (Peak Individual Trait vs Overall Grade)
  const getOutlierInfo = (player: Player) => {
    const traits = player.traits;
    const traitMax = Math.max(traits.athleticism, traits.technique, traits.production, traits.footballIQ, traits.sizeAndFrame);
    const outlierDelta = traitMax - player.overallGrade;
    const isOutlier = outlierDelta >= 4;

    let maxTraitName = 'ATH';
    if (traits.technique === traitMax) maxTraitName = 'TEC';
    else if (traits.production === traitMax) maxTraitName = 'PRD';
    else if (traits.footballIQ === traitMax) maxTraitName = 'FIQ';
    else if (traits.sizeAndFrame === traitMax) maxTraitName = 'SZF';

    return { traitMax, outlierDelta, isOutlier, maxTraitName };
  };

  // Filter based on outlier toggle
  const filteredActivePlayers = showOnlyOutliers
    ? activePlayers.filter(p => getOutlierInfo(p).isOutlier)
    : activePlayers;

  // Color generator for heatmap score ranges
  const getHeatmapColor = (score: number) => {
    if (score >= 95) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-extrabold';
    if (score >= 90) return 'bg-teal-500/15 text-teal-300 border-teal-500/25 font-bold';
    if (score >= 85) return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
    if (score >= 80) return 'bg-indigo-500/5 text-indigo-300 border-indigo-500/15';
    if (score >= 70) return 'bg-slate-900/60 text-slate-400 border-slate-850/50';
    return 'bg-slate-950/40 text-slate-500 border-slate-900/30';
  };

  return (
    <div className="bg-slate-950 border-2 border-slate-800 p-5 md:p-6 space-y-5 rounded-none h-full flex flex-col justify-between">
      <div className="space-y-4">
        {/* Title Block */}
        <div className="border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] uppercase font-bold font-mono text-slate-400 tracking-wider">
              Positional Grading Engine
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-bold italic text-slate-100 mt-1">
            Positional Scouting Matrix
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Analyze prospects sorted by their natural positional scouting grades. Switch to Heatmap view to pinpoint prospects with elite individual traits.
          </p>
        </div>

        {/* Position Selectors Grid */}
        <div className="flex flex-wrap gap-1 border-b border-slate-900 pb-3">
          {positions.map((pos) => {
            const count = players.filter(p => p.position === pos || p.position.includes(pos)).length;
            const isActive = selectedPos === pos;
            return (
              <button
                key={pos}
                onClick={() => setSelectedPos(pos)}
                className={`px-3 py-1.5 font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 rounded-none border ${
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {pos}
                <span className={`text-[9px] px-1 rounded-sm ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-950 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Draft Value Range Legend (Interactive) */}
        {showLegend && (
          <div className="bg-slate-900/50 border border-slate-850 p-3.5 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-slate-500" /> Positional Valuation Scale
              </span>
              <button 
                onClick={() => setShowLegend(false)}
                className="text-[9px] text-slate-500 hover:text-slate-300 font-mono uppercase"
              >
                [ Hide ]
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="text-[10px] space-y-0.5">
                <span className="text-emerald-400 font-bold font-mono">95+ (Grade)</span>
                <p className="text-slate-400 font-mono">Top 5 Pick Range</p>
              </div>
              <div className="text-[10px] space-y-0.5">
                <span className="text-teal-400 font-bold font-mono">90 - 94 (Grade)</span>
                <p className="text-slate-400 font-mono">Blue Chip / Top 15</p>
              </div>
              <div className="text-[10px] space-y-0.5">
                <span className="text-blue-400 font-bold font-mono">85 - 89 (Grade)</span>
                <p className="text-slate-400 font-mono">Day 1 High-End Starter</p>
              </div>
              <div className="text-[10px] space-y-0.5">
                <span className="text-indigo-400 font-bold font-mono">80 - 84 (Grade)</span>
                <p className="text-slate-400 font-mono">Red Chip Contributor</p>
              </div>
              <div className="text-[10px] space-y-0.5">
                <span className="text-purple-400 font-bold font-mono">75 - 79 (Grade)</span>
                <p className="text-slate-400 font-mono">Quality Developmental Starter</p>
              </div>
              <div className="text-[10px] space-y-0.5">
                <span className="text-amber-400 font-bold font-mono">65 - 74 (Grade)</span>
                <p className="text-slate-400 font-mono">Rotational / Special Teamer</p>
              </div>
            </div>
          </div>
        )}
        {!showLegend && (
          <div className="flex justify-end">
            <button 
              onClick={() => setShowLegend(true)}
              className="text-[9px] text-slate-500 hover:text-slate-300 font-mono uppercase"
            >
              [ Show Grading Scale ]
            </button>
          </div>
        )}

        {/* View Layout Toggle Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-2 mt-2">
          <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 border border-slate-850 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-colors rounded-md ${
                viewMode === 'list'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Scouting List
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-colors rounded-md flex items-center gap-1.5 ${
                viewMode === 'heatmap'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
              Heatmap Outliers
            </button>
          </div>

          {/* Dynamic Value Outlier filter (Visible in Heatmap Mode) */}
          {viewMode === 'heatmap' && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOnlyOutliers}
                onChange={(e) => setShowOnlyOutliers(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Only High-Value Trait Outliers (Delta ≥ +4)
              </span>
            </label>
          )}
        </div>

        {/* Positional List Matrix */}
        <div className="space-y-2 mt-4 max-h-[500px] overflow-y-auto pr-1">
          {filteredActivePlayers.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-900 font-mono text-xs text-slate-500">
              No evaluated {selectedPos} prospects found in draft class.
            </div>
          ) : viewMode === 'list' ? (
            /* CLASSIC LIST VIEW */
            activePlayers.map((player, idx) => {
              const draftRange = getDraftRange(player.overallGrade);
              const outlier = getOutlierInfo(player);
              return (
                <div 
                  key={player.id}
                  className="bg-slate-950/60 border border-slate-850 hover:border-slate-700 p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all relative group"
                >
                  {/* Left info */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 text-xs font-bold w-4">
                        #{idx + 1}
                      </span>
                      <button
                        onClick={() => onSelectPlayer(player)}
                        className="font-serif font-bold italic text-slate-200 hover:text-emerald-400 text-sm md:text-base text-left truncate hover:underline"
                      >
                        {player.name}
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({player.school})
                      </span>
                      {player.archetype === 'Blue Chip Prospect' && (
                        <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase rounded-sm">
                          Blue Chip
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>Ath: {player.traits.athleticism}</span>
                      <span>•</span>
                      <span>Tec: {player.traits.technique}</span>
                      <span>•</span>
                      <span>Prd: {player.traits.production}</span>
                      {outlier.isOutlier && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            Value Outlier (+{outlier.outlierDelta})
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right valuation & actions */}
                  <div className="flex sm:flex-col items-end gap-1.5 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-slate-400">Grade:</span>
                      <span className="text-xs md:text-sm font-bold font-mono text-slate-100 bg-slate-900 px-2 py-0.5 border border-slate-800">
                        {player.overallGrade}/99
                      </span>
                    </div>

                    {/* Draft value range badge */}
                    <div className={`px-2 py-1 text-[9px] font-mono font-bold uppercase border tracking-wider ${draftRange.color} ${draftRange.bg} ${draftRange.border}`}>
                      {draftRange.range}
                    </div>

                    {/* Quick action buttons on hover */}
                    {onAddToCompare && (
                      <button
                        onClick={() => onAddToCompare(player)}
                        className="sm:opacity-0 group-hover:opacity-100 px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[8px] font-mono font-bold uppercase transition-all flex items-center gap-1"
                        title="Add to comparative sandbox"
                      >
                        Compare <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            /* HEATMAP VISUALIZER TABLE VIEW */
            <div className="overflow-x-auto border border-slate-900 rounded-xl bg-slate-950">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800 font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Prospect</th>
                    <th className="py-3 px-2 text-center">Grade</th>
                    <th className="py-3 px-2 text-center">Athleticism (ATH)</th>
                    <th className="py-3 px-2 text-center">Technique (TEC)</th>
                    <th className="py-3 px-2 text-center">Production (PRD)</th>
                    <th className="py-3 px-2 text-center">IQ (FIQ)</th>
                    <th className="py-3 px-2 text-center">Size (SZF)</th>
                    <th className="py-3 px-4 text-right">Outlier Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {filteredActivePlayers.map((player, idx) => {
                    const traits = player.traits;
                    const outlier = getOutlierInfo(player);
                    return (
                      <tr 
                        key={player.id}
                        className="hover:bg-slate-900/20 transition-colors group"
                      >
                        {/* Prospect detail */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-500 font-bold">
                              #{idx + 1}
                            </span>
                            <div>
                              <button
                                onClick={() => onSelectPlayer(player)}
                                className="font-serif font-bold italic text-slate-200 hover:text-emerald-400 text-sm hover:underline text-left block"
                              >
                                {player.name}
                              </button>
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                <span>{player.school}</span>
                                {player.archetype && (
                                  <>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-emerald-500/80 font-semibold">{player.archetype}</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Overall Grade */}
                        <td className="py-3 px-2 text-center font-mono text-xs font-bold text-slate-100">
                          <span className="bg-slate-900 px-2 py-1 border border-slate-800 rounded">
                            {player.overallGrade}
                          </span>
                        </td>

                        {/* Heatmap Trait cells with micro-shading */}
                        <td className={`py-3 px-2 text-center font-mono text-xs border-r border-slate-900/40 ${getHeatmapColor(traits.athleticism)}`}>
                          {traits.athleticism}
                        </td>
                        <td className={`py-3 px-2 text-center font-mono text-xs border-r border-slate-900/40 ${getHeatmapColor(traits.technique)}`}>
                          {traits.technique}
                        </td>
                        <td className={`py-3 px-2 text-center font-mono text-xs border-r border-slate-900/40 ${getHeatmapColor(traits.production)}`}>
                          {traits.production}
                        </td>
                        <td className={`py-3 px-2 text-center font-mono text-xs border-r border-slate-900/40 ${getHeatmapColor(traits.footballIQ)}`}>
                          {traits.footballIQ}
                        </td>
                        <td className={`py-3 px-2 text-center font-mono text-xs ${getHeatmapColor(traits.sizeAndFrame)}`}>
                          {traits.sizeAndFrame}
                        </td>

                        {/* Value Outlier indicator */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex flex-col items-end justify-center">
                            {outlier.outlierDelta > 0 ? (
                              <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                <span>+{outlier.outlierDelta} ({outlier.maxTraitName})</span>
                              </div>
                            ) : outlier.outlierDelta === 0 ? (
                              <span className="text-[10px] font-mono text-slate-500">Neutral</span>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-600">{outlier.outlierDelta}</span>
                            )}
                            <span className={`text-[8px] font-mono uppercase tracking-wider ${outlier.isOutlier ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                              {outlier.isOutlier ? 'Value Outlier' : 'Balanced Stock'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-900 mt-4 text-[10px] font-mono text-slate-500 flex justify-between items-center">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          PROSPECT MATRIX ENGINE v1.5
        </span>
        <span>{filteredActivePlayers.length} SHOWN</span>
      </div>
    </div>
  );
}
