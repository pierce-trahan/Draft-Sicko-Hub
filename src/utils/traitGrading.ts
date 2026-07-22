import { Player, PlayerTraits, TraitDef, Pillar } from '../types';
import { getTraitSchemaForPosition } from '../data/traitSchemas';

// Spec 03 — derived values for the position-aware trait model.
// All functions treat positionTraits as OPTIONAL: when absent they fall back to
// the player's existing 5-pillar traits / overallGrade so behavior is unchanged.

export interface EvaluatedTrait {
  key: string;
  label: string;
  pillar: Pillar;
  weight: number;
  value: number;
}

export function getSchema(position?: string): TraitDef[] {
  return getTraitSchemaForPosition(position);
}

/** Weighted position grade from positionTraits; falls back to overallGrade when absent. */
export function computePositionGrade(player: Partial<Player>): number {
  if (!player) return 70;

  const posTraits = player.positionTraits;
  if (!posTraits || Object.keys(posTraits).length === 0) {
    return player.overallGrade ?? 70;
  }

  const schema = getSchema(player.position);
  let weightedSum = 0;
  let totalWeight = 0;

  for (const trait of schema) {
    const val = posTraits[trait.key];
    if (val !== undefined && val !== null) {
      weightedSum += val * trait.weight;
      totalWeight += trait.weight;
    }
  }

  if (totalWeight === 0) {
    return player.overallGrade ?? 70;
  }

  return Math.round(weightedSum / totalWeight);
}

/** Aggregate position sub-traits back into the 5 pillars (keeps base pillars when absent). */
export function pillarRollup(player: Partial<Player>): PlayerTraits {
  const defaultPillars: PlayerTraits = player.traits || {
    athleticism: 70,
    technique: 70,
    production: 70,
    footballIQ: 70,
    sizeAndFrame: 70,
  };

  const posTraits = player.positionTraits;
  if (!posTraits || Object.keys(posTraits).length === 0) {
    return { ...defaultPillars };
  }

  const schema = getSchema(player.position);

  const pillarSums: Record<Pillar, number> = {
    athleticism: 0, technique: 0, production: 0, footballIQ: 0, sizeAndFrame: 0,
  };
  const pillarWeights: Record<Pillar, number> = {
    athleticism: 0, technique: 0, production: 0, footballIQ: 0, sizeAndFrame: 0,
  };
  const pillarCounts: Record<Pillar, number> = {
    athleticism: 0, technique: 0, production: 0, footballIQ: 0, sizeAndFrame: 0,
  };

  for (const trait of schema) {
    const p = trait.pillar;
    const val = posTraits[trait.key];
    if (val !== undefined && val !== null) {
      pillarSums[p] += val * trait.weight;
      pillarWeights[p] += trait.weight;
      pillarCounts[p] += 1;
    }
  }

  const result: PlayerTraits = { ...defaultPillars };
  const pillars: Pillar[] = ['athleticism', 'technique', 'production', 'footballIQ', 'sizeAndFrame'];

  for (const p of pillars) {
    if (pillarWeights[p] > 0) {
      result[p] = Math.round(pillarSums[p] / pillarWeights[p]);
    } else if (pillarCounts[p] > 0) {
      const totalPillarVal = schema
        .filter((t) => t.pillar === p)
        .reduce((sum, t) => sum + (posTraits[t.key] ?? defaultPillars[p]), 0);
      result[p] = Math.round(totalPillarVal / pillarCounts[p]);
    }
  }

  return result;
}

function evaluate(player: Partial<Player>): EvaluatedTrait[] {
  const schema = getSchema(player.position);
  const posTraits = player.positionTraits || {};
  const rolledUp = pillarRollup(player);

  return schema.map((trait) => ({
    key: trait.key,
    label: trait.label,
    pillar: trait.pillar,
    weight: trait.weight,
    value: posTraits[trait.key] !== undefined ? posTraits[trait.key] : rolledUp[trait.pillar] ?? 70,
  }));
}

/** Highest-value weighted traits (strengths). */
export function topTraits(player: Partial<Player>, n: number = 3): EvaluatedTrait[] {
  return evaluate(player).sort((a, b) => b.value - a.value || b.weight - a.weight).slice(0, n);
}

/** Lowest-value weighted traits (growth areas). */
export function bottomTraits(player: Partial<Player>, n: number = 3): EvaluatedTrait[] {
  return evaluate(player).sort((a, b) => a.value - b.value || b.weight - a.weight).slice(0, n);
}

export function getWeightBadgeInfo(weight: number): { label: string; isKey: boolean } {
  if (weight >= 0.15) return { label: 'Key Trait', isKey: true };
  if (weight >= 0.10) return { label: 'Core Trait', isKey: false };
  return { label: 'Secondary', isKey: false };
}
