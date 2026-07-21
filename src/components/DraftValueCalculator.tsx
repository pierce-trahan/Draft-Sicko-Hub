import React, { useState } from 'react';
import { 
  ArrowLeftRight, Plus, Trash2, HelpCircle, Info, Sparkles, 
  TrendingUp, Copy, Check, ChevronDown, Award, RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { NFL_TEAMS } from '../data/teams';

// Fitzgerald-Spielberger (OverTheCap / OTC) Anchor Points
const OTC_POINTS = [
  { pick: 1, val: 3000 },
  { pick: 10, val: 2020 },
  { pick: 20, val: 1710 },
  { pick: 32, val: 1460 },
  { pick: 50, val: 1140 },
  { pick: 64, val: 963 },
  { pick: 80, val: 830 },
  { pick: 100, val: 703 },
  { pick: 120, val: 615 },
  { pick: 150, val: 511 },
  { pick: 180, val: 435 },
  { pick: 200, val: 394 },
  { pick: 220, val: 358 },
  { pick: 250, val: 308 },
  { pick: 260, val: 295 },
];

export const getOTCPickValue = (pickNumber: number): number => {
  if (pickNumber <= 1) return 3000;
  
  for (let i = 0; i < OTC_POINTS.length - 1; i++) {
    const curr = OTC_POINTS[i];
    const next = OTC_POINTS[i + 1];
    if (pickNumber >= curr.pick && pickNumber <= next.pick) {
      const ratio = (pickNumber - curr.pick) / (next.pick - curr.pick);
      return Math.round(curr.val + ratio * (next.val - curr.val));
    }
  }
  
  if (pickNumber >= 260) {
    const diff = pickNumber - 260;
    return Math.max(10, Math.round(295 - diff * 1.5));
  }
  
  return 100;
};

// Traditional Jimmy Johnson Anchor Points for Comparison
const JJ_POINTS = [
  { pick: 1, val: 3000 },
  { pick: 10, val: 1300 },
  { pick: 20, val: 850 },
  { pick: 32, val: 590 },
  { pick: 50, val: 400 },
  { pick: 64, val: 270 },
  { pick: 80, val: 190 },
  { pick: 100, val: 100 },
  { pick: 120, val: 54 },
  { pick: 150, val: 31 },
  { pick: 180, val: 18 },
  { pick: 200, val: 11 },
  { pick: 220, val: 4 },
  { pick: 250, val: 1 },
  { pick: 260, val: 1 },
];

export const getJJValue = (pickNumber: number): number => {
  if (pickNumber <= 1) return 3000;
  
  for (let i = 0; i < JJ_POINTS.length - 1; i++) {
    const curr = JJ_POINTS[i];
    const next = JJ_POINTS[i + 1];
    if (pickNumber >= curr.pick && pickNumber <= next.pick) {
      const ratio = (pickNumber - curr.pick) / (next.pick - curr.pick);
      return Math.round(curr.val + ratio * (next.val - curr.val));
    }
  }
  
  if (pickNumber >= 260) {
    return 1;
  }
  
  return 1;
};

// Get round based on pick number
const getRoundForPick = (pick: number): number => {
  if (pick <= 32) return 1;
  if (pick <= 64) return 2;
  if (pick <= 96) return 3;
  if (pick <= 128) return 4;
  if (pick <= 160) return 5;
  if (pick <= 192) return 6;
  return 7;
};

interface SimulatorPick {
  round: number;
  pickNumber: number;
  teamId: string;
  pickString: string;
}

interface DraftValueCalculatorProps {
  draftPicks?: SimulatorPick[];
  currentPickIndex?: number;
}

export default function DraftValueCalculator({ draftPicks = [], currentPickIndex = 0 }: DraftValueCalculatorProps) {
  // State for assets in proposal
  const [picksA, setPicksA] = useState<number[]>([]);
  const [picksB, setPicksB] = useState<number[]>([]);
  
  // Custom pick number input states
  const [customInputA, setCustomInputA] = useState<string>('');
  const [customInputB, setCustomInputB] = useState<string>('');
  
  // Quick team selectors
  const [teamSelectorA, setTeamSelectorA] = useState<string>('CHI');
  const [teamSelectorB, setTeamSelectorB] = useState<string>('GB');

  // Copy success indicator
  const [copied, setCopied] = useState<boolean>(false);

  // Active educational/details collapse
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  // Add pick to side A or B
  const handleAddPick = (side: 'A' | 'B', pickNum: number) => {
    if (isNaN(pickNum) || pickNum < 1 || pickNum > 262) return;
    
    if (side === 'A') {
      if (!picksA.includes(pickNum)) {
        setPicksA(prev => [...prev, pickNum].sort((a, b) => a - b));
      }
      setCustomInputA('');
    } else {
      if (!picksB.includes(pickNum)) {
        setPicksB(prev => [...prev, pickNum].sort((a, b) => a - b));
      }
      setCustomInputB('');
    }
  };

  const handleRemovePick = (side: 'A' | 'B', pickNum: number) => {
    if (side === 'A') {
      setPicksA(prev => prev.filter(p => p !== pickNum));
    } else {
      setPicksB(prev => prev.filter(p => p !== pickNum));
    }
  };

  // Get active unselected picks belonging to selected teams in simulator
  const getTeamPicksFromSimulator = (teamId: string) => {
    return draftPicks.filter(p => p.teamId === teamId && p.pickNumber > currentPickIndex);
  };

  // Calculations for current proposal
  const totalValueOTC_A = picksA.reduce((sum, p) => sum + getOTCPickValue(p), 0);
  const totalValueOTC_B = picksB.reduce((sum, p) => sum + getOTCPickValue(p), 0);
  
  const totalValueJJ_A = picksA.reduce((sum, p) => sum + getJJValue(p), 0);
  const totalValueJJ_B = picksB.reduce((sum, p) => sum + getJJValue(p), 0);

  const valueDiffOTC = totalValueOTC_A - totalValueOTC_B;
  const absDiffOTC = Math.abs(valueDiffOTC);
  const percentMatchOTC = totalValueOTC_B > 0 
    ? (Math.min(totalValueOTC_A, totalValueOTC_B) / Math.max(totalValueOTC_A, totalValueOTC_B)) * 100 
    : 0;

  const valueDiffJJ = totalValueJJ_A - totalValueJJ_B;
  const absDiffJJ = Math.abs(valueDiffJJ);
  const percentMatchJJ = totalValueJJ_B > 0 
    ? (Math.min(totalValueJJ_A, totalValueJJ_B) / Math.max(totalValueJJ_A, totalValueJJ_B)) * 100 
    : 0;

  // Chart data (comparison between FS/OTC and JJ)
  const chartData = Array.from({ length: 26 }, (_, idx) => {
    const pickNum = idx === 0 ? 1 : idx * 10;
    return {
      pickNum,
      "Fitzgerald-Spielberger": getOTCPickValue(pickNum),
      "Jimmy Johnson": getJJValue(pickNum),
    };
  });

  // Evaluate the proposal under the Fitzgerald-Spielberger methodology
  const getVerdictOTC = () => {
    if (picksA.length === 0 && picksB.length === 0) {
      return {
        label: "Empty Board",
        color: "text-slate-400 border-slate-800 bg-slate-900/30",
        message: "Add draft picks to both sides to begin assessment."
      };
    }
    if (picksA.length === 0 || picksB.length === 0) {
      return {
        label: "Incomplete Swap",
        color: "text-amber-400 border-amber-500/20 bg-amber-500/5",
        message: "Both sides must contain at least one draft pick to compute trade balance."
      };
    }

    if (percentMatchOTC >= 90) {
      return {
        label: "Highly Balanced Trade",
        color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
        message: `Excellent balance under FS theory (${percentMatchOTC.toFixed(1)}% matching value). Both franchises are exchanging fair historical performance yield.`
      };
    }

    if (valueDiffOTC > 0) {
      // Team A gives more value
      return {
        label: "Favors Side B (Receiving Surplus)",
        color: "text-blue-400 border-blue-500/20 bg-blue-500/5",
        message: `Side A is offering ${absDiffOTC} more points on the FS scale. Side B gains massive surplus contract value. According to historical analytics, Side B wins this trade.`
      };
    } else {
      // Team B gives more value
      return {
        label: "Favors Side A (Receiving Surplus)",
        color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
        message: `Side B is offering ${absDiffOTC} more points on the FS scale. Side A acquires massive surplus contract value. Under the Fitzgerald-Spielberger model, Side A wins this trade.`
      };
    }
  };

  const verdict = getVerdictOTC();

  const handleCopyBreakdown = () => {
    if (picksA.length === 0 && picksB.length === 0) return;
    
    const text = `📊 FITZGERALD-SPIELBERGER TRADE VALUE BREAKDOWN 📊
--------------------------------------------------
SIDE A:
Picks: ${picksA.map(p => `Pick #${p} (R${getRoundForPick(p)})`).join(', ') || 'None'}
Total FS (OTC) Value: ${totalValueOTC_A} points
Total JJ Value: ${totalValueJJ_A} points

SIDE B:
Picks: ${picksB.map(p => `Pick #${p} (R${getRoundForPick(p)})`).join(', ') || 'None'}
Total FS (OTC) Value: ${totalValueOTC_B} points
Total JJ Value: ${totalValueJJ_B} points

COMPARATIVE ANALYSIS:
Fitzgerald-Spielberger (OTC) Match: ${percentMatchOTC.toFixed(1)}%
Fitzgerald-Spielberger Discrepancy: ${valueDiffOTC > 0 ? 'Side A surplus of +' : 'Side B surplus of +'}${absDiffOTC} points

Jimmy Johnson (Traditional) Match: ${percentMatchJJ.toFixed(1)}%
Jimmy Johnson Discrepancy: ${valueDiffJJ > 0 ? 'Side A surplus of +' : 'Side B surplus of +'}${absDiffJJ} points

VERDICT:
${verdict.label} - ${verdict.message}
--------------------------------------------------
Generated via NFL Draft Simulator Fitzgerald-Spielberger Trade Engine.`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col justify-between">
      
      {/* Educational block */}
      <div className="bg-slate-900 border border-slate-800 p-4 relative rounded-lg">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              The Fitzgerald-Spielberger Methodology
            </span>
          </div>
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 uppercase"
          >
            [ {showExplanation ? "Hide Details" : "Show Details"} ]
          </button>
        </div>
        
        {showExplanation && (
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Created by Jason Fitzgerald and Brad Spielberger, the **Fitzgerald-Spielberger (OTC) Draft Value Chart** 
            measures pick value by examining empirical player performance data—specifically, the cost-efficiency and valuation of 
            the players' second contracts. Traditional charts (like the Jimmy Johnson model) exponentialize top picks. 
            The Fitzgerald-Spielberger chart reflects a much flatter curve, proving that **trading down to accumulate mid-round capital** 
            is mathematically the most successful approach for drafting long-term franchise contributors.
          </p>
        )}
      </div>

      {/* Main interactive columns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* SIDE A CARD */}
        <div className="bg-slate-900/40 border border-slate-850 p-4 space-y-4 rounded-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest">Side A Offerings</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-bold text-emerald-400">{totalValueOTC_A} <span className="text-[10px] text-slate-500 font-semibold">FS pts</span></div>
                <div className="text-[10px] font-mono text-slate-500">JJ: {totalValueJJ_A} pts</div>
              </div>
            </div>

            {/* Manual input */}
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={262}
                value={customInputA}
                onChange={(e) => setCustomInputA(e.target.value)}
                placeholder="Pick # (1-262)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddPick('A', parseInt(customInputA));
                  }
                }}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 w-full font-mono focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => handleAddPick('A', parseInt(customInputA))}
                className="px-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold font-mono text-xs uppercase flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Simulator quick adder (if simulator context exists) */}
            {draftPicks.length > 0 && (
              <div className="space-y-1.5 bg-slate-950/50 p-2.5 border border-slate-850">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wide">Quick Add from Simulator</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
                <div className="flex gap-1.5">
                  <select
                    value={teamSelectorA}
                    onChange={(e) => setTeamSelectorA(e.target.value)}
                    className="bg-slate-950 border border-slate-850 text-[10px] font-mono text-slate-300 px-2 py-1 flex-1 focus:outline-none focus:border-emerald-500"
                  >
                    {NFL_TEAMS.map(t => (
                      <option key={t.id} value={t.id}>{t.fullName} ({t.id})</option>
                    ))}
                  </select>
                  <select
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val) {
                        handleAddPick('A', val);
                        e.target.value = ''; // reset
                      }
                    }}
                    defaultValue=""
                    className="bg-slate-950 border border-slate-850 text-[10px] font-mono text-slate-300 px-2 py-1 flex-1 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="" disabled>Select Pick...</option>
                    {getTeamPicksFromSimulator(teamSelectorA).map(p => (
                      <option key={p.pickNumber} value={p.pickNumber}>
                        {p.pickString} (Pick #{p.pickNumber} - {getOTCPickValue(p.pickNumber)} pts)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* List of active offerings */}
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {picksA.length === 0 ? (
                <div className="text-center py-8 text-[11px] font-mono text-slate-600 italic border border-dashed border-slate-850 bg-slate-950/20">
                  No selections added. Type a pick number above or choose from active draft capital.
                </div>
              ) : (
                picksA.map(p => {
                  const otcVal = getOTCPickValue(p);
                  const jjVal = getJJValue(p);
                  const round = getRoundForPick(p);
                  return (
                    <div 
                      key={p}
                      className="bg-slate-950/60 border border-slate-850 p-2 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-slate-100 bg-slate-900 px-1.5 py-0.5 border border-slate-850 rounded">
                          #{p}
                        </span>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Round {round} Selection</span>
                          <span className="text-[9px] font-mono text-slate-500 leading-none">FS: {otcVal} pts | JJ: {jjVal} pts</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemovePick('A', p)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900 transition-all"
                        title="Remove selection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* SIDE B CARD */}
        <div className="bg-slate-900/40 border border-slate-850 p-4 space-y-4 rounded-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest">Side B Offerings</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-bold text-blue-400">{totalValueOTC_B} <span className="text-[10px] text-slate-500 font-semibold">FS pts</span></div>
                <div className="text-[10px] font-mono text-slate-500">JJ: {totalValueJJ_B} pts</div>
              </div>
            </div>

            {/* Manual input */}
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={262}
                value={customInputB}
                onChange={(e) => setCustomInputB(e.target.value)}
                placeholder="Pick # (1-262)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddPick('B', parseInt(customInputB));
                  }
                }}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 w-full font-mono focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => handleAddPick('B', parseInt(customInputB))}
                className="px-3 bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500 hover:text-slate-950 font-bold font-mono text-xs uppercase flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Simulator quick adder (if simulator context exists) */}
            {draftPicks.length > 0 && (
              <div className="space-y-1.5 bg-slate-950/50 p-2.5 border border-slate-850">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wide">Quick Add from Simulator</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
                <div className="flex gap-1.5">
                  <select
                    value={teamSelectorB}
                    onChange={(e) => setTeamSelectorB(e.target.value)}
                    className="bg-slate-950 border border-slate-850 text-[10px] font-mono text-slate-300 px-2 py-1 flex-1 focus:outline-none focus:border-emerald-500"
                  >
                    {NFL_TEAMS.map(t => (
                      <option key={t.id} value={t.id}>{t.fullName} ({t.id})</option>
                    ))}
                  </select>
                  <select
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val) {
                        handleAddPick('B', val);
                        e.target.value = ''; // reset
                      }
                    }}
                    defaultValue=""
                    className="bg-slate-950 border border-slate-850 text-[10px] font-mono text-slate-300 px-2 py-1 flex-1 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="" disabled>Select Pick...</option>
                    {getTeamPicksFromSimulator(teamSelectorB).map(p => (
                      <option key={p.pickNumber} value={p.pickNumber}>
                        {p.pickString} (Pick #{p.pickNumber} - {getOTCPickValue(p.pickNumber)} pts)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* List of active offerings */}
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {picksB.length === 0 ? (
                <div className="text-center py-8 text-[11px] font-mono text-slate-600 italic border border-dashed border-slate-850 bg-slate-950/20">
                  No selections added. Type a pick number above or choose from active draft capital.
                </div>
              ) : (
                picksB.map(p => {
                  const otcVal = getOTCPickValue(p);
                  const jjVal = getJJValue(p);
                  const round = getRoundForPick(p);
                  return (
                    <div 
                      key={p}
                      className="bg-slate-950/60 border border-slate-850 p-2 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-slate-100 bg-slate-900 px-1.5 py-0.5 border border-slate-850 rounded">
                          #{p}
                        </span>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Round {round} Selection</span>
                          <span className="text-[9px] font-mono text-slate-500 leading-none">FS: {otcVal} pts | JJ: {jjVal} pts</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemovePick('B', p)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900 transition-all"
                        title="Remove selection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* VERDICT & SUMMARIES BLOCK */}
      <div className={`p-4 border-2 rounded-lg space-y-3 font-mono transition-all ${verdict.color}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/60 pb-2">
          <span className="text-xs font-bold uppercase flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Trade Balance Assessment
          </span>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span>FS (OTC) match: <strong className="text-slate-200">{percentMatchOTC.toFixed(1)}%</strong></span>
            <span>JJ match: <strong className="text-slate-200">{percentMatchJJ.toFixed(1)}%</strong></span>
          </div>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-sm font-bold tracking-wider uppercase">{verdict.label}</h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{verdict.message}</p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-slate-800/40">
          <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1.5">
            <span>FS Difference: <strong className="text-slate-200">{valueDiffOTC > 0 ? `Side A +${absDiffOTC}` : `Side B +${absDiffOTC}`} pts</strong></span>
            <span>JJ Difference: <strong className="text-slate-200">{valueDiffJJ > 0 ? `Side A +${absDiffJJ}` : `Side B +${absDiffJJ}`} pts</strong></span>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setPicksA([]);
                setPicksB([]);
              }}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 px-3 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-950 transition-all flex-1 sm:flex-none text-center"
            >
              Clear Slate
            </button>
            <button
              onClick={handleCopyBreakdown}
              disabled={picksA.length === 0 && picksB.length === 0}
              className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 px-4 py-1.5 border border-emerald-500/20 hover:border-emerald-500/40 bg-slate-950 transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none flex-1 sm:flex-none"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Breakdown Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Breakdown
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* GRAPH CHART SECTION */}
      <div className="bg-slate-950 border border-slate-850 p-4 space-y-4 rounded-lg">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Comparative Value Curve Vizualization
          </h4>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            Fitzgerald-Spielberger (Flat contract yield distribution) vs Jimmy Johnson (Exponential pick pricing)
          </p>
        </div>

        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="pickNum" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                label={{ value: 'Pick Number', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
                label={{ value: 'Points Value', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '0.375rem' }}
                labelStyle={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px' }}
                itemStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
              />
              <Line 
                name="Fitzgerald-Spielberger" 
                type="monotone" 
                dataKey="Fitzgerald-Spielberger" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={false}
              />
              <Line 
                name="Jimmy Johnson" 
                type="monotone" 
                dataKey="Jimmy Johnson" 
                stroke="#3b82f6" 
                strokeWidth={1.5} 
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* QUICK TABLE REFERENCE */}
      <div className="bg-slate-900/20 border border-slate-850 p-4 space-y-3 rounded-lg">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500" /> Selected Anchor Pick Reference Values
        </span>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {[1, 10, 32, 64, 100, 150, 200, 250].map(pick => {
            const fsVal = getOTCPickValue(pick);
            const jjVal = getJJValue(pick);
            return (
              <div 
                key={pick}
                className="bg-slate-950 p-2 border border-slate-850/80 text-center font-mono rounded"
              >
                <div className="text-[10px] font-bold text-slate-400">Pick #{pick}</div>
                <div className="text-xs font-black text-emerald-400 mt-1">{fsVal} <span className="text-[8px] text-slate-500 font-normal">FS</span></div>
                <div className="text-[9px] text-slate-500 leading-none mt-0.5">JJ: {jjVal}</div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
