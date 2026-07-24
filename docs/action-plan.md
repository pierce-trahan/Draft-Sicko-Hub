# Action Plan — Finishing the Remaining Specs

Scope: the specs not yet in `main`. Status below is **verified against the current `main`**, not
against the (stale) tracking docs on the `claude/design-notes-repo-access-2b7bw3` branch.

## Where things actually stand

| # | Spec | In `main`? | Notes |
|---|------|-----------|-------|
| 01 | Pairwise Elo Preference Engine | ❌ **No** | Built on the `design-notes` branch (`src/utils/elo.ts`, rebuilt `PlayerRankingMatrix.tsx`, `draftValue.ts`) but **never merged**, and that branch predates our 02/04 work. Must be **ported**, not merged. |
| 02 | GM Profiles + PFR pipeline | ✅ Yes | Merged (PR #1). Runs on the curated 3-GM subset; full pipeline still wants the manual PFR CSV export. |
| 03 | Position-aware trait model | ✅ Yes | Merged. Trait content (`traitSchemas.ts`) authored this session — the "T-1" task is effectively done (refine later with scouting judgment). |
| 04 | Positional usage & projection | ✅ Yes | Merged. Role catalog (`usageRoles.ts`) authored — the "U-1" task is effectively done. |
| 05 | Athletic profile & outlier metric | ❌ No | Spec-ready. **Data-gated** (needs nflverse combine / RAS). Enhances 02/03/04; carries the "Baalke fingerprint." |
| 06 | AI-GM simulator behavior | ❌ No | Spec-ready. Depends on 02 (have) + enhanced by 05. Rewrites CPU pick logic in `DraftSimulator.tsx`. |
| 07 | Open-source packaging & publish | ❌ No | Spec-ready. License, attributions, graceful no-key degradation, README verify. Do last. |

### Two cross-cutting problems to fix first

1. **Branch divergence.** `design-notes` has Spec 01 **and** an older, different trait foundation
   (its `types.ts` / `traitSchemas.ts` / `traitGrading.ts` conflict with the ones we merged). A
   straight merge would clobber our 02/03/04. Spec 01 must be **cherry-ported** onto `main`.
2. **The knowledge base isn't in `main`.** `docs/VISION.md`, `docs/specs/`, `docs/research/`, and
   `docs/workflow/` live only on `design-notes`. And its tracking index is now wrong (claims 01/03
   "Landed", T-1/U-1 "to author"). This should be brought into `main` and reconciled with reality.

---

## Step 0 — Reconcile docs into `main` (fast, do first)

Bring the spec/vision/research/workflow docs onto `main` so the plan has a home, and correct the
status drift. Merge them alongside the existing `docs/trait-system.md`.

- Port `docs/VISION.md`, `docs/specs/*`, `docs/research/*`, `docs/workflow/*` from `design-notes`.
- Fix `docs/specs/README.md`: 02/03/04 = **Landed in main**; 01 = **built-but-not-ported**; T-1/U-1
  = **authored** (point at `traitSchemas.ts` / `usageRoles.ts`).
- **Est:** ~30 min, docs-only, low risk. **Gate:** none (no code).

---

## Step 1 — Spec 01: Pairwise Elo Preference Engine (flagship)

The differentiator. Port the Elo work from `design-notes` onto current `main`.

- **Port, don't merge.** Take the Elo-specific artifacts and re-apply on `main`:
  - `src/utils/elo.ts` (rating math, pair selection).
  - the rebuilt `src/components/PlayerRankingMatrix.tsx` (matchup UI + Preference Board + Gut-vs-Grades).
  - `src/utils/draftValue.ts` if the rebuilt matrix imports it — **watch the collision**: on `main`,
    `getDraftRange` is exported from `PlayerRankingMatrix.tsx` and imported by `PlayerProfileModal.tsx`.
    Keep that export working (re-export or update the import).
  - `src/types.ts`: add `PreferenceOutcome`, `PreferenceComparison`, `PreferenceRating`,
    `PreferenceState` (additive — do **not** take design-notes' whole `types.ts`).
  - `src/App.tsx`: new `nfl_draft_preferences` localStorage key wired into the Data Hub
    export/import; keep the `scouting_matrix` nav wiring intact.
- **Does NOT need** the divergent trait foundation — Elo reads `overallGrade` and reuses the current
  `RadarChart`. Leave our 02/03/04 foundation untouched.
- **Risks:** the `getDraftRange` import path; making sure the matchup cards' `RadarChart` usage
  matches `main`'s current props.
- **Gate:** `tsc` 0 errors + `vite build` + visual QA (run matchups, verify Elo updates, Preference
  Board number, Gut-vs-Grades divergence, resumability, backup round-trip).

---

## Step 2 — Spec 05: Athletic Profile & Outlier Metric

Enhances 02/03/04; this is where the Baalke fingerprint finally shows.

- **Data first (blocking):** acquire athletic data — default path is **nflverse `load_combine()`**
  (CC-BY, redistribution-clean); compute our own positional percentiles. RAS only as a labeled
  reference. Ship **derived** scores, not raw third-party DBs. → produces a data file the app reads.
- **Code:** `AthleticProfile` type (optional, additive); `src/utils/athleticOutlier.ts`
  (`outlierDelta = normalizedAthleticScore − productionSignal`, guarded for missing data); an
  Athletic Profile card in `PlayerProfileModal.tsx`; an "athletic lean" aggregate in GM Profiles
  once picks join to athletic data.
- **Open items to decide:** A-1 (RAS free vs. premium — default nflverse), A-2 (pick↔combine join by
  name/year), A-3 (production signal = Spec 03 `production` pillar vs. `overallGrade`).
- **Gate:** `tsc` + build + visual QA; validate the athletic-lean aggregate on Baalke's picks.

---

## Step 3 — Spec 06: AI-GM Simulator Behavior

Makes CPU teams draft like the real GM. Needs 02 (have) and is enhanced by 05.

- **Code:** `src/utils/gmDraftStrategy.ts` — score candidates by `value + need + gmPositionBias
  (+ gmAthleticBias when 05 present)`, probabilistic pick with a tunable **chaos** factor, and an
  explainable per-pick rationale. Wire into `DraftSimulator.tsx` (rationale display, strategy
  indicator, chaos slider). GMs without a profile fall back to need+value.
- **Best after 05** so the athletic-lean bias is available (the clearest Baalke effect), but the
  positional-bias core can ship on 02 alone if you want it sooner.
- **Open items:** S-1 (weight/chaos defaults), S-2 (only profiled GMs behave in-character), S-3
  (optional Gemini narration; deterministic scoring stays source of truth).
- **Gate:** `tsc` + build + visual QA; validate a Baalke-controlled team visibly skews vs. Roseman.

---

## Step 4 — Spec 07: Open-Source Packaging & Publish (last)

Turns the repo into a downloadable, self-hostable tool.

- `LICENSE` (MIT pending **P-1**), `ATTRIBUTIONS.md` (nflverse CC-BY, PFR, RAS, CFBD per terms),
  in-app "Data & Credits" view (reuse `CitedSources.tsx`).
- **Hard requirement:** app runs **without** `GEMINI_API_KEY` — every AI feature degrades to
  fallbacks; core features fully work. Verify both modes.
- README/`.env.example` accuracy, light `CONTRIBUTING.md`, clean-machine install→dev→build→start run,
  no secrets committed, AI Studio publish path documented.
- **Open items:** P-1 (license), P-2 (offer a static no-server build?), P-3 (final data-redistribution check).
- **Gate:** clean-machine run succeeds with and without a key.

---

## Recommended sequence

```
Step 0  reconcile docs into main            (fast, no code)
Step 1  Spec 01 Elo  (port)                 ← flagship, do next
Step 2  Spec 05 Athletic  (data → code)     ← unblocks the Baalke fingerprint + feeds 06
Step 3  Spec 06 AI-GM Sim                    ← needs 02 (have) + 05
Step 4  Spec 07 Packaging                    ← last
```

Parallelizable anytime: the **manual PFR CSV export** (expands Spec 02 past the 3-GM subset) and the
**nflverse combine pull** (Step 2's data prerequisite) — both are data-authoring tasks that can be
done independently of code.

## Per-spec acceptance gate (applies to every build)

1. Extract/port the files, apply on a fresh branch off `main`.
2. `tsc --noEmit` = 0 errors.
3. `vite build` succeeds.
4. Visual QA in the running app for the spec's acceptance criteria.
5. PR → review → merge. One spec per PR.

## Data-authoring tasks (with the user, not code)

- **PFR GM CSVs** — export each team's draft table, tag GM-by-year (Roseman skip-2015, Baalke SF/JAX
  cutovers). Feeds the full Spec 02 pipeline.
- **nflverse combine pull** — combine measurables → derived positional percentiles. Prerequisite for
  Spec 05.
- **T-1 / U-1 refinement** — the trait schemas and role catalog exist and compile; revisit weights and
  role definitions with real scouting judgment when convenient (not blocking).
