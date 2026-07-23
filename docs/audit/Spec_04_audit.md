# Audit — Spec 04: Positional Usage & Projection

**Audited artifact:** `Spec_04_Pass_1.md` (Gemini 3.6, pass 1)
**Audited against:** repo @ branch `claude/gemini-specs-02-04-audit-maj9k4` (base `main`)
**Date:** 2026-07-23
**Auditor verdict:** 🟠 **Compiles only partially, and the core scoring is effectively inert.** Spec 04's utility/data files can be made to type-check, but (a) it inherits Spec 03's missing `Player.positionTraits` dependency, (b) its scheme IDs match **none** of the real schemes so the scheme-alignment bonus never fires, (c) the rewarded-trait keys map to nothing that exists, collapsing every role's score onto the same 5 pillars, and (d) the actual modal integration is described in **prose only** — no code — so the headline deliverable is unverifiable.

---

## 0. Severity legend

| Tag | Meaning |
|-----|---------|
| 🔴 **BLOCKER** | Prevents compile/run, or the feature cannot function. |
| 🟠 **MAJOR** | Compiles, but the feature is broken/misleading. |
| 🟡 **MINOR** | Polish/correctness nit. |
| 🟢 **OK** | Verified correct. |

---

## 1. Verified-correct items 🟢

- **New files are new.** `src/data/usageRoles.ts`, `src/utils/usageProjection.ts` do not exist in the repo — additive, no overwrite.
- **`Scheme` shape assumption is correct.** `src/types.ts` `Scheme` has `favoredPositions: string[]`, and `src/data/teams.ts` exports `SCHEMES: Scheme[]`. So `SCHEMES.find(...)` and `.favoredPositions.includes(pos)` are type-valid.
- **`usageProjection?` type extension is safe.** Adding `usageProjection?: UsageProjection` to `Player` is genuinely additive/optional.
- **`pillarFallback` keys are valid.** Every `pillarFallback` used in `ROLE_CATALOG` (`athleticism`, `technique`, `production`, `footballIQ`, `sizeAndFrame`) is a real `PlayerTraits` key, so the fallback path is type-safe.
- **`setPrimaryUsageRole` lock logic is sound** — re-sorts primary to top, sets `userEdited: true`, preserves other roles.

---

## 2. Blocking / functional-blocker issues 🔴

### 2.1 — Inherited dependency: `Player.positionTraits` does not exist
`computeUsageProjection` reads:
```ts
let val: number | undefined = player.positionTraits?.[traitKey];
```
`Player` in `src/types.ts` has **no `positionTraits` field** (see Spec 03 audit §1.4). Under TypeScript this is a compile error unless/until Spec 03's foundation lands. Spec 04 cannot compile before Spec 03's type extension exists.

### 2.2 — Scheme IDs match nothing → scheme bonus is permanently dead
`ROLE_CATALOG` uses `schemeId` values:
`defense_34`, `defense_43`, `defense_nickel`, `offense_zone`, `offense_power_gap`, `offense_pass_heavy`.

The real `SCHEMES` IDs in `src/data/teams.ts` are:
`westcoast`, `spread`, `zoneblock`, `gapblock`, `34defense`, `43defense`, `pressman`, `quarters`.

**Zero overlap.** Therefore in `computeUsageProjection`:
```ts
const matchingScheme = SCHEMES.find((s) => s.id === roleDef.schemeId); // always undefined
if (matchingScheme && ...) rawFitScore += 3; // never runs
```
The `+3` scheme-alignment bonus **can never fire**, and every `UsageRole.scheme` value persisted onto the player is a dangling ID not present in `SCHEMES` (breaks any future join/lookup on that field). The spec's acceptance claim "Scheme Alignment: Cross-references `SCHEMES`" is functionally false.

---

## 3. Major issues 🟠

### 3.1 — Rewarded-trait keys resolve to nothing → all roles score nearly identically
Every `rewardedTraits[].traitKey` (`pass_rush_getoff`, `bend_flexibility`, `contested_catch_radius`, …) is a **position sub-trait key** that would live in `positionTraits`. Since `positionTraits` is absent (and there is no `traitSchemas.ts` defining these keys), `player.positionTraits?.[traitKey]` is always `undefined` and every trait falls back to the role's `pillarFallback`.

Consequence: a role's fit score becomes a weighted average of **at most 5 pillar values**, and many roles share the same pillar set. Two different roles that both reward "athleticism/technique/technique" produce the **same score**, so the ranked "avenues" list is largely arbitrary/tied. The feature *appears* to work (numbers render) but carries no real per-role signal until Spec 03's sub-trait data exists.

### 3.2 — Headline deliverable (modal integration) is prose-only — unverifiable
Section 4 ("`PlayerProfileModal.tsx` Integration") describes the Primary Projection card, Avenues list, override lock, and FLEX support **in bullet points with no code**. The spec's other three files are concrete; the one piece that actually surfaces this feature to the user is not. Claims like "Modal displays primary projection headline + ranked avenues; user can override primary role and lock" cannot be audited and are not proven additive-safe. Given Spec 03 already rewrites `PlayerProfileModal.tsx` wholesale (with its own bugs), the two specs' edits to the same file will conflict.

### 3.3 — Default baseline of 70 flattens scores toward a fixed band
`const finalVal = val ?? 70;` combined with the `Math.max(50, Math.min(99, ...))` clamp means that for any player without sub-traits, **every role scores exactly 70** (before the never-firing +3). Combined with §3.1, the "ranked by fitScore desc" output is a flat list of 70s. The `primaryRoleId` then defaults to whatever role happens to sort first — effectively `ROLE_CATALOG` order, not merit.

---

## 4. Minor issues 🟡

### 4.1 — `SCHEMES` favoredPositions never validated against role positions
Even after fixing IDs (§2.2), note the real schemes are mostly defense/offense *scheme families* (`westcoast`, `zoneblock`, `pressman`…), not the granular fronts the roles assume (`wide-9`, `nickel`, `power_gap`). A correct mapping requires deciding which of the 8 real schemes each role aligns to; a 1:1 rename is not possible.

### 4.2 — Rationale text can misreport when traits are absent
`rationale` is rebuilt as `Scouted {top1.label} ({top1.score}) and {top2.label} ({top2.score})...`. When all traits fall back to 70, the rationale prints "Scouted ... (70) and ... (70)" for everyone, undercutting the "trait-grounded rationale" acceptance claim.

### 4.3 — `primaryRoleId` fallback hardcodes `'edge_wide9'`
`const primaryRoleId = computedRoles[0]?.id || 'edge_wide9';` — a defensive default that would silently label an empty projection as an edge rusher. Prefer `''`/undefined handling.

---

## 5. Spec self-claims vs. reality

| Spec "Acceptance Criteria" claim | Reality |
|---|---|
| Catalog & scoring from Spec 03 `positionTraits` or pillar fallback | ⚠️ `positionTraits` absent → **always** falls back to pillars (§2.1, §3.1). |
| Scheme alignment cross-references `SCHEMES` | ❌ IDs match nothing → bonus never fires (§2.2). |
| Deterministic trait-grounded rationale | ⚠️ Deterministic yes; "trait-grounded" no when traits absent (§4.2). |
| Modal displays headline + avenues, override/lock | ❔ **Unverifiable** — no code provided (§3.2). |
| FLEX tweener support end-to-end | ⚠️ Enumerates roles, but scoring is inert (§3.1). |
| Local-first, no renamed storage keys | ✅ Plausible (additive `usageProjection?`). |

---

## 6. Required-fix checklist (priority order)

1. 🔴 Land Spec 03's foundation first (`Player.positionTraits`, `traitSchemas.ts`, `traitGrading.ts`) — Spec 04 is a downstream consumer.
2. 🔴 Remap every `ROLE_CATALOG.schemeId` to a **real** `SCHEMES` id (`34defense`, `43defense`, `zoneblock`, `gapblock`, `pressman`, `quarters`, `westcoast`, `spread`) — decide the mapping deliberately (§4.1).
3. 🟠 Ensure the rewarded-trait keys actually exist in `traitSchemas.ts`, or the scoring carries no per-role signal (§3.1).
4. 🟠 Provide the **actual** `PlayerProfileModal.tsx` integration code and reconcile it with Spec 03's rewrite of the same file (merge conflict risk).
5. 🟡 Rework rationale/`primaryRoleId` defaults so absent-trait cases don't emit misleading "(70)" text or default to `edge_wide9`.

**Bottom line:** Spec 04's scaffolding is reasonable, but as written the projection engine is **inert** (no sub-trait data, dead scheme bonus) and its user-facing integration is undelivered. It is blocked behind Spec 03's foundation and needs a real scheme-ID mapping before it produces meaningful output.
