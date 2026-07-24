# Specs Index — Sicko's Draft Hub

Build specs, ordered by dependency. Each is precise enough for the Platform Engineer (Gemini 3.6) to build without re-litigating the vision. See [`../workflow/`](../workflow/README.md) for roles and [`../VISION.md`](../VISION.md) for the why.

## Status

> **This table is the single live status.** Verified against `main`. (The old `action-plan.md` / `workflow/next-actions.md` planning docs were retired once their steps were done — git history has them.) UI work is queued separately in [`../research/ui-rd-plan.md`](../research/ui-rd-plan.md).

| # | Spec | Phase | Depends on | Status |
|---|---|---|---|---|
| 01 | [Pairwise Elo Preference Engine](01-elo-preference-engine.md) | 1 | — | ✅ **Landed in `main`** (PR #3) — ported onto current main; verified · [review](01-review-notes.md) |
| 02 | [GM Profiles + PFR Pipeline](02-gm-profiles-pipeline.md) | 3 | — (parallel) | ✅ **Landed in `main`** (PR #1) — runs on the curated 3-GM subset |
| 03 | [Position-Aware Trait Model](03-position-aware-trait-model.md) | 2 | — | ✅ **Landed in `main`** (PR #1) · T-1 trait content **authored** (`src/data/traitSchemas.ts`) · [review](03-review-notes.md) |
| 04 | [Positional Usage & Projection](04-positional-usage-projection.md) | 2 | **03** | ✅ **Landed in `main`** (PR #1) · U-1 role catalog **authored** (`src/data/usageRoles.ts`) |
| 05 | [Athletic Profile & Outlier Metric](05-athletic-profile-outlier-metric.md) | 2.5 | — (enhances 02/03/04) | ✅ **Landed in `main`** (PR #4) — nflverse-derived; athletic card + GM lean |
| 06 | [AI-GM Simulator Behavior](06-ai-gm-simulator-behavior.md) | 3 (optional) | **02** ✅ (+05 ✅) | ✅ **Landed in `main`** (PR #6) — Gemini Pass 2 util kept; its component rewrite rejected, Claude did the surgical integration (`tsc` + build green) · [review](06-review-notes.md) |
| 07 | [Open-Source Packaging & Publish](07-open-source-packaging-publish.md) | 4 | — | 📋 **Handoff-ready for Gemini** — see the spec's "Build context" section for repo file URLs |
| 08 | [Player-Identity Crosswalk](08-player-identity-crosswalk.md) | 3 (enabler) | — (enables full-scale **02** + **05**) | ✏️ **Drafted (design)** — the canonical `prospect_id` + cross-source ID join both 02 and 05 assume but don't design |
| 09 | [Two-Page Player Profile](09-player-profile-restructure.md) | 5 (UI) | — (Report page: existing data; Info page: CFBD) | ✅ **Landed in `main`** (PR #16) — Gemini Pass 1 was surgical; Claude fixed a fabricated provenance panel (now derived from real data) · [review](09-review-notes.md). Open: comparables (F-2), CFBD wiring for the Info page |

**Remaining build work:** **07** (packaging/publish — handoff-ready, and last by design), plus the two design-drafted specs: **08** (player-ID crosswalk — build before joining Spec 02 picks to outcomes at scale or Spec 05 combine data historically) and **09** (two-page player profile — Scouting Report page first, it runs on existing data). **10 — Scouting Atlas** is designated but not yet drafted.

Every spec carries a "Build context — repo files for the Gemini builder" table; each handoff ships that table as a pasted **content bundle** (see [`../workflow/README.md`](../workflow/README.md)). The manual PFR export (expands Spec 02 past the 3-GM subset) remains a parallel data-authoring task; **CFBD wiring** gates Spec 09's Player Info page.

## Backlog

Roadmap specs 01–07 are drafted; **08** (player-identity crosswalk) and **09** (two-page player profile) added as scope emerged. **10 — Scouting Atlas** (the one signature interaction, spatial class map) is **designated but not yet drafted** — see [`ui-direction.md`](../research/ui-direction.md) §4. New specs get added here as scope emerges.

**Where an idea goes:** if it's *in-scope for the Hub*, it becomes a spec here. If it's a *separate product* or blocked on data/tech the Hub can't assume, it goes to [`../future-tools.md`](../future-tools.md) instead — so parked ideas don't creep into the build (VISION §3).

## Content-authoring tasks (not code specs, but needed)

These are scouting-judgment data tasks to do *with the user*, referenced by the specs above:
- **T-1** — ✅ **authored** in `main`: full per-position trait schemas + weights (`src/data/traitSchemas.ts`). Revisit weights with scouting judgment when convenient (not blocking).
- **U-1** — ✅ **authored** in `main`: the usage role catalog (`src/data/usageRoles.ts`). Refine role definitions later as needed.
- **G-2 content** — ✅ **prepared:** 254 GM-attributed picks (Roseman/Schoen/Baalke) in `pipeline-input/gm-subset/` (derived from manual PFR exports; raw kept offline per G-1). Ready for the Spec 02 pipeline.
