import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Player, PreferenceOutcome, PreferenceState } from '../types';
import {
  loadPreferenceState,
  recordComparison,
  undoLastComparison,
  resetPositionPreferences,
  selectNextPair,
  getPositionProgress,
  getGutVsGrades,
  OUTCOME_SCORES,
  DEFAULT_RATING,
} from '../utils/elo';
import {
  GitCompare,
  Trophy,
  Brain,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Save,
  X,
  ExternalLink,
} from 'lucide-react';

interface PlayerRankingMatrixProps {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  activeBoardKey: string;
  rankings: Record<string, string[]>;
  activeBoardOrder: string[];
  onCommitToBoard: (boardKey: string, orderedIds: string[]) => void;
}

type TabMode = 'matchup' | 'board' | 'gut_vs_grades';

export const PlayerRankingMatrix: React.FC<PlayerRankingMatrixProps> = ({
  players,
  onSelectPlayer,
  activeBoardKey,
  rankings,
  activeBoardOrder,
  onCommitToBoard,
}) => {
  // Extract unique positions from players data (using IOL & S position convention)
  const availablePositions = useMemo(() => {
    const posSet = new Set<string>();
    const defaultPositions = ['QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DT', 'LB', 'CB', 'S'];
    players.forEach((p) => {
      if (p.position) posSet.add(p.position);
    });
    defaultPositions.forEach((pos) => posSet.add(pos));
    return Array.from(posSet).filter((pos) => players.some((p) => p.position === pos));
  }, [players]);

  const [activePosition, setActivePosition] = useState<string>(
    availablePositions[0] || 'QB'
  );
  const [activeTab, setActiveTab] = useState<TabMode>('matchup');
  const [prefState, setPrefState] = useState<PreferenceState>(() => loadPreferenceState());

  const [currentPair, setCurrentPair] = useState<[Player, Player] | null>(null);
  const [recentPairKeys, setRecentPairKeys] = useState<string[]>([]);

  // Modal & Notification States
  const [commitModalOpen, setCommitModalOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [commitSuccessToast, setCommitSuccessToast] = useState<string | null>(null);

  // Position progress
  const progress = useMemo(() => {
    return getPositionProgress(players, activePosition, prefState);
  }, [players, activePosition, prefState]);

  // Gut vs Grades analysis
  const gutVsGrades = useMemo(() => {
    return getGutVsGrades(players, activePosition, prefState);
  }, [players, activePosition, prefState]);

  // Load next pair when position changes or state updates
  const loadNextPair = useCallback(
    (currentState: PreferenceState, position: string, recentKeys: string[]) => {
      const pair = selectNextPair(players, position, currentState, recentKeys);
      setCurrentPair(pair);
    },
    [players]
  );

  // Initial load and position switch
  useEffect(() => {
    setRecentPairKeys([]);
    loadNextPair(prefState, activePosition, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePosition, loadNextPair]);

  // Handle recorded choice
  const handleChoice = useCallback(
    (outcome: PreferenceOutcome) => {
      if (!currentPair || !currentPair[0] || !currentPair[1]) return;

      const [pA, pB] = currentPair;
      const pairKey = [pA.id, pB.id].sort().join(':');

      const newState = recordComparison(
        prefState,
        activePosition,
        pA.id,
        pB.id,
        outcome,
        players
      );

      const updatedRecentKeys = [...recentPairKeys.slice(-4), pairKey];
      setPrefState(newState);
      setRecentPairKeys(updatedRecentKeys);

      loadNextPair(newState, activePosition, updatedRecentKeys);
    },
    [currentPair, prefState, activePosition, players, recentPairKeys, loadNextPair]
  );

  // Handle Undo
  const handleUndo = () => {
    const newState = undoLastComparison(prefState, activePosition, players);
    setPrefState(newState);
    loadNextPair(newState, activePosition, recentPairKeys);
  };

  // Handle Skip (cap recent keys history to last 5)
  const handleSkip = () => {
    if (!currentPair) return;
    const pairKey = [currentPair[0].id, currentPair[1].id].sort().join(':');
    const updatedRecentKeys = [...recentPairKeys.slice(-4), pairKey];
    setRecentPairKeys(updatedRecentKeys);
    loadNextPair(prefState, activePosition, updatedRecentKeys);
  };

  // Handle Reset Position Preferences
  const handleReset = () => {
    const newState = resetPositionPreferences(prefState, activePosition, players);
    setPrefState(newState);
    setRecentPairKeys([]);
    setResetConfirmOpen(false);
    loadNextPair(newState, activePosition, []);
  };

  // Keyboard shortcut listener for 1–5 and Left/Right arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'matchup') return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case '1':
          e.preventDefault();
          handleChoice('strong_a');
          break;
        case '2':
          e.preventDefault();
          handleChoice('slight_a');
          break;
        case '3':
          e.preventDefault();
          handleChoice('toss_up');
          break;
        case '4':
          e.preventDefault();
          handleChoice('slight_b');
          break;
        case '5':
          e.preventDefault();
          handleChoice('strong_b');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleChoice('slight_a');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleChoice('slight_b');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, handleChoice]);

  // Handle Commit Preference Board to App Board State
  const handleCommitToBoard = () => {
    try {
      const posState = prefState[activePosition];
      if (!posState) return;

      const posPlayers = players.filter((p) => p.position === activePosition);
      const sortedByElo = [...posPlayers].sort((a, b) => {
        const rA = posState.ratings[a.id]?.rating ?? DEFAULT_RATING;
        const rB = posState.ratings[b.id]?.rating ?? DEFAULT_RATING;
        return rB - rA;
      });

      const prefOrderIds = sortedByElo.map((p) => p.id);
      const posPlayerIds = new Set(posPlayers.map((p) => p.id));

      // Base the merge on the board's CURRENT EFFECTIVE order (grade-sorted for
      // an un-customized board), not raw player-array order, so committing one
      // position's order never reshuffles the others.
      const currentBoardList = rankings[activeBoardKey] || activeBoardOrder;

      const posIndices: number[] = [];
      currentBoardList.forEach((pid, idx) => {
        if (posPlayerIds.has(pid)) {
          posIndices.push(idx);
        }
      });

      const updatedBoardList = [...currentBoardList];
      posIndices.forEach((boardIdx, i) => {
        if (i < prefOrderIds.length) {
          updatedBoardList[boardIdx] = prefOrderIds[i];
        }
      });

      const boardSet = new Set(updatedBoardList);
      prefOrderIds.forEach((pid) => {
        if (!boardSet.has(pid)) {
          updatedBoardList.push(pid);
          boardSet.add(pid);
        }
      });

      // Invoke App callback to persist to rankings state + storage
      onCommitToBoard(activeBoardKey, updatedBoardList);

      setCommitSuccessToast(`Committed ${activePosition} preference order to board '${activeBoardKey}'!`);
      setCommitModalOpen(false);
      setTimeout(() => setCommitSuccessToast(null), 4000);
    } catch (err) {
      console.error('Error committing preferences to board:', err);
    }
  };

  const posHistoryCount = prefState[activePosition]?.history.length || 0;

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {commitSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-950 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-mono text-sm">{commitSuccessToast}</span>
        </div>
      )}

      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-wider rounded">
              Spec 01 Engine
            </span>
            <span className="text-slate-400 text-xs font-mono">
              Pairwise Elo Workbench
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif italic text-slate-100 mt-1">
            Scouting Preference Matrix
          </h1>
        </div>

        {/* Settled Progress Indicator */}
        <div className="flex items-center space-x-4 bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-mono space-x-4">
              <span className="text-slate-400">Position Status</span>
              <span className={progress.isSettled ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                {progress.statusLabel}
              </span>
            </div>
            <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  progress.isSettled ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${progress.progressPct}%` }}
              />
            </div>
          </div>
          <div className="border-l border-slate-800 pl-3 text-right">
            <span className="text-xs font-mono text-slate-400 block">Comparisons</span>
            <span className="text-sm font-mono font-bold text-slate-200">{posHistoryCount}</span>
          </div>
        </div>
      </div>

      {/* Navigation Controls: Position Pills + View Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Position Selector */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-thin">
          {availablePositions.map((pos) => {
            const isActive = pos === activePosition;
            const posProg = getPositionProgress(players, pos, prefState);
            return (
              <button
                key={pos}
                onClick={() => setActivePosition(pos)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{pos}</span>
                {posProg.isSettled && (
                  <CheckCircle2 className={`w-3 h-3 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* View Tabs */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start lg:self-auto">
          <button
            onClick={() => setActiveTab('matchup')}
            className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 ${
              activeTab === 'matchup'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>Matchup Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('board')}
            className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 ${
              activeTab === 'board'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Preference Board</span>
          </button>

          <button
            onClick={() => setActiveTab('gut_vs_grades')}
            className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 ${
              activeTab === 'gut_vs_grades'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Gut vs. Grades</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MATCHUP LAB */}
      {/* ========================================================================= */}
      {activeTab === 'matchup' && (
        <div className="space-y-6">
          {!currentPair || !currentPair[0] || !currentPair[1] ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <Sparkles className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
              <h3 className="text-xl font-serif italic text-slate-200">
                Not enough prospects in {activePosition} to compare.
              </h3>
              <p className="text-sm font-mono text-slate-400 max-w-md mx-auto">
                Need at least 2 prospects assigned to position {activePosition} to run head-to-head comparisons.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Head to Head Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* VS Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-slate-950 border-2 border-slate-800 font-mono text-xs font-bold text-emerald-400 shadow-xl">
                  VS
                </div>

                {/* Prospect A Card */}
                <ProspectMatchupCard
                  player={currentPair[0]}
                  side="A"
                  rating={prefState[activePosition]?.ratings[currentPair[0].id]?.rating ?? DEFAULT_RATING}
                  comparisons={prefState[activePosition]?.ratings[currentPair[0].id]?.comparisons ?? 0}
                  onSelectPlayer={onSelectPlayer}
                />

                {/* Prospect B Card */}
                <ProspectMatchupCard
                  player={currentPair[1]}
                  side="B"
                  rating={prefState[activePosition]?.ratings[currentPair[1].id]?.rating ?? DEFAULT_RATING}
                  comparisons={prefState[activePosition]?.ratings[currentPair[1].id]?.comparisons ?? 0}
                  onSelectPlayer={onSelectPlayer}
                />
              </div>

              {/* 5-Way Decision Bar */}
              <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl space-y-4 shadow-xl">
                <div className="text-center">
                  <span className="font-mono text-xs text-slate-400 uppercase tracking-widest">
                    Select Your Instinctive Preference
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {(Object.keys(OUTCOME_SCORES) as PreferenceOutcome[]).map((outcome) => {
                    const info = OUTCOME_SCORES[outcome];
                    return (
                      <button
                        key={outcome}
                        onClick={() => handleChoice(outcome)}
                        className="group relative flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all duration-200 active:scale-95"
                      >
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] text-slate-400 group-hover:border-emerald-500/40 group-hover:text-emerald-400">
                          {info.keyHint}
                        </span>
                        <span className="font-serif italic text-sm font-semibold text-slate-200 group-hover:text-emerald-300">
                          {info.shortLabel}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 mt-1">
                          {outcome === 'strong_a' || outcome === 'slight_a'
                            ? currentPair[0].name.split(' ').pop()
                            : outcome === 'strong_b' || outcome === 'slight_b'
                            ? currentPair[1].name.split(' ').pop()
                            : 'Even'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Matchup Controls: Undo / Skip / Reset */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleUndo}
                      disabled={posHistoryCount === 0}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 disabled:opacity-40 flex items-center space-x-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Undo Last</span>
                    </button>

                    <button
                      onClick={handleSkip}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 flex items-center space-x-1.5 transition-all"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span>Skip Pair</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="hidden sm:inline text-[11px] text-slate-400">
                      Keyboard: <kbd className="px-1 bg-slate-800 rounded text-slate-300">1-5</kbd> or <kbd className="px-1 bg-slate-800 rounded text-slate-300">← / →</kbd>
                    </span>

                    <button
                      onClick={() => setResetConfirmOpen(true)}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      Reset {activePosition}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PREFERENCE BOARD */}
      {/* ========================================================================= */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="font-serif italic text-lg text-slate-100">
                {activePosition} Elo Preference Standings
              </h3>
              <p className="font-mono text-xs text-slate-400">
                Calculated from head-to-head gut comparison choices
              </p>
            </div>

            <button
              onClick={() => setCommitModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
            >
              <Save className="w-4 h-4" />
              <span>Commit to Board...</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Prospect</th>
                    <th className="py-3 px-4">School / Year</th>
                    <th className="py-3 px-4 text-right">Preference Elo</th>
                    <th className="py-3 px-4 text-center">Comparisons</th>
                    <th className="py-3 px-4 text-right">Trait Grade</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {gutVsGrades.items.map((item, idx) => {
                    const ratingObj = prefState[activePosition]?.ratings[item.player.id];
                    const count = ratingObj?.comparisons || 0;
                    const eloRating = ratingObj?.rating ?? DEFAULT_RATING;

                    return (
                      <tr key={item.player.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-emerald-400">#{idx + 1}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => onSelectPlayer(item.player)}
                            className="font-serif italic text-sm font-semibold text-slate-200 hover:text-emerald-300 text-left"
                          >
                            {item.player.name}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {item.player.school} • {item.player.year || 'SR'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-100">
                          {eloRating.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400">{count}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-300">
                          {item.player.overallGrade?.toFixed(1) || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {count >= 6 ? (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px]">
                              Settled
                            </span>
                          ) : count > 0 ? (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-[10px]">
                              Developing
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px]">
                              Provisional
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onSelectPlayer(item.player)}
                            className="text-slate-400 hover:text-emerald-400"
                          >
                            <ExternalLink className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GUT VS GRADES (THE LEARNING PAYOFF) */}
      {/* ========================================================================= */}
      {activeTab === 'gut_vs_grades' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
              <Brain className="w-4 h-4" />
              <span>Self-Audit Insight Engine</span>
            </div>
            <h3 className="font-serif italic text-xl text-slate-100">
              Gut Preference vs. Systematic Trait Grade
            </h3>
            <p className="font-mono text-xs text-slate-400 max-w-3xl">
              This matrix contrasts where your instinctive gut preference (Elo) diverges from your objective trait grades. Divergence highlights potential scouting biases, flash-play weighting, or scheme fit instinct.
            </p>
          </div>

          {/* Divergence Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Biggest Sleeper */}
            <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold flex items-center space-x-1">
                  <ArrowUp className="w-4 h-4" />
                  <span>Biggest Gut Sleeper</span>
                </span>
                {gutVsGrades.biggestSleeper && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-xs rounded font-bold">
                    +{gutVsGrades.biggestSleeper.delta} Ranks Higher
                  </span>
                )}
              </div>

              {gutVsGrades.biggestSleeper ? (
                <div className="space-y-2">
                  <button
                    onClick={() => onSelectPlayer(gutVsGrades.biggestSleeper!.player)}
                    className="font-serif italic text-lg font-bold text-slate-100 hover:text-emerald-300"
                  >
                    {gutVsGrades.biggestSleeper.player.name}
                  </button>
                  <p className="font-mono text-xs text-slate-400">
                    Gut Rank: <strong className="text-emerald-400">#{gutVsGrades.biggestSleeper.gutRank}</strong> • Grade Rank: <strong className="text-slate-300">#{gutVsGrades.biggestSleeper.gradeRank}</strong>
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-2">
                    Your instinct rates {gutVsGrades.biggestSleeper.player.name} significantly higher than your trait grades suggest. Check if you are heavily weighting high-end flash plays or subconscious scheme fit.
                  </p>
                </div>
              ) : (
                <p className="font-mono text-xs text-slate-400 italic">No positive divergence detected in this position pool yet.</p>
              )}
            </div>

            {/* Biggest Skeptic */}
            <div className="bg-slate-900 border border-rose-500/30 p-5 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-rose-400 font-semibold flex items-center space-x-1">
                  <ArrowDown className="w-4 h-4" />
                  <span>Biggest Gut Skeptic</span>
                </span>
                {gutVsGrades.biggestSkeptic && (
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-mono text-xs rounded font-bold">
                    {gutVsGrades.biggestSkeptic.delta} Ranks Lower
                  </span>
                )}
              </div>

              {gutVsGrades.biggestSkeptic ? (
                <div className="space-y-2">
                  <button
                    onClick={() => onSelectPlayer(gutVsGrades.biggestSkeptic!.player)}
                    className="font-serif italic text-lg font-bold text-slate-100 hover:text-rose-300"
                  >
                    {gutVsGrades.biggestSkeptic.player.name}
                  </button>
                  <p className="font-mono text-xs text-slate-400">
                    Gut Rank: <strong className="text-rose-400">#{gutVsGrades.biggestSkeptic.gutRank}</strong> • Grade Rank: <strong className="text-slate-300">#{gutVsGrades.biggestSkeptic.gradeRank}</strong>
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-2">
                    You are hesitant on {gutVsGrades.biggestSkeptic.player.name} despite strong trait scores. Are you discounting them due to injury concerns, system fit, or personal bias?
                  </p>
                </div>
              ) : (
                <p className="font-mono text-xs text-slate-400 italic">No negative divergence detected in this position pool yet.</p>
              )}
            </div>
          </div>

          {/* Detailed Divergence Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h4 className="font-serif italic text-base text-slate-200">
                {activePosition} Divergence Breakdown
              </h4>
              <span className="font-mono text-xs text-slate-400">
                Delta = Grade Rank − Gut Rank
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Prospect</th>
                    <th className="py-3 px-4 text-center">Gut Rank (Elo)</th>
                    <th className="py-3 px-4 text-center">Grade Rank</th>
                    <th className="py-3 px-4 text-center">Divergence Delta</th>
                    <th className="py-3 px-4 text-right">Elo Score</th>
                    <th className="py-3 px-4 text-right">Trait Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {gutVsGrades.items.map((item) => (
                    <tr key={item.player.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelectPlayer(item.player)}
                          className="font-serif italic text-sm font-semibold text-slate-200 hover:text-emerald-300 text-left"
                        >
                          {item.player.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-100">
                        #{item.gutRank}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-400">
                        #{item.gradeRank}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.delta > 0 ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                            <ArrowUp className="w-3 h-3" />
                            <span>+{item.delta}</span>
                          </span>
                        ) : item.delta < 0 ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold">
                            <ArrowDown className="w-3 h-3" />
                            <span>{item.delta}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                            <Minus className="w-3 h-3" />
                            <span>0</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-200">
                        {item.rating.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {item.player.overallGrade?.toFixed(1) || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMMIT PREFERENCE TO BOARD */}
      {/* ========================================================================= */}
      {commitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-serif italic text-lg text-slate-100">
                Commit {activePosition} Preference Order
              </h3>
              <button
                onClick={() => setCommitModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="font-mono text-xs text-slate-300 leading-relaxed">
              This will overwrite the ordering of all <strong className="text-emerald-400">{activePosition}</strong> prospects on your target board to match your gut preference standings. Other positions remain unchanged.
            </p>

            <div className="space-y-2">
              <label className="font-mono text-xs text-slate-400 uppercase tracking-wider block">
                Target Board Key
              </label>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 flex items-center justify-between">
                <span>Active Board: <strong className="text-emerald-400">{activeBoardKey}</strong></span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setCommitModalOpen(false)}
                className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-xs rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCommitToBoard}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/20"
              >
                Confirm & Commit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET POSITION CONFIRMATION */}
      {/* ========================================================================= */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-serif italic text-lg text-rose-300">
              Reset {activePosition} Preferences?
            </h3>
            <p className="font-mono text-xs text-slate-300 leading-relaxed">
              This will erase all recorded comparisons and reset Elo ratings for {activePosition} prospects back to 1500. This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-xs rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-lg transition-all shadow-lg shadow-rose-600/20"
              >
                Reset Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ========================================================================= */
/* PROSPECT MATCHUP CARD SUB-COMPONENT */
/* ========================================================================= */
interface ProspectMatchupCardProps {
  player: Player;
  side: 'A' | 'B';
  rating: number;
  comparisons: number;
  onSelectPlayer: (player: Player) => void;
}

const ProspectMatchupCard: React.FC<ProspectMatchupCardProps> = ({
  player,
  side,
  rating,
  comparisons,
  onSelectPlayer,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex flex-col justify-between space-y-6 shadow-xl relative transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-serif italic text-lg font-bold text-emerald-400 overflow-hidden">
            {player.photoUrl ? (
              <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              player.name.split(' ').map((n) => n[0]).join('')
            )}
          </div>
          <div>
            <button
              onClick={() => onSelectPlayer(player)}
              className="font-serif italic text-xl font-bold text-slate-100 hover:text-emerald-400 text-left block"
            >
              {player.name}
            </button>
            <span className="font-mono text-xs text-slate-400 block">
              {player.school} • {player.position}
            </span>
          </div>
        </div>

        <span className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-400 font-mono text-xs rounded">
          Card {side}
        </span>
      </div>

      {/* Metrics & Elo */}
      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block text-[10px] uppercase">Trait Grade</span>
          <span className="text-base font-bold text-slate-100">
            {player.overallGrade ? player.overallGrade.toFixed(1) : 'N/A'}
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block text-[10px] uppercase">Current Gut Elo</span>
          <span className="text-base font-bold text-emerald-400">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Trait Pillars (Object Property Mapping) */}
      {player.traits && (
        <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
            Trait Pillars
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(['athleticism', 'technique', 'production', 'footballIQ', 'sizeAndFrame'] as const).map((k) => {
              const val = player.traits?.[k];
              if (val === undefined) return null;
              const label = k === 'footballIQ' ? 'IQ' : k === 'sizeAndFrame' ? 'SIZ' : k.slice(0, 3).toUpperCase();
              return (
                <span key={k} className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[11px] rounded">
                  {label}: {val}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-3">
        <span>Height/Weight: {player.height || 'N/A'}, {player.weight ? `${player.weight} lbs` : 'N/A'}</span>
        <span>{comparisons} comps</span>
      </div>
    </div>
  );
};

export default PlayerRankingMatrix;
