// Draft-value range helper: maps an overall grade to a draft-slot range,
// label, and color classes. Extracted from the former PlayerRankingMatrix so
// it survives the Spec 01 Elo rebuild and stays a shared, single-purpose util.

export interface DraftValueRange {
  range: string;
  label: string;
  color: string;
  bg: string;
  border: string;
}

export function getDraftRange(grade: number): DraftValueRange {
  if (grade >= 95) {
    return {
      range: "Top 5 Pick",
      label: "Elite Franchise Cornerstone",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
    };
  } else if (grade >= 90) {
    return {
      range: "Top 15 Pick",
      label: "Blue Chip Pro Bowler",
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/30",
    };
  } else if (grade >= 85) {
    return {
      range: "1st Round",
      label: "Day 1 High-End Starter",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
    };
  } else if (grade >= 80) {
    return {
      range: "2nd Round",
      label: "Red Chip Contributor",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/30",
    };
  } else if (grade >= 75) {
    return {
      range: "3rd-4th Round",
      label: "Quality Developmental Starter",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
    };
  } else if (grade >= 65) {
    return {
      range: "5th-7th Round",
      label: "Rotational Asset / Special Teamer",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
    };
  } else {
    return {
      range: "Undrafted Free Agent",
      label: "Priority FA / Camp Candidate",
      color: "text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
    };
  }
}
