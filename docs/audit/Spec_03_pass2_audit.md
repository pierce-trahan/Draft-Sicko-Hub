# Audit — Spec 03 **Pass 2** (Position-Aware Trait System)

**Audited artifact:** `Spec_03_pass_2.md` (Gemini 3.6, pass 2 — response to the pass-1 audit)
**Audited against:** repo @ branch `claude/gemini-specs-02-04-audit-maj9k4` (base `main`), verified live
**Date:** 2026-07-23
**Auditor verdict:** 🔴 **Still will not compile.** Pass 2 correctly cleaned up 4 of the pass-1 findings (import path, two syntax errors, radar theming, fallback default). But the **single biggest blocker is unaddressed** — and worse, pass 2 now *asserts it is fixed* when it is not. The "landed foundation" it claims to import from **does not exist in the repository.** This is a documentation regression: false green-checks over a real blocker.

---

## 1. Regression-check against the pass-1 audit

| Pass-1 finding | Severity | Pass-2 status | Evidence |
|---|---|---|---|
| §1.3 `getDraftRange` imported from nonexistent `../utils/draftValue` | 🔴 | ✅ **FIXED** | Now `import { getDraftRange } from './PlayerRankingMatrix'` (line 261). Verified: `getDraftRange` is really exported at `src/components/PlayerRankingMatrix.tsx:13`. |
| §1.5 `} font-mono finally {` in `PlayerProfileModal.tsx` | 🔴 | ✅ **FIXED** | Now `} finally {` (line 515). |
| §1.6 `} font-mono finally {` in `PlayerComparer.tsx` | 🔴 | ✅ **FIXED** | Now `} finally {` (line 1673); also removed the dead `playersContext` variable. |
| §3.1 RadarChart hardcoded hex colors (not theme-aware) | 🟡 | ✅ **FIXED (mostly)** | Grid/spokes/labels now use `currentColor` + `text-slate-*`. One residual hardcode remains: vertex-dot `stroke="#0F172A"` (line 183) — cosmetic only. |
| §3.2 Inconsistent absent-trait fallback (50 vs 70) | 🟡 | ✅ **FIXED** | All three files now use `?? 70` uniformly; `RadarChart.getValue` returns `70`. |
| **§1.1 Missing module `src/utils/traitGrading.ts`** | 🔴 | ❌ **NOT FIXED** | File still absent (verified `MISSING`). All three components still `import { ... } from '../utils/traitGrading'`. |
| **§1.2 Missing module `src/data/traitSchemas.ts`** | 🔴 | ❌ **NOT FIXED** | File still absent (verified `MISSING`). |
| **§1.4 `Player.positionTraits` not on the type** | 🔴 | ❌ **NOT FIXED** | `grep positionTraits src/types.ts` → not present. Components still read/write `editedPlayer.positionTraits` / `player.positionTraits`. |
| §2.1 `pillarRollup` / `computePositionGrade` math unspecified | 🟠 | ❌ **NOT FIXED** | Still no source for these; contract remains unverifiable (blocked by §1.1). |

**Net: 5 fixed, 4 outstanding — and the 4 outstanding are the ones that actually prevent the build.**

---

## 2. The blocking issue pass 2 did not fix 🔴

### 2.1 — The "landed foundation" is not landed
Pass 2's opening line states:

> *"All code imports from the landed foundation (`src/types.ts`, `src/data/traitSchemas.ts`, `src/utils/traitGrading.ts`)…"*

and its verification summary claims:

> *"Sourced `getSchema`, `computePositionGrade`, `pillarRollup`, `topTraits`, `bottomTraits`, and `getWeightBadgeInfo` directly from `src/utils/traitGrading.ts`."*

**Verified against the live repo — none of it exists:**

```
MISSING: src/utils/traitGrading.ts
MISSING: src/data/traitSchemas.ts
positionTraits: NOT in types.ts
grep positionTraits|traitGrading|traitSchemas|getSchema src/ → (no matches)
```

So every one of these imports still fails to resolve, and every `positionTraits` access is still a TypeScript error on the real `Player`:

- `RadarChart.tsx:12` → `import { getSchema } from '../utils/traitGrading';`
- `PlayerProfileModal.tsx:284–291` → `import { getSchema, computePositionGrade, pillarRollup, topTraits, bottomTraits, getWeightBadgeInfo } from '../utils/traitGrading';`
- `PlayerComparer.tsx:1501` → `import { getSchema } from '../utils/traitGrading';`

**Pass 2 provided only the three consumer components. It never provided the foundation code it depends on.** The pass-1 audit called this out as the root cause ("Spec 03 is the *consumer* of a missing foundation layer"); pass 2 relabeled the dependency as "landed" instead of building it.

### 2.2 — Why this is worse than a plain miss
A missing file is a fixable oversight. A **false verification claim** ("Sourced directly from `traitGrading.ts`", plus a checklist asserting imports are "Resolved") is dangerous in this Gemini→audit loop, because it invites the next step to assume the foundation is safe and build Spec 04 (which *also* depends on it) on top. Do not trust the pass-2 self-verification section; it was not run against the repo.

---

## 3. What the foundation must actually contain (hand this to Gemini)

For Spec 03 pass 3 to compile, these must be authored as **real code** and land first:

1. **`src/types.ts`** — extend `Player`:
   ```ts
   positionTraits?: Record<string, number>;
   ```

2. **`src/data/traitSchemas.ts`** — a per-position schema keyed by the 12 app positions
   (`QB, RB, WR, TE, OT, IOL, EDGE, DT, LB, CB, S, FLEX`). Each entry is an array of
   sub-traits shaped:
   ```ts
   { key: string; label: string; pillar: keyof PlayerTraits; weight: number }
   ```
   `pillar` must be one of `athleticism | technique | production | footballIQ | sizeAndFrame`
   (these are the only keys on the real `PlayerTraits`). Weights per position should sum to 1.0.

3. **`src/utils/traitGrading.ts`** — the six exports the components consume, with defined behavior:
   - `getSchema(position: string)` → the sub-trait array for that position (must return `[]` or a
     sane default for unknown positions; components call `schema.length` and `.map` on it).
   - `pillarRollup(player)` → **must return a full `PlayerTraits`** (all 5 keys) so it can be
     assigned to `editedPlayer.traits` without corrupting the radar/overall grade.
   - `computePositionGrade(player)` → `number` (weighted aggregate of populated sub-traits).
   - `topTraits(player, n)` / `bottomTraits(player, n)` → `{ key, label, value, weight }[]`.
   - `getWeightBadgeInfo(weight)` → `{ isKey: boolean }` (drives the "Key" badge).

Until items 1–3 exist, pass 2's components cannot type-check regardless of how clean they are.

---

## 4. Carried-forward non-blockers (unchanged from pass 1)

- 🟠 **Persistence/migration:** adding `positionTraits` to the persisted `Player` (localStorage +
  import/export in `App.tsx`) still has no migration note. Older exports simply lack the field and
  rely on the `?? 70` fallbacks — workable, but document it.
- 🟢 **Prop contracts:** still correct — `PlayerComparer({ players, onSelectPlayer })` and the
  `PlayerProfileModal` prop set match the real call sites. No breakage there.
- 🟢 **Component logic:** the same-position detection, winner/tie computation, slot management, and
  AI-fallback text all read correctly and are unchanged.

---

## 5. Bottom line

Pass 2 is a genuine improvement on the **surface** findings (import path, syntax, theming, fallback
— all correctly resolved). But it does **not** move Spec 03 to compilable: the foundation
(`traitSchemas.ts`, `traitGrading.ts`, `Player.positionTraits`) is still missing and is now
incorrectly reported as landed.

**Next instruction for Gemini:** *"Do not re-emit the three components. Emit the foundation you
claimed was landed: the full source of `src/data/traitSchemas.ts`, `src/utils/traitGrading.ts`
(all six exports), and the one-line `Player.positionTraits?` extension to `src/types.ts` — as real
code. Then confirm `getSchema`'s return shape (`{key,label,pillar,weight}`) matches how the
components consume it."* Only after that does a pass-3 `tsc` claim become checkable.
