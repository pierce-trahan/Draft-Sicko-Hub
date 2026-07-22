# GM Subset — Attributed Draft Picks (Spec 02 validation data)

> **What this is:** the **derived, GM-attributed** draft-pick dataset for the 3-GM validation subset (Roseman / Schoen / Baalke), used to prove the Spec 02 pipeline before scaling to all 32 teams.
> **Status:** content prepared (the G-2 content task). Ready for the Spec 02 pipeline to consume.

## Files here

- `gm-subset-picks.csv` / `gm-subset-picks.json` — the same **254 attributed picks**, one row per pick.
- Columns: `gm, team, year, round, overall_pick, player, pos_raw, pos_group, college, pfr_id`.

## Provenance & the G-1 guardrail

- **Source:** Pro Football Reference per-team draft pages, exported manually via PFR's own "Share & Export → CSV" (the sanctioned, bot-free path — see `docs/research/data-sources.md` and Decision G-1).
- **We ship derived data, not PFR's raw tables.** Per G-1, the **raw full-franchise PFR CSVs are kept offline** (not committed here). What's committed is our **filtered, GM-attributed, re-columned** subset — factual pick lists (not copyrightable) transformed into our own schema. Attribute "Data via Pro Football Reference" anywhere this surfaces in-app.

## GM ↔ year attribution (the "tagging")

Each draft year was attributed to the decision-maker GM for that team-season. Tricky cutoffs are **excluded on purpose**:

| GM | Team(s) & years kept | Deliberately excluded |
|---|---|---|
| **Howie Roseman** | PHI 2010–2014, **2016–2025** | **2015** (Chip Kelly held personnel control) |
| **Joe Schoen** | NYG 2022–2025 | — (clean single tenure) |
| **Trent Baalke** | SF 2011–2016 **+** JAX 2021–2024 | SF **2010** (McCloughan/transition); JAX **2020** (Dave Caldwell); JAX **2025** (post-Baalke) |

> These tenures are well-established but were **not re-verified pick-by-pick against each PFR season-page "General Manager" field**. If Spec 02 automates attribution from that field, treat this table as the expected-answer key.

## Counts (validation signal)

- **Total: 254 picks.** Roseman 124 · Schoen 31 · Baalke 99 (SF 61 + JAX 38).
- Early tendency signal: **Baalke leads in `FLEX` picks (20)** — consistent with his tweener-DB / positionless-athlete reputation. (The true athletic-outlier fingerprint still needs Spec 05's combine/RAS join.)

## Position normalization (`pos_group`)

`pos_raw` (PFR's label) is preserved; `pos_group` maps it to the app's groups per Spec 02 §A3.2 + the G-3 `FLEX` rule. Deterministic mapping:

- `QB→QB`; `RB/FB/HB→RB`; `WR→WR`; `TE→TE`
- `T/OT/LT/RT→OT`; `G/OG/C/OL/LS→IOL`
- `DE→EDGE`; `DT/NT/DL→DT`; `LB/ILB/MLB→LB`
- `CB→CB`; `S/SAF/FS/SS→S`; `K→K`; `P→P`
- **`OLB→FLEX`** and **`DB→FLEX`** — genuinely ambiguous tweeners (edge-vs-off-ball; corner-vs-safety), routed to `FLEX` per Decision G-3. Unknown labels also → `FLEX`.

> **Caveat:** older PFR drafts use the generic `DB`/`OLB` labels heavily, which inflates `FLEX`. That's honest (the field alone doesn't tell us CB vs S), and `pos_raw` is retained so no information is lost. Spec 02 may refine this (e.g., era- or stat-aware) later.

## How Spec 02 uses this

This is the **expected output** of Spec 02's extract→attribute→transform steps for the subset. When the pipeline is built, it should reproduce this from the raw PFR exports; this file is the ground-truth check. The GM tendency views (position-by-round, allocation, capital, college lean) compute from these `pos_group` + `round` + `college` fields.
