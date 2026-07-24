import { Player, PlayerTraits } from '../types';
import {
  PositionTraitDef,
  PositionTraitSchema,
  getPositionSchema,
  KEY_TRAIT_WEIGHT_THRESHOLD,
} from '../data/traitSchemas';

// ==========================================================================
// Spec 03 — Position-Aware Trait System : Grading Utilities
// ==========================================================================
//
// Public API consumed by RadarChart.tsx, PlayerProfileModal.tsx and
// PlayerComparer.tsx:
//
//   getSchema(position)            -> PositionTraitDef[]
//   pillarRollup(player)           -> PlayerTraits  (all 5 keys, always)
//   computePositionGrade(player)   -> number        (50..99)
//   topTraits(player, n)           -> ScoredTrait[]
//   bottomTraits(player, n)        -> ScoredTrait[]
//   getWeightBadgeInfo(weight)     -> { isKey, percentage }
//
// Fallback rule (single source of truth): when a position sub-trait is not
// populated on Player.positionTraits, its value falls back to the owning
// 5-pillar score, and finally to DEFAULT_TRAIT_SCORE (70). This 70 default is
// intentionally identical to the fallback used inline by the components.
// ==========================================================================

export const DEFAULT_TRAIT_SCORE = 70;
const GRADE_FLOOR = 50;
const GRADE_CEIL = 99;

export interface ScoredTrait {
  key: string;
  label: string;
  pillar: keyof PlayerTraits;
  value: number;
  weight: number;
}

const clamp = (v: number, lo = GRADE_FLOOR, hi = GRADE_CEIL): number =>
  Math.max(lo, Math.min(hi, v));

/**
 * Returns the ordered sub-trait schema for a player's position.
 * Unknown/blank positions fall back to the FLEX schema (never empty).
 */
export function getSchema(position: string | undefined): PositionTraitSchema {
  return getPositionSchema(position);
}

/**
 * Resolves the effective 50..99 score for one sub-trait:
 *   positionTraits[key]  ->  traits[pillar]  ->  DEFAULT_TRAIT_SCORE (70)
 */
export function getValueForTrait(
  player: Pick<Player, 'positionTraits' | 'traits'>,
  def: PositionTraitDef
): number {
  const fromPosition = player.positionTraits?.[def.key];
  if (typeof fromPosition === 'number') return fromPosition;

  const fromPillar = player.traits?.[def.pillar];
  if (typeof fromPillar === 'number') return fromPillar;

  return DEFAULT_TRAIT_SCORE;
}

/** All sub-traits for a player, scored and annotated. */
export function scoreAllTraits(
  player: Pick<Player, 'position' | 'positionTraits' | 'traits'>
): ScoredTrait[] {
  const schema = getSchema(player.position);
  return schema.map((def) => ({
    key: def.key,
    label: def.label,
    pillar: def.pillar,
    value: getValueForTrait(player, def),
    weight: def.weight,
  }));
}

/**
 * Rolls the populated position sub-traits back up into the 5 core pillars.
 * ALWAYS returns a complete PlayerTraits (all five keys). For a pillar with no
 * sub-traits in the schema, the player's existing pillar value is preserved.
 */
export function pillarRollup(
  player: Pick<Player, 'position' | 'positionTraits' | 'traits'>
): PlayerTraits {
  const schema = getSchema(player.position);
  const base: PlayerTraits = { ...player.traits };

  const pillarKeys: (keyof PlayerTraits)[] = [
    'athleticism',
    'technique',
    'production',
    'footballIQ',
    'sizeAndFrame',
  ];

  pillarKeys.forEach((pillar) => {
    const defs = schema.filter((d) => d.pillar === pillar);
    if (defs.length === 0) return; // keep existing pillar value

    const weightSum = defs.reduce((s, d) => s + d.weight, 0);
    if (weightSum <= 0) return;

    const weighted = defs.reduce(
      (s, d) => s + getValueForTrait(player, d) * d.weight,
      0
    );
    base[pillar] = clamp(Math.round(weighted / weightSum));
  });

  return base;
}

/**
 * Weighted aggregate position grade (50..99) across the full position schema.
 * Schema weights sum to ~1.0, so this is a weighted average of sub-trait scores.
 */
export function computePositionGrade(
  player: Pick<Player, 'position' | 'positionTraits' | 'traits'>
): number {
  const schema = getSchema(player.position);
  if (schema.length === 0) return clamp(player.traits ? avgPillars(player.traits) : DEFAULT_TRAIT_SCORE);

  const weightSum = schema.reduce((s, d) => s + d.weight, 0);
  if (weightSum <= 0) return DEFAULT_TRAIT_SCORE;

  const weighted = schema.reduce(
    (s, d) => s + getValueForTrait(player, d) * d.weight,
    0
  );
  return clamp(Math.round(weighted / weightSum));
}

function avgPillars(t: PlayerTraits): number {
  return Math.round(
    (t.athleticism + t.technique + t.production + t.footballIQ + t.sizeAndFrame) / 5
  );
}

/** Top-N scored sub-traits, highest value first. */
export function topTraits(
  player: Pick<Player, 'position' | 'positionTraits' | 'traits'>,
  n = 3
): ScoredTrait[] {
  return [...scoreAllTraits(player)].sort((a, b) => b.value - a.value).slice(0, n);
}

/** Bottom-N scored sub-traits, lowest value first (growth areas). */
export function bottomTraits(
  player: Pick<Player, 'position' | 'positionTraits' | 'traits'>,
  n = 3
): ScoredTrait[] {
  return [...scoreAllTraits(player)].sort((a, b) => a.value - b.value).slice(0, n);
}

export interface WeightBadgeInfo {
  isKey: boolean;
  percentage: number; // whole-number percent, e.g. 18 for weight 0.18
}

/**
 * Badge metadata for a sub-trait weight. `isKey` marks the heavily-weighted
 * traits that define the position (weight >= KEY_TRAIT_WEIGHT_THRESHOLD).
 */
export function getWeightBadgeInfo(weight: number): WeightBadgeInfo {
  return {
    isKey: weight >= KEY_TRAIT_WEIGHT_THRESHOLD,
    percentage: Math.round(weight * 100),
  };
}
