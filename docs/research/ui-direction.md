# UI Direction — Editorial Scouting Workstation

> **Status:** v1 direction (from the ChatGPT UI R&D session, July 2026). Anchors how we move the UI off its current "vibe-coded SaaS" look. Feeds the player-profile restructure (Spec 09) and the future Scouting Atlas signature. **Not a full visual spec** — it's the standing direction + the rules for borrowing UI ethically.
> **Decided with the user:** keep **emerald** as the single accent (the R&D mockups used orange — not adopted); Scouting Atlas is the one signature interaction, staged later; two-page player profile confirmed (Spec 09). (VISION §11 D-3.)

---

## 0. The problem & the north star

The current UI reads as vibe-coded because it uses the default SaaS grammar: rounded cards around every section, a gradient per block, modals for everything, decorative controls. The target is the opposite — **an editorial scouting workstation with terminal density and unusually strong provenance**: a working instrument (equipment room / playbook / film terminal / research desk), not an admin panel.

This is a **finishing-touch direction**, applied gradually — not a stop-the-world rewrite. It layers onto the existing **dark slate + emerald, serif-italic headers, mono labels** language (VISION §4); it does not replace it.

## 1. The four structural moves (the substance)

These four do most of the work of killing the vibe-coded feel. Everything else is flavor.

1. **Radius 0–4px, not 12–24px.** Square geometry, strong rules/borders. Mechanical, not soft.
2. **Tables are a first-class surface**, not a fallback — dense, sortable, filterable; tables can act as navigation.
3. **Persistent inspector, not a modal for everything.** Selecting a prospect updates a pinned inspector while the surrounding context (class, comparison, board) stays put.
4. **Typography + rules do the organizing, not cards.** Prefer spacing, hairline rules, and hierarchy over a container around every section.

Plus two standing rules:
- **One accent = emerald.** Reserve **team colors for data encoding** only, never chrome.
- **Provenance is visible** (see §2).

## 2. Provenance & confidence as a product feature (the ethical spine, surfaced)

The single most "us" idea from the R&D: make every number **inspectable like a cataloged data asset**. This is the UI surface of the ethos already built into `CitedSources.tsx`, `docs/research/data-sources.md`, the per-dataset provenance manifest (from the data-source audit), and Spec 07's Data & Credits view.

The pattern (from the DataHub reference):

> **value → definition → source → season → transformation → confidence → last updated**

A **Source & Confidence** panel (per-source `High / Med / Low` + an overall confidence score) is a first-class, always-on element — not a footer. It's the opposite of shoe-in-uncited numbers, and it's a real differentiator. Anchors the Scouting Report page (Spec 09).

## 3. How we borrow UI, ethically (open-source is the bloodline)

Two kinds of borrowing, and the distinction is the whole ethics question:

- **Ideas / aesthetics / interaction patterns are free from *any* source, regardless of license** — layout grammar, "persistent inspector," "tables-first," a beeswarm for class rankings. Ideas aren't copyrightable. This is what the R&D references are really for.
- **Actual *code* reuse is license-gated.** For an MIT give-it-away project: permissive (MIT / Apache-2.0 / ISC / BSD) is OK **with attribution**; **AGPL / GPL is off-limits for code reuse** — it would force copyleft on our MIT code. Copy their *look*, never their *code*. Cite anything copied in `ATTRIBUTIONS.md` (Spec 07).

Realistically **~95% of the R&D list is inspiration**, because they're whole apps in other stacks. The only likely *code* pulls are a viz library (**Observable Plot** or **visx**, both permissive, React-friendly) and a token approach from a brutalist theme.

### Reference tools — license & how we use them

> Verify each license at integration time — terms change. "Inspiration" = ideas/aesthetics only (safe from any license).

| Tool | License | Use for us |
|---|---|---|
| **Perspective** (FINOS) | Apache-2.0 | Inspiration: dense exploratory workspace, table↔viz movement |
| **Observable Framework / Plot** | ISC | **Code candidate** (Plot as a viz lib) + inspiration |
| **Evidence** | MIT | Inspiration: editorial report / player-page structure (diff stack) |
| **RAWGraphs** | Apache-2.0 | Inspiration: uncommon chart forms (ridgeline, dumbbell, beeswarm, alluvial) |
| **The Pudding** (starters) | MIT (verify) | Inspiration: editorial typography, full-width visual moments |
| **Apache Superset** | Apache-2.0 | Inspiration: explore-vs-report-vs-board mode separation |
| **DataHub** | Apache-2.0 | Inspiration: entity pages, provenance/lineage, data-health indicators |
| **visx** (Airbnb) | MIT | **Code candidate**: React viz primitives |
| **Amazon Neptune Graph Explorer** | Apache-2.0 | Inspiration: gradual graph expansion, faceted relationship filtering |
| **Aubade** (Obsidian theme) | MIT (verify) | Inspiration + token approach: restrained brutalism |
| **Grafana** | **AGPL-3.0** | **Inspiration only — do NOT copy code.** Annotation model, linked filtering |
| **OpenBB** | **AGPL-3.0** | **Inspiration only.** Research-terminal / pinned-widget organization |
| **Metabase** | **AGPL-3.0** | **Inspiration only.** Restraint, drill-through |
| **Plausible** | **AGPL-3.0** | **Inspiration only.** Minimal-chrome home screen |
| **Gephi** | **GPL-3.0** | **Inspiration only.** Graph-as-thinking-surface |
| HelixDB Explorer, Graphoria, SoccerDashboard | verify | Inspiration; check license before any code use |

## 4. Signature interaction (staged): the Scouting Atlas

**One** signature interaction — not many (explicitly not also a graph "player universe"). Decided: the **Scouting Atlas** — a spatial map of the draft class (archetype regions, prospect clusters, position regions), zoomable, with a persistent selected-player inspector and layers for production / athleticism / age / role / projection.

It's the most memorable direction and the right eventual signature, but it's a **real build** (clustering, archetype-region layout) that leans on Spec 03 traits + archetypes and Spec 05 athletic. **Staged as its own later spec** (`10 — Scouting Atlas`, not yet drafted) — not part of the Spec 09 profile restructure.

## 5. Data honesty guardrail (don't design toward data we can't cite)

The most cinematic R&D mockups — **Playbook Grid** (EPA by concept/situation), **All-22**, **route diagrams/telemetry**, snap-level breakdowns — run on **college snap-charting/tracking/concept data that isn't freely or citably available** (PFF/tracking-tier; public college tracking doesn't exist). Building UI around them would mean empty panels or uncited numbers — exactly what we refuse. They're parked with the film feature in [`future-tools.md`](../future-tools.md).

- **Buildable now, fully citable:** editorial language, provenance/confidence, Evaluation Matrix, the two-page profile, board/rank history, recruitment/transfer journey, comparables/archetype.
- **Data-blocked → future-tools:** Playbook Grid, All-22, route telemetry, the film terminal.

## 6. Not doing (anti-bloat)

Not adopting every R&D pass. Film stays a v2 dream. Orange not adopted (emerald kept). No card-per-section. No app-wide rip-and-replace — the four moves migrate module by module, starting with the player profile (Spec 09).
