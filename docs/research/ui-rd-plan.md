# UI R&D Plan — page-by-page

> **What this is:** the working queue for the external UI R&D sessions (ChatGPT), one module at a time. Companion to [`ui-direction.md`](ui-direction.md), which holds the *decided* direction; this doc holds *what we explore next and how*.
> **Status:** v1. Session 1 (macro/whole-app) is done — it produced the direction + the two-page player profile ([Spec 09](../specs/09-player-profile-restructure.md)).

---

## 0. Why page-by-page

Session 1 looked at the app at a **macro** level and produced one genuine breakthrough — the two-page player profile — and it happened precisely when the exploration dropped to the **micro** level of a single screen. That's the lesson: **the good ideas come from concentrating on one surface at a time**, not from another whole-app sweep. So every session from here targets **one module**, deeply.

**Corollary, equally important:** narrowing the *target* must not narrow the *thinking*. Session 1's best ideas (provenance/confidence, the class-as-landscape atlas) came from the R&D partner reaching past our current scope and data. Sessions stay free to propose ideas we have no data for — they get **flagged and parked**, not suppressed (see §3).

## 1. Standing constraints (short — full version in `ui-direction.md`)

- **Direction:** editorial scouting workstation — terminal density, provenance-forward.
- **The four moves:** 0–4px radius · tables first-class · persistent inspector over modals · typography/rules over cards.
- **Accent: emerald**, single. Team colors are for **data encoding** only. (Decided — VISION D-3.)
- **Provenance visible:** value → definition → source → season → transformation → confidence → last updated.
- **Dark + light** both considered for any pass.
- **One signature interaction:** the **Scouting Atlas** (staged, Spec 10). Don't propose competing signatures as *the* signature; propose them as modules.
- **Borrowing:** ideas are free from any source; **code** reuse permissive-only (AGPL/GPL = inspiration only). Flag the license when a pass leans on a specific tool's implementation.

## 2. How each session runs

**Input:** one module from the queue (§4) + the standing constraints + what data actually exists for it.

**Ask for:**
1. **3–5 distinct passes** for that one module — spanning restrained/professional → abstract/experimental (the full spectrum worked well in session 1).
2. For each pass: a short **rationale** (what problem it solves, what it makes easy that's hard today).
3. **Data callouts** — what each idea would require, and whether it's plausible from what we have.
4. **License callout** if a pass borrows from a specific tool's implementation.
5. **At least one idea deliberately past current scope/data** — see §3.

**Output format:** annotated mockups + a per-pass rationale list. Not a full design system; we're hunting for the structural idea.

## 3. Explore past scope — flag, don't self-censor

The R&D partner should keep proposing ideas we can't build yet. The **data-honesty guardrail** (`ui-direction.md` §5) governs what we *ship*, not what we *think about*. So:

- Propose it, then **tag it**: `BUILDABLE NOW` / `NEEDS DATA: <what>` / `SPECULATIVE`.
- Tagged-but-blocked ideas are valuable — they go to [`future-tools.md`](../future-tools.md) with their blocker and an integration seam, so they're waiting when the data arrives.
- What we will **not** do is build a beautiful panel we'd have to fill with uncited or invented numbers.

## 4. The queue

Order is a recommendation (shell first because every other surface inherits its grammar; flagship next because it's the differentiator). Reorder freely.

| # | Module | Component(s) | Status |
|---|---|---|---|
| — | Player Profile | `PlayerProfileModal.tsx` | ✅ **Done** — session 1 → [Spec 09](../specs/09-player-profile-restructure.md) |
| 1 | Global shell & navigation | `App.tsx` | ⬜ Next |
| 2 | Pairwise Elo Preference Engine | `PlayerRankingMatrix.tsx` | ⬜ |
| 3 | Prospect Boards / Board Builder | `BoardRanker.tsx` | ⬜ |
| 4 | Prospect Comparer | `PlayerComparer.tsx`, `RadarChart.tsx` | ⬜ |
| 5 | Draft Class Overview → Scouting Atlas | `DraftClassOverview.tsx` | ⬜ (feeds Spec 10) |
| 6 | Draft Simulator / war room | `DraftSimulator.tsx` + `DraftAnalyticsDashboard`, `DraftGradeSummaryModal`, `DraftValueCalculator` | ⬜ |
| 7 | GM Profiles | `GMProfiles.tsx` | ⬜ |
| 8 | Team Reports | `TeamReports.tsx` | ⬜ |
| 9 | Coaching Reports | `CoachingReports.tsx` | ⬜ |
| 10 | Data Hub / Data & Credits | `App.tsx`, `CitedSources.tsx` | ⬜ (ties to Spec 07) |

### 1 — Global shell & navigation (`App.tsx`)
**Today:** left sidebar of mode buttons + header; profile opens as a **modal**.
**Design questions:** Does the app get a **persistent inspector** instead of modals (this resolves Spec 09 **PP-3**)? A command bar (⌘K) for prospects/teams/metrics? Do we separate **modes** — explore / report / board / audit — the way Superset separates exploration from presentation? Full-bleed workspace vs. contained page? How do you change context without losing your place?
**Data:** none needed — pure structure.
**Why first:** every other module inherits this grammar, and it unblocks the modal-vs-inspector decision.

### 2 — Pairwise Elo Preference Engine (`PlayerRankingMatrix.tsx`) — the flagship
**Today:** rebuilt in Spec 01 — head-to-head pairs, 5-point preference, Elo ratings, gut-vs-grades view.
**Design questions:** What does the **comparison moment** look like — how much information is enough to choose without biasing toward the stat sheet? How do you make a long session **fast and rhythmic** (keyboard-first, no mouse)? How is **the sacred number** surfaced (never auto-hidden — VISION §6)? Most important: how do you **visualize divergence** between the gut board and the deliberate grade board — that's the core learning payoff. Session progress/convergence and confidence?
**Data:** all existing (`PreferenceState`, ratings, comparison counts).
**Why high:** it's the product's actual differentiator; it deserves the most design ambition after the atlas.

### 3 — Prospect Boards / Board Builder (`BoardRanker.tsx`)
**Today:** drag-rank, custom boards (league/team/position/scheme), labels, per-board export.
**Design questions:** Should **tiers** be first-class objects (drag between tiers, tier breaks that mean something) rather than a flat ordered list? **Pinned margin notes** (the dossier idea)? How do many boards coexist without a dropdown maze? A **board-history / bump chart** showing how your board moved over time (a session-1 signature candidate — good as a module here)?
**Data:** all existing.

### 4 — Prospect Comparer (`PlayerComparer.tsx`, `RadarChart.tsx`)
**Today:** multi-player compare with radar overlay; Spec 03 differentiates same-position (position traits) vs cross-position (5 pillars).
**Design questions:** The **comparison canvas** — side-by-side columns vs. overlay vs. spatial? How many at once before it degrades? Percentile framing vs. raw? How do you compare *honestly* across positions?
**Data:** existing traits/percentiles.

### 5 — Draft Class Overview → Scouting Atlas (`DraftClassOverview.tsx`)
**Today:** class-wide summary.
**Design questions:** What *is* a class overview — positional strength, tier distribution, top-end vs. depth, where the cliffs are? Then the big one: the **class as a landscape** (archetype regions, clusters, zoom, selected-player inspector, layers for production/athleticism/age/role). This pass should get the atlas concrete enough to **draft Spec 10**.
**Data:** traits/archetypes (Spec 03) + athletic (Spec 05) exist; clustering/layout is ours to build.

### 6 — Draft Simulator / war room (`DraftSimulator.tsx` + dashboards/modals)
**Today:** the largest module — live sim, trade desk (OTC values), analytics dashboard, grade summary, and **AI-GM picks with rationales + GM strategy indicator** (Spec 06, just landed).
**Design questions:** The **on-clock moment** — what does a war room feel like? How much density is right during a live draft vs. after? How do the new **pick rationales** surface as *teaching* rather than noise? Trade desk ergonomics. Is the post-draft grade report an **editorial artifact** (a publishable report) rather than a modal?
**Data:** all existing.

### 7 — GM Profiles (`GMProfiles.tsx`)
**Today:** position-by-round heatmap, positional allocation, capital spend, college/conference lean, athletic lean.
**Design questions:** How do you render a GM's **fingerprint** as an identity rather than four charts? And the pointed one, straight from what we learned: **how do you show honestly that the data contradicts the public narrative?** (Baalke — the "athletic gambler" story is weak in the numbers; the real signal is a defensive-trench bias. VISION §7 / D-2.) A visual language for *measured vs. believed* would be genuinely novel and is squarely on-mission.
**Data:** existing (`gmData`, `gmTendencies`, `gmPickAthletics`).

### 8 — Team Reports (`TeamReports.tsx`)
**Today:** cap, depth chart, needs, transactions.
**Design questions:** Depth chart as an actual **positional grid** rather than a list? Needs as structured data (severity, horizon) rather than prose tags? How does a team view connect to the board and to prospect fit without becoming a second board?
**Data:** existing static team data.

### 9 — Coaching Reports (`CoachingReports.tsx`)
**Today:** coach scheme trees, mentors/protégés, formation trends (5 offensive personnel groupings).
**Design questions:** The **coaching tree / lineage** as a real relationship graph (restrained — graph as a secondary mode, not navigation). Formation cards that carry the **illustrative-vs-derived** labeling honestly (decision F-3), and room for defensive fronts (F-4).
**Data:** existing, hand-authored; formation numbers are labeled illustrative until an nflverse pipeline lands.

### 10 — Data Hub / Data & Credits (`App.tsx`, `CitedSources.tsx`)
**Today:** import/export (board / class / full backup / smart merge); `CitedSources` component; Spec 07 will add a Data & Credits view.
**Design questions:** The **provenance home** — a browsable catalog of every field: definition, source, license, season, transformation, confidence, last updated. **Data status/health** at a glance. And import/export as a first-class *"your data is yours"* moment rather than a settings afterthought.
**Data:** existing + the `data-sources.md` licensing table.

## 5. What happens after each session

Same loop as the data-source R&D: **explore → audit → decide → route.**

1. Session produces passes for the module.
2. Claude audits: what's genuinely new, what's buildable now, what conflicts with the vision/data honesty.
3. Decisions get logged in **VISION §11**; the visual direction updates in `ui-direction.md`.
4. Buildable → a **spec** (`docs/specs/NN-*.md`) with a Build-context table. Blocked/separate → **`future-tools.md`** with blocker + seam.
