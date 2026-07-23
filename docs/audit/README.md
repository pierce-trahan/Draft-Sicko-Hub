# Gemini Spec Audit — Specs 02 / 03 / 04 (Pass 1)

Audit of the Gemini 3.6 pass-1 implementations for Specs 02, 03, and 04, reviewed against the
actual repository on branch `claude/gemini-specs-02-04-audit-maj9k4` (base `main`).

| Spec | Feature | Verdict | Report |
|------|---------|---------|--------|
| 02 | GM Profiles + PFR data pipeline | ⚠️ Compiles, but **orphaned** (no nav wiring) + dead code | [Spec_02_audit.md](./Spec_02_audit.md) |
| 03 | Position-aware trait system (RadarChart / ProfileModal / Comparer) | 🔴 **Does not compile** (missing foundation, 2 syntax errors, bad type/import) | [Spec_03_audit.md](./Spec_03_audit.md) |
| 04 | Positional usage & projection | 🟠 **Inert core** (dead scheme bonus, no sub-trait data) + prose-only integration | [Spec_04_audit.md](./Spec_04_audit.md) |

## The one cross-cutting root cause

Specs 03 and 04 are both written **as if a trait-grading foundation had already shipped** — a
layer that would provide:

- `Player.positionTraits?: Record<string, number>` on the `Player` type,
- `src/data/traitSchemas.ts` (per-position sub-trait schemas: `{ key, label, pillar, weight }`),
- `src/utils/traitGrading.ts` (`getSchema`, `pillarRollup`, `computePositionGrade`, `topTraits`,
  `bottomTraits`, `getWeightBadgeInfo`).

**None of that exists on `main`.** Until that foundation is authored, Spec 03 cannot compile and
Spec 04's scoring is inert. Recommended sequencing: **foundation → 03 → 04 → 02** (02 is independent
and can land any time once wired into navigation).

## Reusable facts confirmed against the repo (so future passes don't re-derive them)

- Real `SCHEMES` ids (`src/data/teams.ts`): `westcoast, spread, zoneblock, gapblock, 34defense,
  43defense, pressman, quarters`. (Spec 04 used `defense_34`/`offense_zone`/etc. — none match.)
- `getDraftRange` is exported from `src/components/PlayerRankingMatrix.tsx`, **not** `utils/draftValue`.
- `App.tsx` view state: `appMode` union = `'boards' | 'draft_sim' | 'compare' | 'team_reports' |
  'coaching_reports' | 'scouting_matrix' | 'overview'` (no `gm_profiles`).
- Component prop contracts that Spec 03 must preserve (and does, correctly):
  `PlayerComparer({ players, onSelectPlayer })`,
  `PlayerProfileModal({ player, onClose, onSave, teamContext, customLabels, onAddCustomLabel })`.
- The app uses an **inverted custom Tailwind theme** (`src/index.css` `@theme`): `slate-950` is a warm
  off-white, `emerald-500` is forest green, and `slate-850` is defined. The specs' dark-looking class
  names are therefore **valid** — not a bug.
- Known hard syntax errors to strip in Spec 03: `} font-mono finally {` appears in both
  `PlayerProfileModal.tsx` and `PlayerComparer.tsx`.
