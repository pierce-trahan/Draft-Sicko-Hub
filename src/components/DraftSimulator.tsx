import React, { useState, useEffect, useRef } from 'react';
import { Player, Team, Scheme } from '../types';
import { NFL_TEAMS, SCHEMES } from '../data/teams';
import { getContrastColor } from '../utils/contrast';
import { 
  Trophy, Play, Pause, SkipForward, RotateCcw, 
  Search, SlidersHorizontal, ArrowRight, CheckCircle2, 
  Sparkles, Award, User, RefreshCw, Plus, Trash2, ArrowUpRight,
  ClipboardList, ArrowLeftRight, BarChart3, Share2, Copy, Download,
  Check, FileText, AlertTriangle, TrendingUp, Zap
} from 'lucide-react';
import DraftAnalyticsDashboard from './DraftAnalyticsDashboard';
import DraftGradeSummaryModal from './DraftGradeSummaryModal';
import DraftValueCalculator from './DraftValueCalculator';
import { LabelDef, getLabelClasses } from '../utils/labels';
import { selectCpuPick, getGmStrategySummary, getGmProfileForTeam } from '../utils/gmDraftStrategy';

interface DraftSimulatorProps {
  players: Player[];
  orderedPlayerIds: string[]; // User's active rankings order
  onSelectPlayer: (player: Player) => void;
  customLabels?: LabelDef[];
}

interface DraftPick {
  round: number;
  pickNumber: number; // Overall pick number
  teamId: string;
  pickString: string; // e.g. "1.1" or "1.10"
}

interface DraftSelection {
  pick: DraftPick;
  player: Player;
  grade: string; // Selection grade (A+, A, B, etc.)
  notes: string;
  gmName?: string; // Spec 06: the GM model that made a CPU pick (undefined for user picks)
}

// Fitzgerald-Spielberger / OverTheCap trade values
const OTC_POINTS: { pick: number; val: number }[] = [
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

const getOTCPickValue = (pickNumber: number): number => {
  if (pickNumber <= 1) return 3000;
  
  // Find exact anchor or interpolate
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

// Helper to get the original owner of a pick before any trades
const getOriginalOwnerOfPick = (pickNumber: number): string => {
  const originalTeam = NFL_TEAMS.find(team => 
    team.draftPicks.some(pickStr => {
      const [, pNum] = pickStr.split('.').map(Number);
      return pNum === pickNumber;
    })
  );
  return originalTeam ? originalTeam.id : 'None';
};

export default function DraftSimulator({ players, orderedPlayerIds, onSelectPlayer, customLabels = [] }: DraftSimulatorProps) {
  // Simulator configurations
  const [roundsToSimulate, setRoundsToSimulate] = useState<number>(1);
  const [userControlledTeamId, setUserControlledTeamId] = useState<string>('CHI'); // Default to Chicago Bears
  const [draftSpeed, setDraftSpeed] = useState<'instant' | 'fast' | 'normal' | 'slow'>('normal');
  const [boardSource, setBoardSource] = useState<'custom' | 'consensus'>('custom');

  // Spec 06: Chaos / GM realism factor (0.0 = deterministic BPA, 1.0 = high GM-flavored variance)
  const [chaosFactor, setChaosFactor] = useState<number>(0.2);
  
  // Custom draft team needs (copied from original team definition on setup, fully customizable!)
  const [customTeamNeeds, setCustomTeamNeeds] = useState<Record<string, string[]>>({});
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [newNeedPosition, setNewNeedPosition] = useState<string>('');

  // Simulation state
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([]);
  const [currentPickIndex, setCurrentPickIndex] = useState<number>(0);
  const [draftSelections, setDraftSelections] = useState<DraftSelection[]>([]);
  const [selectedPlayerForUserPick, setSelectedPlayerForUserPick] = useState<string>('');
  const [simStatus, setSimStatus] = useState<'setup' | 'running' | 'paused' | 'completed'>('setup');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [posFilter, setPosFilter] = useState<string>('ALL');

  // AI Summary state for teams
  const [aiComments, setAiComments] = useState<Record<string, string>>({});
  const [generatingAiTeam, setGeneratingAiTeam] = useState<string | null>(null);

  // Trade States
  const [tradeTeamA, setTradeTeamA] = useState<string>('CHI');
  const [tradeTeamB, setTradeTeamB] = useState<string>('GB');
  const [selectedPicksA, setSelectedPicksA] = useState<number[]>([]); // pickNumbers
  const [selectedPicksB, setSelectedPicksB] = useState<number[]>([]); // pickNumbers
  const [forceTrade, setForceTrade] = useState<boolean>(false);
  const [completedTrades, setCompletedTrades] = useState<{
    id: string;
    teamA: string;
    teamB: string;
    picksA: { pickString: string; pickNumber: number; value: number; originalOwnerId?: string }[];
    picksB: { pickString: string; pickNumber: number; value: number; originalOwnerId?: string }[];
    valueA: number;
    valueB: number;
    timestamp: string;
  }[]>([]);
  const [activeSetupTab, setActiveSetupTab] = useState<'needs' | 'trades' | 'analytics' | 'calculator'>('needs');
  const [activeLiveTab, setActiveLiveTab] = useState<'selections' | 'trades' | 'analytics' | 'calculator'>('selections');
  const [isGradeModalOpen, setIsGradeModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'rich' | 'condensed'>('rich');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Automatically trigger grade modal when draft concludes
  useEffect(() => {
    if (simStatus === 'completed') {
      setIsGradeModalOpen(true);
    }
  }, [simStatus]);

  // Keep Trade Team A synced with user franchise or default
  useEffect(() => {
    if (userControlledTeamId && userControlledTeamId !== 'none') {
      setTradeTeamA(userControlledTeamId);
    } else if (!tradeTeamA) {
      setTradeTeamA('CHI');
    }
  }, [userControlledTeamId]);

  // Keep trade partners distinct
  useEffect(() => {
    if (tradeTeamA === tradeTeamB) {
      const nextTeam = NFL_TEAMS.find(t => t.id !== tradeTeamA);
      if (nextTeam) {
        setTradeTeamB(nextTeam.id);
      }
    }
  }, [tradeTeamA]);

  // Interval Ref for timing
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize draft picks order and customizable needs
  useEffect(() => {
    // 1. Build draft picks list across selected rounds
    let picks: DraftPick[] = [];
    
    // We will extract picks for round 1 to roundsToSimulate
    NFL_TEAMS.forEach(team => {
      team.draftPicks.forEach(pickStr => {
        const [r, p] = pickStr.split('.').map(Number);
        if (r <= roundsToSimulate) {
          picks.push({
            round: r,
            pickNumber: p,
            teamId: team.id,
            pickString: pickStr
          });
        }
      });
    });

    // Sort picks chronologically
    picks.sort((a, b) => a.pickNumber - b.pickNumber);

    // Apply any completed trades dynamically
    completedTrades.forEach(trade => {
      const picksAToBIds = new Set(trade.picksA.map(p => p.pickNumber));
      const picksBToAIds = new Set(trade.picksB.map(p => p.pickNumber));

      picks = picks.map(p => {
        if (picksAToBIds.has(p.pickNumber)) {
          return { ...p, teamId: trade.teamB };
        }
        if (picksBToAIds.has(p.pickNumber)) {
          return { ...p, teamId: trade.teamA };
        }
        return p;
      });
    });

    setDraftPicks(picks);

    // 2. Build initial custom team needs
    const initialNeeds: Record<string, string[]> = {};
    NFL_TEAMS.forEach(team => {
      initialNeeds[team.id] = [...team.needs];
    });
    setCustomTeamNeeds(initialNeeds);
  }, [roundsToSimulate, completedTrades]);

  // Clean interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Determine sorted baseline rankings based on user's selected source
  const getOrderedPlayersList = (): Player[] => {
    if (boardSource === 'custom') {
      const playerMap = new Map(players.map(p => [p.id, p]));
      const ordered: Player[] = [];
      orderedPlayerIds.forEach(id => {
        const p = playerMap.get(id);
        if (p) ordered.push(p);
      });
      // Append any players missing from ordered ids
      players.forEach(p => {
        if (!ordered.some(op => op.id === p.id)) {
          ordered.push(p);
        }
      });
      return ordered;
    } else {
      // Consensus sorting: Overall grade descending
      return [...players].sort((a, b) => b.overallGrade - a.overallGrade);
    }
  };

  // Run the next step of simulation
  const simulateNextPick = () => {
    if (currentPickIndex >= draftPicks.length) {
      setSimStatus('completed');
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const currentPick = draftPicks[currentPickIndex];
    
    // Pause if this is the user-controlled team's turn and simulation is running
    if (currentPick.teamId === userControlledTeamId && userControlledTeamId !== 'none' && simStatus === 'running') {
      setSimStatus('paused');
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // AI logic picks a player
    const available = getAvailablePlayers();
    if (available.length === 0) {
      setSimStatus('completed');
      return;
    }

    const team = NFL_TEAMS.find(t => t.id === currentPick.teamId)!;
    const teamNeeds = customTeamNeeds[team.id] || team.needs;
    const orderedList = getOrderedPlayersList();

    // Spec 06 — GM-flavored CPU pick engine (value + need + GM position-by-round bias + athletic lean)
    const cpuResult = selectCpuPick(available, team, currentPick.round, teamNeeds, orderedList, chaosFactor);
    const bestPlayer = cpuResult.selectedPlayer;

    // Grade the selection
    // An 'A' if they picked a top need or high value. 'B' if solid value.
    const boardRank = orderedList.findIndex(p => p.id === bestPlayer.id) + 1;
    let grade = "B";
    if (boardRank <= currentPick.pickNumber + 5) {
      grade = "A";
      if (boardRank < currentPick.pickNumber - 10) grade = "A+";
    } else if (boardRank > currentPick.pickNumber + 20) {
      grade = "C";
    }

    const newSelection: DraftSelection = {
      pick: currentPick,
      player: bestPlayer,
      grade,
      notes: cpuResult.rationale,
      gmName: cpuResult.gmName,
    };

    setDraftSelections(prev => [...prev, newSelection]);
    setCurrentPickIndex(prev => prev + 1);

    // If it was the last pick, wrap up
    if (currentPickIndex + 1 >= draftPicks.length) {
      setSimStatus('completed');
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  // Handle user manual choice
  const executeUserPick = (player: Player) => {
    const currentPick = draftPicks[currentPickIndex];
    if (!currentPick) return;

    const orderedList = getOrderedPlayersList();
    const boardRank = orderedList.findIndex(p => p.id === player.id) + 1;
    
    // Evaluate pick grade
    let grade = "B";
    if (boardRank <= currentPick.pickNumber + 5) {
      grade = "A";
      if (boardRank < currentPick.pickNumber - 10) grade = "A+";
    } else if (boardRank > currentPick.pickNumber + 15) {
      grade = "C";
    }

    const team = NFL_TEAMS.find(t => t.id === currentPick.teamId)!;
    const teamNeeds = customTeamNeeds[team.id] || team.needs;
    const isNeed = teamNeeds.includes(player.position);

    const newSelection: DraftSelection = {
      pick: currentPick,
      player,
      grade,
      notes: isNeed 
        ? `User selected ${player.name} to fill priority team need: ${player.position}.` 
        : `User drafted Best Player Available: ${player.name}.`
    };

    setDraftSelections(prev => [...prev, newSelection]);
    setCurrentPickIndex(prev => prev + 1);
    setSelectedPlayerForUserPick('');

    // Auto resume if it was running previously
    if (currentPickIndex + 1 < draftPicks.length) {
      setSimStatus('running');
    } else {
      setSimStatus('completed');
    }
  };

  // Get list of unselected players
  const getAvailablePlayers = (): Player[] => {
    const selectedIds = new Set(draftSelections.map(s => s.player.id));
    return getOrderedPlayersList().filter(p => !selectedIds.has(p.id));
  };

  // Instant simulation helper to avoid infinite React state loops
  const simulateInstantDraft = () => {
    let localIndex = currentPickIndex;
    const newSelections = [...draftSelections];
    const selectedIds = new Set(newSelections.map(s => s.player.id));
    const orderedList = getOrderedPlayersList();

    let pausedForUser = false;

    while (localIndex < draftPicks.length) {
      const currentPick = draftPicks[localIndex];
      
      // Pause if this is the user-controlled team's turn and simulation is running
      if (currentPick.teamId === userControlledTeamId && userControlledTeamId !== 'none') {
        pausedForUser = true;
        break;
      }

      // Find available players
      const available = orderedList.filter(p => !selectedIds.has(p.id));
      if (available.length === 0) {
        break;
      }

      const team = NFL_TEAMS.find(t => t.id === currentPick.teamId)!;
      const teamNeeds = customTeamNeeds[team.id] || team.needs;

      // Spec 06 — GM-flavored CPU pick engine
      const cpuResult = selectCpuPick(available, team, currentPick.round, teamNeeds, orderedList, chaosFactor);
      const bestPlayer = cpuResult.selectedPlayer;

      // Grade the selection
      const boardRank = orderedList.findIndex(p => p.id === bestPlayer.id) + 1;
      let grade = "B";
      if (boardRank <= currentPick.pickNumber + 5) {
        grade = "A";
        if (boardRank < currentPick.pickNumber - 10) grade = "A+";
      } else if (boardRank > currentPick.pickNumber + 20) {
        grade = "C";
      }

      const newSelection: DraftSelection = {
        pick: currentPick,
        player: bestPlayer,
        grade,
        notes: cpuResult.rationale,
        gmName: cpuResult.gmName,
      };

      newSelections.push(newSelection);
      selectedIds.add(bestPlayer.id);
      localIndex++;
    }

    setDraftSelections(newSelections);
    setCurrentPickIndex(localIndex);

    if (localIndex >= draftPicks.length) {
      setSimStatus('completed');
    } else if (pausedForUser) {
      setSimStatus('paused');
    }
  };

  // Trigger auto simulator loop
  useEffect(() => {
    if (simStatus === 'running') {
      const delay = draftSpeed === 'slow' ? 2500 : draftSpeed === 'normal' ? 1200 : draftSpeed === 'fast' ? 400 : 0;
      
      if (delay === 0) {
        // Fast-simulate entire chunks synchronously to avoid React state batching crash
        simulateInstantDraft();
      } else {
        intervalRef.current = setInterval(() => {
          simulateNextPick();
        }, delay);
      }
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [simStatus, currentPickIndex, draftSpeed, userControlledTeamId, draftPicks, chaosFactor]);

  // Reset complete simulation
  const handleResetDraft = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDraftSelections([]);
    setCurrentPickIndex(0);
    setSimStatus('setup');
    setAiComments({});
    setCompletedTrades([]);
    setSelectedPicksA([]);
    setSelectedPicksB([]);
  };

  // Customize team needs methods
  const handleAddNeed = (teamId: string) => {
    if (!newNeedPosition) return;
    setCustomTeamNeeds(prev => ({
      ...prev,
      [teamId]: [...(prev[teamId] || []), newNeedPosition.toUpperCase()]
    }));
    setNewNeedPosition('');
  };

  const handleRemoveNeed = (teamId: string, indexToRemove: number) => {
    setCustomTeamNeeds(prev => ({
      ...prev,
      [teamId]: (prev[teamId] || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Calculate Draft Summary Grades for each franchise
  const calculateTeamDraftGrades = () => {
    const grades: Record<string, { grade: string; text: string; playersSelected: Player[] }> = {};
    
    NFL_TEAMS.forEach(team => {
      const teamPicks = draftSelections.filter(s => s.pick.teamId === team.id);
      const teamNeeds = customTeamNeeds[team.id] || team.needs;
      
      if (teamPicks.length === 0) {
        grades[team.id] = { grade: 'N/A', text: "No draft capital spent in simulated rounds.", playersSelected: [] };
        return;
      }

      // Check how many needs matched
      let needsAddressed = 0;
      let totalGradeScore = 0;
      
      teamPicks.forEach(pick => {
        if (teamNeeds.includes(pick.player.position)) {
          needsAddressed++;
        }
        totalGradeScore += pick.player.overallGrade;
      });

      const avgGrade = totalGradeScore / teamPicks.length;
      let gradeLetter = "B";

      if (avgGrade >= 92 && needsAddressed >= 1) gradeLetter = "A+";
      else if (avgGrade >= 88) gradeLetter = "A";
      else if (avgGrade >= 84) gradeLetter = "A-";
      else if (avgGrade >= 80) gradeLetter = "B+";
      else if (avgGrade >= 75) gradeLetter = "B";
      else if (avgGrade >= 70) gradeLetter = "C";
      else gradeLetter = "D";

      const primarySelection = teamPicks[0].player;
      const text = `Drafted ${teamPicks.length} players. Star pick: ${primarySelection.name} (${primarySelection.position}) overall. Addressed ${needsAddressed} key draft needs.`;

      grades[team.id] = {
        grade: gradeLetter,
        text,
        playersSelected: teamPicks.map(s => s.player)
      };
    });

    return grades;
  };

  // Generate detailed formatted mock draft text
  const generateMockDraftText = (): string => {
    if (draftSelections.length === 0) {
      return "No draft selections made yet.";
    }

    const sortedSelections = [...draftSelections].sort((a, b) => a.pick.pickNumber - b.pick.pickNumber);
    
    let text = `🏈 NFL MOCK DRAFT SIMULATION SUMMARY 🏈\n`;
    text += `Generated on: ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    text += `Board Source: ${boardSource === 'custom' ? 'User Custom Rankings' : 'NFL Consensus Board'}\n`;
    text += `Rounds Simulated: ${roundsToSimulate}\n`;
    if (userControlledTeamId !== 'none') {
      const userTeamName = NFL_TEAMS.find(t => t.id === userControlledTeamId)?.fullName || userControlledTeamId;
      text += `User Franchise: ${userTeamName} (${userControlledTeamId})\n`;
    }
    text += `==================================================\n\n`;

    let currentRound = 0;
    sortedSelections.forEach((selection) => {
      const pick = selection.pick;
      const team = NFL_TEAMS.find(t => t.id === pick.teamId);
      const teamName = team ? team.fullName : pick.teamId;
      
      if (pick.round !== currentRound) {
        currentRound = pick.round;
        text += `--- ROUND ${currentRound} ---\n`;
      }
      
      text += `Pick ${pick.pickString} | ${teamName} (${pick.teamId})\n`;
      text += `👉 ${selection.player.name} - ${selection.player.position} (${selection.player.school})\n`;
      text += `   Grade: ${selection.grade} | ${selection.notes}\n\n`;
    });

    if (completedTrades.length > 0) {
      text += `==================================================\n`;
      text += `🔄 COMPLETED TRADES (${completedTrades.length})\n`;
      text += `==================================================\n`;
      completedTrades.forEach((trade, idx) => {
        text += `Trade #${idx + 1}: ${trade.teamA} ↔ ${trade.teamB}\n`;
        if (trade.picksA.length > 0) {
          text += `  - Sent by ${trade.teamA}: ${trade.picksA.map(p => `Pick ${p.pickString}`).join(', ')}\n`;
        }
        if (trade.picksB.length > 0) {
          text += `  - Sent by ${trade.teamB}: ${trade.picksB.map(p => `Pick ${p.pickString}`).join(', ')}\n`;
        }
        text += `\n`;
      });
    }

    text += `==================================================\n`;
    text += `Simulated using NFL Draft Simulator v2.4\n`;
    
    return text;
  };

  // Generate condensed markdown list
  const generateCondensedMockDraftText = (): string => {
    if (draftSelections.length === 0) {
      return "No draft selections made yet.";
    }

    const sortedSelections = [...draftSelections].sort((a, b) => a.pick.pickNumber - b.pick.pickNumber);
    let text = `### 2026 NFL Mock Draft Summary\n\n`;
    
    let currentRound = 0;
    sortedSelections.forEach((selection) => {
      const pick = selection.pick;
      if (pick.round !== currentRound) {
        currentRound = pick.round;
        text += `**Round ${currentRound}**\n\n`;
      }
      text += `* **${pick.pickString} (${pick.teamId})**: ${selection.player.name}, ${selection.player.position} (${selection.player.school}) - *Grade: ${selection.grade}*\n`;
    });
    
    return text;
  };

  // Action: Copy to clipboard
  const handleCopyToClipboard = () => {
    const textToCopy = exportFormat === 'rich' ? generateMockDraftText() : generateCondensedMockDraftText();
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Action: Download text file
  const handleDownloadText = () => {
    const textToDownload = exportFormat === 'rich' ? generateMockDraftText() : generateCondensedMockDraftText();
    const element = document.createElement("a");
    const file = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Mock_Draft_Export_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Generate Gemini custom draft class recap
  const generateExpertCommentary = async (teamId: string) => {
    setGeneratingAiTeam(teamId);
    const team = NFL_TEAMS.find(t => t.id === teamId)!;
    const teamSelections = draftSelections.filter(s => s.pick.teamId === teamId);
    
    if (teamSelections.length === 0) {
      setGeneratingAiTeam(null);
      return;
    }

    try {
      const response = await fetch("/api/gemini/generate-scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player: teamSelections[0].player,
          expert: "Mel Kiper Jr. (ESPN)",
          targetTeam: team
        })
      });

      const data = await response.json();
      if (data.comment) {
        setAiComments(prev => ({
          ...prev,
          [teamId]: data.comment
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingAiTeam(null);
    }
  };

  const availablePlayers = getAvailablePlayers();
  const currentPick = draftPicks[currentPickIndex];
  const isUserOnClock = currentPick && currentPick.teamId === userControlledTeamId && userControlledTeamId !== 'none';
  const currentClockTeam = currentPick ? NFL_TEAMS.find(t => t.id === currentPick.teamId) : null;

  const renderTradeDesk = () => {
    const unselectedPicksA = draftPicks.filter(p => p.teamId === tradeTeamA && p.pickNumber > currentPickIndex);
    const unselectedPicksB = draftPicks.filter(p => p.teamId === tradeTeamB && p.pickNumber > currentPickIndex);

    const totalValueA = selectedPicksA.reduce((sum, num) => sum + getOTCPickValue(num), 0);
    const totalValueB = selectedPicksB.reduce((sum, num) => sum + getOTCPickValue(num), 0);

    const getTradeEvaluation = () => {
      if (selectedPicksA.length === 0 && selectedPicksB.length === 0) {
        return {
          status: 'pending',
          text: 'Select draft picks from both sides to evaluate a trade proposal.',
          canExecute: false,
          aiComment: 'Please select assets to trade.'
        };
      }
      if (selectedPicksA.length === 0 || selectedPicksB.length === 0) {
        return {
          status: 'pending',
          text: 'Both teams must trade at least one selection to formulate a swap.',
          canExecute: false,
          aiComment: 'A trade requires an exchange of assets.'
        };
      }

      const ratio = totalValueB > 0 ? (totalValueA / totalValueB) : 0;
      const diff = totalValueA - totalValueB;
      const teamBName = NFL_TEAMS.find(t => t.id === tradeTeamB)?.fullName || tradeTeamB;

      if (forceTrade) {
        return {
          status: 'accepted',
          text: `Commissioner Override Active. Trade will execute successfully. Deficit: ${diff >= 0 ? '+' : ''}${diff} pts.`,
          canExecute: true,
          aiComment: `[Commissioner Mode]: Approved by administrative authority.`
        };
      }

      if (diff >= 0) {
        return {
          status: 'accepted',
          text: `Trade Accepted! ${teamBName} gains surplus value (+${diff} pts).`,
          canExecute: true,
          aiComment: `"${teamBName} Front Office: We accept this trade proposal. We receive excellent valuation in this deal."`
        };
      }

      const pct = ratio * 100;
      if (pct >= 85) {
        return {
          status: 'accepted',
          text: `Trade Accepted! Deficit is within our acceptable 15% margin (${pct.toFixed(1)}% value match). Deficit: ${diff} pts.`,
          canExecute: true,
          aiComment: `"${teamBName} Front Office: We agree. The Fitzgerald-Spielberger points are close enough to proceed."`
        };
      } else if (pct >= 72) {
        return {
          status: 'hesitant',
          text: `Trade Declined. Deficit is slightly too high for our club (${pct.toFixed(1)}% value match). Deficit: ${diff} pts.`,
          canExecute: false,
          aiComment: `"${teamBName} Front Office: Close, but not quite. Throw in a mid-round pick or swap to sweeten the pot."`
        };
      } else {
        return {
          status: 'declined',
          text: `Trade Strongly Declined! Highly unbalanced proposal (${pct.toFixed(1)}% value match). Deficit: ${diff} pts.`,
          canExecute: false,
          aiComment: `"${teamBName} Front Office: Absolutely not. This does not meet our minimum trade value chart threshold."`
        };
      }
    };

    const evalRes = getTradeEvaluation();

    const handleExecuteTrade = () => {
      const picksToTradeA = draftPicks.filter(p => selectedPicksA.includes(p.pickNumber));
      const picksToTradeB = draftPicks.filter(p => selectedPicksB.includes(p.pickNumber));

      const newTrade = {
        id: "trade-" + Date.now().toString(36),
        teamA: tradeTeamA,
        teamB: tradeTeamB,
        picksA: picksToTradeA.map(p => ({
          pickString: p.pickString,
          pickNumber: p.pickNumber,
          value: getOTCPickValue(p.pickNumber),
          originalOwnerId: getOriginalOwnerOfPick(p.pickNumber)
        })),
        picksB: picksToTradeB.map(p => ({
          pickString: p.pickString,
          pickNumber: p.pickNumber,
          value: getOTCPickValue(p.pickNumber),
          originalOwnerId: getOriginalOwnerOfPick(p.pickNumber)
        })),
        valueA: totalValueA,
        valueB: totalValueB,
        timestamp: new Date().toLocaleString([], { 
          year: 'numeric', 
          month: 'short', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        })
      };

      setCompletedTrades(prev => [...prev, newTrade]);
      setSelectedPicksA([]);
      setSelectedPicksB([]);
    };

    return (
      <div className="space-y-5 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Propose swaps based on the <strong className="text-slate-300">OverTheCap (Fitzgerald-Spielberger) Trade Value model</strong>. Unselected picks are valued using an linear-interpolation curve.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Team A */}
            <div className="bg-slate-900 border border-slate-800 p-4 space-y-3 rounded-lg">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Team A (Proposer)</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{totalValueA} pts</span>
              </div>
              
              <select
                value={tradeTeamA}
                onChange={(e) => {
                  setTradeTeamA(e.target.value);
                  setSelectedPicksA([]);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-100 px-3 py-1.5 text-xs font-mono focus:border-slate-500 focus:outline-none"
              >
                {NFL_TEAMS.map(team => (
                  <option key={team.id} value={team.id}>{team.fullName} ({team.id})</option>
                ))}
              </select>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 border border-slate-800 bg-slate-950 p-2.5 rounded-lg">
                {unselectedPicksA.length === 0 ? (
                  <div className="text-center py-6 text-[11px] font-mono text-slate-600 italic">
                    No unselected picks available
                  </div>
                ) : (
                  unselectedPicksA.map(pick => {
                    const isChecked = selectedPicksA.includes(pick.pickNumber);
                    const pVal = getOTCPickValue(pick.pickNumber);
                    return (
                      <label 
                        key={pick.pickNumber} 
                        className={`flex items-center justify-between p-1.5 text-xs font-mono text-slate-300 rounded cursor-pointer transition-all hover:bg-slate-900 ${
                          isChecked ? "bg-slate-900 text-emerald-400" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedPicksA(prev => 
                                isChecked ? prev.filter(n => n !== pick.pickNumber) : [...prev, pick.pickNumber]
                              );
                            }}
                            className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                          />
                          <span>Pick {pick.pickString}</span>
                        </div>
                        <span className="text-slate-500 text-[10px]">{pVal} pts</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Team B */}
            <div className="bg-slate-900 border border-slate-800 p-4 space-y-3 rounded-lg">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Team B (Partner)</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{totalValueB} pts</span>
              </div>
              
              <select
                value={tradeTeamB}
                onChange={(e) => {
                  setTradeTeamB(e.target.value);
                  setSelectedPicksB([]);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-100 px-3 py-1.5 text-xs font-mono focus:border-slate-500 focus:outline-none"
              >
                {NFL_TEAMS.map(team => (
                  <option key={team.id} value={team.id} disabled={team.id === tradeTeamA}>{team.fullName} ({team.id})</option>
                ))}
              </select>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 border border-slate-800 bg-slate-950 p-2.5 rounded-lg">
                {unselectedPicksB.length === 0 ? (
                  <div className="text-center py-6 text-[11px] font-mono text-slate-600 italic">
                    No unselected picks available
                  </div>
                ) : (
                  unselectedPicksB.map(pick => {
                    const isChecked = selectedPicksB.includes(pick.pickNumber);
                    const pVal = getOTCPickValue(pick.pickNumber);
                    return (
                      <label 
                        key={pick.pickNumber} 
                        className={`flex items-center justify-between p-1.5 text-xs font-mono text-slate-300 rounded cursor-pointer transition-all hover:bg-slate-900 ${
                          isChecked ? "bg-slate-900 text-emerald-400" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedPicksB(prev => 
                                isChecked ? prev.filter(n => n !== pick.pickNumber) : [...prev, pick.pickNumber]
                              );
                            }}
                            className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                          />
                          <span>Pick {pick.pickString}</span>
                        </div>
                        <span className="text-slate-500 text-[10px]">{pVal} pts</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Evaluation Panel */}
          <div className={`p-4 border-2 rounded-lg space-y-2 font-mono ${
            evalRes.status === 'accepted' 
              ? "border-emerald-500/30 bg-emerald-950/10 text-emerald-400"
              : evalRes.status === 'hesitant'
                ? "border-amber-500/30 bg-amber-950/10 text-amber-400"
                : "border-slate-850 bg-slate-900/40 text-slate-400"
          }`}>
            <div className="flex justify-between items-center text-xs font-bold border-b border-slate-800 pb-1.5">
              <span>PROPOSAL STATUS: <span className="uppercase font-black">{evalRes.status}</span></span>
              <span>
                {selectedPicksA.length > 0 && selectedPicksB.length > 0 && (
                  `Diff: ${totalValueA - totalValueB >= 0 ? '+' : ''}${totalValueA - totalValueB} pts`
                )}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">{evalRes.text}</p>
            {evalRes.aiComment && (
              <p className="text-[11px] leading-relaxed italic text-slate-500 mt-1">{evalRes.aiComment}</p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-4 pt-3 border-t border-slate-900">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-mono text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={forceTrade}
                onChange={(e) => setForceTrade(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0"
              />
              <span>Force Trade (Commissioner Mode)</span>
            </label>

            <button
              onClick={() => {
                setSelectedPicksA([]);
                setSelectedPicksB([]);
              }}
              className="text-[10px] font-mono text-slate-500 hover:text-slate-300 uppercase tracking-wider"
            >
              Reset Selection
            </button>
          </div>

          <button
            onClick={handleExecuteTrade}
            disabled={!evalRes.canExecute}
            className={`w-full py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all rounded-lg border flex items-center justify-center gap-2 ${
              evalRes.canExecute
                ? "bg-emerald-500 hover:bg-emerald-600 text-white dark:text-slate-950 border-slate-800 shadow-lg"
                : "bg-slate-900 text-slate-500 border-slate-800/85 cursor-not-allowed"
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" /> Execute & Swap Capital
          </button>

          {/* Trade History */}
          {completedTrades.length > 0 && (
            <div className="space-y-3 border-t border-slate-900 pt-4 mt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-emerald-500" /> Trade History ({completedTrades.length} Swaps)
                </h4>
                <span className="text-[9px] font-mono text-slate-600">Scrollable Log</span>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {[...completedTrades].reverse().map((trade) => {
                  const teamAData = NFL_TEAMS.find(t => t.id === trade.teamA);
                  const teamBData = NFL_TEAMS.find(t => t.id === trade.teamB);

                  return (
                    <div key={trade.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-lg flex flex-col gap-2.5 text-xs font-mono hover:border-slate-800 transition-all">
                      {/* Trade Meta / Header */}
                      <div className="flex justify-between items-start border-b border-slate-900 pb-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[13px]" style={{ color: teamAData?.logoColor || '#38bdf8' }}>{trade.teamA}</span>
                            <span className="text-slate-600 font-bold">↔</span>
                            <span className="font-extrabold text-[13px]" style={{ color: teamBData?.logoColor || '#60a5fa' }}>{trade.teamB}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            Date/Time: {trade.timestamp}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setCompletedTrades(prev => prev.filter(t => t.id !== trade.id));
                          }}
                          className="p-1.5 text-red-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-all"
                          title="Undo / Remove Trade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Assets Exchanged */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* Sent by A */}
                        <div className="space-y-1.5 bg-slate-900/30 p-2 rounded border border-slate-900/60">
                          <div className="flex justify-between items-center border-b border-slate-850 pb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Sent by {trade.teamA}</span>
                            <span className="text-[10px] text-slate-500 font-bold">{trade.valueA} pts</span>
                          </div>
                          {trade.picksA.length === 0 ? (
                            <div className="text-[10px] text-slate-600 italic">No assets sent</div>
                          ) : (
                            <ul className="space-y-1">
                              {trade.picksA.map(p => {
                                const origOwner = p.originalOwnerId || getOriginalOwnerOfPick(p.pickNumber);
                                const origTeam = NFL_TEAMS.find(t => t.id === origOwner);
                                return (
                                  <li key={p.pickNumber} className="flex items-center justify-between text-[11px] hover:bg-slate-900/50 p-0.5 rounded transition-colors">
                                    <span className="text-slate-200 font-bold">Pick {p.pickString}</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-slate-500 text-[10px]">{p.value} pts</span>
                                      <span className="text-[9px] text-slate-600">Orig:</span>
                                      <span className={`px-1 text-[9px] rounded font-bold scale-95 ${getContrastColor(origTeam?.logoColor)}`} style={{ backgroundColor: origTeam?.logoColor || '#334155' }} title={origTeam?.fullName}>
                                        {origOwner}
                                      </span>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>

                        {/* Sent by B */}
                        <div className="space-y-1.5 bg-slate-900/30 p-2 rounded border border-slate-900/60">
                          <div className="flex justify-between items-center border-b border-slate-850 pb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Sent by {trade.teamB}</span>
                            <span className="text-[10px] text-slate-500 font-bold">{trade.valueB} pts</span>
                          </div>
                          {trade.picksB.length === 0 ? (
                            <div className="text-[10px] text-slate-600 italic">No assets sent</div>
                          ) : (
                            <ul className="space-y-1">
                              {trade.picksB.map(p => {
                                const origOwner = p.originalOwnerId || getOriginalOwnerOfPick(p.pickNumber);
                                const origTeam = NFL_TEAMS.find(t => t.id === origOwner);
                                return (
                                  <li key={p.pickNumber} className="flex items-center justify-between text-[11px] hover:bg-slate-900/50 p-0.5 rounded transition-colors">
                                    <span className="text-slate-200 font-bold">Pick {p.pickString}</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-slate-500 text-[10px]">{p.value} pts</span>
                                      <span className="text-[9px] text-slate-600">Orig:</span>
                                      <span className={`px-1 text-[9px] rounded font-bold scale-95 ${getContrastColor(origTeam?.logoColor)}`} style={{ backgroundColor: origTeam?.logoColor || '#334155' }} title={origTeam?.fullName}>
                                        {origOwner}
                                      </span>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Trade Summary Valuation Footer */}
                      <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-1.5">
                        <span>Valuation Discrepancy:</span>
                        <span className={Math.abs(trade.valueA - trade.valueB) === 0 ? 'text-slate-400' : (trade.valueA > trade.valueB ? 'text-blue-400' : 'text-emerald-400')}>
                          {trade.valueA - trade.valueB > 0 
                            ? `+${trade.valueA - trade.valueB} pts to ${trade.teamB}`
                            : trade.valueA - trade.valueB < 0
                              ? `+${Math.abs(trade.valueA - trade.valueB)} pts to ${trade.teamA}`
                              : 'Even Value Swap'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Filter available list for UI
  const filteredAvailable = availablePlayers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.school.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPos = posFilter === 'ALL' || p.position === posFilter || p.position.includes(posFilter);
    return matchesSearch && matchesPos;
  });

  return (
    <div className="space-y-6">
      
      {/* Simulation Header banner */}
      <div className="bg-slate-900 border-2 border-slate-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-500" />
            <span className="text-[10px] uppercase font-bold font-mono text-slate-400 tracking-wider">War Room Modules</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold italic text-slate-100">NFL Draft Simulator v2.4</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Model professional war rooms. Setup simulation rules, customize individual team boards, assign priorities, and watch AI or manual logic draft real prospects.
          </p>
        </div>

        {simStatus !== 'setup' && (
          <div className="flex flex-wrap gap-2">
            {draftSelections.length > 0 && (
              <button 
                onClick={() => setIsExportModalOpen(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-none text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <Share2 className="w-4 h-4" /> Export Mock Draft
              </button>
            )}
            <button 
              onClick={handleResetDraft}
              className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-none text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Reset Simulator
            </button>
          </div>
        )}
      </div>

      {/* SETUP PHASE VIEW */}
      {simStatus === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Settings panel */}
          <div className="bg-slate-950 border-2 border-slate-800 p-5 md:p-6 space-y-5 rounded-none lg:col-span-1">
            <h2 className="text-lg font-serif font-bold italic border-b border-slate-800 pb-2 text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-500" /> Simulation Rules
            </h2>

            <div className="space-y-4">
              {/* Rounds count */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 font-mono uppercase">Draft Capital depth</label>
                <select
                  value={roundsToSimulate}
                  onChange={(e) => setRoundsToSimulate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded px-3 py-2 text-xs font-mono focus:border-emerald-500"
                >
                  <option value={1}>Round 1 Only (32 Picks)</option>
                  <option value={2}>Rounds 1 - 2 (64 Picks)</option>
                  <option value={3}>Rounds 1 - 3 (96 Picks)</option>
                  <option value={4}>Rounds 1 - 4 (128 Picks)</option>
                  <option value={5}>Rounds 1 - 5 (160 Picks)</option>
                </select>
              </div>

              {/* User controlled franchise */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 font-mono uppercase">Your Franchise Board</label>
                <select
                  value={userControlledTeamId}
                  onChange={(e) => setUserControlledTeamId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded px-3 py-2 text-xs font-mono focus:border-emerald-500"
                >
                  <option value="none">Fully Automated AI Simulation (None)</option>
                  {NFL_TEAMS.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.fullName} ({team.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Draft speed */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 font-mono uppercase">Simulation Velocity</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['instant', 'fast', 'normal', 'slow'] as const).map(speed => (
                    <button
                      key={speed}
                      onClick={() => setDraftSpeed(speed)}
                      className={`py-1.5 border font-mono text-[9px] uppercase font-bold text-center ${
                        draftSpeed === speed
                          ? "bg-emerald-500/20 border-slate-800 text-emerald-400"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>

              {/* Board baseline */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 font-mono uppercase">Big Board Source Priority</label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setBoardSource('custom')}
                    className={`py-2 border font-mono text-[10px] font-bold text-center ${
                      boardSource === 'custom'
                        ? "bg-emerald-500/20 border-slate-800 text-emerald-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    Custom User Rankings
                  </button>
                  <button
                    onClick={() => setBoardSource('consensus')}
                    className={`py-2 border font-mono text-[10px] font-bold text-center ${
                      boardSource === 'consensus'
                        ? "bg-emerald-500/20 border-slate-800 text-emerald-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    NFL Consensus Board
                  </button>
                </div>
              </div>

              {/* Spec 06: GM Chaos / Realism factor */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-400 font-mono uppercase">GM Chaos / Realism</label>
                  <span className="text-[10px] font-mono font-bold text-emerald-400">{Math.round(chaosFactor * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={chaosFactor}
                  onChange={(e) => setChaosFactor(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 cursor-pointer"
                />
                <span className="text-[9px] text-slate-500 font-mono block">
                  {chaosFactor <= 0.1
                    ? 'Deterministic — pure board/need value'
                    : chaosFactor <= 0.4
                    ? 'Balanced — historical GM tendencies'
                    : 'High draft-day chaos / variance'}
                </span>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setSimStatus('running')}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white dark:text-slate-950 rounded-none font-serif italic font-bold text-sm tracking-wide flex items-center justify-center gap-1.5 border border-slate-800 transition-all shadow"
                >
                  <Play className="w-4 h-4 fill-white" /> Begin Draft Room Simulation
                </button>
              </div>
            </div>
          </div>

          {/* Setup Tabs: Team Needs & Trades */}
          <div className="bg-slate-950 border-2 border-slate-800 p-5 md:p-6 space-y-4 rounded-none lg:col-span-2 flex flex-col min-h-[550px]">
            <div className="flex border-b border-slate-800 pb-3 justify-between items-center shrink-0">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setActiveSetupTab('needs')}
                  className={`text-sm font-mono font-bold uppercase flex items-center gap-2 transition-all pb-1.5 border-b-2 ${
                    activeSetupTab === 'needs' 
                      ? "text-emerald-400 border-emerald-500" 
                      : "text-slate-500 border-transparent hover:text-slate-300"
                  }`}
                >
                  <Award className="w-4 h-4 text-emerald-500" /> Team Needs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSetupTab('trades')}
                  className={`text-sm font-mono font-bold uppercase flex items-center gap-2 transition-all pb-1.5 border-b-2 ${
                    activeSetupTab === 'trades' 
                      ? "text-emerald-400 border-emerald-500" 
                      : "text-slate-500 border-transparent hover:text-slate-300"
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4 text-emerald-500" /> Trade Desk
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSetupTab('analytics')}
                  className={`text-sm font-mono font-bold uppercase flex items-center gap-2 transition-all pb-1.5 border-b-2 ${
                    activeSetupTab === 'analytics' 
                      ? "text-emerald-400 border-emerald-500" 
                      : "text-slate-500 border-transparent hover:text-slate-300"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-emerald-500" /> Analytics Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSetupTab('calculator')}
                  className={`text-sm font-mono font-bold uppercase flex items-center gap-2 transition-all pb-1.5 border-b-2 ${
                    activeSetupTab === 'calculator' 
                      ? "text-emerald-400 border-emerald-500" 
                      : "text-slate-500 border-transparent hover:text-slate-300"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Value Calculator
                </button>
              </div>
              <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest hidden sm:inline">War Room Configurator</span>
            </div>

            {activeSetupTab === 'needs' ? (
              <div className="flex-1 flex flex-col min-h-0">
                <p className="text-xs text-slate-400 mb-3">
                  Tweak team needs before running the simulation to guide the AI draft-choice algorithm.
                </p>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[380px]">
                  {NFL_TEAMS.map(team => {
                    const needs = customTeamNeeds[team.id] || team.needs;
                    const isEditing = editingTeamId === team.id;
                    
                    return (
                      <div key={team.id} className="border border-slate-800 bg-slate-900/40 p-2.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-10 shrink-0" style={{ backgroundColor: team.logoColor }}></div>
                          <div>
                            <span className="text-xs font-mono font-extrabold text-slate-100">{team.id}</span>
                            <span className="text-[11px] text-slate-400 block font-serif italic leading-none">{team.fullName}</span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-wrap gap-1 items-center justify-start max-w-xl pl-4">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                placeholder="POS"
                                value={newNeedPosition}
                                onChange={(e) => setNewNeedPosition(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-xs px-2 py-1 max-w-[80px] font-mono text-center uppercase"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddNeed(team.id)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white dark:text-slate-950 px-2 py-1 text-xs font-bold rounded"
                              >
                                Add
                              </button>
                            </div>
                          ) : null}

                          {needs.map((need, idx) => (
                            <span 
                              key={`${need}-${idx}`}
                              className="group text-[9px] font-mono font-bold bg-slate-950 border border-slate-800 px-2 py-0.5 text-slate-300 flex items-center gap-1.5 rounded"
                            >
                              {need}
                              {isEditing && (
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveNeed(team.id, idx)}
                                  className="text-red-500 hover:text-red-300 font-bold shrink-0 text-[8px]"
                                  title="Delete need"
                                >
                                  ✕
                                </button>
                              )}
                            </span>
                          ))}
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditing) {
                                setEditingTeamId(null);
                              } else {
                                setEditingTeamId(team.id);
                              }
                            }}
                            className="text-[10px] font-mono font-bold text-slate-400 hover:text-white underline"
                          >
                            {isEditing ? 'Done' : 'Edit Needs'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : activeSetupTab === 'trades' ? (
              <div className="flex-1 flex flex-col min-h-0">
                {renderTradeDesk()}
              </div>
            ) : activeSetupTab === 'analytics' ? (
              <div className="flex-1 flex flex-col min-h-0">
                <DraftAnalyticsDashboard
                  players={players}
                  draftPicks={draftPicks}
                  customTeamNeeds={customTeamNeeds}
                  draftSelections={draftSelections}
                  boardSource={boardSource}
                  orderedPlayerIds={orderedPlayerIds}
                  roundsToSimulate={roundsToSimulate}
                  userControlledTeamId={userControlledTeamId}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <DraftValueCalculator
                  draftPicks={draftPicks}
                  currentPickIndex={currentPickIndex}
                />
              </div>
            )}
          </div>

        </div>
      )}

      {/* RUNNING / PLAYBACK PHASE VIEW */}
      {(simStatus === 'running' || simStatus === 'paused') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Draft Cast Left Side (Log / Player clock) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Clock / Active team panel */}
            {currentPick ? (
              <div className="bg-slate-950 border-2 border-slate-800 p-6 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                {currentClockTeam && (
                  <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: currentClockTeam.logoColor }}></div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-900 border border-slate-800 flex flex-col justify-center items-center font-mono">
                    <span className="text-[9px] text-slate-500 leading-none uppercase">PICK</span>
                    <span className="text-xl font-bold text-emerald-500">{currentPick.pickString}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest block animate-pulse">
                      // ON THE CLOCK
                    </span>
                    <h2 className="text-2xl font-serif font-bold italic text-slate-100 flex items-center gap-2">
                      {currentClockTeam ? currentClockTeam.fullName : 'NFL Franchise'}
                    </h2>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Primary Needs: <span className="font-bold text-slate-200 uppercase">{(currentClockTeam ? (customTeamNeeds[currentClockTeam.id] || currentClockTeam.needs) : []).join(', ')}</span>
                    </div>
                    {/* Spec 06: GM strategy indicator */}
                    {currentClockTeam && (
                      <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-slate-400 font-mono max-w-md">
                        <Zap className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          <span className="text-slate-500">GM Model: </span>
                          <span className="text-emerald-400 font-bold">{getGmProfileForTeam(currentClockTeam.id)?.name || 'Standard Fallback'}</span>
                          <span className="block text-slate-500 leading-snug">{getGmStrategySummary(currentClockTeam.id)}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Simulation playback controls */}
                <div className="flex items-center gap-2">
                  {simStatus === 'running' ? (
                    <button
                      onClick={() => setSimStatus('paused')}
                      className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 rounded text-xs font-mono font-bold flex items-center gap-1.5"
                    >
                      <Pause className="w-4 h-4 fill-slate-300" /> Pause Simulation
                    </button>
                  ) : (
                    !isUserOnClock && (
                      <button
                        onClick={() => setSimStatus('running')}
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white dark:text-slate-950 rounded text-xs font-mono font-bold flex items-center gap-1.5 border border-slate-800"
                      >
                        <Play className="w-4 h-4 fill-white animate-bounce" /> Resume Simulation
                      </button>
                    )
                  )}

                  <button
                    onClick={simulateNextPick}
                    disabled={isUserOnClock}
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 disabled:opacity-40 rounded"
                    title="Simulate Next Pick"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null}

            {/* IF USER IS ON THE CLOCK - DRAWER ACTIVE CHOOSE PROSPECT */}
            {isUserOnClock && currentClockTeam && (
              <div className="border-2 border-emerald-500 bg-slate-900 p-6 space-y-5 rounded-none shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xl font-serif font-bold italic text-slate-100 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" /> 
                      Your Turn to Pick! ({currentClockTeam.fullName})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Select the best fit for your customized needs: <span className="text-emerald-400 font-mono font-bold">{customTeamNeeds[currentClockTeam.id]?.join(', ') || currentClockTeam.needs.join(', ')}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-950 px-3 py-1 rounded border border-slate-800">
                    <span>Active Scheme: <strong>{currentClockTeam.currentScheme}</strong></span>
                  </div>
                </div>

                {/* Search / filter for available */}
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search available players..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-4 py-2 text-xs"
                    />
                  </div>

                  <div className="flex gap-1 overflow-x-auto">
                    {['ALL', 'QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DT', 'LB', 'CB', 'S'].map(pos => (
                      <button
                        key={pos}
                        onClick={() => setPosFilter(pos)}
                        className={`px-2.5 py-1 text-[10px] font-mono font-bold ${
                          posFilter === pos 
                            ? "bg-emerald-500/20 border border-slate-800 text-emerald-400" 
                            : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Available player selection pool */}
                <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                  {filteredAvailable.slice(0, 15).map((player, idx) => {
                    const isFavoredScheme = SCHEMES.find(s => s.name === currentClockTeam.currentScheme)?.favoredPositions.includes(player.position);
                    const isTeamNeed = (customTeamNeeds[currentClockTeam.id] || currentClockTeam.needs).includes(player.position);

                    return (
                      <div 
                        key={player.id}
                        className={`p-3 bg-slate-950/80 border flex items-center justify-between gap-4 hover:bg-slate-900 transition-all ${
                          selectedPlayerForUserPick === player.id ? "border-emerald-500 bg-slate-900" : "border-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-slate-500 w-6 text-right">#{idx + 1}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span 
                                onClick={() => onSelectPlayer(player)}
                                className="font-serif font-bold italic text-sm text-slate-200 hover:text-emerald-400 cursor-pointer"
                              >
                                {player.name}
                              </span>
                              <span className="text-[9px] font-mono font-bold bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-slate-300 rounded">
                                {player.position}
                              </span>
                              {player.labels && player.labels.map(labelName => {
                                const matchedLabel = customLabels?.find(l => l.name === labelName);
                                const classes = matchedLabel ? getLabelClasses(matchedLabel.colorName) : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                                return (
                                  <span 
                                    key={labelName}
                                    className={`text-[8px] px-1.5 py-0.5 border font-mono font-bold shrink-0 uppercase tracking-wide rounded-none flex items-center gap-1 ${classes}`}
                                  >
                                    <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: matchedLabel?.color || '#64748b' }} />
                                    {labelName}
                                  </span>
                                );
                              })}
                              {isTeamNeed && (
                                <span className="text-[8px] font-mono font-extrabold text-emerald-500 uppercase tracking-wider">
                                  // Need Match
                                </span>
                              )}
                              {isFavoredScheme && (
                                <span className="text-[8px] font-mono font-extrabold text-blue-400 uppercase tracking-wider">
                                  // Scheme Fit
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {player.school} | {player.height}, {player.weight} lbs | Scout Grade: <strong>{player.overallGrade}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectPlayer(player)}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[9px] font-mono uppercase font-bold border border-slate-800"
                          >
                            Profile
                          </button>
                          
                          <button
                            onClick={() => executeUserPick(player)}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white dark:text-slate-950 text-[10px] font-mono font-bold uppercase border border-slate-850"
                          >
                            Draft Player
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dynamic visual log / trade desk tabs */}
            <div className="bg-slate-950 border-2 border-slate-800 p-5 md:p-6 space-y-4 rounded-none flex flex-col min-h-[480px]">
              <div className="flex border-b border-slate-800 pb-3 justify-between items-center shrink-0">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveLiveTab('selections')}
                    className={`text-sm font-mono font-bold uppercase flex items-center gap-2 transition-all pb-1.5 border-b-2 ${
                      activeLiveTab === 'selections' 
                        ? "text-emerald-400 border-emerald-500" 
                        : "text-slate-500 border-transparent hover:text-slate-300"
                    }`}
                  >
                    <ClipboardList className="w-4 h-4 text-emerald-500" /> Draft Selections Log ({draftSelections.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLiveTab('trades')}
                    className={`text-sm font-mono font-bold uppercase flex items-center gap-2 transition-all pb-1.5 border-b-2 ${
                      activeLiveTab === 'trades' 
                        ? "text-emerald-400 border-emerald-500" 
                        : "text-slate-500 border-transparent hover:text-slate-300"
                    }`}
                  >
                    <ArrowLeftRight className="w-4 h-4 text-emerald-500" /> Draft Trade Desk
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLiveTab('analytics')}
                    className={`text-sm font-mono font-bold uppercase flex items-center gap-2 transition-all pb-1.5 border-b-2 ${
                      activeLiveTab === 'analytics' 
                        ? "text-emerald-400 border-emerald-500" 
                        : "text-slate-500 border-transparent hover:text-slate-300"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-emerald-500" /> Analytics Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLiveTab('calculator')}
                    className={`text-sm font-mono font-bold uppercase flex items-center gap-2 transition-all pb-1.5 border-b-2 ${
                      activeLiveTab === 'calculator' 
                        ? "text-emerald-400 border-emerald-500" 
                        : "text-slate-500 border-transparent hover:text-slate-300"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Value Calculator
                  </button>
                </div>
                <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest hidden sm:inline">Live Room Controls</span>
              </div>

              {activeLiveTab === 'selections' ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="space-y-1.5 overflow-y-auto pr-1 max-h-[400px]">
                    {draftSelections.length === 0 ? (
                      <div className="text-center py-10 text-xs font-mono text-slate-500">
                        No selections have been recorded yet. Click Resume or Sim Pick.
                      </div>
                    ) : (
                      [...draftSelections].reverse().map((selection, idx) => {
                        const pickTeam = NFL_TEAMS.find(t => t.id === selection.pick.teamId)!;
                        
                        return (
                          <div 
                            key={`${selection.pick.pickNumber}-${idx}`}
                            className="p-3 bg-slate-900 border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-3 relative rounded-lg"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" style={{ backgroundColor: pickTeam.logoColor }}></div>
                            
                            <div className="flex items-center gap-3 pl-1">
                              <span className="font-mono text-xs font-bold text-slate-500 min-w-[44px]">
                                {selection.pick.pickString}
                              </span>
                              
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono text-xs font-black text-slate-200" style={{ color: pickTeam.logoColor }}>
                                  {pickTeam.id}
                                </span>
                              </div>

                              <div className="ml-2">
                                <div className="flex items-baseline gap-1.5">
                                  <span 
                                    onClick={() => onSelectPlayer(selection.player)}
                                    className="font-serif font-bold italic text-sm text-slate-100 hover:text-emerald-400 cursor-pointer"
                                  >
                                    {selection.player.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    ({selection.player.position}, {selection.player.school})
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 block font-mono">
                                  {selection.notes}
                                </span>
                                {selection.gmName && (
                                  <span className="text-[9px] text-emerald-500/80 block font-mono uppercase tracking-wide">
                                    GM Model: {selection.gmName}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0 font-mono">
                              <span className="text-[10px] text-slate-400">
                                Grade:
                              </span>
                              <span className={`text-xs font-black px-1.5 py-0.5 rounded ${
                                selection.grade.startsWith('A') ? 'bg-emerald-950/20 text-emerald-500 border border-emerald-500/20' : 'bg-slate-950 text-slate-400 border border-slate-850'
                              }`}>
                                {selection.grade}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : activeLiveTab === 'trades' ? (
                <div className="flex-1 flex flex-col min-h-0">
                  {renderTradeDesk()}
                </div>
              ) : activeLiveTab === 'analytics' ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <DraftAnalyticsDashboard
                    players={players}
                    draftPicks={draftPicks}
                    customTeamNeeds={customTeamNeeds}
                    draftSelections={draftSelections}
                    boardSource={boardSource}
                    orderedPlayerIds={orderedPlayerIds}
                    roundsToSimulate={roundsToSimulate}
                    userControlledTeamId={userControlledTeamId}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  <DraftValueCalculator
                    draftPicks={draftPicks}
                    currentPickIndex={currentPickIndex}
                  />
                </div>
              )}
            </div>

          </div>

          {/* Right Side: Draft Order Tracker & board preview */}
          <div className="space-y-6">
            <div className="bg-slate-950 border-2 border-slate-800 p-5 md:p-6 space-y-4 rounded-none h-[640px] flex flex-col">
              <h3 className="text-sm font-serif font-bold italic text-slate-100 border-b border-slate-800 pb-2">
                Draft Tracker Timeline
              </h3>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {draftPicks.map((pick, idx) => {
                  const team = NFL_TEAMS.find(t => t.id === pick.teamId)!;
                  const selection = draftSelections.find(s => s.pick.pickNumber === pick.pickNumber);
                  const isCurrent = idx === currentPickIndex;
                  const isFuture = idx > currentPickIndex;

                  return (
                    <div 
                      key={`${pick.pickNumber}-${idx}`}
                      className={`p-2 border flex items-center justify-between gap-3 text-xs ${
                        isCurrent 
                          ? "border-emerald-500 bg-emerald-500/10 font-bold" 
                          : isFuture 
                            ? "border-slate-850 bg-slate-900/20 text-slate-500" 
                            : "border-slate-850 bg-slate-900/80 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-500 w-10">
                          {pick.pickString}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold" style={{ color: team.logoColor }}>
                            {team.id}
                          </span>
                          <span className="text-[10px] font-serif italic text-slate-400">
                            {team.name}
                          </span>
                        </div>
                      </div>

                      <div className="font-mono text-right text-[11px] truncate max-w-[120px]">
                        {isCurrent ? (
                          <span className="text-emerald-500 animate-pulse font-extrabold uppercase text-[10px]">On Clock</span>
                        ) : selection ? (
                          <span className="text-slate-200 font-semibold">{selection.player.name}</span>
                        ) : (
                          <span className="text-slate-600 italic">Pending...</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* COMPLETED PHASE VIEW (POST-DRAFT REPORT CARD) */}
      {simStatus === 'completed' && (
        <div className="space-y-6">
          
          {/* Main big board mock final recap banner */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-end border-b border-slate-800 pb-12 pt-6">
            <div className="space-y-3">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">// War Room Module 01</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold italic text-slate-300">
                NFL Draft Simulator
              </h2>
              <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                Model professional war rooms. Setup simulation rules, customize individual team boards, assign priorities, and watch AI or manual logic draft real prospects.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button 
                  onClick={handleResetDraft}
                  className="px-5 py-2.5 bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-500 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all"
                >
                  Reset Simulator
                </button>
                <button 
                  onClick={() => setIsGradeModalOpen(true)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-bold text-xs rounded-full uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse"
                >
                  <Award className="w-4 h-4 text-slate-950" /> View Draft Grade Card
                </button>
                <button 
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-5 py-2.5 bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-500 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4 text-emerald-500" /> Export Mock Draft
                </button>
              </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 p-8 text-center rounded-2xl shadow-sm relative group hover:border-slate-700 transition-all duration-300">
              <Award className="w-10 h-10 text-emerald-500 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-serif font-bold italic text-slate-200">
                Simulation Concluded
              </h3>
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mt-2">
                War Room Adjourned
              </p>
            </div>
          </div>

          {/* Steals of the Draft */}
          <section className="space-y-6">
            <div className="flex justify-between items-baseline border-b border-slate-800 pb-3">
              <h3 className="text-2xl font-serif font-bold italic text-slate-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" /> Draft Value Steals Tracker
              </h3>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Live Analysis</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const orderedList = getOrderedPlayersList();
                
                const steals = draftSelections
                  .map(selection => {
                    const boardRank = orderedList.findIndex(p => p.id === selection.player.id) + 1;
                    const diff = selection.pick.pickNumber - boardRank;
                    return { selection, boardRank, diff };
                  })
                  .filter(item => item.diff > 8) // Slashed deep value picks
                  .sort((a, b) => b.diff - a.diff);

                if (steals.length === 0) {
                  return (
                    <div className="col-span-2 text-center py-10 border border-dashed border-slate-800 rounded-2xl text-xs font-mono text-slate-500">
                      No notable "steals" identified based on current custom board parameters.
                    </div>
                  );
                }

                return steals.slice(0, 4).map((steal, idx) => {
                  const team = NFL_TEAMS.find(t => t.id === steal.selection.pick.teamId)!;
                  return (
                    <div key={idx} className="border border-slate-800 bg-slate-900 p-4 rounded-xl flex justify-between items-center relative shadow-sm hover:border-slate-500 transition-all">
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: team.logoColor }}></div>
                      
                      <div className="pl-3">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold italic text-sm text-slate-200 hover:text-emerald-500 cursor-pointer" onClick={() => onSelectPlayer(steal.selection.player)}>
                            {steal.selection.player.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 px-1.5 py-0.5 text-slate-400 rounded">
                            {steal.selection.player.position}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          Drafted by <strong>{team.fullName}</strong> at pick <strong>{steal.selection.pick.pickString}</strong>
                        </div>
                      </div>

                      <div className="font-mono text-right shrink-0">
                        <span className="text-[9px] text-slate-500 block tracking-wider">BOARD VALUE</span>
                        <span className="text-emerald-500 font-bold text-xs">+#{steal.diff} Picks Steal</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </section>

          {/* Franchise draft grade card deck list */}
          <section className="space-y-6 pt-6">
            <div className="flex justify-between items-baseline border-b border-slate-800 pb-3">
              <h3 className="text-2xl font-serif font-bold italic text-slate-300">
                Franchise Evaluation & Draft Class Grades
              </h3>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Draft Class 2026</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(calculateTeamDraftGrades()).map(([teamId, report]) => {
                const team = NFL_TEAMS.find(t => t.id === teamId)!;
                if (report.grade === 'N/A') return null;

                const hasAiComment = !!aiComments[teamId];

                return (
                  <div key={teamId} className="border border-slate-800 bg-slate-900 p-6 space-y-4 flex flex-col justify-between rounded-2xl relative shadow-sm hover:translate-y-[-4px] hover:border-slate-500 transition-all duration-300">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: team.logoColor }}></div>
                          <span className="font-serif font-bold italic text-base text-slate-200">{team.fullName}</span>
                        </div>

                        <span className="text-base font-bold font-mono text-emerald-500">
                          {report.grade}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-wider block">Selections:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {report.playersSelected.map(p => (
                            <span key={p.id} className="text-[10px] bg-slate-950 px-2 py-0.5 border border-slate-800 font-mono text-slate-400 rounded">
                              {p.name} ({p.position})
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed italic font-serif">
                        "{report.text}"
                      </p>

                      {hasAiComment && (
                        <div className="bg-slate-950 p-3.5 border border-slate-800 mt-2 text-[11px] font-mono text-slate-400 space-y-1 rounded-xl">
                          <span className="text-[8px] uppercase font-bold text-emerald-500 block tracking-widest">// Mel Kiper Jr. Commentary</span>
                          <p className="leading-relaxed font-serif italic text-slate-500">"{aiComments[teamId]}"</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800">
                      <button
                        onClick={() => generateExpertCommentary(teamId)}
                        disabled={generatingAiTeam === teamId}
                        className="w-full py-2 bg-transparent border border-slate-800 hover:border-slate-500 hover:bg-slate-950 text-[10px] font-mono font-bold text-slate-400 hover:text-slate-200 uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      >
                        {generatingAiTeam === teamId ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-emerald-500" />
                            Evaluating tape...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            {hasAiComment ? 'Regenerate Kiper Critique' : 'Kiper Critique'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      )}

      {isGradeModalOpen && (
        <DraftGradeSummaryModal
          players={players}
          draftPicks={draftPicks}
          draftSelections={draftSelections}
          completedTrades={completedTrades}
          customTeamNeeds={customTeamNeeds}
          userControlledTeamId={userControlledTeamId}
          boardSource={boardSource}
          orderedPlayerIds={orderedPlayerIds}
          onClose={() => setIsGradeModalOpen(false)}
        />
      )}

      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-none max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span className="text-[9px] uppercase font-bold font-mono text-slate-400 tracking-wider">Export & Share</span>
                </div>
                <h3 className="text-xl font-serif font-bold italic text-slate-100">
                  Export Mock Draft Result
                </h3>
              </div>
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono font-bold text-sm bg-slate-950 border border-slate-800 hover:border-slate-600 px-2.5 py-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 flex flex-col">
              
              {draftSelections.length < draftPicks.length || draftPicks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6 space-y-6 bg-slate-950 border border-red-900/30">
                  <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-full animate-pulse">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-mono font-bold text-red-400 uppercase tracking-widest">
                      Draft Simulation Incomplete
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed font-sans">
                      To ensure completeness of your exported mock draft summary, all scheduled picks must be filled before generating.
                    </p>
                  </div>
                  
                  {/* Progress tracker */}
                  <div className="w-full max-w-sm space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold uppercase">
                      <span>Picks Simulated</span>
                      <span>{draftSelections.length} / {draftPicks.length}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 border border-slate-800">
                      <div 
                        className="bg-red-500 h-full transition-all duration-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                        style={{ width: `${draftPicks.length > 0 ? (draftSelections.length / draftPicks.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-mono">
                    Please resume, fast-forward, or complete the draft simulation to unlock the exporter.
                  </p>
                </div>
              ) : (
                <>
                  {/* Export options/format toggle */}
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Export Format</span>
                      <span className="text-xs text-slate-500">Choose how the mock draft text is presented.</span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => setExportFormat('rich')}
                        className={`px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                          exportFormat === 'rich'
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                        }`}
                      >
                        Rich Detailed
                      </button>
                      <button
                        onClick={() => setExportFormat('condensed')}
                        className={`px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                          exportFormat === 'condensed'
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                        }`}
                      >
                        Condensed Markdown
                      </button>
                    </div>
                  </div>

                  {/* Text Preview area */}
                  <div className="flex-1 flex flex-col min-h-[250px] relative">
                    <div className="absolute right-3 top-3 z-10 flex gap-2">
                      <button
                        onClick={handleCopyToClipboard}
                        className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-500 flex items-center gap-1.5 text-xs font-mono font-bold transition-all"
                        title="Copy to clipboard"
                      >
                        {copySuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={handleDownloadText}
                        className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-500 flex items-center gap-1.5 text-xs font-mono font-bold transition-all"
                        title="Download as .txt"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>

                    <textarea
                      readOnly
                      value={exportFormat === 'rich' ? generateMockDraftText() : generateCondensedMockDraftText()}
                      className="w-full h-full min-h-[280px] bg-slate-950 border border-slate-800 rounded-none p-4 pr-32 font-mono text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="bg-emerald-950/10 border border-emerald-900/40 p-3 rounded-none flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-emerald-400/80 leading-relaxed font-mono">
                      This summary is fully optimized for pasting directly into Reddit threads, fantasy sports channels, and Twitter threads!
                    </p>
                  </div>
                </>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 flex justify-end bg-slate-950/40">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600 font-mono font-bold text-xs uppercase"
              >
                Close Export Portal
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
