# Spec 03 — Position-Aware Trait Model

> **Phase:** 2 (foundation). **Extends:** `src/types.ts` `PlayerTraits`, `RadarChart.tsx`, `PlayerProfileModal.tsx`, `PlayerComparer.tsx`.
> **Owner:** Claude (design). **Builder:** Gemini 3.6 → AI Studio.
> **Reads with:** `docs/VISION.md` §5 (Player Profiles row) + roadmap Phase 2.
> **Prerequisite for:** Spec 04 (Positional Usage & Projection).

---

## 0. What we're building (one paragraph)

Today every prospect is graded on the **same five generic traits** (`athleticism, technique, production, footballIQ, sizeAndFrame`). Real scouting grades **position-specific traits** — a QB's arm strength and processing, a CB's press and ball skills — and weights the ones that matter most for that position. This spec adds a **position-aware trait layer**: each position group defines its own named sub-traits (each rolling up under one of the five existing pillars) with per-trait **weights**, driving a position-adjusted grade and a richer radar. It is **additive and backward-compatible** — existing players and the five pillars keep working; position traits layer on top.

## 1. Why (the philosophy)

Generic traits flatten what makes evaluation *learnable*. Position-specific traits + weights teach the user *what actually matters at each position* and make the gut-vs-grades and comparison views far sharper. This is also the data foundation Spec 04 needs to project how a player is best used.

## 2. Data model

### 2.1 Trait schema (new static data — `src/data/traitSchemas.ts`)

Each position group defines its trait set. Keep the **five pillars** as roll-up categories so existing summary UI and the radar's high-level shape still work.

```ts
export type Pillar = 'athleticism' | 'technique' | 'production' | 'footballIQ' | 'sizeAndFrame';

export interface TraitDef {
  key: string;        // stable id, e.g. 'arm_strength'
  label: string;      // 'Arm Strength'
  pillar: Pillar;     // which of the 5 pillars it rolls up into
  weight: number;     // relative importance for this position (0..1, per-position sum ~1)
}

// position group -> its trait definitions
export const TRAIT_SCHEMAS: Record<string, TraitDef[]> = { /* QB, RB, WR, ... , FLEX */ };
```

**Representative examples (author the full set as a data task — this is the shape, not the whole list):**
- **QB:** arm strength (ath), deep accuracy (tech), short/intermediate accuracy (tech), processing/anticipation (IQ), pocket presence (IQ), mobility (ath), mechanics (tech), decision-making (IQ), production (prod), size/frame (size).
- **WR:** route running (tech), separation (ath), hands/catch radius (tech), YAC (ath), release vs press (tech), deep speed (ath), contested catch (tech), production (prod), size/frame (size).
- **EDGE:** get-off/first step (ath), bend (ath), power/bull (size), hand usage (tech), counters (tech), run defense (tech), motor (IQ), production (prod), length/frame (size).
- **CB:** man coverage (tech), zone/instincts (IQ), ball skills (prod), press (tech), deep speed (ath), tackling (tech), size/length (size), production (prod).
- **FLEX** (tweeners, per Spec 02 §A3): a superset/union of the plausible home positions' traits, so a DE/OLB carries both edge-rush and off-ball markers. Spec 04 consumes this directly.

> **Athletic sub-traits can be seeded from data** (nflverse `load_combine()` / RAS) rather than hand-graded — see `docs/research/data-sources.md`. Not required for this spec; note the seam.

### 2.2 Player extension (`src/types.ts`)

```ts
export interface Player {
  // ...existing fields unchanged...
  traits: PlayerTraits;                 // KEEP — the 5 pillars (back-compat + summary/radar)
  positionTraits?: Record<string, number>;  // NEW — keyed by TraitDef.key, values 0..99
}
```

`positionTraits` is **optional**. When absent, the app falls back to the five pillars exactly as today. No migration destroys data; no localStorage key renamed.

## 3. Derived values (new util — `src/utils/traitGrading.ts`)

- `getSchema(position)` → the position's `TraitDef[]` (FLEX-aware).
- `computePositionGrade(player)` → weighted average of `positionTraits` by `weight`, scaled 0..99. If `positionTraits` absent, return existing `overallGrade` (no behavior change).
- `topTraits(player, n)` / `bottomTraits(player, n)` → the highest/lowest **weighted** traits, for "what matters most here" highlighting.
- `pillarRollup(player)` → aggregate position traits back into the five pillars, so `RadarChart` keeps a stable 5-axis summary while a detailed view can show per-trait axes.

`overallGrade` stays the user-facing/manual grade and is **not** auto-overwritten; `computePositionGrade` is a *derived* number shown alongside it (respect the "user owns their grade" tenet — offer "apply computed grade" as an explicit action, never silent).

## 4. UI

- **PlayerProfileModal:** add a **position-trait editor** — sliders for the active position's `TraitDef`s, grouped by pillar, with weight indicated (e.g. a "key trait" marker on high-weight rows). Keep the existing 5-pillar sliders as the summary layer (or derive them via `pillarRollup`).
- **RadarChart:** support two modes — the existing **5-pillar** summary (default, stable) and a **detailed per-trait** overlay for the active position. Reuse the component; add a prop.
- **PlayerComparer:** when comparing same-position players, show the **position-specific** axes; when cross-position, fall back to the 5 pillars. Overlay radars (Big Board Lab-style).
- Preserve the dark slate + emerald visual language.

## 5. Backward compatibility (hard requirement)

- Players without `positionTraits` render and grade exactly as today.
- The five `PlayerTraits` pillars remain in the type and in storage.
- No localStorage key renamed; `positionTraits` joins the existing player object and thus existing export/import automatically.
- The `INITIAL_PROSPECTS` dataset can be progressively enriched with `positionTraits`; absence is valid.

## 6. Acceptance criteria

- [ ] `TRAIT_SCHEMAS` defines per-position trait sets (incl. FLEX) with pillars + weights.
- [ ] `Player.positionTraits` is optional; absent → identical current behavior.
- [ ] `computePositionGrade`, `topTraits`, `pillarRollup` implemented and unit-verifiable.
- [ ] Computed grade is shown alongside `overallGrade`, never silently overwrites it.
- [ ] Profile editor edits position traits; radar supports 5-pillar and per-trait modes.
- [ ] Comparer uses position-specific axes for same-position, pillars for cross-position.
- [ ] No existing storage key renamed; existing players unaffected; export/import still works.

## 7. Out of scope (note, don't build)

Auto-deriving grades from combine/RAS data (future); cross-position value normalization; changing `overallGrade` semantics; the usage/projection logic (that's Spec 04).

## 8. Open items

- **T-1 — Full per-position trait lists + weights.** A data-authoring task; author with the user (scouting judgment). This spec ships the *shape* + examples; the exhaustive lists are content.
- **T-2 — Do the 5 pillars stay user-editable, or become derived** via `pillarRollup` once position traits exist? Recommend: derived-with-manual-override.
</content>
