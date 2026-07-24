import { Player, PreferenceOutcome, PreferenceComparison, PreferenceRating, PreferenceState } from '../types';

export const STORAGE_KEY = 'nfl_draft_preferences';
export const DEFAULT_RATING = 1500;
export const MIN_COMPARISONS = 3;
export const TARGET_COMPARISONS = 6;

export const OUTCOME_SCORES: Record<
  PreferenceOutcome,
  { scoreA: number; scoreB: number; label: string; shortLabel: string; keyHint: string }
> = {
  strong_a: { scoreA: 1.0, scoreB: 0.0, label: 'Strongly Prefer A', shortLabel: 'Strong A', keyHint: '1' },
  slight_a: { scoreA: 0.75, scoreB: 0.25, label: 'Prefer A', shortLabel: 'Prefer A', keyHint: '2' },
  toss_up:  { scoreA: 0.5, scoreB: 0.5, label: 'Toss-Up / Even', shortLabel: 'Toss-Up', keyHint: '3' },
  slight_b: { scoreA: 0.25, scoreB: 0.75, label: 'Prefer B', shortLabel: 'Prefer B', keyHint: '4' },
  strong_b: { scoreA: 0.0, scoreB: 1.0, label: 'Strongly Prefer B', shortLabel: 'Strong B', keyHint: '5' },
};

/**
 * Standard Elo update formula with provisional K-factor decay
 */
export function calculateEloUpdate(
  ratingA: number,
  ratingB: number,
  scoreA: number,
  countA: number,
  countB: number
) {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 - expectedA;

  const kA = countA < 10 ? 32 : 16;
  const kB = countB < 10 ? 32 : 16;

  const newRatingA = Math.round((ratingA + kA * (scoreA - expectedA)) * 10) / 10;
  const newRatingB = Math.round((ratingB + kB * ((1 - scoreA) - expectedB)) * 10) / 10;

  return {
    ratingA: newRatingA,
    ratingB: newRatingB,
    expectedA,
    expectedB,
  };
}

/**
 * Load preference state from localStorage
 */
export function loadPreferenceState(): PreferenceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load preference state from storage:', err);
    return {};
  }
}

/**
 * Save preference state to localStorage
 */
export function savePreferenceState(state: PreferenceState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save preference state to storage:', err);
  }
}

/**
 * Ensure all players in a position pool have rating entries
 */
export function ensurePositionPool(
  state: PreferenceState,
  position: string,
  players: Player[]
): PreferenceState {
  const posState = state[position] || { ratings: {}, history: [], updatedAt: Date.now() };
  const posPlayers = players.filter((p) => p.position === position);

  const updatedRatings = { ...posState.ratings };
  let modified = false;

  for (const player of posPlayers) {
    if (!updatedRatings[player.id]) {
      updatedRatings[player.id] = {
        playerId: player.id,
        position,
        rating: DEFAULT_RATING,
        comparisons: 0,
      };
      modified = true;
    }
  }

  if (!modified && state[position]) return state;

  return {
    ...state,
    [position]: {
      ...posState,
      ratings: updatedRatings,
      updatedAt: Date.now(),
    },
  };
}

/**
 * Select the next pair of players to compare within a position (§4 Pair selection algorithm)
 */
export function selectNextPair(
  players: Player[],
  position: string,
  state: PreferenceState,
  recentPairKeys: string[] = []
): [Player, Player] | null {
  const posPlayers = players.filter((p) => p.position === position);
  if (posPlayers.length < 2) return null;

  const posState = state[position] || { ratings: {}, history: [], updatedAt: Date.now() };
  const ratingsMap = posState.ratings;
  const history = posState.history;

  const candidates: { pA: Player; pB: Player; weight: number }[] = [];

  for (let i = 0; i < posPlayers.length; i++) {
    for (let j = i + 1; j < posPlayers.length; j++) {
      const pA = posPlayers[i];
      const pB = posPlayers[j];
      const pairKey = [pA.id, pB.id].sort().join(':');

      const rA = ratingsMap[pA.id]?.rating ?? DEFAULT_RATING;
      const rB = ratingsMap[pB.id]?.rating ?? DEFAULT_RATING;
      const cA = ratingsMap[pA.id]?.comparisons ?? 0;
      const cB = ratingsMap[pB.id]?.comparisons ?? 0;

      // Coverage floor priority
      const minComp = Math.min(cA, cB);
      const maxComp = Math.max(cA, cB);
      let coverageBoost = 1.0;
      if (minComp < MIN_COMPARISONS) {
        coverageBoost = 20.0 - minComp * 5.0;
      }

      // Informativeness (closeness)
      const diff = Math.abs(rA - rB);
      const closeness = 1.0 / (1.0 + diff / 100.0);

      // Uncertainty (fewer total comparisons)
      const uncertainty = 1.0 / (1.0 + minComp * 0.5 + maxComp * 0.2);

      // Anti-repeat
      const isLastShown = recentPairKeys.length > 0 && recentPairKeys[recentPairKeys.length - 1] === pairKey;
      const isRecentlyShown = recentPairKeys.includes(pairKey);
      const timesInHistory = history.filter(
        (h) => (h.playerAId === pA.id && h.playerBId === pB.id) || (h.playerAId === pB.id && h.playerBId === pA.id)
      ).length;

      let repeatPenalty = 1.0;
      if (isLastShown) {
        repeatPenalty = 0.001;
      } else if (isRecentlyShown) {
        repeatPenalty = 0.05;
      } else if (timesInHistory > 0) {
        repeatPenalty = 1.0 / (1.0 + timesInHistory * 3.0);
      }

      const weight = coverageBoost * closeness * uncertainty * repeatPenalty;
      candidates.push({ pA, pB, weight });
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.weight - a.weight);

  // Sample with weighted randomness among top candidate pool
  const topPool = candidates.slice(0, Math.min(5, candidates.length));
  const totalWeight = topPool.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight <= 0) return [topPool[0].pA, topPool[0].pB];

  let rand = Math.random() * totalWeight;
  for (const item of topPool) {
    rand -= item.weight;
    if (rand <= 0) {
      return [item.pA, item.pB];
    }
  }

  return [topPool[0].pA, topPool[0].pB];
}

/**
 * Record a comparison outcome and update Elo ratings
 */
export function recordComparison(
  state: PreferenceState,
  position: string,
  playerAId: string,
  playerBId: string,
  outcome: PreferenceOutcome,
  players: Player[]
): PreferenceState {
  const newState = ensurePositionPool(state, position, players);
  const posState = newState[position];

  const ratingAObj = posState.ratings[playerAId] || {
    playerId: playerAId,
    position,
    rating: DEFAULT_RATING,
    comparisons: 0,
  };
  const ratingBObj = posState.ratings[playerBId] || {
    playerId: playerBId,
    position,
    rating: DEFAULT_RATING,
    comparisons: 0,
  };

  const { scoreA } = OUTCOME_SCORES[outcome];

  const { ratingA: newRatingA, ratingB: newRatingB } = calculateEloUpdate(
    ratingAObj.rating,
    ratingBObj.rating,
    scoreA,
    ratingAObj.comparisons,
    ratingBObj.comparisons
  );

  const updatedRatings = {
    ...posState.ratings,
    [playerAId]: {
      ...ratingAObj,
      rating: newRatingA,
      comparisons: ratingAObj.comparisons + 1,
    },
    [playerBId]: {
      ...ratingBObj,
      rating: newRatingB,
      comparisons: ratingBObj.comparisons + 1,
    },
  };

  const newComparison: PreferenceComparison = {
    position,
    playerAId,
    playerBId,
    outcome,
    timestamp: Date.now(),
  };

  const updatedState: PreferenceState = {
    ...newState,
    [position]: {
      ratings: updatedRatings,
      history: [...posState.history, newComparison],
      updatedAt: Date.now(),
    },
  };

  savePreferenceState(updatedState);
  return updatedState;
}

/**
 * Undo the last comparison for a position by replaying history
 */
export function undoLastComparison(
  state: PreferenceState,
  position: string,
  players: Player[]
): PreferenceState {
  const posState = state[position];
  if (!posState || posState.history.length === 0) return state;

  const newHistory = posState.history.slice(0, -1);
  const posPlayers = players.filter((p) => p.position === position);

  const resetRatings: Record<string, PreferenceRating> = {};
  for (const p of posPlayers) {
    resetRatings[p.id] = {
      playerId: p.id,
      position,
      rating: DEFAULT_RATING,
      comparisons: 0,
    };
  }

  for (const comp of newHistory) {
    const rAObj = resetRatings[comp.playerAId] || {
      playerId: comp.playerAId,
      position,
      rating: DEFAULT_RATING,
      comparisons: 0,
    };
    const rBObj = resetRatings[comp.playerBId] || {
      playerId: comp.playerBId,
      position,
      rating: DEFAULT_RATING,
      comparisons: 0,
    };

    const { scoreA } = OUTCOME_SCORES[comp.outcome];
    const { ratingA: nA, ratingB: nB } = calculateEloUpdate(
      rAObj.rating,
      rBObj.rating,
      scoreA,
      rAObj.comparisons,
      rBObj.comparisons
    );

    resetRatings[comp.playerAId] = {
      ...rAObj,
      rating: nA,
      comparisons: rAObj.comparisons + 1,
    };
    resetRatings[comp.playerBId] = {
      ...rBObj,
      rating: nB,
      comparisons: rBObj.comparisons + 1,
    };
  }

  const updatedState: PreferenceState = {
    ...state,
    [position]: {
      ratings: resetRatings,
      history: newHistory,
      updatedAt: Date.now(),
    },
  };

  savePreferenceState(updatedState);
  return updatedState;
}

/**
 * Reset all preferences for a given position
 */
export function resetPositionPreferences(
  state: PreferenceState,
  position: string,
  players: Player[]
): PreferenceState {
  const posPlayers = players.filter((p) => p.position === position);
  const resetRatings: Record<string, PreferenceRating> = {};

  for (const p of posPlayers) {
    resetRatings[p.id] = {
      playerId: p.id,
      position,
      rating: DEFAULT_RATING,
      comparisons: 0,
    };
  }

  const updatedState: PreferenceState = {
    ...state,
    [position]: {
      ratings: resetRatings,
      history: [],
      updatedAt: Date.now(),
    },
  };

  savePreferenceState(updatedState);
  return updatedState;
}

/**
 * Get progress & settlement statistics for a position
 */
export function getPositionProgress(
  players: Player[],
  position: string,
  state: PreferenceState
) {
  const posPlayers = players.filter((p) => p.position === position);
  const totalPlayers = posPlayers.length;

  if (totalPlayers < 2) {
    return {
      progressPct: 100,
      completedPlayers: totalPlayers,
      totalPlayers,
      isSettled: true,
      totalComparisons: 0,
      statusLabel: 'Settled (Single Prospect)',
    };
  }

  const posState = state[position] || { ratings: {}, history: [] };
  const ratings = posState.ratings;

  let completedPlayers = 0;
  for (const p of posPlayers) {
    const count = ratings[p.id]?.comparisons || 0;
    if (count >= TARGET_COMPARISONS) {
      completedPlayers++;
    }
  }

  const progressPct = Math.min(100, Math.round((completedPlayers / totalPlayers) * 100));
  const totalComparisons = posState.history.length;
  const isSettled = completedPlayers === totalPlayers;

  let statusLabel = 'Developing';
  if (isSettled) {
    statusLabel = 'Settled';
  } else if (completedPlayers > 0) {
    statusLabel = `${progressPct}% Settled`;
  } else {
    statusLabel = 'Provisional (New)';
  }

  return {
    progressPct,
    completedPlayers,
    totalPlayers,
    isSettled,
    totalComparisons,
    statusLabel,
  };
}

export interface GutVsGradesItem {
  player: Player;
  gutRank: number;
  gradeRank: number;
  delta: number; // gradeRank - gutRank. Positive = Gut Sleeper, Negative = Gut Skeptic
  rating: number;
  comparisons: number;
}

/**
 * Calculate Gut vs Grades divergence matrix for a position
 */
export function getGutVsGrades(
  players: Player[],
  position: string,
  state: PreferenceState
): {
  items: GutVsGradesItem[];
  biggestSleeper: GutVsGradesItem | null;
  biggestSkeptic: GutVsGradesItem | null;
} {
  const posPlayers = players.filter((p) => p.position === position);
  if (posPlayers.length === 0) {
    return { items: [], biggestSleeper: null, biggestSkeptic: null };
  }

  const posState = state[position] || { ratings: {}, history: [] };
  const ratingsMap = posState.ratings;

  // Grade Rank sorting (overallGrade descending)
  const gradeSorted = [...posPlayers].sort((a, b) => (b.overallGrade || 0) - (a.overallGrade || 0));
  const gradeRanks: Record<string, number> = {};
  gradeSorted.forEach((p, idx) => {
    gradeRanks[p.id] = idx + 1;
  });

  // Gut Rank sorting (Elo rating descending)
  const eloSorted = [...posPlayers].sort((a, b) => {
    const rA = ratingsMap[a.id]?.rating ?? DEFAULT_RATING;
    const rB = ratingsMap[b.id]?.rating ?? DEFAULT_RATING;
    return rB - rA;
  });

  const eloRanks: Record<string, number> = {};
  eloSorted.forEach((p, idx) => {
    eloRanks[p.id] = idx + 1;
  });

  const items: GutVsGradesItem[] = posPlayers.map((p) => {
    const gutRank = eloRanks[p.id];
    const gradeRank = gradeRanks[p.id];
    const delta = gradeRank - gutRank;
    const ratingObj = ratingsMap[p.id];

    return {
      player: p,
      gutRank,
      gradeRank,
      delta,
      rating: ratingObj?.rating ?? DEFAULT_RATING,
      comparisons: ratingObj?.comparisons ?? 0,
    };
  });

  items.sort((a, b) => a.gutRank - b.gutRank);

  const sleepers = items.filter((item) => item.delta > 0);
  const skeptics = items.filter((item) => item.delta < 0);

  let biggestSleeper: GutVsGradesItem | null = null;
  if (sleepers.length > 0) {
    biggestSleeper = sleepers.reduce((max, curr) => (curr.delta > max.delta ? curr : max), sleepers[0]);
  }

  let biggestSkeptic: GutVsGradesItem | null = null;
  if (skeptics.length > 0) {
    biggestSkeptic = skeptics.reduce((min, curr) => (curr.delta < min.delta ? curr : min), skeptics[0]);
  }

  return { items, biggestSleeper, biggestSkeptic };
}
