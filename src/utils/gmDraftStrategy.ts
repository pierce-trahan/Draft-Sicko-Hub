import { Player, Team, GMProfile, GMTendencies } from '../types';
import { GM_PROFILES } from '../data/gmData';
import { computeGMTendencies } from './gmTendencies';
import { SCHEMES } from '../data/teams';

export interface CpuPickResult {
  selectedPlayer: Player;
  rationale: string;
  gmName?: string;
  score: number;
}

/**
 * Finds the active GM profile associated with a team ID.
 */
export function getGmProfileForTeam(teamId: string): GMProfile | undefined {
  return GM_PROFILES.find((gm) =>
    gm.tenures.some((t) => t.teamId === teamId && t.endYear === null)
  );
}

/**
 * Selects the top CPU prospect using the GM-flavored evaluation model and generates a clear, explainable rationale.
 *
 * Fixes applied (Spec 06 Pass 2):
 * - F-4: Athletic bias is data-derived from tendencies.athleticLean (no GM-slug if-ladder).
 * - F-5: Athletic signal is candidate's percentile of traits.athleticism vs available pool (0..1) * athleticLeanStrength.
 * - F-6: Smart fallback keeps scheme-fit (+SCHEMES) & positional premium (QB/EDGE/OT/CB/WR).
 * - F-7: computeGMTendencies computed ONCE per team-on-clock pick (hoisted out of candidate loop).
 * - F-8: gmPosBias is normalized to position share within round phase (0..100).
 * - F-9: Chaos noise tuned relative to score scale.
 */
export function selectCpuPick(
  availablePlayers: Player[],
  team: Team,
  roundNumber: number,
  teamNeeds: string[],
  orderedList: Player[],
  chaosFactor: number = 0.2
): CpuPickResult {
  const gmProfile = getGmProfileForTeam(team.id);

  // F-7: Hoist computeGMTendencies out of candidate loop (computed ONCE per team pick)
  let tendencies: GMTendencies | undefined;
  let athleticLeanStrength = 0;

  if (gmProfile) {
    tendencies = computeGMTendencies(gmProfile, team.id);
    if (tendencies.athleticLean) {
      // F-4: Scale athletic lean magnitude dynamically from tendencies.athleticLean.avgScore (0..10 scale, 5.0 baseline)
      athleticLeanStrength = Math.max(
        0,
        (tendencies.athleticLean.avgScore - 5.0) / 5.0
      );
    }
  }

  // F-5: Pre-compute available pool athleticism min & max for pool-relative percentiles
  let minAth = 99;
  let maxAth = 0;
  availablePlayers.forEach((p) => {
    const ath = p.traits?.athleticism ?? 70;
    if (ath < minAth) minAth = ath;
    if (ath > maxAth) maxAth = ath;
  });
  const athRange = maxAth - minAth > 0 ? maxAth - minAth : 1;

  let bestPlayer = availablePlayers[0];
  let bestScore = -99999;
  let bestGmPosBias = 0;
  let bestHasNeed = false;

  availablePlayers.forEach((player) => {
    // 1. Board Value Score (0-100)
    const boardIndex = orderedList.findIndex((p) => p.id === player.id);
    let valueScore = player.overallGrade;
    if (boardIndex !== -1) {
      valueScore += ((orderedList.length - boardIndex) / orderedList.length) * 8;
    }

    // 2. Need Score
    const needIndex = teamNeeds.indexOf(player.position);
    const isMultiMatch =
      player.position.includes('/') &&
      player.position.split('/').some((p) => teamNeeds.includes(p));

    let needBonus = 0;
    let hasNeed = false;

    if (needIndex !== -1) {
      hasNeed = true;
      needBonus = 18 - needIndex * 2;
    } else if (isMultiMatch) {
      hasNeed = true;
      needBonus = 12;
    }

    // 3. F-6: Scheme Fit & Positional Premium
    let schemeBonus = 0;
    const teamSchemeObj = SCHEMES.find(
      (s) => s.name === team.currentScheme || s.id === team.currentScheme
    );
    if (teamSchemeObj && teamSchemeObj.favoredPositions.includes(player.position)) {
      schemeBonus = 4;
    }

    let premiumBonus = 0;
    const premiumPositions = ['QB', 'EDGE', 'OT', 'CB', 'WR'];
    if (premiumPositions.includes(player.position)) {
      premiumBonus = player.position === 'QB' && hasNeed ? 6 : 2.5;
    }

    // 4. F-8: Normalized GM Position Share Bias (0-100)
    let gmPosBias = 0;
    if (tendencies) {
      let roundDict: Record<string, number> = {};
      if (roundNumber === 1) roundDict = tendencies.roundMatrix.round1;
      else if (roundNumber <= 3) roundDict = tendencies.roundMatrix.day2;
      else roundDict = tendencies.roundMatrix.day3;

      const pickCount = roundDict[player.position] || 0;
      const totalPhasePicks = Object.values(roundDict).reduce((sum, c) => sum + c, 0);

      if (totalPhasePicks > 0) {
        const posShareInPhase = pickCount / totalPhasePicks; // 0..1
        gmPosBias = posShareInPhase * 100; // 0..100
      }
    }

    // 5. F-4 & F-5: Data-Derived Pool Percentile Athletic Bias
    let gmAthleticBias = 0;
    const candAth = player.traits?.athleticism ?? 70;
    const poolPercentile = (candAth - minAth) / athRange; // 0..1 relative to pool

    if (gmProfile && athleticLeanStrength > 0) {
      gmAthleticBias = poolPercentile * athleticLeanStrength * 100;
    }

    // Score blend
    let baseScore: number;
    if (gmProfile) {
      baseScore =
        valueScore +
        needBonus * 1.5 +
        schemeBonus +
        premiumBonus +
        gmPosBias * 0.25 +
        gmAthleticBias * 0.20;
    } else {
      // F-6: Smart Fallback (Value + Need + Scheme + Premium)
      baseScore = valueScore + needBonus + schemeBonus + premiumBonus;
    }

    // F-9: Tuned Chaos Noise
    const noise = (Math.random() - 0.5) * chaosFactor * 20;
    const finalScore = baseScore + noise;

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestPlayer = player;
      bestGmPosBias = gmPosBias;
      bestHasNeed = hasNeed;
    }
  });

  // Construct explainable selection rationale
  const boardRank = orderedList.findIndex((p) => p.id === bestPlayer.id) + 1;
  const bestAth = bestPlayer.traits?.athleticism ?? 70;
  const poolPercentile = (bestAth - minAth) / athRange;

  let rationale = '';
  if (gmProfile) {
    if (athleticLeanStrength > 0.3 && poolPercentile >= 0.75) {
      rationale = `Drafted high-athletic outlier ${bestPlayer.name} (${bestPlayer.position}) matching ${gmProfile.name}'s historical athletic profile preference.`;
    } else if (bestGmPosBias >= 20) {
      rationale = `Selected ${bestPlayer.name} (${bestPlayer.position}) aligned with ${gmProfile.name}'s Round ${roundNumber} position target history.`;
    } else if (bestHasNeed) {
      rationale = `Selected ${bestPlayer.name} to fill priority team need at ${bestPlayer.position} (${gmProfile.name} in-character decision).`;
    } else {
      rationale = `Drafted top available overall value ${bestPlayer.name} (#${boardRank} on board) following ${gmProfile.name}'s rankings.`;
    }
  } else {
    if (bestHasNeed) {
      rationale = `Addressed critical team need at ${bestPlayer.position} (Priority Need Match).`;
    } else {
      rationale = `Drafted Best Player Available: ${bestPlayer.name} (#${boardRank} Board Rank).`;
    }
  }

  return {
    selectedPlayer: bestPlayer,
    rationale,
    gmName: gmProfile?.name,
    score: Math.round(bestScore),
  };
}

/**
 * Returns a human-readable strategy summary badge for a team's GM.
 */
export function getGmStrategySummary(teamId: string): string {
  const gm = getGmProfileForTeam(teamId);
  if (!gm) return 'Standard CPU Model: Need, BPA Value & Scheme Alignment';

  if (gm.id === 'howie-roseman') {
    return 'Howie Roseman (PHI): Premium Position Allocation (DL/OL/QB) & High Capital Spend';
  }
  if (gm.id === 'joe-schoen') {
    return 'Joe Schoen (NYG): Early Round Target Allocation (WR/CB/OL)';
  }
  if (gm.id === 'trent-baalke') {
    return 'Trent Baalke (JAX/SF): Athletic Outliers & High-RAS Edge/DL Preference';
  }

  return `${gm.name}: Historical Tendency Model Active`;
}
