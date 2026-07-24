# Spec 08 — Player-Identity Crosswalk

> **Phase:** 3 (foundational enabler). **New:** an offline data primitive + a small typed static dataset. No new UI.
> **Owner:** Claude (design). **Builder:** Gemini 3.6 → AI Studio.
> **Reads with:** `docs/research/data-sources.md` (nflverse players/IDs, CFBD) + `docs/VISION.md` §7–§8.
> **Enables (does not block v1 of):** **Spec 02** at full scale (join picks → outcomes) and **Spec 05** (join picks → combine/athletic). Both currently flag this join as a risk without designing it — this spec is that design.

---

## 0. What we're building (one paragraph)

A **canonical player-identity table** that gives every person in the system one stable internal `prospect_id` and maps it to the various provider IDs (`gsis_id`, `pfr_id`, `espn_id`, `pff_id`, `sleeper_id`, a college id) so we can **join a player across sources without ever keying on names**. This is the primitive under the project's core thesis — the **college-usage → NFL-outcome bridge** — and under the at-scale joins Specs 02 and 05 need (draft picks → career outcomes, draft picks → combine athletics). It is an **offline build-time artifact** shipped as static data; the running app just reads it.

## 1. Why (the philosophy)

Names are not identity. Juniors and II/III, hyphenation, nicknames, transfers, identical names, and — the killer for us — **college-vs-NFL spelling differences** all break a name join silently and *wrongly* (a bad match is worse than a missing one: it attributes one player's outcome to another). Every downstream number that spans two sources — a GM's picks joined to how they panned out, a prospect's combine athleticism joined to his pick, and eventually college production joined to NFL results — rides on getting this join right **once**, in one audited place, rather than re-deriving a fragile name match in every util. Doing it here keeps the rest of the system honest and keeps our "reproducible → visible methodology" ethos intact.

## 2. Data sources (see `docs/research/data-sources.md`)

- **nflverse players / ID map** — the nflverse ecosystem already publishes a cross-provider ID crosswalk (`nflreadr::load_players()` / the `nflverse-players` data, and the `load_ff_playerids()`-style mapping) carrying `gsis_id`, `pfr_id`, `espn_id`, `pff_id`, `sleeper_id`, plus name/college/draft fields. **CC-BY 4.0** — redistribution-friendly with attribution. **This is the spine of the crosswalk: most NFL-side IDs are already joined for us — we reuse it, we don't rebuild it.**
- **CFBD / cfbfastR** — carries college-side player IDs and college rosters, for the eventual college→NFL edge. API-key gated; confirm redistribution terms before shipping (open item in data-sources §8). College IDs are **out of scope for v1 of this spec** — leave the column, don't populate it yet.
- **Our own `prospect_id`** — the one field that is *ours* and never changes, even when a provider renames or re-IDs a player.

## 3. Data model (`src/types.ts` or `src/data/playerIds.ts`)

```ts
export interface PlayerIdMap {
  prospectId: string;        // OUR canonical id — stable, never keyed on name
  fullName: string;          // display only, not a join key
  position?: string;         // normalized to app position groups
  college?: string;
  draftYear?: number;
  // provider ids — any may be absent
  gsisId?: string;           // nflverse / NFL
  pfrId?: string;            // Pro Football Reference
  espnId?: string;
  pffId?: string;
  sleeperId?: string;
  collegeId?: string;        // CFBD/cfbfastR — reserved, populated later
  // provenance
  idSource: 'nflverse' | 'manual' | 'derived';
  matchConfidence: 'exact' | 'high' | 'review';  // never silently ship 'review'
}
```

Optional everywhere except `prospectId`; a row with only a name and `matchConfidence: 'review'` is a **work item, not shippable data**.

## 4. How the join works (`scripts/buildPlayerIds.*` — offline)

Deterministic and auditable; **exact-ID first, fuzzy only as a flagged fallback**:

1. **Seed from nflverse.** Ingest the nflverse ID map; for every row, mint a `prospect_id` and copy the provider IDs it already crosswalks. `matchConfidence: 'exact'`, `idSource: 'nflverse'`. This covers the large majority with zero guessing.
2. **Join our existing data by shared provider ID, not by name.** The Spec 02 pipeline already carries picks with a PFR-derived identity, and Spec 05 joins combine data — resolve each to a `prospect_id` **through the ID it already has** (`pfr_id`, `gsis_id`). No shared ID → step 3.
3. **Fuzzy fallback (last resort, human-gated).** Only when no shared ID exists, propose a match on normalized `name + draftYear + college + position`; mark it `matchConfidence: 'review'` and **surface it for human confirmation** — never auto-accept. Confirmed → `'high'`.
4. **Emit** a typed static dataset in `src/data/`. Ship the crosswalk; downstream utils resolve `prospect_id` at load and join through it.

This mirrors the offline-then-static discipline the rest of the data layer uses (VISION §8): the match runs at build time; the app depends only on the shipped table.

## 5. Feeds into the rest of the system

- **Spec 02 (at scale):** joining a GM's draft picks to career outcomes (weighted AV, etc.) and, past the 3-GM subset, to nflverse — join on `prospect_id`, not name. Retires the A-2/G-1 "id/name match" risk.
- **Spec 05:** joining draft picks to combine measurables for the athletic-outlier/GM-athletic-lean metric — the historical join A-2 flags is exactly this, done once, cleanly.
- **Future college→NFL bridge:** the `collegeId` column is the reserved seam for connecting CFBD college production to the NFL record — the differentiating thread, enabled but not built here.

## 6. Acceptance criteria

- [ ] `PlayerIdMap` type added; typed static dataset emitted in `src/data/`.
- [ ] Crosswalk seeded from the nflverse ID map (exact provider IDs, attributed CC-BY).
- [ ] Existing Spec 02 picks and Spec 05 combine rows resolve to `prospect_id` **through a shared provider ID** where one exists.
- [ ] Fuzzy matches are flagged `matchConfidence: 'review'` and never shipped unconfirmed; confirmed matches recorded as `'high'`.
- [ ] Downstream joins key on `prospect_id`, never on `fullName`.
- [ ] `collegeId` column present but unpopulated (reserved for the college→NFL thread); no storage key renamed; rides existing export/import if surfaced.
- [ ] Attribution: "Player IDs via nflverse (CC-BY 4.0)" in ATTRIBUTIONS/Data & Credits (Spec 07).

## 7. Out of scope (note, don't build)

Populating `collegeId` / the full college→NFL join (future thread — needs CFBD terms confirmed, data-sources §8); a UI for the crosswalk (it's plumbing, not a view); real-time/live ID resolution (offline only); building our own NFL ID map from scratch (reuse nflverse — don't reinvent it).

## 8. Open items

- **X-1 — nflverse ID-map exact fields.** Confirm the precise column names/coverage of the current nflverse players/ID dataset at build time (field names drift across releases). Pin the dataset version in the provenance manifest (Spec 07).
- **X-2 — Fuzzy-review surface.** Decide the lightest confirmation surface for `'review'` rows (a generated CSV the user checks off is enough for the subset; no app UI needed).
- **X-3 — CFBD college-ID timing.** Populate `collegeId` only once CFBD redistribution terms are confirmed (data-sources §8) and the college→NFL thread is actually scoped.
