export interface PlayerTraits {
  athleticism: number;
  technique: number;
  production: number;
  footballIQ: number;
  sizeAndFrame: number;
}

export type Pillar = keyof PlayerTraits;

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
  // Spec 03 — Position-Aware Trait System.
  // Optional map of position sub-trait key -> 50..99 score. Absent keys fall
  // back to the owning 5-pillar value (see src/utils/traitGrading.ts).
  positionTraits?: Record<string, number>;
  usageProjection?: UsageProjection;
}

// ==========================================
// Spec 01 — Pairwise Elo Preference Engine
// ==========================================

export type PreferenceOutcome =
  | 'strong_a' | 'slight_a' | 'toss_up' | 'slight_b' | 'strong_b';

export interface PreferenceComparison {
  position: string;         // pool this belongs to ('QB', 'WR', ...)
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


// ===== Spec 02/04 additive types (merged from deliverable) =====
export interface UsageRole {
  id: string;
  label: string; // e.g. 'Stand-up 3-4 OLB rusher'
  scheme?: string; // Scheme.id matching SCHEMES ('34defense', 'zoneblock', etc.)
  formationSpot?: string; // e.g. 'EDGE (wide-9)' / 'SLOT' / 'BOX safety'
  fitScore: number; // 0..99, from trait x scheme/role weighting
  rationale: string; // trait-grounded 'why'
  isPrimary?: boolean;
}

export interface UsageProjection {
  roles: UsageRole[]; // ranked by fitScore desc
  primaryRoleId: string;
  computedAt: number;
  userEdited?: boolean; // true once the user overrides
}

export interface GMDraftPick {
  year: number;
  round: number;
  overallPick: number;
  playerName: string;
  position: string; // Normalized app position group (QB, RB, WR, TE, OT, IOL, EDGE, DT, LB, CB, S, FLEX)
  rawPosition?: string; // Raw PFR position string
  college: string;
  teamId: string; // App Team.id, e.g. 'PHI', 'NYG', 'SF', 'JAX'
  careerAV?: number;
}

export interface GMTenure {
  teamId: string;
  startYear: number;
  endYear: number | null; // null = active GM
}

export interface GMProfile {
  id: string; // slug, e.g. 'howie-roseman'
  name: string;
  title?: string;
  tenures: GMTenure[];
  picks: GMDraftPick[];
}

export interface GMTendencies {
  totalPicks: number;
  positionCounts: Record<string, number>;
  positionShare: Record<string, number>; // Percentage 0..100
  draftCapitalByPos: Record<string, number>; // Total Jimmy Johnson points invested per position
  roundMatrix: {
    round1: Record<string, number>;
    day2: Record<string, number>; // Rounds 2-3
    day3: Record<string, number>; // Rounds 4-7
  };
  r1LeanText: string; // Top R1 positions by frequency, e.g. "DT (3), QB (2)"
  earlyRoundPriorities: { position: string; count: number; percentage: number }[];
  topColleges: { college: string; count: number }[];
}
