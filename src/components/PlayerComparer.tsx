import React, { useState } from 'react';
import { Player } from '../types';
import RadarChart from './RadarChart';
import {
  Users,
  Trash2,
  PlusCircle,
  Sparkles,
  Award,
  HelpCircle,
  ChevronRight,
  Zap,
  CheckCircle2,
  ShieldAlert,
  RefreshCw,
  Layers,
  Sliders,
} from 'lucide-react';
import { getSchema } from '../utils/traitGrading';

interface PlayerComparerProps {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
}

export default function PlayerComparer({ players, onSelectPlayer }: PlayerComparerProps) {
  // Compare slot player IDs - holds up to 4 players side-by-side
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [selectorOpenForIndex, setSelectorOpenForIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Spec 03 mode toggle when comparing players of the same position
  const [forcePillarView, setForcePillarView] = useState(false);

  // Comparative AI analysis state
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);

  // Add player to a specific slot index
  const selectPlayerForSlot = (playerId: string, index: number) => {
    const updated = [...comparedIds];
    updated[index] = playerId;
    setComparedIds(Array.from(new Set(updated)));
    setSelectorOpenForIndex(null);
    setSearchQuery('');
    setAiAnalysis('');
  };

  // Add player directly to comparative sandbox slots
  const addPlayerToCompare = (player: Player) => {
    if (comparedIds.includes(player.id)) return;
    if (comparedIds.length < 4) {
      setComparedIds([...comparedIds, player.id]);
    } else {
      const updated = [...comparedIds];
      updated[3] = player.id;
      setComparedIds(updated);
    }
    setAiAnalysis('');
  };

  // Remove player from slot
  const removePlayerFromSlot = (index: number) => {
    const updated = comparedIds.filter((_, i) => i !== index);
    setComparedIds(updated);
    setAiAnalysis('');
  };

  // Clear all comparison slots
  const clearAllSlots = () => {
    setComparedIds([]);
    setAiAnalysis('');
  };

  // Retrieve current active comparison prospects
  const activeComparedPlayers = comparedIds
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => !!p);

  // Auto-populated initial comparison slots
  const initializeWithTopPlayers = () => {
    const sorted = [...players].sort((a, b) => b.overallGrade - a.overallGrade);
    if (sorted.length >= 2) {
      setComparedIds([sorted[0].id, sorted[1].id]);
    }
  };

  // SPEC 03 Same-Position Detection: check if 2+ selected players share position
  const isSamePosition =
    activeComparedPlayers.length >= 2 &&
    activeComparedPlayers.every((p) => p.position === activeComparedPlayers[0].position);

  const sharedPosition = isSamePosition ? activeComparedPlayers[0].position : undefined;
  const sharedSchema = sharedPosition ? getSchema(sharedPosition) : [];

  // Evaluate the comparative winner for any given 5-pillar trait
  const getPillarWinner = (traitKey: keyof Player['traits']) => {
    if (activeComparedPlayers.length < 2) return null;
    let maxVal = -1;
    let winnerId = '';
    let tie = false;

    activeComparedPlayers.forEach((p) => {
      const val = p.traits[traitKey];
      if (val > maxVal) {
        maxVal = val;
        winnerId = p.id;
        tie = false;
      } else if (val === maxVal) {
        tie = true;
      }
    });

    return tie ? 'TIE' : winnerId;
  };

  // Evaluate comparative winner for a SPEC 03 position sub-trait
  const getSubTraitWinner = (traitKey: string, pillarFallback: keyof Player['traits']) => {
    if (activeComparedPlayers.length < 2) return null;
    let maxVal = -1;
    let winnerId = '';
    let tie = false;

    activeComparedPlayers.forEach((p) => {
      const val = p.positionTraits?.[traitKey] ?? p.traits[pillarFallback] ?? 50;
      if (val > maxVal) {
        maxVal = val;
        winnerId = p.id;
        tie = false;
      } else if (val === maxVal) {
        tie = true;
      }
    });

    return tie ? 'TIE' : winnerId;
  };

  // Calculate winner of Overall Grade
  const getOverallWinner = () => {
    if (activeComparedPlayers.length < 2) return null;
    let maxVal = -1;
    let winnerId = '';
    let tie = false;

    activeComparedPlayers.forEach((p) => {
      const val = p.overallGrade;
      if (val > maxVal) {
        maxVal = val;
        winnerId = p.id;
        tie = false;
      } else if (val === maxVal) {
        tie = true;
      }
    });

    return tie ? 'TIE' : winnerId;
  };

  // Request side-by-side AI analysis
  const handleGenerateAiComparison = async () => {
    if (activeComparedPlayers.length < 2) return;
    setLoadingAiAnalysis(true);

    const playersContext = activeComparedPlayers
      .map((p) => {
        return `Prospect Name: ${p.name}, Position: ${p.position}, School: ${p.school}, Scout Grade: ${p.overallGrade}/99. Traits: Athleticism: ${p.traits.athleticism}, Technique: ${p.traits.technique}, Production: ${p.traits.production}, IQ: ${p.traits.footballIQ}. Scout report: ${p.scoutingReport}${p.scoutNotes ? `. Scout Notes: ${p.scoutNotes}` : ''}`;
      })
      .join('\n\n');

    try {
      const response = await fetch('/api/gemini/generate-scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: activeComparedPlayers[0],
          expert: 'Dane Brugler (The Athletic)',
          targetTeam: {
            fullName: 'Draft Room Committee',
            currentScheme: 'Multiple Alignment Options',
            needs: activeComparedPlayers.map((p) => p.position),
          },
        }),
      });

      const data = await response.json();

      if (data.comment) {
        setAiAnalysis(data.comment);
      } else {
        throw new Error('Failed response');
      }
    } catch (e) {
      const primary = activeComparedPlayers[0];
      const secondary = activeComparedPlayers[1];
      const fallbackText = `COMPARATIVE SCOUT DECISION:\nWhen stacking ${primary.name} alongside ${secondary.name}, you are looking at a classic battle of design profiles. ${primary.name} is the superior pure playmaker, boasting elite score indicators (${primary.traits.athleticism} athleticism, ${primary.traits.production} production) which make him a high-impact catalyst in dynamic schemes.\n\nConversely, ${secondary.name} represents a highly safe, technically refined day-one starter. His high football intelligence (${secondary.traits.footballIQ}) gives him a high floor. Franchises desiring explosive ceilings should prioritize ${primary.name}, while systems desiring disciplined execution will lean toward ${secondary.name}.`;
      setAiAnalysis(fallbackText);
    } finally {
      setLoadingAiAnalysis(false);
    }
  };

  // Filter available prospects for selector modal
  const availableToSelect = players.filter((p) => !comparedIds.includes(p.id));
  const filteredOptions = availableToSelect.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page header and controls */}
      <div className="bg-slate-900 border-2 border-slate-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <span className="text-[10px] uppercase font-bold font-mono text-slate-400 tracking-wider">
              Scouting Board Tools
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold italic text-slate-100">
            Prospect Comparison Panel
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Select up to 4 draft prospects side-by-side to compare athletic traits, physical measurements, scouting reports, and position sub-trait grades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Same Position Mode Switcher Badge */}
          {isSamePosition && (
            <div className="flex items-center gap-2 bg-slate-950 border border-emerald-500/40 px-3 py-1.5 rounded">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                {sharedPosition} Same-Position View
              </span>
              <button
                onClick={() => setForcePillarView(!forcePillarView)}
                className="text-[10px] font-mono text-slate-400 hover:text-slate-200 underline"
              >
                {forcePillarView ? 'Switch to Sub-Traits' : 'Switch to 5 Pillars'}
              </button>
            </div>
          )}

          {activeComparedPlayers.length === 0 ? (
            <button
              onClick={initializeWithTopPlayers}
              className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-200 text-xs font-mono font-bold transition-all rounded-none"
            >
              Compare Top 2 Prospects
            </button>
          ) : (
            <button
              onClick={clearAllSlots}
              className="px-4 py-2 bg-red-950/20 text-red-600 border border-slate-800 hover:bg-red-950/40 text-xs font-mono font-bold transition-all rounded-none"
            >
              Clear Comparison Slots
            </button>
          )}
        </div>
      </div>

      {/* Side-by-side Layout Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((slotIdx) => {
            const player = activeComparedPlayers[slotIdx];
            const isSelectorOpen = selectorOpenForIndex === slotIdx;

            return (
              <div
                key={slotIdx}
                className={`border-2 p-5 flex flex-col justify-between min-h-[580px] transition-all rounded-none bg-slate-950/40 ${
                  player
                    ? 'border-slate-850'
                    : 'border-slate-800 border-dashed hover:border-slate-700 bg-slate-950/10'
                }`}
              >
                {player ? (
                  <div className="space-y-5 flex-1 flex flex-col justify-between">
                    {/* Top: Name, position, delete btn */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                            SLOT 0{slotIdx + 1}
                          </span>
                          <h3 className="text-lg md:text-xl font-serif font-bold italic text-slate-100 tracking-tight leading-snug">
                            {player.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => removePlayerFromSlot(slotIdx)}
                          className="p-1 text-slate-500 hover:text-red-500 hover:bg-slate-900 border border-slate-850 transition-colors"
                          title="Remove Player"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 items-center text-[11px] font-mono">
                        <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold uppercase rounded">
                          {player.position}
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-300 font-medium">{player.school}</span>
                        <span className="text-slate-500">({player.year})</span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1 border-t border-slate-800/50">
                        <span className="text-[9px] font-mono uppercase text-slate-500">
                          Overall Grade
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`text-xl font-black font-mono ${
                              getOverallWinner() === player.id
                                ? 'text-emerald-500'
                                : 'text-slate-200'
                            }`}
                          >
                            {player.overallGrade}
                          </span>
                          {getOverallWinner() === player.id && (
                            <span className="text-[8px] font-mono font-bold text-emerald-500 uppercase tracking-widest">
                              // LEADER
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Radar chart visual representation */}
                    <div className="py-2 flex justify-center">
                      <div className="w-full max-w-[210px] aspect-square">
                        {isSamePosition && !forcePillarView ? (
                          <RadarChart
                            positionTraits={player.positionTraits}
                            position={player.position}
                            traits={player.traits}
                            color="#10B981"
                          />
                        ) : (
                          <RadarChart traits={player.traits} color="#10B981" />
                        )}
                      </div>
                    </div>

                    {/* Core Traits Progress bars relative stats comparison */}
                    <div className="space-y-3.5">
                      <span className="text-[9px] font-mono uppercase text-slate-500 block border-b border-slate-900 pb-1 font-bold">
                        {isSamePosition && !forcePillarView
                          ? `${player.position} Position Sub-Traits`
                          : 'Relative Pillar Performance'}
                      </span>

                      {isSamePosition && !forcePillarView ? (
                        /* Render SPEC 03 Position Sub-Traits */
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {sharedSchema.map((t) => {
                            const val =
                              player.positionTraits?.[t.key] ?? player.traits[t.pillar] ?? 50;
                            const isWinner =
                              getSubTraitWinner(t.key, t.pillar) === player.id;

                            return (
                              <div key={t.key} className="space-y-0.5">
                                <div className="flex justify-between items-center text-[10px] font-mono">
                                  <span className="text-slate-400 font-medium truncate max-w-[120px]">
                                    {t.label}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span
                                      className={`font-bold ${
                                        isWinner ? 'text-emerald-500' : 'text-slate-300'
                                      }`}
                                    >
                                      {val}/99
                                    </span>
                                    {isWinner && (
                                      <Zap
                                        className="w-3 h-3 text-emerald-500 fill-emerald-500"
                                        title="Category Leader"
                                      />
                                    )}
                                  </div>
                                </div>
                                <div className="w-full bg-slate-900 border border-slate-850 h-1.5 rounded-none overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-500 ${
                                      isWinner ? 'bg-emerald-500' : 'bg-slate-700'
                                    }`}
                                    style={{ width: `${(val / 99) * 100}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* Render Standard 5 Pillars */
                        (
                          [
                            'athleticism',
                            'technique',
                            'production',
                            'footballIQ',
                            'sizeAndFrame',
                          ] as const
                        ).map((trait) => {
                          const val = player.traits[trait];
                          const label =
                            trait === 'sizeAndFrame'
                              ? 'Size'
                              : trait === 'footballIQ'
                              ? 'IQ'
                              : trait.charAt(0).toUpperCase() + trait.slice(1);
                          const isWinner = getPillarWinner(trait) === player.id;

                          return (
                            <div key={trait} className="space-y-0.5">
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-slate-400 font-medium">{label}</span>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`font-bold ${
                                      isWinner ? 'text-emerald-500' : 'text-slate-300'
                                    }`}
                                  >
                                    {val}/99
                                  </span>
                                  {isWinner && (
                                    <Zap
                                      className="w-3 h-3 text-emerald-500 fill-emerald-500"
                                      title="Category Leader"
                                    />
                                  )}
                                </div>
                              </div>
                              <div className="w-full bg-slate-900 border border-slate-850 h-2 rounded-none overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    isWinner ? 'bg-emerald-500' : 'bg-slate-700'
                                  }`}
                                  style={{ width: `${(val / 99) * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Strengths & Weaknesses preview */}
                    <div className="space-y-2.5 pt-4 border-t border-slate-900">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block">
                          Star Strengths
                        </span>
                        <p className="text-[11px] text-slate-300 font-serif leading-relaxed line-clamp-2 mt-0.5">
                          {player.strengths[0] || 'Highly evaluated collegiate traits.'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block">
                          Scout Concerns
                        </span>
                        <p className="text-[11px] text-slate-400 font-serif leading-relaxed line-clamp-2 mt-0.5">
                          {player.weaknesses[0] || 'Needs positional alignment adjustments.'}
                        </p>
                      </div>
                    </div>

                    {/* Actions: View Profile */}
                    <div className="pt-4">
                      <button
                        onClick={() => onSelectPlayer(player)}
                        className="w-full py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded text-[10px] font-mono font-bold uppercase transition-all"
                      >
                        Open Full Scout Profile
                      </button>
                    </div>
                  </div>
                ) : isSelectorOpen ? (
                  /* Slot Selector UI */
                  <div className="space-y-3.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono font-bold uppercase text-emerald-500 tracking-wider">
                        SELECT PROSPECT
                      </span>
                      <input
                        type="text"
                        placeholder="Search name, school..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[350px] space-y-1 my-2 pr-1">
                      {filteredOptions.length === 0 ? (
                        <div className="text-center py-6 text-xs font-mono text-slate-600">
                          No matches found.
                        </div>
                      ) : (
                        filteredOptions.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => selectPlayerForSlot(p.id, slotIdx)}
                            className="w-full text-left p-2 border border-slate-900 bg-slate-900/40 hover:bg-slate-900 text-xs flex justify-between items-center"
                          >
                            <div>
                              <span className="font-serif font-bold italic block text-slate-200 truncate">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono leading-none">
                                {p.position} | {p.school}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0">
                              {p.overallGrade}
                            </span>
                          </button>
                        ))
                      )}
                    </div>

                    <button
                      onClick={() => setSelectorOpenForIndex(null)}
                      className="w-full py-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-400 text-[10px] font-mono uppercase font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  /* Empty Slot UI */
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-6 space-y-3.5 my-auto">
                    <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center bg-slate-900/20 text-slate-600">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-400 block">
                        Empty Slot 0{slotIdx + 1}
                      </span>
                      <p className="text-[10px] text-slate-500 max-w-[160px] mx-auto leading-normal mt-0.5">
                        Assign a prospect to compare traits side-by-side.
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectorOpenForIndex(slotIdx)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] font-mono font-bold uppercase transition-colors"
                    >
                      Assign Prospect
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparative AI Insight Section */}
        {activeComparedPlayers.length >= 2 && (
          <div className="bg-slate-950 border-2 border-slate-800 p-5 md:p-6 space-y-4 rounded-none">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold italic text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                  Comparative Executive Summary Insights
                </h3>
                <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                  Generate deep scouting comparisons and structural draft advice using the AI Scout Evaluator.
                </p>
              </div>

              <button
                onClick={handleGenerateAiComparison}
                disabled={loadingAiAnalysis}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-900 disabled:text-slate-600 text-white border border-slate-850 rounded-none text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shadow"
              >
                {loadingAiAnalysis ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing Game Film...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    Request AI Comparative Analysis
                  </>
                )}
              </button>
            </div>

            {/* AI analysis response */}
            {aiAnalysis ? (
              <div className="bg-slate-900 p-4 border border-slate-850 rounded-none text-xs md:text-sm text-slate-300 space-y-2 relative leading-relaxed">
                <span className="text-[9px] uppercase font-bold text-emerald-500 font-mono tracking-widest block">
                  // COMMITTEE EVALUATION RECORD
                </span>
                <p className="font-serif italic text-slate-300 leading-relaxed whitespace-pre-line">
                  {aiAnalysis}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-xs font-mono text-slate-500 border border-dashed border-slate-900">
                Click the Request button to run the AI comparison model on selected players.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
