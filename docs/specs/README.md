# Specs Index — Sicko's Draft Hub

Build specs, ordered by dependency. Each is precise enough for the Platform Engineer (Gemini 3.6) to build without re-litigating the vision. See [`../workflow/`](../workflow/README.md) for roles and [`../VISION.md`](../VISION.md) for the why.

## Ready to build

| # | Spec | Phase | Depends on | Status |
|---|---|---|---|---|
| 01 | [Pairwise Elo Preference Engine](01-elo-preference-engine.md) | 1 | — | ✅ Spec ready |
| 02 | [GM Profiles + PFR Pipeline](02-gm-profiles-pipeline.md) | 3 | — (parallel) | ✅ Spec ready — all open items (G-1/2/3) resolved |
| 03 | [Position-Aware Trait Model](03-position-aware-trait-model.md) | 2 | — | ✅ Spec ready (T-1 = trait-list content authoring) |
| 04 | [Positional Usage & Projection](04-positional-usage-projection.md) | 2 | **03** | ✅ Spec ready (U-1 = role-catalog content authoring) |

**Suggested build order:** 01 (flagship) → 03 → 04 (Phase 2 chain) → 02 (parallelizable anytime; needs the manual PFR export for its subset).

## Backlog — not yet drafted

Scoped one-liners; write these as they come up.

| # | Spec (proposed) | Phase | Scope |
|---|---|---|---|
| 05 | Athletic Profile & Outlier Metric | 2.5 / future | Join draft picks/prospects to combine + RAS athleticism (`docs/research/data-sources.md`); quantify "toolsy reach vs. production" — captures the Baalke fingerprint deferred from Spec 02, and can weight Spec 04 fits. |
| 06 | AI-GM Simulator Behavior | 3 (optional) | Feed Spec 02 GM tendencies into the Draft Simulator so CPU teams pick like the real GM (position-by-round, archetype lean). |
| 07 | Open-Source Packaging & Publish | 4 | Real README (done-ish), LICENSE, local-run/self-host instructions, data attributions, and the AI Studio publish path. |

## Content-authoring tasks (not code specs, but needed)

These are scouting-judgment data tasks to do *with the user*, referenced by the specs above:
- **T-1** — full per-position trait lists + weights (`TRAIT_SCHEMAS`, Spec 03).
- **U-1** — the usage role catalog (`usageRoles.ts`, Spec 04), FLEX-heavy cases first.
- **G-2 content** — the 3-GM subset draft data (manual PFR CSV export, Spec 02).
</content>
