import React, { useState, useEffect } from 'react';
import { Player, Team } from '../types';
import { NFL_TEAMS } from '../data/teams';
import { 
  X, Award, Sparkles, AlertCircle, CheckCircle2, 
  ShieldCheck, RefreshCw, Info, ArrowUpRight, TrendingUp,
  ArrowRightLeft, FileText, ChevronRight
} from 'lucide-react';

interface DraftPick {
  round: number;
  pickNumber: number;
  teamId: string;
  pickString: string;
}

interface DraftSelection {
  pick: DraftPick;
  player: Player;
  grade: string;
  notes: string;
}

interface CompletedTrade {
  id: string;
  teamA: string;
  teamB: string;
  picksA: { pickString: string; pickNumber: number; value: number; originalOwnerId?: string }[];
  picksB: { pickString: string; pickNumber: number; value: number; originalOwnerId?: string }[];
  valueA: number;
  valueB: number;
  timestamp: string;
}

interface DraftGradeSummaryModalProps {
  players: Player[];
  draftPicks: DraftPick[];
  draftSelections: DraftSelection[];
  completedTrades: CompletedTrade[];
  customTeamNeeds: Record<string, string[]>;
  userControlledTeamId: string;
  boardSource: 'custom' | 'consensus';
  orderedPlayerIds: string[];
  onClose: () => void;
}

export default function DraftGradeSummaryModal({
  players,
  draftPicks,
  draftSelections,
  completedTrades,
  customTeamNeeds,
  userControlledTeamId,
  boardSource,
  orderedPlayerIds,
  onClose
}: DraftGradeSummaryModalProps) {
  // Allow viewing evaluation for any team
  const defaultTeamId = userControlledTeamId !== 'none' ? userControlledTeamId : (NFL_TEAMS[0]?.id || 'CHI');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(defaultTeamId);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  const currentTeam = NFL_TEAMS.find(t => t.id === selectedTeamId) || NFL_TEAMS[0];

  // Baseline player ordering for consensus board rank lookup
  const getOrderedList = (): Player[] => {
    if (boardSource === 'custom') {
      const playerMap = new Map(players.map(p => [p.id, p]));
      const ordered: Player[] = [];
      orderedPlayerIds.forEach(id => {
        const p = playerMap.get(id);
        if (p) ordered.push(p);
      });
      // Append missing players
      players.forEach(p => {
        if (!ordered.some(op => op.id === p.id)) {
          ordered.push(p);
        }
      });
      return ordered;
    } else {
      return [...players].sort((a, b) => b.overallGrade - a.overallGrade);
    }
  };

  const orderedList = getOrderedList();

  const getPlayerBoardRank = (playerId: string): number => {
    const idx = orderedList.findIndex(p => p.id === playerId);
    return idx !== -1 ? idx + 1 : 99;
  };

  // Filter selections and trades for the selected team
  const teamSelections = draftSelections.filter(s => s.pick.teamId === selectedTeamId);
  
  const teamTrades = completedTrades.filter(t => t.teamA === selectedTeamId || t.teamB === selectedTeamId);

  // 1. Calculate Year 1 vs Long Term Needs Met
  const teamNeeds = customTeamNeeds[selectedTeamId] || currentTeam.needs || [];
  const immediateNeeds = teamNeeds.slice(0, 2);
  const longTermNeeds = teamNeeds.slice(2);

  const checkNeedMet = (pos: string) => {
    return teamSelections.some(s => {
      const pPos = s.player.position;
      return pPos === pos || (pPos.includes('/') && pPos.split('/').some(p => p === pos));
    });
  };

  const immediateNeedsMet = immediateNeeds.filter(checkNeedMet);
  const longTermNeedsMet = longTermNeeds.filter(checkNeedMet);

  const immediateScore = immediateNeeds.length > 0 
    ? Math.round((immediateNeedsMet.length / immediateNeeds.length) * 100) 
    : 100;

  const longTermScore = longTermNeeds.length > 0 
    ? Math.round((longTermNeedsMet.length / longTermNeeds.length) * 100) 
    : 100;

  // 2. Pick Placement Value (Consensus & Positional Premium)
  let totalConsensusDiff = 0;
  let premiumCount = 0;
  let totalGradeScore = 0;

  teamSelections.forEach(s => {
    const boardRank = getPlayerBoardRank(s.player.id);
    const diff = s.pick.pickNumber - boardRank; // Positive = Steal, Negative = Reach
    totalConsensusDiff += diff;
    totalGradeScore += s.player.overallGrade;

    if (['QB', 'EDGE', 'OT', 'CB', 'WR'].includes(s.player.position)) {
      premiumCount += 1;
    }
  });

  const avgPlayerGrade = teamSelections.length > 0 ? (totalGradeScore / teamSelections.length) : 75;
  const avgDiff = teamSelections.length > 0 ? (totalConsensusDiff / teamSelections.length) : 0;

  // Pick Placement Score formula: combination of average player talent, consensus steals, and positional value
  const basePickPlacementScore = 80 + (avgDiff * 1.8);
  const premiumBonus = premiumCount * 4;
  const rawPickValueScore = (avgPlayerGrade * 0.5) + (basePickPlacementScore * 0.4) + premiumBonus;
  const pickPlacementScore = Math.max(50, Math.min(100, Math.round(rawPickValueScore)));

  // 3. Trade Value Added or Lost
  let netTradeValue = 0;
  teamTrades.forEach(trade => {
    if (trade.teamA === selectedTeamId) {
      netTradeValue += (trade.valueB - trade.valueA);
    } else {
      netTradeValue += (trade.valueA - trade.valueB);
    }
  });

  // Trade Score: neutral 85 if no trades, else positive/negative scaling
  const tradeScore = teamTrades.length === 0 
    ? 85 
    : Math.max(50, Math.min(100, Math.round(85 + (netTradeValue / 40))));

  // 4. Overall Aggregate Grade Score
  // Weighted: Year 1 Needs (20%), Long Term Needs (40%), Pick Placement Value (30%), Trade Desk (10%)
  const overallScore = Math.round(
    (immediateScore * 0.20) + 
    (longTermScore * 0.40) + 
    (pickPlacementScore * 0.30) + 
    (tradeScore * 0.10)
  );

  const getLetterGrade = (score: number): { letter: string; color: string; bg: string; border: string; desc: string } => {
    if (score >= 95) return { letter: 'A+', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', desc: 'Elite Masterclass' };
    if (score >= 90) return { letter: 'A', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'Outstanding Class' };
    if (score >= 87) return { letter: 'A-', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/10', desc: 'Highly Successful' };
    if (score >= 83) return { letter: 'B+', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', desc: 'Great Value & Need Fit' };
    if (score >= 80) return { letter: 'B', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/10', desc: 'Solid, Balanced Class' };
    if (score >= 77) return { letter: 'B-', color: 'text-slate-200', bg: 'bg-slate-800/40', border: 'border-slate-700/40', desc: 'Above Average' };
    if (score >= 73) return { letter: 'C+', color: 'text-yellow-500', bg: 'bg-yellow-500/5', border: 'border-yellow-500/20', desc: 'Average Roster Patch' };
    if (score >= 70) return { letter: 'C', color: 'text-yellow-500', bg: 'bg-yellow-500/5', border: 'border-yellow-500/10', desc: 'Modest Returns' };
    if (score >= 60) return { letter: 'D', color: 'text-rose-400', bg: 'bg-rose-500/5', border: 'border-rose-500/20', desc: 'Reach-Heavy Class' };
    return { letter: 'F', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30', desc: 'Strategic Failure' };
  };

  const finalGrade = getLetterGrade(overallScore);

  // Identify steals for this team
  const teamSteals = teamSelections
    .map(s => {
      const boardRank = getPlayerBoardRank(s.player.id);
      const diff = s.pick.pickNumber - boardRank;
      return { s, boardRank, diff };
    })
    .filter(item => item.diff > 6)
    .sort((a, b) => b.diff - a.diff);

  // Generate dynamic rule-based narrative summary as instant baseline
  const generateRuleBasedSummary = (): string => {
    if (teamSelections.length === 0) {
      return "No draft selections made for this team. This franchise traded away or did not hold active pick selection rights during the simulated rounds.";
    }

    const starPick = teamSelections[0]?.player;
    const isPremiumStar = ['QB', 'EDGE', 'OT', 'CB', 'WR'].includes(starPick.position);

    let summary = `The ${currentTeam.fullName} compiled a highly strategic draft class, yielding an overall draft efficiency score of ${overallScore}% (${finalGrade.letter}). `;
    
    // 1. Long-term vs short-term needs
    summary += `A heavy emphasis was placed on long-term sustainability (${longTermScore}% fit score) compared to quick-fix immediate needs (${immediateScore}% short-term score). By addressing long-term needs like ${longTermNeedsMet.length > 0 ? longTermNeedsMet.join(", ") : "future depth roster spots"}, this front office promotes a sustainable and robust development lifecycle rather than burning premium capital on immediate holes. `;

    // 2. Highlights & steals
    if (teamSteals.length > 0) {
      const bestSteal = teamSteals[0];
      summary += `Their crown jewel value pick is undoubtedly ${bestSteal.s.player.name} (${bestSteal.s.player.position} - ${bestSteal.s.player.school}) at pick ${bestSteal.s.pick.pickString}, which represents a massive consensus board steal of +${bestSteal.diff} slots. `;
    } else {
      summary += `They stuck strictly to their internal board projections, drafting high-character players like ${starPick.name} near their projected values. `;
    }

    // 3. Trade and Positional premium
    if (teamTrades.length > 0) {
      if (netTradeValue > 0) {
        summary += `At the Trade Desk, they exhibited masterclass negotiating, securing a net trade value advantage of +${netTradeValue} points on the OTC index. `;
      } else if (netTradeValue < 0) {
        summary += `Though they surrendered a net value margin of ${Math.abs(netTradeValue)} points in aggressive trade-ups, they successfully consolidated capital to land elite premium targets. `;
      }
    } else {
      summary += `This front office showed extreme board discipline by refraining from chaotic draft-day trade swings, preferring to let the natural flow of the board bring the value to them. `;
    }

    if (isPremiumStar) {
      summary += `Landing a premium position talent at ${starPick.position} with their lead selection gives them a foundational cornerstone for years to come.`;
    } else {
      summary += `Though their lead selection of ${starPick.name} at ${starPick.position} isn't at a standard premium-valued spot, his exceptional down-to-down grading profile makes him a plug-and-play starter.`;
    }

    return summary;
  };

  // Run server-side Gemini API if configured, otherwise default to smart rule summary
  const fetchAiSummary = async () => {
    setLoadingAi(true);
    setAiError('');
    setAiSummary('');

    try {
      const formattedPicks = teamSelections.map(s => ({
        pickString: s.pick.pickString,
        player: {
          name: s.player.name,
          position: s.player.position,
          school: s.player.school,
          overallGrade: s.player.overallGrade
        },
        grade: s.grade
      }));

      const response = await fetch('/api/gemini/generate-scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: teamSelections[0]?.player,
          expert: "Daniel Jeremiah (NFL Network)",
          targetTeam: currentTeam
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact server summary endpoint.");
      }

      const data = await response.json();
      if (data.comment) {
        // Build a highly realistic multi-paragraph report incorporating the Gemini expert feedback
        const geminiPart = data.comment;
        const baselineNarrative = generateRuleBasedSummary();
        setAiSummary(`${baselineNarrative}\n\n**Lead Analyst Perspective (DJ style):**\n"${geminiPart}"`);
      } else {
        setAiSummary(generateRuleBasedSummary());
      }
    } catch (err: any) {
      console.warn("Gemini draft report error, utilizing high-quality baseline summary:", err);
      setAiSummary(generateRuleBasedSummary());
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (teamSelections.length > 0) {
      fetchAiSummary();
    } else {
      setAiSummary("No selections recorded for this franchise.");
    }
  }, [selectedTeamId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-950 border-2 border-slate-800 rounded-none shadow-none overflow-hidden flex flex-col my-8 max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-500 animate-pulse" />
            <span className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wider">
              Draft Class Evaluation & Report Card
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-none border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Top Selection & Team Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest font-bold block">
                // Select Franchise Report Card
              </span>
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: currentTeam.logoColor }}></div>
                <h3 className="text-xl font-serif font-black italic text-slate-100">{currentTeam.fullName}</h3>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Review detailed grade scoring weighted for long-term roster health and draft-day trade value.
              </p>
            </div>

            {/* Franchise selector dropdown */}
            <div className="shrink-0">
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-100 rounded px-3.5 py-2 text-xs font-mono focus:border-emerald-500 w-full md:w-56"
              >
                {NFL_TEAMS.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.fullName} ({team.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {teamSelections.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl space-y-3">
              <AlertCircle className="w-9 h-9 text-slate-600 mx-auto animate-bounce" />
              <div className="font-serif font-bold italic text-slate-400">No Draft Choices Evaluated</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans">
                This team made no active selection picks during the simulated rounds. Change the franchise from the dropdown above to inspect another team.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Giant Grade and Roster Scores Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Score Card 1: Letter Grade */}
                <div className={`${finalGrade.bg} ${finalGrade.border} border rounded-xl p-6 flex flex-col justify-between items-center text-center relative overflow-hidden group`}>
                  <div className="absolute top-2 right-2 text-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-12 h-12" />
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                    Class Efficiency
                  </span>
                  
                  <div className="my-3 flex flex-col items-center">
                    <span className={`text-6xl md:text-7xl font-mono font-black ${finalGrade.color} tracking-tighter`}>
                      {finalGrade.letter}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      Score: {overallScore}%
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-serif font-bold italic text-slate-200 block">
                      {finalGrade.desc}
                    </span>
                    <span className="text-[9px] text-slate-500 font-sans block mt-0.5">
                      Based on 4-factor scoring
                    </span>
                  </div>
                </div>

                {/* Score Card 2: Strategic Score Breakdown Progress bars */}
                <div className="bg-slate-900/30 border border-slate-850 rounded-xl p-5 md:col-span-2 space-y-4">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex justify-between items-center">
                    <span>Strategic Matrix Evaluation</span>
                    <span className="text-[9px] text-slate-500 font-normal">Weights applied</span>
                  </h4>

                  <div className="space-y-3.5">
                    {/* Weight factor 1: Long term needs (40%) */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-mono">
                        <span className="text-slate-300 font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Long-Term Need Fit (40%)
                        </span>
                        <span className="text-emerald-400 font-extrabold">{longTermScore}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded overflow-hidden border border-slate-900">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-1000" 
                          style={{ width: `${longTermScore}%` }}
                        ></div>
                      </div>
                      <p className="text-[9px] text-slate-500 font-sans leading-relaxed">
                        Measures coverage of long-term roster needs (index 2-4 on team board). Heavily weighted to promote sustainable roster building.
                      </p>
                    </div>

                    {/* Weight factor 2: Year 1 Immediate needs (20%) */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-mono">
                        <span className="text-slate-300 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Immediate Impact Needs (20%)
                        </span>
                        <span className="text-blue-400 font-extrabold">{immediateScore}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded overflow-hidden border border-slate-900">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-1000" 
                          style={{ width: `${immediateScore}%` }}
                        ></div>
                      </div>
                      <p className="text-[9px] text-slate-500 font-sans leading-relaxed">
                        Measures coverage of immediate Year 1 roster needs (top 2 priorities on team board).
                      </p>
                    </div>

                    {/* Weight factor 3: Pick Placement Value (30%) */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-mono">
                        <span className="text-slate-300 font-bold flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Pick Placement Value (30%)
                        </span>
                        <span className="text-cyan-400 font-extrabold">{pickPlacementScore}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded overflow-hidden border border-slate-900">
                        <div 
                          className="bg-cyan-500 h-full transition-all duration-1000" 
                          style={{ width: `${pickPlacementScore}%` }}
                        ></div>
                      </div>
                      <p className="text-[9px] text-slate-500 font-sans leading-relaxed">
                        Evaluates capital optimization. Awards bonus points for drafting consensus "steals" and high-value premium roles (QB, EDGE, OT, CB, WR).
                      </p>
                    </div>

                    {/* Weight factor 4: Trade Efficiency (10%) */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-mono">
                        <span className="text-slate-300 font-bold flex items-center gap-1.5">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400" /> Trade Desk Efficiency (10%)
                        </span>
                        <span className="text-purple-400 font-extrabold">{tradeScore}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded overflow-hidden border border-slate-900">
                        <div 
                          className="bg-purple-500 h-full transition-all duration-1000" 
                          style={{ width: `${tradeScore}%` }}
                        ></div>
                      </div>
                      <p className="text-[9px] text-slate-500 font-sans leading-relaxed">
                        Calculates net value gained or lost based on OverTheCap trade values. Standard moves default to 85.
                      </p>
                    </div>

                  </div>
                </div>

              </div>

              {/* Roster Fit Analysis Table */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
                  <FileText className="w-4 h-4 text-emerald-500" /> Roster Integration & Value Mapping
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px] text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500 text-[9px] uppercase tracking-wider">
                        <th className="py-2.5 px-3">Pick</th>
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-3">Position</th>
                        <th className="py-2.5 px-3 text-center">Board Rank</th>
                        <th className="py-2.5 px-3 text-right">Value Difference</th>
                        <th className="py-2.5 px-3 text-center">Fit Tag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {teamSelections.map((sel, idx) => {
                        const boardRank = getPlayerBoardRank(sel.player.id);
                        const diff = sel.pick.pickNumber - boardRank;
                        const isPremium = ['QB', 'EDGE', 'OT', 'CB', 'WR'].includes(sel.player.position);
                        
                        const isImmediateFit = immediateNeeds.includes(sel.player.position);
                        const isLongTermFit = longTermNeeds.includes(sel.player.position);

                        let fitLabel = "Depth Fit";
                        let fitColor = "text-slate-400 bg-slate-900/50 border border-slate-850";

                        if (isImmediateFit) {
                          fitLabel = "Immediate Impact";
                          fitColor = "text-blue-400 bg-blue-500/5 border border-blue-500/10";
                        } else if (isLongTermFit) {
                          fitLabel = "Long-Term Fit";
                          fitColor = "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10";
                        } else if (isPremium) {
                          fitLabel = "Premium Role BPA";
                          fitColor = "text-purple-400 bg-purple-500/5 border border-purple-500/10";
                        }

                        return (
                          <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-400">{sel.pick.pickString}</td>
                            <td className="py-3 px-3">
                              <span className="font-serif font-bold italic text-slate-100 block">{sel.player.name}</span>
                              <span className="text-[10px] text-slate-500 font-sans block">{sel.player.school}</span>
                            </td>
                            <td className="py-3 px-3 font-extrabold">{sel.player.position}</td>
                            <td className="py-3 px-3 text-center font-bold text-slate-400">#{boardRank}</td>
                            <td className="py-3 px-3 text-right font-bold">
                              {diff > 4 ? (
                                <span className="text-emerald-500">+{diff} (Steal)</span>
                              ) : diff < -4 ? (
                                <span className="text-rose-500">{diff} (Reach)</span>
                              ) : (
                                <span className="text-slate-500">Par Value</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${fitColor}`}>
                                {fitLabel}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Trade desk efficiency summary cards */}
              {teamTrades.length > 0 && (
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowRightLeft className="w-4 h-4 text-emerald-500" /> Trade Desk Audit
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-900/30 p-3.5 border border-slate-850 rounded-lg space-y-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">Total Swaps Executed</span>
                      <span className="text-base font-mono font-black text-slate-100">{teamTrades.length} Trades</span>
                      <span className="text-[10px] text-slate-400 font-sans block">
                        Exchanged capital and pick rights on draft day
                      </span>
                    </div>

                    <div className="bg-slate-900/30 p-3.5 border border-slate-850 rounded-lg space-y-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">Net OTC Valuation Balance</span>
                      <span className={`text-base font-mono font-black ${netTradeValue >= 0 ? 'text-emerald-400' : 'text-slate-400'} block`}>
                        {netTradeValue >= 0 ? `+${netTradeValue}` : `${netTradeValue}`} Points
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans block">
                        {netTradeValue >= 0 
                          ? 'Gained value based on historical pick analytics' 
                          : 'Sacrificed value to consolidate premium targets'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Expert AI Commentary & Narrative summary */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" /> Executive Boardroom Narrative
                  </h4>
                  {loadingAi && <span className="text-[9px] font-mono text-emerald-400 animate-pulse uppercase">AI Analyzing...</span>}
                </div>

                {loadingAi ? (
                  <div className="space-y-2.5 py-4">
                    <div className="h-3 w-11/12 bg-slate-800/60 rounded animate-pulse"></div>
                    <div className="h-3 w-full bg-slate-800/60 rounded animate-pulse"></div>
                    <div className="h-3 w-10/12 bg-slate-800/60 rounded animate-pulse"></div>
                    <div className="h-3 w-9/12 bg-slate-800/60 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-3 whitespace-pre-line">
                    {aiSummary}
                  </div>
                )}
                
                <div className="bg-slate-950 p-3 border border-slate-850 rounded text-[10px] text-slate-500 flex items-start gap-2 leading-relaxed">
                  <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Scouting Advisory:</strong> Year 1 need assessment often results in short-sighted reach choices. By optimizing 40% of the grade toward long-term future slots, we incentivize building depth at premium positions to secure sustained franchise performance.
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-900 border-t border-slate-800 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 text-xs font-mono font-bold tracking-wider uppercase transition-all rounded-none"
          >
            Dismiss Report
          </button>
        </div>

      </div>
    </div>
  );
}
