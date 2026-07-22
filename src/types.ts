export interface PlayerTraits {
  athleticism: number;
  technique: number;
  production: number;
  footballIQ: number;
  sizeAndFrame: number;
}

export interface BigBoardInfo {
  rank: number;
  comment: string;
  url?: string;
  sourceName?: string;
  isRealQuote?: boolean;
  dateStr?: string;
}

export interface GradeHistoryPoint {
  date: string;
  grade: number;
  milestone: string;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  school: string;
  height: string;
  weight: number;
  year: string;
  traits: PlayerTraits;
  scoutingReport: string;
  strengths: string[];
  weaknesses: string[];
  bigBoards: {
    [boardName: string]: BigBoardInfo;
  };
  overallGrade: number;
  archetype?: string;
  isCustom?: boolean;
  scoutNotes?: string;
  gradeHistory?: GradeHistoryPoint[];
  labels?: string[];
  photoUrl?: string;
}

export interface Team {
  id: string; // Abbreviation, e.g. "GB", "KC"
  name: string;
  fullName: string;
  logoColor: string; // Hex code for primary color
  textColor: string; // Hex code for text on primary color
  secondaryColor: string; // Hex code for secondary accent
  division: string;
  needs: string[];
  currentScheme: string;
  draftPicks: string[];
}

export interface Scheme {
  id: string;
  name: string;
  type: 'offense' | 'defense';
  description: string;
  favoredPositions: string[];
}

// ==========================================
// Spec 01 — Pairwise Elo Preference Engine Types
// ==========================================

export type PreferenceOutcome =
  | 'strong_a'
  | 'slight_a'
  | 'toss_up'
  | 'slight_b'
  | 'strong_b';

export interface PreferenceComparison {
  position: string;         // 'QB', 'WR', ... — the pool this belongs to
  playerAId: string;
  playerBId: string;
  outcome: PreferenceOutcome;
  timestamp: number;
}

export interface PreferenceRating {
  playerId: string;
  position: string;
  rating: number;           // Elo, starts 1500
  comparisons: number;      // count this player has been in
}

// Per-position preference state, keyed by position.
export interface PreferenceState {
  [position: string]: {
    ratings: Record<string, PreferenceRating>;  // by playerId
    history: PreferenceComparison[];
    updatedAt: number;
  };
}
