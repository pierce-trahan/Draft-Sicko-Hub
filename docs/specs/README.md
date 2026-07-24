# Specs Index — Sicko's Draft Hub

Build specs, ordered by dependency. Each is precise enough for the Platform Engineer (Gemini 3.6) to build without re-litigating the vision. See [`../workflow/`](../workflow/README.md) for roles and [`../VISION.md`](../VISION.md) for the why.

## Status

> Verified against `main`. See [`../action-plan.md`](../action-plan.md) for the finish plan.

| # | Spec | Phase | Depends on | Status |
|---|---|---|---|---|
| 01 | [Pairwise Elo Preference Engine](01-elo-preference-engine.md) | 1 | — | 🟡 **Built but not in `main`** — engine exists on the `design-notes` branch (`elo.ts`, rebuilt `PlayerRankingMatrix.tsx`); being **ported** onto current `main` · [review](01-review-notes.md) |
| 02 | [GM Profiles + PFR Pipeline](02-gm-profiles-pipeline.md) | 3 | — (parallel) | ✅ **Landed in `main`** (PR #1) — runs on the curated 3-GM subset |
| 03 | [Position-Aware Trait Model](03-position-aware-trait-model.md) | 2 | — | ✅ **Landed in `main`** (PR #1) · T-1 trait content **authored** (`src/data/traitSchemas.ts`) · [review](03-review-notes.md) |
| 04 | [Positional Usage & Projection](04-positional-usage-projection.md) | 2 | **03** | ✅ **Landed in `main`** (PR #1) · U-1 role catalog **authored** (`src/data/usageRoles.ts`) |
| 05 | [Athletic Profile & Outlier Metric](05-athletic-profile-outlier-metric.md) | 2.5 | — (enhances 02/03/04) | ⬜ Spec ready, unbuilt — data-gated (nflverse combine); captures the Baalke fingerprint |
| 06 | [AI-GM Simulator Behavior](06-ai-gm-simulator-behavior.md) | 3 (optional) | **02** (+05) | ⬜ Spec ready, unbuilt |
| 07 | [Open-Source Packaging & Publish](07-open-source-packaging-publish.md) | 4 | — | ⬜ Spec ready, unbuilt |

**Remaining build order** (from [`../action-plan.md`](../action-plan.md)): **01** (port, flagship) → **05** (athletic; data → code) → **06** (needs 02 + 05) → **07** (packaging, last). The manual PFR export and the nflverse combine pull are parallel data-authoring tasks.

## Backlog

All roadmap specs are now drafted. New specs get added here as scope emerges.

## Content-authoring tasks (not code specs, but needed)

These are scouting-judgment data tasks to do *with the user*, referenced by the specs above:
- **T-1** — ✅ **authored** in `main`: full per-position trait schemas + weights (`src/data/traitSchemas.ts`). Revisit weights with scouting judgment when convenient (not blocking).
- **U-1** — ✅ **authored** in `main`: the usage role catalog (`src/data/usageRoles.ts`). Refine role definitions later as needed.
- **G-2 content** — ✅ **prepared:** 254 GM-attributed picks (Roseman/Schoen/Baalke) in `pipeline-input/gm-subset/` (derived from manual PFR exports; raw kept offline per G-1). Ready for the Spec 02 pipeline.
</content>
