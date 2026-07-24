# Spec 09 — Two-Page Player Profile (Info / Scouting Report)

> **Phase:** 4 (UI). **Extends:** `PlayerProfileModal.tsx`. **Reads with:** [`docs/research/ui-direction.md`](../research/ui-direction.md) (visual language + provenance) and `docs/research/data-sources.md` (CFBD for the new résumé fields).
> **Owner:** Claude (design). **Builder:** Gemini 3.6 → AI Studio.
> **Sequencing:** the **Scouting Report** page is buildable now on existing data — do it first. The **Player Info** page depends on new CFBD-sourced data — do it after (or ship it progressive, showing only fields we have).

---

## 0. What we're building (one paragraph)

When you open a player, the profile becomes **two pages you toggle between: "Player Info" (default) and "Scouting Report."** This separates **fact from evaluation** — who the player is / what he did (résumé, production, measurables, recruitment journey) vs. our opinion of him (evaluation matrix, comparables, projection, and the confidence behind every number). It's the "the number is sacred / contextualize honestly / learning instrument" ethos made structural, and it applies the editorial visual language from `ui-direction.md`.

## 1. Why (the philosophy)

Mixing biography and evaluation into one dense screen hides which parts are *facts* and which are *our judgment*. Splitting them teaches the user to read a prospect the way a scout does — establish the résumé, then form the take — and it lets the **Source & Confidence** panel sit honestly next to the derived numbers. It also makes room for a genuinely on-thesis new feature: the **recruitment → transfer → draft valuation journey**, a valuation-over-time story that rhymes with board-rank history and the "narrative vs. reality" mission (VISION §1, §7).

## 2. The two pages

### Page 1 — Player Info (default): the résumé / who he is
- **Identity header** (existing): name, position, school, class, measurables, photo.
- **Measurables / combine** (from `athleticProfile`, Spec 05 — show what exists).
- **Production** (career/season stats — *new data, CFBD*; show only what we have).
- **Career résumé — NEW:** awards/honors (All-American, All-Conference…) and team accolades (record, conference titles, bowl games, championships).
- **Recruitment & transfer journey — NEW:** HS star rating + composite, and re-rating at each transfer stop — a small timeline/bump visualization of valuation over time.
- Every block carries a **source label**.

### Page 2 — Scouting Report: our evaluation
- **Evaluation Matrix:** position traits + grade + percentile bars (reuse Spec 03 `traitGrading` / `TRAIT_SCHEMAS` and Spec 05 percentiles; reuse `RadarChart`).
- **Archetype + Comparables** (existing `archetype`; similarity list).
- **Strengths / Risks / Projection** (existing `strengths`/`weaknesses` + projection).
- **Board / Rank History** (existing `gradeHistory` — already in the `Player` type; render as a line/bump chart over time).
- **Source & Confidence panel** (per `ui-direction.md` §2): per-source `High/Med/Low` + overall confidence, anchored here.

> **Trim per the user:** some evaluation detail moves *off* the scouting page; the résumé/context (awards, records, recruitment) lives on Player Info, not buried in the scouting report.

## 3. Data model (`src/types.ts` — additive, optional)

```ts
export interface RecruitingStage {
  stage: 'hs' | 'transfer';   // high-school entry, or a transfer move
  fromSchool?: string;
  toSchool?: string;
  year?: number;
  stars?: number;             // 0..5
  compositeRating?: number;   // e.g. 0.9800
  source?: string;            // 'CFBD' | 'manual' | ...
}

export interface CareerHonor {
  label: string;              // 'First-Team All-SEC' | 'CFP National Champion'
  year?: number;
  level?: 'national' | 'conference' | 'team' | 'other';
  source?: string;
}

export interface SourceConfidence {
  source: string;             // 'College Data API (CFBD)' | 'nflverse' | 'manual' | ...
  confidence: 'high' | 'med' | 'low';
  lastUpdated?: string;
  note?: string;
}

export interface Player {
  // ...existing...
  recruiting?: RecruitingStage[];                     // NEW — HS + transfer valuation journey
  honors?: CareerHonor[];                             // NEW — awards + team accolades
  sourceConfidence?: Record<string, SourceConfidence>; // NEW — per-section provenance, keyed by section id
}
```

All optional; absent = the section simply isn't shown. No storage key renamed; joins existing export/import.

## 4. UI (`PlayerProfileModal.tsx`)

- A **two-page toggle** at the top of the profile surface — `Player Info` (default) | `Scouting Report`. Persist last-viewed page per session is optional.
- Apply the **`ui-direction.md` visual language**: 0–4px radius, rules/typography over cards, **emerald** accent, tables-first where dense.
- **Preserve every existing profile feature** — scout notes, grade editing, labels, media big-board quotes, grade history, archetype, save flow (`onSave`). This is a *restructure*, not a teardown; edit surgically (do not drop the editor).
- Source labels on every data block; the Source & Confidence panel anchors the Scouting Report page.

## 5. Acceptance criteria

- [ ] Opening a player shows a two-page profile; **Player Info is default**, toggle to Scouting Report and back with no data loss.
- [ ] Scouting Report renders from **existing data** (traits/percentiles, archetype/comparables, strengths/risks, `gradeHistory`) + the Source & Confidence panel.
- [ ] Player Info renders identity/measurables now; **résumé, recruitment journey, and production show when data exists**, and are cleanly absent (no empty shells, no fabricated values) when it doesn't.
- [ ] New types are additive/optional; export/import covers them; no storage key renamed.
- [ ] Every existing profile editor feature still works (surgical restructure).
- [ ] Visual language matches `ui-direction.md` (emerald accent, low radius, provenance visible).

## 6. Out of scope (note, don't build)

Film terminal, Playbook Grid, All-22, route telemetry (data-blocked → `future-tools.md`); the Scouting Atlas (its own later spec 10); the app-wide modal→persistent-inspector migration (gradual, per `ui-direction.md`); the CFBD ingestion pipeline itself (a separate data task — this spec just *consumes* the fields when present).

## 7. Open items

- **PP-1 — CFBD data wiring.** Records, conference titles, bowls, and **HS recruiting stars** are obtainable from **CFBD** (already our college source). **Fuzzy/flagged:** per-transfer re-ratings (transfer-portal star ratings are less standardized — may need a supplement) and individual awards (spotty in CFBD — supplement or manual). Cite what CFBD gives; mark gaps; never fabricate.
- **PP-2 — Production stats source.** The `Player` type has no raw production stats today; the Player-Info production block needs a CFBD pull. Ship the block progressive (show when present).
- **PP-3 — Modal vs. inspector.** The profile is a modal today; `ui-direction.md` favors a persistent inspector. Keep the two-page toggle inside the current surface for this spec; treat the modal→inspector migration as separable.
- **PP-4 — Section trim.** Confirm with the user exactly which evaluation details move off the Scouting Report onto Player Info.

---

## Build context — repo files for the Gemini builder

> Per the Engineering Handoff URL Rule, each handoff delivers a **content bundle** built from this table (the AI Studio builder can't fetch raw URLs). URLs point to `main`; resolve after merge.

| File | Why the builder needs it | Raw URL |
|------|--------------------------|---------|
| This spec | The build target | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/docs/specs/09-player-profile-restructure.md |
| `docs/research/ui-direction.md` | The visual language + provenance/confidence pattern to apply | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/docs/research/ui-direction.md |
| `src/types.ts` | Add `RecruitingStage`/`CareerHonor`/`SourceConfidence`; see real `Player` shape (extend, don't redefine) | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/types.ts |
| `src/components/PlayerProfileModal.tsx` | **The file to restructure** — preserve every existing editor feature; add the two-page toggle | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/components/PlayerProfileModal.tsx |
| `src/components/RadarChart.tsx` | Reuse for the Evaluation Matrix radar (real prop contract) | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/components/RadarChart.tsx |
| `src/data/traitSchemas.ts` | Position trait schemas for the Evaluation Matrix | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/data/traitSchemas.ts |
| `src/utils/traitGrading.ts` | `computePositionGrade` / percentile helpers | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/utils/traitGrading.ts |
| `src/utils/athleticOutlier.ts` | Athletic profile/percentile helpers for measurables | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/utils/athleticOutlier.ts |
| `src/components/CitedSources.tsx` | Pattern to reuse for the Source & Confidence panel | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/src/components/CitedSources.tsx |
| `docs/research/data-sources.md` | CFBD (records, bowls, conference titles, recruiting stars); gap notes | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/docs/research/data-sources.md |
| `docs/VISION.md` | §1/§7 the "why" — fact vs. evaluation, valuation-over-time | https://raw.githubusercontent.com/pierce-trahan/Draft-Sicko-Hub/main/docs/VISION.md |
