import { Player, UsageRole, UsageProjection } from '../types';
import { ROLE_CATALOG } from '../data/usageRoles';
import { SCHEMES } from '../data/teams';

/**
 * Computes usage roles, scheme bonuses, and fit scores for a given prospect.
 */
export function computeUsageProjection(player: Partial<Player>): UsageProjection {
  const pos = (player.position || 'FLEX').toUpperCase();

  // Find candidate roles matching player position (or FLEX candidate union)
  let candidateCatalog = ROLE_CATALOG.filter((item) => {
    if (pos === 'FLEX') return true;
    return item.positions.includes(pos) || item.positions.includes('FLEX');
  });

  if (candidateCatalog.length === 0) {
    candidateCatalog = ROLE_CATALOG;
  }

  // Calculate fit score and rationale for each candidate role
  const computedRoles: UsageRole[] = candidateCatalog.map((roleDef) => {
    let scoreAcc = 0;
    let weightSum = 0;

    const traitDetails: { label: string; score: number }[] = [];

    roleDef.rewardedTraits.forEach(({ traitKey, pillarFallback, weight }) => {
      let val: number | undefined = player.positionTraits?.[traitKey];

      // Fallback to 5-pillar value if positionTrait is unpopulated
      if (val === undefined && player.traits) {
        val = player.traits[pillarFallback];
      }

      const finalVal = val ?? 70;
      scoreAcc += finalVal * weight;
      weightSum += weight;

      const cleanLabel = traitKey.replace(/_/g, ' ');
      traitDetails.push({ label: cleanLabel, score: finalVal });
    });

    let rawFitScore = weightSum > 0 ? Math.round(scoreAcc / weightSum) : 70;

    // Real scheme alignment bonus (+3)
    if (roleDef.schemeId) {
      const matchingScheme = SCHEMES.find((s) => s.id === roleDef.schemeId);
      if (matchingScheme && matchingScheme.favoredPositions.includes(pos)) {
        rawFitScore += 3;
      }
    }

    const fitScore = Math.min(99, Math.max(50, rawFitScore));

    // Sort trait details by score descending to extract top contributing strengths
    traitDetails.sort((a, b) => b.score - a.score);
    const top1 = traitDetails[0];
    const top2 = traitDetails[1];

    let rationale = roleDef.baseRationaleTemplate;
    if (top1 && top2 && (player.positionTraits || player.traits)) {
      rationale = `Scouted ${top1.label} (${top1.score}) and ${top2.label} (${top2.score}) make him a strong fit as a ${roleDef.label.toLowerCase()} in ${roleDef.formationSpot}.`;
    }

    return {
      id: roleDef.id,
      label: roleDef.label,
      scheme: roleDef.schemeId,
      formationSpot: roleDef.formationSpot,
      fitScore,
      rationale,
    };
  });

  // Rank candidate roles by fitScore descending
  computedRoles.sort((a, b) => b.fitScore - a.fitScore);

  const primaryRoleId = computedRoles[0]?.id || '';
  if (computedRoles[0]) {
    computedRoles[0].isPrimary = true;
  }

  return {
    roles: computedRoles,
    primaryRoleId,
    computedAt: Date.now(),
    userEdited: false,
  };
}

/**
 * Sets a specific role as the primary usage projection and locks auto-recomputation (`userEdited = true`).
 */
export function setPrimaryUsageRole(
  currentProjection: UsageProjection,
  roleId: string
): UsageProjection {
  const updatedRoles = currentProjection.roles.map((r) => ({
    ...r,
    isPrimary: r.id === roleId,
  }));

  updatedRoles.sort((a, b) => {
    if (a.id === roleId) return -1;
    if (b.id === roleId) return 1;
    return b.fitScore - a.fitScore;
  });

  return {
    ...currentProjection,
    roles: updatedRoles,
    primaryRoleId: roleId,
    userEdited: true,
  };
}