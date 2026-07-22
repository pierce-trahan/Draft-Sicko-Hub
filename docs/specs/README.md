# Specs Index — Sicko's Draft Hub

Build specs, ordered by dependency. Each is precise enough for the Platform Engineer (Gemini 3.6) to build without re-litigating the vision. See [`../workflow/`](../workflow/README.md) for roles and [`../VISION.md`](../VISION.md) for the why.

## Ready to build

| # | Spec | Phase | Depends on | Status |
|---|---|---|---|---|
| 01 | [Pairwise Elo Preference Engine](01-elo-preference-engine.md) | 1 | — | ✅ Spec ready |
| 02 | [GM Profiles + PFR Pipeline](02-gm-profiles-pipeline.md) | 3 | — (parallel) | ✅ Spec ready — all open items (G-1/2/3) resolved |
| 03 | [Position-Aware Trait Model](03-position-aware-trait-model.md) | 2 | — | ✅ Spec ready (T-1 = trait-list content authoring) |
| 04 | [Positional Usage & Projection](04-positional-usage-projection.md) | 2 | **03** | ✅ Spec ready (U-1 = role-catalog content authoring) |
| 05 | [Athletic Profile & Outlier Metric](05-athletic-profile-outlier-metric.md) | 2.5 | — (enhances 02/03/04) | ✅ Spec ready — captures the Baalke fingerprint |
| 06 | [AI-GM Simulator Behavior](06-ai-gm-simulator-behavior.md) | 3 (optional) | **02** (+05) | ✅ Spec ready |
| 07 | [Open-Source Packaging & Publish](07-open-source-packaging-publish.md) | 4 | — | ✅ Spec ready |

**Suggested build order:** 01 (flagship) → 03 → 04 (Phase 2 chain) → 05 (athletic layer) → 02 (parallelizable anytime; needs the manual PFR export for its subset) → 06 (needs 02 data) → 07 (packaging, last).

## Backlog

All roadmap specs are now drafted. New specs get added here as scope emerges.

## Content-authoring tasks (not code specs, but needed)

These are scouting-judgment data tasks to do *with the user*, referenced by the specs above:
- **T-1** — full per-position trait lists + weights (`TRAIT_SCHEMAS`, Spec 03).
- **U-1** — the usage role catalog (`usageRoles.ts`, Spec 04), FLEX-heavy cases first.
- **G-2 content** — the 3-GM subset draft data (manual PFR CSV export, Spec 02).
</content>
