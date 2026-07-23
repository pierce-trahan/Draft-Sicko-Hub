# Audit — Spec 03: Position-Aware Trait System (RadarChart / PlayerProfileModal / PlayerComparer)

**Audited artifact:** `Spec_03_pass_1.md` (Gemini 3.6, pass 1)
**Audited against:** repo @ branch `claude/gemini-specs-02-04-audit-maj9k4` (base `main`)
**Date:** 2026-07-23
**Auditor verdict:** 🔴 **Does not compile. Will not build.** Spec 03 depends on an entire trait-grading foundation (a "Spec 01"-level layer) that **does not exist in the repository**, extends the `Player` type with a field that was never actually added, imports from nonexistent modules, and contains **two hard syntax errors**. The spec's own "Definition of Done: `tsc` passes — no undefined imports" is **false**.

---

## 0. Severity legend

| Tag | Meaning |
|-----|---------|
| 🔴 **BLOCKER** | Prevents compile/run. |
| 🟠 **MAJOR** | Compiles, but broken/misleading. |
| 🟡 **MINOR** | Polish/correctness nit. |
| 🟢 **OK** | Verified correct. |

---

## 1. Blocking issues 🔴

### 1.1 — Missing module `src/utils/traitGrading.ts` (does not exist)
All three files import from it:

- `RadarChart.tsx`: `import { getSchema } from '../utils/traitGrading';`
- `PlayerProfileModal.tsx`: `import { getSchema, computePositionGrade, pillarRollup, topTraits, bottomTraits, getWeightBadgeInfo } from '../utils/traitGrading';`
- `PlayerComparer.tsx`: `import { getSchema } from '../utils/traitGrading';`

`ls src/utils/` → `contrast.ts, labels.ts, playerPhotos.ts`. **There is no `traitGrading.ts`.** Every one of these imports fails to resolve → build error in all three components.

### 1.2 — Missing module `src/data/traitSchemas.ts` (does not exist)
The spec's own "Definition of Done" states values are "imported directly from `src/data/traitSchemas.ts`." That file does not exist either. `getSchema()` — the linchpin that returns per-position sub-trait definitions (`{ key, label, pillar, weight }`) — has no backing schema data anywhere in the repo.

### 1.3 — Missing import `getDraftRange` from wrong path
`PlayerProfileModal.tsx` (spec) line 259:
```ts
import { getDraftRange } from '../utils/draftValue';
```
`src/utils/draftValue.ts` **does not exist.** In the real repo, `getDraftRange` is exported from `./PlayerRankingMatrix` (see real `src/components/PlayerProfileModal.tsx:6`). The spec invented a new, nonexistent path.

### 1.4 — `Player.positionTraits` is not on the `Player` type
Real `src/types.ts` `Player` has **no `positionTraits` field**. Yet Spec 03 reads/writes it pervasively:

- `PlayerProfileModal.tsx`: `editedPlayer.positionTraits?.[traitDef.key]`, `handlePositionTraitChange` writes `positionTraits`.
- `PlayerComparer.tsx`: `player.positionTraits?.[t.key]` (lines ~1606, ~1844).

Under TypeScript this is a compile error (`Property 'positionTraits' does not exist on type 'Player'`). The spec's DoD claims "Core `Player` interface preserved, only extended with optional `positionTraits?: Record<string, number>`" — **but the spec never shows that edit to `src/types.ts`, and the repo does not contain it.** (Note: Spec 04 separately adds `usageProjection` but also does **not** add `positionTraits`.)

### 1.5 — Hard syntax error in `PlayerProfileModal.tsx` (spec line ~514)
```ts
    } font-mono finally {
      setIsGenerating(false);
    }
```
`} font-mono finally {` is stray text injected into a `try/catch/finally`. This is not valid JavaScript/TypeScript — it will fail to parse.

### 1.6 — Same syntax error repeated in `PlayerComparer.tsx` (spec line ~1678)
```ts
    } font-mono finally {
      setLoadingAiAnalysis(false);
    }
```
Identical `} font-mono finally {` corruption in `handleGenerateAiComparison`. Second hard parse failure.

---

## 2. Major issues 🟠

### 2.1 — `pillarRollup` / `computePositionGrade` semantics are undefined
`handlePositionTraitChange` calls `pillarRollup(tempPlayer)` and assigns the result to `editedPlayer.traits`; "Apply Computed Grade" calls `computePositionGrade(editedPlayer)`. Because `traitGrading.ts` doesn't exist, **the rollup weighting, the sub-trait→pillar mapping, and the grade formula are entirely unspecified.** There is no way to verify the math, the weight normalization, or that `pillarRollup` returns a valid `PlayerTraits` (all 5 keys) — a partial return would silently corrupt the radar and overall grade.

### 2.2 — Silent scope creep on the `Player` model
Introducing `positionTraits` (Spec 03) and later `usageProjection` (Spec 04) changes the persisted player shape. The app persists players to `localStorage` and supports import/export (`App.tsx` data hub). Neither spec addresses migration for existing saved data, so older exports lack these fields and rely entirely on the `?.`/fallback paths. This is workable but undocumented — a data-contract change presented as "additive/no-op."

### 2.3 — DoD verification claims are inaccurate
The spec's "Definition of Done Verification" asserts:
- ✅ "`tsc` Type-check / build: Pass (no type errors, no undefined imports)" — **false** (§1.1–§1.6).
- ✅ "Import reuse: derived from `src/data/traitSchemas.ts` and `src/utils/traitGrading.ts`" — **false** (neither file exists).

These false green-checks are the most dangerous part of the spec: they assert verification that did not happen.

---

## 3. Minor issues 🟡

### 3.1 — RadarChart hardcodes stroke/label colors outside the theme
The redone `RadarChart.tsx` uses literal hex for grid/labels (`stroke="#A1A09C"`, `fill="#141414"`, `fill="#444444"`). The app is theme-aware (light/dark via `src/index.css`). These literals will look wrong in one theme (e.g. `#141414` labels on a dark background). The existing chart should be checked for how it currently handles this; prefer `currentColor`/CSS vars.

### 3.2 — `getValue` fallback default drift
`RadarChart.getValue` returns `50` when a key is absent, while `PlayerProfileModal`/`PlayerComparer` sub-trait reads fall back to `player.traits[pillar] ?? 70/50`. Inconsistent defaults (50 vs 70) across the same data path produce mismatched chart vs. slider values for unpopulated traits.

### 3.3 — Props contract for existing call sites — OK 🟢
The real `PlayerComparer` signature `{ players, onSelectPlayer }` and the real `PlayerProfileModal` prop set `{ player, onClose, onSave, teamContext, customLabels, onAddCustomLabel }` **do** match the spec's redone signatures. Existing call sites in `App.tsx` would not break on the prop contract — the breakage is entirely from imports/types (§1), not the public component API.

### 3.4 — `TrendLineChart` usage — OK 🟢
`TrendLineChart` exists (`src/components/TrendLineChart.tsx`) and the `history={editedPlayer.gradeHistory}` usage is plausible (verify prop name against the real component before landing).

---

## 4. Root-cause summary

Spec 03 is written **as if a prerequisite trait-grading foundation had already shipped** — one that would provide `src/data/traitSchemas.ts`, `src/utils/traitGrading.ts` (`getSchema`, `pillarRollup`, `computePositionGrade`, `topTraits`, `bottomTraits`, `getWeightBadgeInfo`), and a `Player.positionTraits` field. **None of that exists on `main`.** Spec 03 cannot be evaluated or landed in isolation; it is the *consumer* of a missing "Spec 01/foundation" layer.

---

## 5. Required-fix checklist (priority order)

1. 🔴 Author the missing foundation first: `src/data/traitSchemas.ts` (per-position `{key,label,pillar,weight}` schemas) and `src/utils/traitGrading.ts` (`getSchema`, `pillarRollup`, `computePositionGrade`, `topTraits`, `bottomTraits`, `getWeightBadgeInfo`) with defined, testable math.
2. 🔴 Add `positionTraits?: Record<string, number>` to `Player` in `src/types.ts`.
3. 🔴 Fix `getDraftRange` import to `./PlayerRankingMatrix` (not `../utils/draftValue`).
4. 🔴 Remove the `} font-mono finally {` corruption in **both** `PlayerProfileModal.tsx` and `PlayerComparer.tsx` → `} finally {`.
5. 🟠 Specify + unit-test `pillarRollup` (must return all 5 `PlayerTraits` keys) and `computePositionGrade`.
6. 🟡 Normalize radar colors to theme vars; unify the absent-trait fallback default (pick 50 *or* 70 everywhere).
7. 🟠 Correct the DoD section — do not claim `tsc` passes until it does.

**Bottom line:** Spec 03 is **not landable as written**. It needs its foundation layer built, the type extended, two syntax errors removed, and one import path corrected before it will even compile.
