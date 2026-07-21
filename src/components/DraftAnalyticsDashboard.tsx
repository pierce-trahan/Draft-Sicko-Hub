import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, Cell, ReferenceLine
} from 'recharts';
import { Player, Team } from '../types';
import { NFL_TEAMS, SCHEMES } from '../data/teams';
import { getOTCPickValue } from './DraftValueCalculator';
import { 
  BarChart3, PieChart, Sparkles, HelpCircle, 
  CheckCircle2, Info, TrendingUp, AlertCircle,
  Search, Filter, ArrowUpDown, Award, TrendingDown
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

interface DraftAnalyticsDashboardProps {
  players: Player[];
  draftPicks: DraftPick[];
  customTeamNeeds: Record<string, string[]>;
  draftSelections: DraftSelection[];
  boardSource: 'custom' | 'consensus';
  orderedPlayerIds: string[];
  roundsToSimulate: number;
  userControlledTeamId?: string;
}

interface FullPickSelection {
  pick: DraftPick;
  player: Player;
  isProjected: boolean;
  notes: string;
  grade: string;
  filledNeed: boolean;
}

export default function DraftAnalyticsDashboard({
  players,
  draftPicks,
  customTeamNeeds,
  draftSelections,
  boardSource,
  orderedPlayerIds,
  roundsToSimulate,
  userControlledTeamId = 'CHI'
}: DraftAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'positions' | 'needs' | 'teamFulfillment' | 'scouting' | 'valuePlot'>('positions');
  const [prospectScope, setProspectScope] = useState<'all' | 'available'>('all');
  const [dataSource, setDataSource] = useState<'all' | 'actual'>('all');
  
  // Need fulfillment searching, filtering, sorting states
  const [teamSearch, setTeamSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [teamSort, setTeamSort] = useState<'percentage' | 'alphabetical' | 'metCount'>('percentage');

  // Value Plot specific states
  const [valueTeamScope, setValueTeamScope] = useState<'all' | 'user'>('all');
  const [valueMetric, setValueMetric] = useState<'picks' | 'points'>('picks');
  
  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    visible: boolean;
    title: string;
    value: string;
    details?: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 325 });

  // Update dimensions based on container width
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({
          width: Math.max(320, width),
          height: 325
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 1. Get baseline player ordering (custom rank vs consensus)
  const getOrderedPlayersList = (): Player[] => {
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

  // 2. Perform in-memory projection for the rest of the draft
  const getFullDraftProjection = (): FullPickSelection[] => {
    const projection: FullPickSelection[] = [];
    const draftedIds = new Set<string>();

    // Step A: Populate with actual selections made so far
    draftSelections.forEach(sel => {
      const team = NFL_TEAMS.find(t => t.id === sel.pick.teamId);
      const teamNeeds = customTeamNeeds[sel.pick.teamId] || (team ? team.needs : []);
      
      const isTeamNeed = teamNeeds.includes(sel.player.position) || 
        (sel.player.position.includes('/') && sel.player.position.split('/').some(p => teamNeeds.includes(p)));

      projection.push({
        pick: sel.pick,
        player: sel.player,
        isProjected: false,
        notes: sel.notes,
        grade: sel.grade,
        filledNeed: isTeamNeed
      });
      draftedIds.add(sel.player.id);
    });

    // Step B: Simulate remaining picks in memory using same AI rules
    const orderedList = getOrderedPlayersList();
    let available = players.filter(p => !draftedIds.has(p.id));

    // Iterate through all draft picks starting from where we are
    for (let idx = draftSelections.length; idx < draftPicks.length; idx++) {
      const pick = draftPicks[idx];
      if (!pick || available.length === 0) break;

      const team = NFL_TEAMS.find(t => t.id === pick.teamId)!;
      const teamNeeds = customTeamNeeds[team.id] || team.needs;

      let bestPlayer = available[0];
      let bestScore = -99999;
      let selectedReason = "Best Player Available";

      available.forEach((player) => {
        let score = player.overallGrade;

        const boardIndex = orderedList.findIndex(p => p.id === player.id);
        if (boardIndex !== -1) {
          score += (orderedList.length - boardIndex) / orderedList.length * 8;
        }

        const needIndex = teamNeeds.indexOf(player.position);
        const isMultiMatch = player.position.includes('/') && player.position.split('/').some(p => teamNeeds.includes(p));
        
        let hasNeed = false;
        let needBonus = 0;

        if (needIndex !== -1) {
          hasNeed = true;
          needBonus = 18 - (needIndex * 2);
        } else if (isMultiMatch) {
          hasNeed = true;
          needBonus = 12;
        }

        score += needBonus;

        const teamSchemeObj = SCHEMES.find(s => s.name === team.currentScheme);
        if (teamSchemeObj && teamSchemeObj.favoredPositions.includes(player.position)) {
          score += 4;
        }

        const premiumPositions = ['QB', 'EDGE', 'OT', 'CB', 'WR'];
        if (premiumPositions.includes(player.position)) {
          score += (player.position === 'QB' && hasNeed) ? 6 : 2.5;
        }

        if (score > bestScore) {
          bestScore = score;
          bestPlayer = player;
          if (hasNeed) {
            selectedReason = `Addressed need at ${player.position}`;
          } else {
            selectedReason = `Best Player Available`;
          }
        }
      });

      // Grade simulated pick
      const boardRank = orderedList.findIndex(p => p.id === bestPlayer.id) + 1;
      let grade = "B";
      if (boardRank <= pick.pickNumber + 5) {
        grade = "A";
        if (boardRank < pick.pickNumber - 10) grade = "A+";
      } else if (boardRank > pick.pickNumber + 20) {
        grade = "C";
      }

      const teamNeedsCurrent = customTeamNeeds[pick.teamId] || team.needs;
      const filledNeed = teamNeedsCurrent.includes(bestPlayer.position) || 
        (bestPlayer.position.includes('/') && bestPlayer.position.split('/').some(p => teamNeedsCurrent.includes(p)));

      projection.push({
        pick,
        player: bestPlayer,
        isProjected: true,
        notes: `${selectedReason}. Projected draft choice.`,
        grade,
        filledNeed
      });

      // Remove drafted player
      available = available.filter(p => p.id !== bestPlayer.id);
    }

    return projection;
  };

  const fullProjection = getFullDraftProjection();
  const currentSelectionsCount = draftSelections.length;

  // Filter list based on whether user wants only active choices or projected full draft
  const activePicksToAnalyze = dataSource === 'actual' 
    ? fullProjection.filter(p => !p.isProjected)
    : fullProjection;

  // Sleeper/Value data computation
  const valueChartData = useMemo(() => {
    const orderedList = getOrderedPlayersList();
    
    return activePicksToAnalyze.map(item => {
      const boardIndex = orderedList.findIndex(p => p.id === item.player.id);
      const projectedSlot = boardIndex !== -1 ? boardIndex + 1 : item.pick.pickNumber;
      
      const actualPick = item.pick.pickNumber;
      const spentValue = getOTCPickValue(actualPick);
      const talentValue = getOTCPickValue(projectedSlot);
      const surplusValue = talentValue - spentValue;
      
      const team = NFL_TEAMS.find(t => t.id === item.pick.teamId);
      
      return {
        playerId: item.player.id,
        name: item.player.name,
        position: item.player.position,
        school: item.player.school,
        teamId: item.pick.teamId,
        teamName: team ? team.name : item.pick.teamId,
        actualPick,
        projectedSlot,
        spentValue,
        talentValue,
        surplusValue,
        isProjected: item.isProjected,
        isSleeper: surplusValue > 0,
        isReach: surplusValue < 0,
        grade: item.grade,
      };
    });
  }, [activePicksToAnalyze, players, boardSource, orderedPlayerIds]);

  // Filtered by selected team scope
  const filteredValueChartData = useMemo(() => {
    if (valueTeamScope === 'user') {
      return valueChartData.filter(item => item.teamId === userControlledTeamId);
    }
    return valueChartData;
  }, [valueChartData, valueTeamScope, userControlledTeamId]);

  const topSleepers = useMemo(() => {
    return [...filteredValueChartData]
      .filter(item => item.surplusValue > 0)
      .sort((a, b) => b.surplusValue - a.surplusValue)
      .slice(0, 5);
  }, [filteredValueChartData]);

  const topReaches = useMemo(() => {
    return [...filteredValueChartData]
      .filter(item => item.surplusValue < 0)
      .sort((a, b) => a.surplusValue - b.surplusValue)
      .slice(0, 5);
  }, [filteredValueChartData]);

  // Aggregates
  const valueAggregates = useMemo(() => {
    const count = filteredValueChartData.length;
    if (count === 0) return { totalSurplus: 0, avgSurplus: 0, sleepersCount: 0, reachesCount: 0 };
    
    const totalSurplus = filteredValueChartData.reduce((sum, item) => sum + item.surplusValue, 0);
    const avgSurplus = Math.round(totalSurplus / count);
    const sleepersCount = filteredValueChartData.filter(item => item.surplusValue > 0).length;
    const reachesCount = filteredValueChartData.filter(item => item.surplusValue < 0).length;
    
    return {
      totalSurplus,
      avgSurplus,
      sleepersCount,
      reachesCount
    };
  }, [filteredValueChartData]);

  // 3. Prepare data for the D3 Position Distribution Chart
  const positionsList = ['QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DT', 'LB', 'CB', 'S'];
  const positionColors: Record<string, string> = {
    QB: '#f59e0b',    // Gold
    RB: '#f43f5e',    // Rose
    WR: '#8b5cf6',    // Purple
    TE: '#ec4899',    // Pink
    OT: '#3b82f6',    // Blue
    IOL: '#60a5fa',   // Light Blue
    EDGE: '#10b981',  // Emerald
    DT: '#14b8a6',    // Teal
    LB: '#64748b',    // Slate
    CB: '#06b6d4',    // Cyan
    S: '#0284c7'      // Sky Blue
  };

  // Build rows per round
  const maxRound = Math.max(roundsToSimulate, ...draftPicks.map(p => p.round), 1);
  const positionChartData = Array.from({ length: maxRound }, (_, idx) => {
    const rNum = idx + 1;
    const row: any = { round: `Round ${rNum}`, roundNum: rNum };
    positionsList.forEach(pos => {
      row[pos] = 0;
    });
    return row;
  });

  activePicksToAnalyze.forEach(sel => {
    const rIdx = sel.pick.round - 1;
    if (rIdx >= 0 && rIdx < positionChartData.length) {
      const pos = sel.player.position;
      // Match high level positional categories or standard keys
      if (positionChartData[rIdx][pos] !== undefined) {
        positionChartData[rIdx][pos] += 1;
      } else {
        // Fallback for compound positions
        const matched = positionsList.find(p => pos.includes(p));
        if (matched) {
          positionChartData[rIdx][matched] += 1;
        } else {
          positionChartData[rIdx]['OT'] += 1; // absolute fallback
        }
      }
    }
  });

  // Calculate maximum height value for Position Stack
  const positionSeries = d3.stack<any, any>().keys(positionsList)(positionChartData as any[]);
  const maxPositionVal = d3.max(positionSeries, s => d3.max(s, d => d[1])) || 32;

  // 4. Prepare data for the D3 Need Fulfillment Chart
  const needKeys = ['needMet', 'bpa'];
  const needChartData = Array.from({ length: maxRound }, (_, idx) => {
    const rNum = idx + 1;
    return {
      round: `Round ${rNum}`,
      roundNum: rNum,
      needMet: 0,
      bpa: 0
    };
  });

  activePicksToAnalyze.forEach(sel => {
    const rIdx = sel.pick.round - 1;
    if (rIdx >= 0 && rIdx < needChartData.length) {
      if (sel.filledNeed) {
        needChartData[rIdx].needMet += 1;
      } else {
        needChartData[rIdx].bpa += 1;
      }
    }
  });

  const needSeries = d3.stack<any, any>().keys(needKeys)(needChartData as any[]);
  const maxNeedVal = d3.max(needSeries, s => d3.max(s, d => d[1])) || 32;

  // 5. SVG Render math coordinates (D3 scale utilities)
  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const plotWidth = dimensions.width - margin.left - margin.right;
  const plotHeight = dimensions.height - margin.top - margin.bottom;

  // X scale
  const xScale = d3.scaleBand()
    .domain(positionChartData.map(d => d.round))
    .range([0, plotWidth])
    .padding(0.35);

  // Y scale for positions
  const yScalePositions = d3.scaleLinear()
    .domain([0, maxPositionVal])
    .range([plotHeight, 0])
    .nice();

  // Y scale for needs
  const yScaleNeeds = d3.scaleLinear()
    .domain([0, maxNeedVal])
    .range([plotHeight, 0])
    .nice();

  // Handle bar interactivity
  const handleBarHover = (e: React.MouseEvent, title: string, value: string, details?: string) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setTooltip({
      x,
      y,
      visible: true,
      title,
      value,
      details
    });
  };

  const handleBarLeave = () => {
    setTooltip(null);
  };

  // Helper values for analytics widgets
  const totalAnalyzed = activePicksToAnalyze.length;
  const needsFilledCount = activePicksToAnalyze.filter(p => p.filledNeed).length;
  const alignmentRate = totalAnalyzed > 0 ? Math.round((needsFilledCount / totalAnalyzed) * 100) : 0;

  // Count top drafted positions
  const posCounts: Record<string, number> = {};
  activePicksToAnalyze.forEach(p => {
    posCounts[p.player.position] = (posCounts[p.player.position] || 0) + 1;
  });
  const topDraftedPos = Object.entries(posCounts).sort((a, b) => b[1] - a[1])[0] || ["None", 0];

  // Calculate fulfillment stats for all teams
  const teamFulfillmentData = NFL_TEAMS.map(team => {
    const teamNeeds = customTeamNeeds[team.id] || team.needs;
    const teamPicks = activePicksToAnalyze.filter(sel => sel.pick.teamId === team.id);
    
    const mappedNeeds = teamNeeds.map(need => {
      // Find if any of the team's picks match this need
      const matchingPick = teamPicks.find(sel => {
        const pos = sel.player.position;
        return pos === need || (pos.includes('/') && pos.split('/').some(p => p === need));
      });
      return {
        need,
        met: !!matchingPick,
        player: matchingPick ? matchingPick.player : null,
        pick: matchingPick ? matchingPick.pick : null
      };
    });

    const metCount = mappedNeeds.filter(n => n.met).length;
    const percentage = teamNeeds.length > 0 ? Math.round((metCount / teamNeeds.length) * 100) : 0;

    return {
      team,
      needs: mappedNeeds,
      metCount,
      totalCount: teamNeeds.length,
      percentage,
      picksCount: teamPicks.length
    };
  });

  // Filter and Sort Team Fulfillment Data
  const filteredTeams = teamFulfillmentData
    .filter(item => {
      const matchSearch = item.team.name.toLowerCase().includes(teamSearch.toLowerCase()) || 
        item.team.fullName.toLowerCase().includes(teamSearch.toLowerCase()) ||
        item.team.id.toLowerCase().includes(teamSearch.toLowerCase());
      
      const matchDivision = divisionFilter === 'all' || 
        item.team.division === divisionFilter || 
        (divisionFilter === 'AFC' && item.team.division.startsWith('AFC')) ||
        (divisionFilter === 'NFC' && item.team.division.startsWith('NFC'));
        
      return matchSearch && matchDivision;
    })
    .sort((a, b) => {
      if (teamSort === 'percentage') {
        if (b.percentage !== a.percentage) {
          return b.percentage - a.percentage;
        }
        return a.team.fullName.localeCompare(b.team.fullName); // Tie-breaker alphabetical
      } else if (teamSort === 'metCount') {
        if (b.metCount !== a.metCount) {
          return b.metCount - a.metCount;
        }
        return a.team.fullName.localeCompare(b.team.fullName);
      } else {
        return a.team.fullName.localeCompare(b.team.fullName);
      }
    });

  // 5.5. Prepare data for the Recharts Scouting Efficiency Chart
  const draftedPlayerIds = new Set(draftSelections.map(sel => sel.player.id));
  const playersToAnalyze = prospectScope === 'available'
    ? players.filter(p => !draftedPlayerIds.has(p.id))
    : players;

  const scoutingChartData = positionsList.map(pos => {
    const posPlayers = playersToAnalyze.filter(p => p.position === pos || p.position.includes(pos));
    
    const elite = posPlayers.filter(p => p.overallGrade >= 90).length;
    const day1 = posPlayers.filter(p => p.overallGrade >= 85 && p.overallGrade < 90).length;
    const day2 = posPlayers.filter(p => p.overallGrade >= 80 && p.overallGrade < 85).length;
    const dev = posPlayers.filter(p => p.overallGrade >= 75 && p.overallGrade < 80).length;
    const rotational = posPlayers.filter(p => p.overallGrade >= 65 && p.overallGrade < 75).length;
    const udfa = posPlayers.filter(p => p.overallGrade < 65).length;
    
    const total = posPlayers.length;
    const avgGrade = total > 0 
      ? Math.round(posPlayers.reduce((sum, p) => sum + p.overallGrade, 0) / total)
      : 0;

    return {
      position: pos,
      "Elite (90+)": elite,
      "Day 1 Starter (85-89)": day1,
      "Day 2 Starter (80-84)": day2,
      "Developmental (75-79)": dev,
      "Rotational (65-74)": rotational,
      "UDFA (<65)": udfa,
      total,
      avgGrade
    };
  });

  const positionDepthSummary = positionsList.map(pos => {
    const posPlayers = playersToAnalyze.filter(p => p.position === pos || p.position.includes(pos));
    const total = posPlayers.length;
    const starters = posPlayers.filter(p => p.overallGrade >= 80).length;
    const avgGrade = total > 0 
      ? Math.round(posPlayers.reduce((sum, p) => sum + p.overallGrade, 0) / total)
      : 0;

    let scarcity = "Extreme Scarcity";
    let scarcityColor = "text-red-400 bg-red-500/10 border-red-500/20";
    if (starters >= 6) {
      scarcity = "Deep Class";
      scarcityColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    } else if (starters >= 3) {
      scarcity = "Moderate Depth";
      scarcityColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
    } else if (starters >= 1) {
      scarcity = "Top-Heavy";
      scarcityColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    }

    return {
      position: pos,
      total,
      starters,
      avgGrade,
      scarcity,
      scarcityColor
    };
  }).sort((a, b) => b.starters - a.starters);

  return (
    <div className="space-y-6 flex flex-col h-full" ref={containerRef}>
      
      {/* Top Description bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-900/60 p-4 border border-slate-800 rounded">
        <div>
          <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest font-bold">// D3 Analytics Dashboard</span>
          <h4 className="text-sm font-serif font-bold text-slate-200">Needs-Aligned Selection Distributions</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Visualize the volume of positions taken per round and analyze how closely they align with custom team boards.
          </p>
        </div>

        {/* Data Source Toggle */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-950 p-1 border border-slate-800 rounded">
          <button
            type="button"
            onClick={() => setDataSource('all')}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase transition-all ${
              dataSource === 'all' 
                ? "bg-emerald-500 text-slate-950" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Projected Draft
          </button>
          <button
            type="button"
            onClick={() => setDataSource('actual')}
            disabled={currentSelectionsCount === 0}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase transition-all disabled:opacity-35 ${
              dataSource === 'actual' 
                ? "bg-emerald-500 text-slate-950" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Active Selections ({currentSelectionsCount})
          </button>
        </div>
      </div>

      {/* Analytics Summary Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/30 border border-slate-850 p-3 rounded flex items-center gap-3.5">
          <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Need Alignment Rate</span>
            <span className="text-lg font-mono font-black text-slate-100">{alignmentRate}%</span>
            <span className="text-[9px] text-slate-400 block font-sans">
              {needsFilledCount} of {totalAnalyzed} picks met a primary need
            </span>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-850 p-3 rounded flex items-center gap-3.5">
          <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Top Drafted Position</span>
            <span className="text-lg font-mono font-black text-slate-100">{topDraftedPos[0]}</span>
            <span className="text-[9px] text-slate-400 block font-sans">
              Drafted {topDraftedPos[1]} times in selected scopes
            </span>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-850 p-3 rounded flex items-center gap-3.5">
          <div className="w-10 h-10 rounded bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Scope Configuration</span>
            <span className="text-lg font-mono font-black text-slate-100">
              {dataSource === 'all' ? 'FULL PROJECTION' : 'REAL TIME LOG'}
            </span>
            <span className="text-[9px] text-slate-400 block font-sans">
              Round 1 - {roundsToSimulate} ({draftPicks.length} picks)
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Card Block */}
      <div className="bg-slate-950 border border-slate-850 p-4 relative flex flex-col min-h-0">
        
        {/* Chart View Tabs */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('positions')}
              className={`text-xs font-mono uppercase font-black flex items-center gap-1.5 pb-1.5 border-b-2 transition-all ${
                activeTab === 'positions' 
                  ? "text-emerald-400 border-emerald-500" 
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Positions Drafted
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('needs')}
              className={`text-xs font-mono uppercase font-black flex items-center gap-1.5 pb-1.5 border-b-2 transition-all ${
                activeTab === 'needs' 
                  ? "text-emerald-400 border-emerald-500" 
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              <PieChart className="w-3.5 h-3.5" /> Need Fulfillment Rate
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('teamFulfillment')}
              className={`text-xs font-mono uppercase font-black flex items-center gap-1.5 pb-1.5 border-b-2 transition-all ${
                activeTab === 'teamFulfillment' 
                  ? "text-emerald-400 border-emerald-500" 
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Team Need Fulfillment
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('scouting')}
              className={`text-xs font-mono uppercase font-black flex items-center gap-1.5 pb-1.5 border-b-2 transition-all ${
                activeTab === 'scouting' 
                  ? "text-emerald-400 border-emerald-500" 
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Scouting Efficiency
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('valuePlot')}
              className={`text-xs font-mono uppercase font-black flex items-center gap-1.5 pb-1.5 border-b-2 transition-all ${
                activeTab === 'valuePlot' 
                  ? "text-emerald-400 border-emerald-500" 
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Sleeper Value Plot
            </button>
          </div>
          <span className="text-[9px] text-slate-500 font-mono hidden sm:inline">D3 Interactive Graphics</span>
        </div>

        {totalAnalyzed === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center py-16 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-600 animate-bounce" />
            <span className="text-xs font-mono text-slate-500">No active selections recorded yet in simulator.</span>
            <span className="text-[10px] text-slate-600 max-w-sm">
              Press Resume in the main screen to make draft picks, or click "Projected Draft" above to view forecasted distributions.
            </span>
          </div>
        ) : (
          <div className="relative flex-1">
            {activeTab === 'scouting' ? (
              <div className="space-y-6 animate-fade-in">
                {/* Scouting Efficiency Header / Description & Scope Selector */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/40 p-3.5 border border-slate-850 rounded-lg">
                  <div>
                    <h5 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Class Grade Distribution & Depth Analytics
                    </h5>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Analyze the density of scout grades across all standard football positions. Use the scope filter to see real-time remaining class depth as prospects are drafted.
                    </p>
                  </div>

                  {/* Scope Selector Button Group */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-850 rounded shrink-0">
                    <button
                      type="button"
                      onClick={() => setProspectScope('all')}
                      className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-all ${
                        prospectScope === 'all'
                          ? "bg-emerald-500 text-slate-950"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Entire Class ({players.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProspectScope('available')}
                      className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-all ${
                        prospectScope === 'available'
                          ? "bg-emerald-500 text-slate-950"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Remaining Available ({players.length - draftedPlayerIds.size})
                    </button>
                  </div>
                </div>

                {/* The Stacked Bar Chart with Recharts */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Stacked Grade Distribution Chart
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Y-Axis: Prospect Count | X-Axis: Position
                    </span>
                  </div>

                  <div className="h-72 sm:h-80 md:h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={scoutingChartData}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(245, 240, 238, 0.08)" />
                        <XAxis 
                          dataKey="position" 
                          stroke="#9c8986" 
                          fontSize={10}
                          tickLine={false}
                          fontFamily="monospace"
                        />
                        <YAxis 
                          stroke="#9c8986" 
                          fontSize={10}
                          tickLine={false}
                          allowDecimals={false}
                          fontFamily="monospace"
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: '#1e1514', 
                            borderColor: 'rgba(245, 240, 238, 0.15)', 
                            borderRadius: '0.375rem' 
                          }}
                          labelStyle={{ color: '#ede8e6', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold' }}
                          itemStyle={{ fontFamily: 'monospace', fontSize: '11px', padding: '1px 0' }}
                          cursor={{ fill: 'rgba(245, 240, 238, 0.05)' }}
                        />
                        <Legend 
                          verticalAlign="top" 
                          height={36} 
                          iconType="circle"
                          wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingBottom: '12px' }}
                        />
                        <Bar name="Elite (90+)" dataKey="Elite (90+)" stackId="a" fill="#34d399" />
                        <Bar name="Day 1 Starter (85-89)" dataKey="Day 1 Starter (85-89)" stackId="a" fill="#38bdf8" />
                        <Bar name="Day 2 Starter (80-84)" dataKey="Day 2 Starter (80-84)" stackId="a" fill="#ff6f3c" />
                        <Bar name="Developmental (75-79)" dataKey="Developmental (75-79)" stackId="a" fill="#fb7185" />
                        <Bar name="Rotational (65-74)" dataKey="Rotational (65-74)" stackId="a" fill="#fbbf24" />
                        <Bar name="UDFA (<65)" dataKey="UDFA (<65)" stackId="a" fill="#64748b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Scouting Depth and Scarcity Metrics Table */}
                <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-lg space-y-3">
                  <div>
                    <h5 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Positional Depth Index
                    </h5>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Positions sorted by volume of Starter-grade talent (overall grade ≥ 80). Identifying these deep pools helps optimize trade-back maneuvers.
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-slate-850 rounded">
                    <table className="w-full text-left border-collapse text-[11px] font-mono">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 uppercase tracking-wider text-[9px]">
                          <th className="p-2.5">Position</th>
                          <th className="p-2.5 text-center">Starter Depth (≥80)</th>
                          <th className="p-2.5 text-center">Total Candidates</th>
                          <th className="p-2.5 text-center">Avg Class Grade</th>
                          <th className="p-2.5 text-right">Class Scarcity Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/60 bg-slate-950/20 text-slate-300">
                        {positionDepthSummary.map(row => (
                          <tr key={row.position} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-2.5 font-bold text-slate-100 flex items-center gap-1.5">
                              <span 
                                className="w-1.5 h-4 rounded-sm block" 
                                style={{ backgroundColor: positionColors[row.position] || '#475569' }}
                              />
                              {row.position}
                            </td>
                            <td className="p-2.5 text-center text-emerald-400 font-extrabold">{row.starters}</td>
                            <td className="p-2.5 text-center text-slate-400">{row.total}</td>
                            <td className="p-2.5 text-center font-bold">{row.avgGrade}</td>
                            <td className="p-2.5 text-right">
                              <span className={`inline-block px-2 py-0.5 rounded-none border text-[9px] uppercase font-bold ${row.scarcityColor}`}>
                                {row.scarcity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : activeTab === 'valuePlot' ? (
              <div className="space-y-6 animate-fade-in text-slate-200">
                {/* Header and Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/40 p-3.5 border border-slate-850 rounded-lg">
                  <div>
                    <h5 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Sleeper & Draft Capital Surplus Analytics
                    </h5>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Analyze drafted players against their projected big board positions using Fitzgerald-Spielberger (OTC) values to identify high-yield sleepers and reaches.
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Team Filter */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-850 rounded shrink-0">
                      <button
                        type="button"
                        onClick={() => setValueTeamScope('all')}
                        className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-all ${
                          valueTeamScope === 'all'
                            ? "bg-emerald-500 text-slate-950"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        All Teams
                      </button>
                      <button
                        type="button"
                        onClick={() => setValueTeamScope('user')}
                        className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-all ${
                          valueTeamScope === 'user'
                            ? "bg-emerald-500 text-slate-950"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        My Team ({userControlledTeamId})
                      </button>
                    </div>

                    {/* Chart Mode */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-850 rounded shrink-0">
                      <button
                        type="button"
                        onClick={() => setValueMetric('picks')}
                        className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-all ${
                          valueMetric === 'picks'
                            ? "bg-emerald-500 text-slate-950"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Slot Plot
                      </button>
                      <button
                        type="button"
                        onClick={() => setValueMetric('points')}
                        className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-all ${
                          valueMetric === 'points'
                            ? "bg-emerald-500 text-slate-950"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Capital Surplus
                      </button>
                    </div>
                  </div>
                </div>

                {/* Aggregates Banner */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-950 border border-slate-850 p-3 flex flex-col justify-between">
                    <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block">Analyzed Picks</span>
                    <span className="text-xl font-mono font-extrabold text-slate-200 mt-1">
                      {filteredValueChartData.length}
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-3 flex flex-col justify-between">
                    <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block">Total Value Surplus</span>
                    <span className={`text-xl font-mono font-extrabold mt-1 ${valueAggregates.totalSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {valueAggregates.totalSurplus >= 0 ? `+${valueAggregates.totalSurplus}` : valueAggregates.totalSurplus} pts
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-3 flex flex-col justify-between">
                    <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block">Avg Surplus / Pick</span>
                    <span className={`text-xl font-mono font-extrabold mt-1 ${valueAggregates.avgSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {valueAggregates.avgSurplus >= 0 ? `+${valueAggregates.avgSurplus}` : valueAggregates.avgSurplus} pts
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-3 flex flex-col justify-between">
                    <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block">Steals vs Reaches</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-mono text-emerald-400 font-bold">▲ {valueAggregates.sleepersCount}</span>
                      <span className="text-slate-600 font-mono">/</span>
                      <span className="text-sm font-mono text-rose-400 font-bold">▼ {valueAggregates.reachesCount}</span>
                    </div>
                  </div>
                </div>

                {/* Plot Area */}
                <div className="bg-slate-950 border border-slate-850 p-4 h-[350px] relative flex flex-col justify-center">
                  {filteredValueChartData.length === 0 ? (
                    <div className="text-center text-slate-500 font-mono text-xs">
                      No selections match the active filters in this run.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      {valueMetric === 'picks' ? (
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(245, 240, 238, 0.04)" />
                          <XAxis 
                            type="number" 
                            dataKey="projectedSlot" 
                            name="Projected Rank" 
                            domain={[1, 260]} 
                            stroke="rgba(245, 240, 238, 0.4)" 
                            fontSize={10}
                            fontFamily="monospace"
                            tickLine={false}
                          />
                          <YAxis 
                            type="number" 
                            dataKey="actualPick" 
                            name="Actual Pick" 
                            domain={[1, 260]} 
                            reversed
                            stroke="rgba(245, 240, 238, 0.4)" 
                            fontSize={10}
                            fontFamily="monospace"
                            tickLine={false}
                          />
                          <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }} 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const isSleeper = data.surplusValue > 0;
                                return (
                                  <div className="bg-slate-950 border border-slate-850 p-3 shadow-xl rounded-none space-y-1.5 font-mono text-xs max-w-xs text-slate-200">
                                    <div className="flex justify-between items-center border-b border-slate-800 pb-1 gap-4">
                                      <span className="font-bold text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-none">
                                        {data.teamId} • Pick {data.actualPick}
                                      </span>
                                      {data.isProjected && (
                                        <span className="text-[8px] bg-slate-850 text-slate-400 px-1 py-0.5 uppercase">
                                          Projected
                                        </span>
                                      )}
                                    </div>
                                    <p className="font-serif italic text-sm font-bold text-slate-100">
                                      {data.name} <span className="text-xs font-mono font-normal text-slate-400">({data.position})</span>
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      School: {data.school}
                                    </p>
                                    <div className="pt-1.5 border-t border-slate-800/50 space-y-1 text-[10px]">
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Projected Slot:</span>
                                        <span className="text-slate-300 font-bold">Pick #{data.projectedSlot}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Pick Cost Value:</span>
                                        <span className="text-slate-300">{data.spentValue} pts</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Player Talent Value:</span>
                                        <span className="text-slate-300">{data.talentValue} pts</span>
                                      </div>
                                      <div className="flex justify-between pt-1 border-t border-dashed border-slate-850">
                                        <span className="text-slate-400 font-bold">Draft Surplus:</span>
                                        <span className={`font-black ${isSleeper ? 'text-emerald-400' : 'text-rose-400'}`}>
                                          {data.surplusValue > 0 ? `+${data.surplusValue}` : data.surplusValue} pts
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <ReferenceLine 
                            segment={[{ x: 1, y: 1 }, { x: 260, y: 260 }]} 
                            stroke="#475569" 
                            strokeWidth={1.5}
                            strokeDasharray="4 4" 
                          />
                          <Scatter name="Players" data={filteredValueChartData}>
                            {filteredValueChartData.map((entry, index) => {
                              let pColor = '#64748b'; // normal
                              if (entry.surplusValue > 150) {
                                pColor = '#10b981'; // big steal
                              } else if (entry.surplusValue < -150) {
                                pColor = '#f43f5e'; // big reach
                              } else if (entry.surplusValue > 0) {
                                pColor = '#34d399'; // steal
                              } else if (entry.surplusValue < 0) {
                                pColor = '#fb7185'; // reach
                              }
                              return (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={pColor} 
                                  className="cursor-pointer hover:scale-125 transition-transform"
                                />
                              );
                            })}
                          </Scatter>
                        </ScatterChart>
                      ) : (
                        <BarChart
                          data={filteredValueChartData.sort((a, b) => a.actualPick - b.actualPick)}
                          margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(245, 240, 238, 0.04)" vertical={false} />
                          <XAxis 
                            dataKey="actualPick" 
                            stroke="rgba(245, 240, 238, 0.4)" 
                            fontSize={10}
                            fontFamily="monospace"
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="rgba(245, 240, 238, 0.4)" 
                            fontSize={10}
                            fontFamily="monospace"
                            tickLine={false}
                          />
                          <Tooltip
                            cursor={{ fill: 'rgba(255, 111, 60, 0.02)' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const isSleeper = data.surplusValue > 0;
                                return (
                                  <div className="bg-slate-950 border border-slate-800 p-3 shadow-xl rounded-none space-y-1.5 font-mono text-xs max-w-xs text-slate-200">
                                    <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                                      <span className="font-bold text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-none">
                                        Pick {data.actualPick} ({data.teamId})
                                      </span>
                                    </div>
                                    <p className="font-serif italic text-sm font-bold text-slate-100">
                                      {data.name} <span className="text-xs font-mono text-slate-400">({data.position})</span>
                                    </p>
                                    <div className="space-y-1 text-[10px] pt-1">
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Projected Slot:</span>
                                        <span className="text-slate-300">Pick #{data.projectedSlot}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400 font-bold">Surplus Value:</span>
                                        <span className={`font-black ${isSleeper ? 'text-emerald-400' : 'text-rose-400'}`}>
                                          {data.surplusValue > 0 ? `+${data.surplusValue}` : data.surplusValue} pts
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="surplusValue">
                            {filteredValueChartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.surplusValue > 0 ? '#10b981' : '#f43f5e'} 
                                opacity={0.8}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  )}
                  {filteredValueChartData.length > 0 && valueMetric === 'picks' && (
                    <div className="absolute bottom-2 right-2 flex gap-3 text-[9px] font-mono text-slate-500 bg-slate-950/80 px-2 py-1 border border-slate-850">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Major Steal
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" /> Steal
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fb7185]" /> Reach
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Major Reach
                      </span>
                    </div>
                  )}
                </div>

                {/* Side-by-Side Tables for Sleepers vs Reaches */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Top Sleepers */}
                  <div className="bg-slate-950 border border-slate-850 p-4 space-y-3">
                    <h6 className="text-xs font-mono font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" /> Top Value Sleepers
                    </h6>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] font-mono">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 text-[9px] uppercase">
                            <th className="pb-1.5 font-bold">Player</th>
                            <th className="pb-1.5 text-center font-bold">Projected</th>
                            <th className="pb-1.5 text-center font-bold">Actual Pick</th>
                            <th className="pb-1.5 text-right font-bold">Value Surplus</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {topSleepers.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-slate-600">No sleepers recorded yet.</td>
                            </tr>
                          ) : (
                            topSleepers.map(item => (
                              <tr key={item.playerId} className="hover:bg-slate-900/30 transition-colors">
                                <td className="py-2">
                                  <div className="font-bold text-slate-200">{item.name}</div>
                                  <div className="text-[10px] text-slate-500">{item.position} • {item.school}</div>
                                </td>
                                <td className="py-2 text-center text-slate-400 font-bold">#{item.projectedSlot}</td>
                                <td className="py-2 text-center font-bold text-slate-100 flex items-center justify-center gap-1">
                                  <span className="text-[10px] bg-slate-900 px-1 py-0.5 rounded text-emerald-400">{item.teamId}</span>
                                  <span>#{item.actualPick}</span>
                                </td>
                                <td className="py-2 text-right text-emerald-400 font-black">+{item.surplusValue} pts</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Top Reaches */}
                  <div className="bg-slate-950 border border-slate-850 p-4 space-y-3">
                    <h6 className="text-xs font-mono font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-rose-400" /> Top Reaches
                    </h6>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] font-mono">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 text-[9px] uppercase">
                            <th className="pb-1.5 font-bold">Player</th>
                            <th className="pb-1.5 text-center font-bold">Projected</th>
                            <th className="pb-1.5 text-center font-bold">Actual Pick</th>
                            <th className="pb-1.5 text-right font-bold">Value Deficit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {topReaches.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-slate-600">No reaches recorded yet.</td>
                            </tr>
                          ) : (
                            topReaches.map(item => (
                              <tr key={item.playerId} className="hover:bg-slate-900/30 transition-colors">
                                <td className="py-2">
                                  <div className="font-bold text-slate-200">{item.name}</div>
                                  <div className="text-[10px] text-slate-500">{item.position} • {item.school}</div>
                                </td>
                                <td className="py-2 text-center text-slate-400 font-bold">#{item.projectedSlot}</td>
                                <td className="py-2 text-center font-bold text-slate-100 flex items-center justify-center gap-1">
                                  <span className="text-[10px] bg-slate-900 px-1 py-0.5 rounded text-rose-400">{item.teamId}</span>
                                  <span>#{item.actualPick}</span>
                                </td>
                                <td className="py-2 text-right text-rose-400 font-black">{item.surplusValue} pts</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab !== 'teamFulfillment' ? (
              <>
                <svg 
                  width={dimensions.width} 
                  height={dimensions.height}
                  className="font-mono text-[9px] text-slate-400 overflow-visible"
                >
                  {/* Plot area background grid lines */}
                  <g transform={`translate(${margin.left}, ${margin.top})`}>
                    
                    {/* Horizontal reference grid lines */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      const val = activeTab === 'positions' 
                        ? Math.round((maxPositionVal / 4) * i)
                        : Math.round((maxNeedVal / 4) * i);
                      
                      const y = activeTab === 'positions' 
                        ? yScalePositions(val) 
                        : yScaleNeeds(val);
                      
                      return (
                        <g key={i}>
                          <line 
                            x1={0} 
                            y1={y} 
                            x2={plotWidth} 
                            y2={y} 
                            stroke="#1e293b" 
                            strokeWidth={1} 
                            strokeDasharray="2,2"
                          />
                          <text 
                            x={-8} 
                            y={y + 3} 
                            textAnchor="end" 
                            className="fill-slate-500"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* X Axis label tick marks */}
                    {positionChartData.map((d, idx) => {
                      const x = (xScale(d.round) || 0) + xScale.bandwidth() / 2;
                      return (
                        <g key={idx} transform={`translate(${x}, ${plotHeight + 14})`}>
                          <text textAnchor="middle" className="fill-slate-400 font-bold">
                            {d.round}
                          </text>
                        </g>
                      );
                    })}

                    {/* CHART RENDER: POSITIONS TAB */}
                    {activeTab === 'positions' && positionSeries.map((s) => {
                      const posKey = s.key;
                      const color = positionColors[posKey] || '#475569';
                      
                      return (
                        <g key={posKey} fill={color}>
                          {s.map((d, i) => {
                            const barX = xScale((d.data as any).round) || 0;
                            const y0 = yScalePositions(d[0]);
                            const y1 = yScalePositions(d[1]);
                            const barHeight = Math.max(0, y0 - y1);
                            const count = d[1] - d[0];

                            if (count === 0) return null;

                            return (
                              <rect
                                key={i}
                                x={barX}
                                y={y1}
                                width={xScale.bandwidth()}
                                height={barHeight}
                                className="transition-all duration-150 hover:brightness-125 cursor-pointer stroke-slate-950/40 stroke-1"
                                onMouseEnter={(e) => handleBarHover(e, 
                                  `${posKey} Selected`, 
                                  `${count} Prospect(s)`, 
                                  `${d.data.round} Distribution`
                                )}
                                onMouseMove={(e) => handleBarHover(e, 
                                  `${posKey} Selected`, 
                                  `${count} Prospect(s)`, 
                                  `${d.data.round} Distribution`
                                )}
                                onMouseLeave={handleBarLeave}
                              />
                            );
                          })}
                        </g>
                      );
                    })}

                    {/* CHART RENDER: NEEDS TAB */}
                    {activeTab === 'needs' && needSeries.map((s) => {
                      const needType = s.key;
                      const color = needType === 'needMet' ? '#10b981' : '#475569'; // Emerald vs Gray-Blue
                      const label = needType === 'needMet' ? 'Met Primary Need' : 'Best Player Available (BPA)';
                      
                      return (
                        <g key={needType} fill={color}>
                          {s.map((d, i) => {
                            const barX = xScale((d.data as any).round) || 0;
                            const y0 = yScaleNeeds(d[0]);
                            const y1 = yScaleNeeds(d[1]);
                            const barHeight = Math.max(0, y0 - y1);
                            const count = d[1] - d[0];

                            if (count === 0) return null;

                            return (
                              <rect
                                key={i}
                                x={barX}
                                y={y1}
                                width={xScale.bandwidth()}
                                height={barHeight}
                                className="transition-all duration-150 hover:brightness-110 cursor-pointer stroke-slate-950/40 stroke-1"
                                onMouseEnter={(e) => handleBarHover(e, 
                                  label, 
                                  `${count} Pick(s) (${Math.round((count / (d.data.needMet + d.data.bpa)) * 100)}%)`, 
                                  `${d.data.round} - Alignment Summary`
                                )}
                                onMouseMove={(e) => handleBarHover(e, 
                                  label, 
                                  `${count} Pick(s) (${Math.round((count / (d.data.needMet + d.data.bpa)) * 100)}%)`, 
                                  `${d.data.round} - Alignment Summary`
                                )}
                                onMouseLeave={handleBarLeave}
                              />
                            );
                          })}
                        </g>
                      );
                    })}
                  </g>
                </svg>

                {/* Custom Interactive Tooltip Element */}
                {tooltip && tooltip.visible && (
                  <div 
                    className="absolute z-50 bg-slate-900 border border-slate-750 text-slate-100 rounded p-2.5 shadow-xl pointer-events-none text-[10px] space-y-0.5"
                    style={{ 
                      left: tooltip.x + 12, 
                      top: tooltip.y - 12,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <div className="font-mono text-slate-400 text-[8px] uppercase tracking-wider">{tooltip.details}</div>
                    <div className="font-serif italic font-bold text-xs text-emerald-400">{tooltip.title}</div>
                    <div className="font-mono font-extrabold">{tooltip.value}</div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                {/* 1. Quick aggregate metrics banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-900/20 border border-slate-900 p-3.5 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-500 font-mono block text-[9px] uppercase tracking-wider">Average League Need Fulfillment</span>
                    <span className="text-base font-mono font-extrabold text-emerald-400">
                      {Math.round(teamFulfillmentData.reduce((acc, t) => acc + t.percentage, 0) / teamFulfillmentData.length)}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Average across all 32 teams</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono block text-[9px] uppercase tracking-wider">Total Needs Fulfilled</span>
                    <span className="text-base font-mono font-extrabold text-slate-200">
                      {teamFulfillmentData.reduce((acc, t) => acc + t.metCount, 0)} / {teamFulfillmentData.reduce((acc, t) => acc + t.totalCount, 0)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Active or projected draft spots</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono block text-[9px] uppercase tracking-wider">Fully Fulfilled Teams</span>
                    <span className="text-base font-mono font-extrabold text-blue-400">
                      {teamFulfillmentData.filter(t => t.percentage === 100).length} Teams
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Reached 100% need alignment</span>
                  </div>
                </div>

                {/* 2. Search, Filter, Sort toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800/80">
                  {/* Search box */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search teams by name or ID..."
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded pl-9 pr-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>

                  {/* Division filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <select
                      value={divisionFilter}
                      onChange={(e) => setDivisionFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">All Divisions</option>
                      <option value="AFC">AFC Conference</option>
                      <option value="NFC">NFC Conference</option>
                      <option value="AFC East">AFC East</option>
                      <option value="AFC North">AFC North</option>
                      <option value="AFC South">AFC South</option>
                      <option value="AFC West">AFC West</option>
                      <option value="NFC East">NFC East</option>
                      <option value="NFC North">NFC North</option>
                      <option value="NFC South">NFC South</option>
                      <option value="NFC West">NFC West</option>
                    </select>
                  </div>

                  {/* Sort order */}
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <select
                      value={teamSort}
                      onChange={(e) => setTeamSort(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    >
                      <option value="percentage">Highest % First</option>
                      <option value="metCount">Most Needs Met</option>
                      <option value="alphabetical">Alphabetical A-Z</option>
                    </select>
                  </div>
                </div>

                {/* 3. Grid of teams */}
                {filteredTeams.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                    <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-mono text-slate-400">No teams match your search or filter options.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTeams.map(({ team, needs, metCount, totalCount, percentage, picksCount }) => (
                      <div 
                        key={team.id}
                        className="bg-slate-900/30 border border-slate-850 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all duration-300 group"
                      >
                        {/* Card Header */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {/* Small color swatch instead of logo file */}
                              <span 
                                className="w-2.5 h-6 rounded-sm shrink-0 block" 
                                style={{ backgroundColor: team.logoColor }}
                              />
                              <div>
                                <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                                  {team.fullName} <span className="font-mono text-[9px] text-slate-500">({team.id})</span>
                                </h4>
                                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                                  {team.division}
                                </p>
                              </div>
                            </div>
                            
                            {/* Circular/Text Percent indicator */}
                            <div className="text-right">
                              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-none border ${
                                percentage === 100 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                percentage >= 60 ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                percentage >= 20 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                                'bg-slate-500/10 text-slate-400 border-slate-500/30'
                              }`}>
                                {percentage}%
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1 my-3">
                            <div className="flex justify-between text-[10px] font-mono text-slate-400">
                              <span>Fulfillment Progress</span>
                              <span className="font-bold text-slate-300">{metCount} of {totalCount} Met</span>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900 relative">
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: team.logoColor || '#10b981'
                                }}
                              />
                            </div>
                          </div>

                          {/* Mapping Picks to Needs list */}
                          <div className="space-y-2 mt-4 pt-3 border-t border-slate-800/40">
                            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                              Board Needs Mapping
                            </p>
                            <div className="space-y-1.5">
                              {needs.map(({ need, met, player, pick }) => (
                                <div 
                                  key={need}
                                  className={`flex items-center justify-between text-[11px] px-2 py-1 rounded transition-colors ${
                                    met 
                                      ? 'bg-emerald-500/5 border border-emerald-500/10 text-slate-200' 
                                      : 'bg-slate-950/20 border border-slate-900/60 text-slate-400'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-slate-600'}`} />
                                    <span className="font-mono font-bold text-slate-300">{need}</span>
                                  </div>

                                  <div className="text-right truncate max-w-[180px]">
                                    {met && player && pick ? (
                                      <span className="text-[10px] text-emerald-400 font-mono">
                                        {player.name} <span className="text-slate-500 text-[9px]">({pick.pickString})</span>
                                      </span>
                                    ) : (
                                      <span className="text-[9px] text-slate-600 font-mono italic">Unfulfilled</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Info */}
                        <div className="mt-4 pt-2.5 border-t border-slate-800/30 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>Total Picks: {picksCount}</span>
                          <span className="text-[9px] uppercase tracking-wide">Scheme: {team.currentScheme.split(' ')[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Dynamic Legend */}
        {totalAnalyzed > 0 && activeTab !== 'teamFulfillment' && activeTab !== 'scouting' && (
          <div className="mt-4 pt-3 border-t border-slate-900 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {activeTab === 'positions' ? (
              positionsList.map(pos => (
                <div key={pos} className="flex items-center gap-1.5 text-[9px] font-mono">
                  <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: positionColors[pos] }}></span>
                  <span className="text-slate-400 font-bold">{pos}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-[9px] font-mono">
                  <span className="w-2.5 h-2.5 shrink-0 bg-emerald-500"></span>
                  <span className="text-slate-400 font-bold">Met Team Primary Need</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono">
                  <span className="w-2.5 h-2.5 shrink-0 bg-[#475569]"></span>
                  <span className="text-slate-400 font-bold">BPA (Best Player Available)</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Insights Sidecard Grid Footer */}
      {totalAnalyzed > 0 && (
        <div className="bg-slate-900/10 border border-slate-850 p-4 rounded text-xs space-y-2.5">
          <h5 className="font-serif font-bold italic text-slate-200 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-500" /> Executive Boardroom Insights
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-400 leading-relaxed font-sans">
            <div className="space-y-1.5">
              <p>
                🏈 <strong className="text-slate-200 font-mono">Positional Trends:</strong> Team draft-picker simulations prioritise premium roles like <strong className="text-slate-300">QB, EDGE, OT, CB, WR</strong>. When teams have a primary need at quarterback, they are given an additional valuation weight, causing earlier runs at the position in Round 1.
              </p>
              <p>
                ⚖️ <strong className="text-slate-200 font-mono">Trade Impact:</strong> Exchanging capital at the Trade Desk shifts chronological pick rights. This allows user or AI franchises to jump positions in front of direct competitors to address high priority board needs before standard simulation.
              </p>
            </div>
            <div className="space-y-1.5">
              <p>
                📋 <strong className="text-slate-200 font-mono">Need Met Metrics:</strong> Across the mock board, {alignmentRate}% of selections matched configured needs. A higher percentage indicates teams are focusing heavily on drafting positions from their boards rather than settling for BPA value picks.
              </p>
              <p>
                💡 <strong className="text-slate-200 font-mono">Scouting Recommendation:</strong> Tweak custom needs under the <strong className="text-emerald-400">Team Needs</strong> tab in the configurator. The AI heuristic uses these lists on every simulation tick to guide picking behavior dynamically.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
