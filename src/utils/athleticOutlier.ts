import { Player, AthleticMeasurables, AthleticProfile } from '../types';
import { ATHLETIC_BASELINES, PERCENTILE_STEPS } from '../data/athleticBaselines';

// ==========================================================================
// Spec 05 — Athletic Profile & Outlier Metric
// ==========================================================================
//
// Computes positional percentiles + a RAS-style 0..10 composite from combine
// measurables (baselines derived from nflverse combine data, CC-BY 4.0), and
// the "outlier delta" = athleticism vs. production/scouting grade.
//
// All functions guard against missing data — no fabricated numbers.
// ==========================================================================

export interface AthleticMetricMeta {
  key: keyof AthleticMeasurables;
  label: string;
  unit: string;
  lowerBetter: boolean;
  size?: boolean; // size metric (bigger = higher percentile), not a movement test
}

// Metrics with a baseline live in ATHLETIC_BASELINES; arm/hand/tenSplit have no
// combine baseline (not in the dataset) — shown as measurables, no percentile.
export const ATHLETIC_METRICS: AthleticMetricMeta[] = [
  { key: 'forty', label: '40-Yard Dash', unit: 's', lowerBetter: true },
  { key: 'tenSplit', label: '10-Yard Split', unit: 's', lowerBetter: true },
  { key: 'twentyShuttle', label: '20-Yard Shuttle', unit: 's', lowerBetter: true },
  { key: 'threeCone', label: '3-Cone Drill', unit: 's', lowerBetter: true },
  { key: 'vertical', label: 'Vertical Jump', unit: '"', lowerBetter: false },
  { key: 'broad', label: 'Broad Jump', unit: '"', lowerBetter: false },
  { key: 'bench', label: 'Bench Press', unit: ' reps', lowerBetter: false },
  { key: 'weightLb', label: 'Weight', unit: ' lb', lowerBetter: false, size: true },
  { key: 'heightIn', label: 'Height', unit: '"', lowerBetter: false, size: true },
  { key: 'armIn', label: 'Arm Length', unit: '"', lowerBetter: false, size: true },
  { key: 'handIn', label: 'Hand Size', unit: '"', lowerBetter: false, size: true },
];

// Metrics that feed the composite 0..10 score (must match the generator).
const SCORE_BASIS: (keyof AthleticMeasurables)[] = [
  'forty', 'vertical', 'broad', 'threeCone', 'twentyShuttle', 'bench', 'weightLb', 'heightIn',
];

const LOWER_BETTER = new Set<string>(['forty', 'threeCone', 'twentyShuttle', 'tenSplit']);

/** Normalize an app position to a baseline key (FLEX / unknowns have no baseline). */
function baselineKey(position: string | undefined): string | undefined {
  const p = (position || '').trim().toUpperCase();
  return ATHLETIC_BASELINES[p] ? p : undefined;
}

/**
 * Percentile (0..100, higher = more athletic) for one measurable vs. its
 * position group. Returns undefined when no baseline exists for the metric.
 */
export function computePercentile(
  position: string | undefined,
  metric: keyof AthleticMeasurables,
  value: number
): number | undefined {
  const key = baselineKey(position);
  if (key === undefined) return undefined;
  const anchors = ATHLETIC_BASELINES[key][metric as string];
  if (!anchors || anchors.length !== PERCENTILE_STEPS.length) return undefined;

  // raw percentile of value against the ascending anchor values
  let raw: number;
  if (value <= anchors[0]) raw = PERCENTILE_STEPS[0];
  else if (value >= anchors[anchors.length - 1]) raw = PERCENTILE_STEPS[anchors.length - 1];
  else {
    raw = 100;
    for (let i = 1; i < anchors.length; i++) {
      if (value <= anchors[i]) {
        const v0 = anchors[i - 1], v1 = anchors[i];
        const p0 = PERCENTILE_STEPS[i - 1], p1 = PERCENTILE_STEPS[i];
        raw = v1 === v0 ? p1 : p0 + (p1 - p0) * ((value - v0) / (v1 - v0));
        break;
      }
    }
  }
  const pct = LOWER_BETTER.has(metric as string) ? 100 - raw : raw;
  return Math.round(Math.max(0, Math.min(100, pct)));
}

/**
 * Builds percentiles + a 0..10 composite athletic score from measurables.
 * Returns an AthleticProfile (source 'computed') or undefined if too little data.
 */
export function computeAthleticProfile(
  position: string | undefined,
  measurables: AthleticMeasurables
): AthleticProfile | undefined {
  const percentiles: Record<string, number> = {};
  for (const m of ATHLETIC_METRICS) {
    const v = measurables[m.key];
    if (typeof v === 'number') {
      const p = computePercentile(position, m.key, v);
      if (p !== undefined) percentiles[m.key] = p;
    }
  }

  const basisPcts = SCORE_BASIS.map((k) => percentiles[k]).filter(
    (p): p is number => typeof p === 'number'
  );
  const athleticScore =
    basisPcts.length >= 3
      ? Math.round((basisPcts.reduce((s, p) => s + p, 0) / basisPcts.length / 10) * 10) / 10
      : undefined;

  return {
    measurables,
    percentiles,
    athleticScore,
    source: 'computed',
  };
}

export type OutlierBandId = 'athletic_outlier' | 'balanced' | 'producer' | 'insufficient';

export interface OutlierResult {
  band: OutlierBandId;
  label: string;
  delta?: number;            // normalizedAthletic(0..99) - productionSignal
  normalizedAthletic?: number;
  productionSignal?: number;
  rationale: string;
}

const OUTLIER_THRESHOLD = 10; // grade points

/** The production baseline for the outlier: Spec 03 production pillar, else overallGrade. */
export function getProductionSignal(player: Pick<Player, 'traits' | 'overallGrade'>): number | undefined {
  const prod = player.traits?.production;
  if (typeof prod === 'number') return prod;
  if (typeof player.overallGrade === 'number') return player.overallGrade;
  return undefined;
}

/**
 * Athletic-vs-production outlier. Only computed when BOTH an athletic score and a
 * production signal exist; otherwise reports 'insufficient' (never a fake number).
 */
export function computeOutlier(
  player: Pick<Player, 'traits' | 'overallGrade' | 'athleticProfile'>
): OutlierResult {
  const score = player.athleticProfile?.athleticScore;
  const production = getProductionSignal(player);

  if (typeof score !== 'number' || typeof production !== 'number') {
    return {
      band: 'insufficient',
      label: 'Insufficient Data',
      rationale: 'Needs both an athletic score and a production/grade signal to compute.',
    };
  }

  const normalizedAthletic = Math.round(score * 9.9); // 0..10 -> 0..99
  const delta = normalizedAthletic - production;

  let band: OutlierBandId, label: string, rationale: string;
  if (delta >= OUTLIER_THRESHOLD) {
    band = 'athletic_outlier';
    label = 'Athletic Outlier';
    rationale = `Tests well above his production/grade (athletic ${normalizedAthletic} vs. production ${production}). Toolsy — traits lead the tape.`;
  } else if (delta <= -OUTLIER_THRESHOLD) {
    band = 'producer';
    label = 'Producer';
    rationale = `Produces above his athletic profile (production ${production} vs. athletic ${normalizedAthletic}). Game exceeds the workout.`;
  } else {
    band = 'balanced';
    label = 'Traits Match Production';
    rationale = `Athleticism and production track together (${normalizedAthletic} vs. ${production}).`;
  }

  return { band, label, delta, normalizedAthletic, productionSignal: production, rationale };
}
