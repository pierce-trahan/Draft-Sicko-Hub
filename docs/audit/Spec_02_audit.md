# Audit — Spec 02: GM Profiles + Pro Football Reference Data Pipeline

**Audited artifact:** `Spec_02_pass_1.md` (Gemini 3.6, pass 1)
**Audited against:** repo @ branch `claude/gemini-specs-02-04-audit-maj9k4` (base `main`)
**Date:** 2026-07-23
**Auditor verdict:** ⚠️ **Compiles, but ships dead / orphaned.** Spec 02 is the cleanest of the three — it is self-contained and does not depend on missing infrastructure. However, as written it is **not reachable by the user** (never wired into navigation) and contains dead code plus data-normalization inconsistencies.

---

## 0. How to read this report

Severity legend:

| Tag | Meaning |
|-----|---------|
| 🔴 **BLOCKER** | Prevents compile/run, or the feature cannot function. |
| 🟠 **MAJOR** | Compiles, but the feature is unreachable, broken, or misleading. |
| 🟡 **MINOR** | Correctness/polish/data quality; does not stop the feature. |
| 🟢 **OK** | Verified correct against the real codebase. |

---

## 1. Verified-correct items 🟢

- **New files are genuinely new.** `src/utils/gmTendencies.ts`, `src/data/gmData.ts`, `src/components/GMProfiles.tsx` do not exist in the repo, so there is no overwrite risk. Additive claim holds.
- **`Team.id` references are valid.** `PHI`, `NYG`, `SF`, `JAX` all exist in `src/data/teams.ts` (`NFL_TEAMS`).
- **Styling classes are valid.** `slate-850`, `slate-950`, `emerald-500`, etc. are defined in `src/index.css` `@theme` (the app runs an inverted "ink on paper" palette). The dark-looking class names render correctly — **not** a bug.
- **`lucide-react` is available** (`^0.546.0` in `package.json`). All icons imported by `GMProfiles.tsx` (`UserCheck, Building2, Layers, Award, Search`, etc.) exist in that version.
- **`computeGMTendencies` math is sound.** Position counts, `positionShare` rounding (`Math.round(x*1000)/10`), Day-2 (R2–3) / Day-3 (R4–7) bucketing, early-round (R≤3) priority aggregation, and top-5 college concentration all compute correctly. Empty-college guard (`col.trim() !== ''`) correctly skips Jordan Mailata's blank college.
- **Type definitions are consistent** — `GMDraftPick`, `GMTenure`, `GMProfile`, `GMTendencies` are internally coherent and match how `gmData.ts` / `GMProfiles.tsx` consume them.

---

## 2. Blocking issues 🔴

None. Spec 02 will type-check and compile on its own.

---

## 3. Major issues 🟠

### 3.1 — `GMProfiles` is orphaned: no navigation entry point
`src/App.tsx` drives views off a fixed union:

```ts
const [appMode, setAppMode] = useState<
  'boards' | 'draft_sim' | 'compare' | 'team_reports' |
  'coaching_reports' | 'scouting_matrix' | 'overview'
>('boards');
```

There is **no `'gm_profiles'` mode**, no sidebar/nav item, and no `<GMProfiles />` render branch. As delivered, the component can never be mounted by a user. The spec's "Acceptance Scorecard" does not mention wiring, so this gap is silent.

**Fix:** Extend the `appMode` union with `'gm_profiles'`, add a nav entry (mirror the `{ id: 'compare', label: 'Prospect Comparer' }` pattern near `App.tsx:653`), and add an `{appMode === 'gm_profiles' && <GMProfiles />}` render branch (mirror `App.tsx:1193`).

### 3.2 — `getPickDraftValue` is dead code
`gmTendencies.ts` exports `getPickDraftValue()` (a Jimmy Johnson value-chart lookup), but nothing in Spec 02 imports or calls it. The `GMTendencies` shape has no draft-capital field, and `GMProfiles.tsx` never references it. It is pure dead weight.

Additionally its bucketing is lossy/incorrect as a value chart: it collapses picks 16–32 to a flat `590` and 4–5 to `1700`, so it is not usable as a real JJ chart even if wired in.

**Fix:** Either (a) delete it, or (b) actually use it — add a `draftCapitalSpent` metric to `GMTendencies` and surface it in the UI, and replace the coarse buckets with a real per-pick chart.

---

## 4. Minor issues 🟡

### 4.1 — Inconsistent PFR→app position normalization
The dataset normalizes `rawPosition` → app position group inconsistently:

| Player | rawPosition | Mapped to | Comment |
|--------|-------------|-----------|---------|
| Nolan Smith | `OLB` | `FLEX` | Other edge OLBs map to `EDGE`; should likely be `EDGE`. |
| Nate Allen | `DB` | `FLEX` | Other `DB`s (Jimmie Ward, Cooper DeJean) map to `CB`. |
| Jimmie Ward | `DB` | `CB` | Ward played mostly S/nickel; defensible but conflicts with Allen. |

The `FLEX` bucket becomes a dumping ground, which skews `positionCounts`, `positionShare`, and the "Top Early Priority" metric.

**Fix:** Adopt one deterministic `DB → CB/S` and `OLB → EDGE/LB` rule and apply it uniformly; document the rule next to the dataset.

### 4.2 — "R1 Premium Lean" metric is not a "lean"
`GMProfiles.tsx`:
```tsx
{Object.keys(tendencies.roundMatrix.round1).join(', ') || 'None'}
```
This lists **every** position ever taken in Round 1, in `Object.keys` order (insertion order, not frequency). For Howie Roseman that renders a long comma list, not a "lean." Label and computation disagree.

**Fix:** Sort R1 positions by count desc and show the top 1–2 (reuse the `earlyRoundPriorities` pattern already computed).

### 4.3 — Unused imports
`GMProfiles.tsx` imports `Shield, BarChart2, Filter` (and possibly others) that are never rendered. Harmless under Vite but will trip `noUnusedLocals`/lint if enabled.

**Fix:** Drop unused icon imports.

### 4.4 — Dataset completeness caveat
The pick lists are **curated highlights**, not complete draft classes (e.g., Roseman's 2014/2015/2017/2019 classes are absent; only notable picks are present). Any tendency percentage is therefore over a hand-picked subset, not the true population. This is a legitimate design choice for a demo seed, but the UI presents counts as if authoritative ("Total Picks Analyzed").

**Fix:** Either backfill complete classes, or add a UI disclaimer that the sample is curated.

---

## 5. Spec self-claims vs. reality

| Spec "Acceptance Scorecard" claim | Reality |
|---|---|
| Static dataset for 3 GMs | ✅ True (curated subset). |
| Multi-tenure support (Baalke SF vs JAX) | ✅ True — filter logic + UI toggle verified. |
| Position normalization to app groups | ⚠️ Present but **inconsistent** (§4.1). |
| In-app heatmap + early-round priorities | ✅ Renders — but component is **unreachable** (§3.1). |

---

## 6. Required-fix checklist (priority order)

1. 🟠 Wire `GMProfiles` into `App.tsx` nav (`appMode` union + nav item + render branch).
2. 🟠 Resolve `getPickDraftValue` — delete or actually surface draft-capital spend.
3. 🟡 Make position normalization deterministic and uniform.
4. 🟡 Fix "R1 Premium Lean" to be frequency-sorted top-N.
5. 🟡 Remove unused imports; add curated-sample disclaimer.

**Bottom line:** Spec 02 is functionally correct in isolation but is not yet a shippable feature — it needs navigation wiring (§3.1) before a user can ever see it.
