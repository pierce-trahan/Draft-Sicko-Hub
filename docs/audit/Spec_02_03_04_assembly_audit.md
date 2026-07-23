# Audit — Specs 02 + 03 + 04 combined deliverable ("Auditi_Response")

**Audited artifact:** Gemini's 10-file combined deliverable for Specs 02, 03, 04
**Method:** every file extracted and **actually compiled** against the repo (`tsc --noEmit`), not eyeballed
**Against:** branch `claude/gemini-specs-02-04-audit-maj9k4` (foundation `b94da05` in place)
**Date:** 2026-07-23
**Verdict:** 🟠 **Very close — 3 real compile blockers, all mechanical, all easy.** After fixing exactly those three, the entire 10-file deliverable type-checks with **0 errors**. The Spec-04 engine, RadarChart, PlayerComparer, GMProfiles, and the merged modal's structure are all sound. Two of the three blockers are *regressions* — Gemini rewrote sections the real repo already had correct.

---

## 1. How this was verified

I extracted all 9 full files + the App.tsx snippet, merged the additive `types.ts` (see §3), wrote them
into the repo, and ran the TypeScript compiler. Result: **5 errors**, collapsing to **3 distinct
defects**. Applying the three fixes below → **`tsc --noEmit` = 0 errors** across the whole project.

---

## 2. Blocking issues 🔴 (must fix before assembly)

### 2.1 — `usageRoles.ts` imports a type that doesn't exist
```
src/data/usageRoles.ts(1,10): error TS2305: Module '"../types"' has no exported member 'Pillar'.
```
`import { Pillar } from '../types';` — but `Pillar` is exported nowhere (not in the real `types.ts`,
not in Gemini's File 1). `RewardedTraitDef.pillarFallback: Pillar` therefore won't type.

**Fix:** add one line to `src/types.ts`:
```ts
export type Pillar = keyof PlayerTraits; // 'athleticism' | 'technique' | 'production' | 'footballIQ' | 'sizeAndFrame'
```
(Equivalently, change the import to `keyof PlayerTraits`.) This is the cleanest fix and makes the
`player.traits[pillarFallback]` lookups in `usageProjection.ts` valid.

### 2.2 — Merged modal passes the wrong prop to `TrendLineChart` (regression)
```
PlayerProfileModal.tsx: <TrendLineChart history={editedPlayer.gradeHistory} />
error TS2322: Property 'history' does not exist on type 'TrendLineChartProps'.
```
The real component is `function TrendLineChart({ player }: TrendLineChartProps)` — it takes a
**`player`** and reads the history internally. **The real repo modal already did this correctly**
(`<TrendLineChart player={editedPlayer} />`); Gemini's rewrite regressed it.

**Fix:** `<TrendLineChart player={editedPlayer} />`.

### 2.3 — Merged modal's big-boards loop infers `unknown` (regression, 3 errors)
```
PlayerProfileModal.tsx(1218/1229/1236): Property 'rank'/'comment'/'sourceName' does not exist on type 'unknown'.
```
Gemini rewrote the big-boards section as
`Object.entries(editedPlayer.bigBoards || {}).map(([boardName, boardInfo]) => …)`. The `|| {}`
widens the operand to include the empty-object type, so TS infers `boardInfo: unknown`, and every
`boardInfo.rank/.comment/.sourceName` fails. The **original repo modal avoided this** (it looked up
each board by key, `editedPlayer.bigBoards?.[boardName]`).

**Fix (either):**
- cast the entries: `(Object.entries(editedPlayer.bigBoards || {}) as [string, BigBoardInfo][]).map(…)`
  (and `import { … , BigBoardInfo } from '../types'`); **or**
- restore the original keyed-lookup pattern.

---

## 3. `types.ts` must be MERGED, not pasted ⚠️ (assembly hazard)

File 1 in the deliverable is **not a complete file** — its `Player` is a stub:
```ts
export interface Player {
  // ... existing fields preserved intact ...
  positionTraits?: ...;
  usageProjection?: ...;
}
```
Pasting File 1 over `src/types.ts` verbatim would **delete** the real `Player` fields, `PlayerTraits`,
`BigBoardInfo`, `Team`, `Scheme`, and the landed foundation. The assembler must **additively merge**:
keep the real file, add `usageProjection?: UsageProjection` to `Player`, append the new `UsageRole /
UsageProjection / GM*` interfaces, and add the `Pillar` export from §2.1. (This audit did exactly that
to compile it.)

---

## 4. File 10 (App.tsx nav) is a snippet, not a file — integration notes 🟡

Not a compile blocker (it isn't a standalone file), but it won't drop in as written:

- **There is no `AppMode` type to "extend."** The real `App.tsx` declares the union **inline** in the
  hook: `useState<'boards' | … | 'overview'>('boards')`. Add `'gm_profiles'` **there**, not to a named
  type.
- **Nav-item shape may not match.** The real nav example is `{ id: 'compare', label: 'Prospect
  Comparer' }` — no `icon` field. Adding `{ id:'gm_profiles', label:'GM Profiles', icon: UserCheck }`
  may not render unless the nav map reads `icon`. Verify against the actual nav array.
- **Merge the import**, don't duplicate — `App.tsx` already imports from `lucide-react`.

Until App.tsx is wired, `GMProfiles` compiles but is **unreachable** (the pass-1 Spec 02 finding).

---

## 5. What's genuinely fixed / correct 🟢 (verified)

- **All 12 positions' sub-trait keys are 100% correct** (re-diffed against the landed schema).
- **Scheme IDs are real, and the `+3` bonus now actually fires.** Cross-checked against real
  `favoredPositions`: e.g. `34defense`→EDGE/DT/LB, `quarters`→S/CB/LB, `spread`→QB/WR/OT. Most
  role/position combos trigger the bonus. The pass-1 "dead scheme bonus" defect is resolved. (Minor:
  `third_down_back`→`westcoast` doesn't favor RB, so no bonus there — harmless.)
- **The merged `PlayerProfileModal.tsx` is genuinely one file** containing both the Spec 03 sub-trait
  breakdown and the Spec 04 usage-projection section (primary role, ranked avenues, `userEdited` lock,
  reset), one import block, one default export — exactly as §5 of the foundation reference required.
- **These files compile with zero errors, untouched:** `usageProjection.ts`, `RadarChart.tsx`,
  `PlayerComparer.tsx`, `gmData.ts`, `gmTendencies.ts`, `GMProfiles.tsx`.
- **Spec 02 audit items addressed:** `draftCapitalByPos` (JJ chart) and `r1LeanText` (frequency-sorted)
  now exist on `GMTendencies`.

---

## 6. Verification-summary claims vs. reality

| Gemini's claim | Reality |
|---|---|
| Merged modal delivered exactly once | ✅ True. |
| Trait keys 100% verbatim to landed keys | ✅ True. |
| Real scheme IDs; `+3` bonus functional | ✅ True (fires for most combos). |
| Navigation wired into `App.tsx` | ⚠️ Snippet only, needs adaptation (§4). |
| *(implicit)* compiles / production-ready | ❌ 3 compile blockers (§2). |

---

## 7. Bottom line & fix list

Three edits stand between this deliverable and a clean build:

1. 🔴 `types.ts`: `export type Pillar = keyof PlayerTraits;`
2. 🔴 `PlayerProfileModal.tsx`: `<TrendLineChart player={editedPlayer} />`
3. 🔴 `PlayerProfileModal.tsx`: cast big-boards entries `as [string, BigBoardInfo][]` (import `BigBoardInfo`)

Plus two assembly cautions: **merge** `types.ts` (don't paste — §3), and **adapt** the App.tsx nav
snippet to the inline union (§4). With #1–#3 applied, the full Specs 02/03/04 set compiles at **0
errors** — verified here.
