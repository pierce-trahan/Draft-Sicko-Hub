# Spec 09 — Build Review (Pass 1)

> **Reviewer:** Claude (design/audit). **Build:** Gemini 3.6 Pass 1 of the Two-Page Player Profile.
> **Verdict: ✅ Accepted with one fix applied.** The build was genuinely surgical — a clear turnaround from the Spec 06 passes. One blocking issue (a fabricated provenance panel) was fixed by Claude rather than sent back for a Pass 2; everything else landed as delivered.

---

## Acceptance-criteria scorecard (Spec 09 §5)

| Criterion | Status |
|---|---|
| Two-page profile; **Player Info default**; toggle both ways, no data loss | ✅ (`profilePage` defaults to `'info'`) |
| Scouting Report renders from existing data (traits/percentiles, archetype, strengths/risks, `gradeHistory`) + Source & Confidence | ⚠️ → ✅ **after fix** — panel was fabricated (see below); **comparables not built** (see gap) |
| Player Info renders identity/measurables; résumé/recruitment/production **progressive**, no empty shells, no fabricated values | ✅ `honors` / `recruiting` correctly guarded on `&& .length > 0` |
| New types additive/optional; export/import covers them; no key renamed | ✅ |
| Every existing profile editor feature still works (surgical restructure) | ✅ verified — see below |
| Visual language matches `ui-direction.md` (emerald, low radius, provenance visible) | ✅ 71 emerald refs, **0 orange** |

## What Pass 1 got right (worth recording — this is the pattern we want)

**It edited surgically instead of regenerating.** `PlayerProfileModal.tsx` went 1,455 → 1,639 lines (grew, not stubbed). A function-by-function diff showed **nothing lost**: `onSave`, photo-URL input, sub-trait sliders, strengths/weaknesses editing, AI quote generation (`/api/gemini/generate-scout`), label tagging, grade history, usage-projection locking, and big-board editing all present at identical occurrence counts.

**It used real signatures.** `PlayerProfileModalProps` preserved exactly (`player`, `onClose`, `onSave`, `teamContext`, `customLabels`, `onAddCustomLabel`); `<TrendLineChart player={…} />` and `<RadarChart traits/color/positionTraits/position>` match the real contracts. No invented props — the exact failure mode of Spec 06 Pass 2.

**Types are properly additive.** `RecruitingStage` / `CareerHonor` / `SourceConfidence` added; every existing `Player` field and every other interface in `types.ts` preserved.

**Regression check clean** (the new post-pass rule): no AI Studio boilerplate re-injected, no branding revert, all `prospect_engine_*` / `nfl_draft_*` localStorage keys intact, only the 2 intended files touched, `tsc --noEmit` + `npm run build` green.

---

## 🔴 F-1 — Fabricated provenance panel (FIXED by Claude)

The Source & Confidence panel shipped **100% hardcoded**. `SourceConfidence` was imported and **never used** — the type existed, the panel ignored it. Every player rendered identical invented values:

- `Overall Evaluation Confidence: High (Verified)` — nothing was verified.
- `CFBD College Data — High · Roster & Records` — **there is no CFBD data in the app at all**; the only CFBD references in the codebase are type comments.
- `nflverse Combine — High · Official Measurables` — most prospects carry only manually-seeded measurables.
- `Media Consensus — Med-High · 5 Outlets Grounded` — invented count.

This is the single failure this project most exists to prevent, and it is **worse than having no panel**, because it asserts verification with authority. It contradicts `ui-direction.md` §2, the data-honesty guardrail, and VISION's cite-everything ethos.

**Fix applied:** the panel is now **derived from what the player actually carries**, with `player.sourceConfidence` as an optional per-section override:

| Source row | Derived from | Honest empty state |
|---|---|---|
| Evaluator Traits | count of graded sub-traits vs. the position schema | "No sub-traits graded — falls back to 5 pillars" |
| Athletic / Combine | count of present measurables + `athleticProfile.source` (`nflverse`/`ras` → High, `computed` → Med, `manual` → Low) | "No measurables on file" |
| Media Big Boards | **real** `bigBoards` entry count | "No outlets recorded" |
| College Data (CFBD) | `honors` + `recruiting` record count | **"Not connected — résumé & recruiting not yet ingested"** |

The header now reports **"Connected sources: N of 4"** instead of asserting an overall grade, unconnected rows render dimmed, and a standing footnote states: *"Confidence is derived from the data actually on file for this prospect — not asserted."* `tsc` + build green after the fix.

## 🟡 F-2 — Comparables not built (open, deferred)

Spec 09 §2 Page 2 lists "**Archetype + Comparables** (existing `archetype`; similarity list)". Archetype ships; the **comparables list was not built** (zero references). Not fixed here because a prospect-similarity function doesn't exist yet and inventing one exceeds this pass's "existing data" scope. Options: a small position-trait-distance similarity util, or fold it into the Scouting Atlas work (Spec 10), which needs clustering anyway. **Decide before calling Spec 09 fully complete.**

## Still open from the spec

- **PP-1 / PP-2 — CFBD wiring** gates the Player Info résumé, recruitment journey, and production blocks. Until then those sections stay correctly absent, and the provenance panel now says so honestly.
- **PP-3 — modal vs. persistent inspector** remains deferred to the shell R&D pass (UI R&D queue #1).
- **PP-4 — section trim** (which evaluation details move to Player Info) not yet confirmed with the user.
