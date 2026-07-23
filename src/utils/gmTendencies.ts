import { GMDraftPick, GMProfile, GMTendencies } from '../types';

export function getPickDraftValue(pickNumber: number): number {
  if (pickNumber <= 1) return 3000;
  if (pickNumber <= 2) return 2600;
  if (pickNumber <= 3) return 2200;
  if (pickNumber <= 4) return 1800;
  if (pickNumber <= 5) return 1700;
  if (pickNumber <= 10) return 1300 - (pickNumber - 6) * 60;
  if (pickNumber <= 32) return 1000 - (pickNumber - 11) * 20;
  if (pickNumber <= 64) return 580 - (pickNumber - 33) * 10;
  if (pickNumber <= 100) return 265 - (pickNumber - 65) * 4;
  return Math.max(10, 100 - (pickNumber - 100));
}

export function computeGMTendencies(
  profile: GMProfile,
  filterTeamId?: string
): GMTendencies {
  const filteredPicks = filterTeamId
    ? profile.picks.filter((p) => p.teamId === filterTeamId)
    : profile.picks;

  const totalPicks = filteredPicks.length;
  const positionCounts: Record<string, number> = {};
  const draftCapitalByPos: Record<string, number> = {};
  const roundMatrix = {
    round1: {} as Record<string, number>,
    day2: {} as Record<string, number>,
    day3: {} as Record<string, number>,
  };
  const collegeCounts: Record<string, number> = {};

  filteredPicks.forEach((pick) => {
    const pos = pick.position || 'FLEX';
    const rnd = pick.round;
    const col = pick.college;
    const pickVal = getPickDraftValue(pick.overallPick);

    positionCounts[pos] = (positionCounts[pos] || 0) + 1;
    draftCapitalByPos[pos] = (draftCapitalByPos[pos] || 0) + pickVal;

    if (rnd === 1) {
      roundMatrix.round1[pos] = (roundMatrix.round1[pos] || 0) + 1;
    } else if (rnd === 2 || rnd === 3) {
      roundMatrix.day2[pos] = (roundMatrix.day2[pos] || 0) + 1;
    } else {
      roundMatrix.day3[pos] = (roundMatrix.day3[pos] || 0) + 1;
    }

    if (col && col.trim() !== '') {
      collegeCounts[col] = (collegeCounts[col] || 0) + 1;
    }
  });

  const positionShare: Record<string, number> = {};
  Object.keys(positionCounts).forEach((pos) => {
    positionShare[pos] = totalPicks > 0 ? Math.round((positionCounts[pos] / totalPicks) * 1000) / 10 : 0;
  });

  const sortedR1 = Object.entries(roundMatrix.round1).sort((a, b) => b[1] - a[1]);
  const r1LeanText = sortedR1.length > 0
    ? sortedR1.slice(0, 2).map(([p, c]) => `${p} (${c})`).join(', ')
    : 'None';

  const earlyPicksCount = (filteredPicks.filter((p) => p.round <= 3)).length;
  const earlyPosCounts: Record<string, number> = {};
  filteredPicks
    .filter((p) => p.round <= 3)
    .forEach((p) => {
      earlyPosCounts[p.position] = (earlyPosCounts[p.position] || 0) + 1;
    });

  const earlyRoundPriorities = Object.entries(earlyPosCounts)
    .map(([position, count]) => ({
      position,
      count,
      percentage: earlyPicksCount > 0 ? Math.round((count / earlyPicksCount) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const topColleges = Object.entries(collegeCounts)
    .map(([college, count]) => ({ college, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalPicks,
    positionCounts,
    positionShare,
    draftCapitalByPos,
    roundMatrix,
    r1LeanText,
    earlyRoundPriorities,
    topColleges,
  };
}