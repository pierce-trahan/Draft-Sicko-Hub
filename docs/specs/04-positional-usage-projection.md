# Spec 04 — Positional Usage & Projection

> **Phase:** 2. **Extends:** `PlayerProfileModal.tsx`; consumes `SCHEMES` (`src/data/teams.ts`) and `FormationTrend`/`PlayerArchetype` (`src/data/coachesData.ts`).
> **Owner:** Claude (design). **Builder:** Gemini 3.6 → AI Studio.
> **Reads with:** `docs/VISION.md` §5 + roadmap Phase 2; the tweener decision in Spec 02 (G-3, the `FLEX` bucket).
> **Depends on:** **Spec 03** (position-aware traits) — the fit math needs per-position trait values.

---

## 0. What we're building (one paragraph)

Some prospects don't have one position — a DE/OLB tweener, a big-slot WR/TE, a box safety/LB. Instead of forcing them into one bucket, this feature breaks down a prospect's **avenues of usage** (the distinct roles they could play) and gives a **predictive projection** of the *best* one: which **scheme** and which **spot within a formation** they'd play best, with a **trait-based rationale**. It lives in the player profile, turns the `FLEX` bucket from Spec 02 into something actionable, and directly serves the "learning instrument" goal — it teaches the user *how a player could be deployed*, not just *what he is*.

## 1. Why (the philosophy)

Deployment is where scouting gets real: the same body is a star in one scheme and a backup in another. Surfacing the *avenues* and a *reasoned best-fit projection* is exactly the nuance the tool exists to teach. It also makes the `FLEX` designation productive rather than a shrug.

## 2. Data model (`src/types.ts`)

```ts
export interface UsageRole {
  id: string;
  label: string;            // 'Stand-up 3-4 OLB rusher'
  scheme?: string;          // Scheme.id from SCHEMES, when applicable
  formationSpot?: string;   // e.g. 'EDGE (wide-9)' / 'SLOT' / 'BOX safety'
  fitScore: number;         // 0..99, from trait x scheme/role weighting
  rationale: string;        // trait-grounded 'why'
  isPrimary?: boolean;
}

export interface UsageProjection {
  roles: UsageRole[];       // ranked by fitScore desc
  primaryRoleId: string;
  computedAt: number;
  userEdited?: boolean;     // true once the user overrides
}

export interface Player {
  // ...existing...
  usageProjection?: UsageProjection;  // NEW, optional
}
```

Optional; absent = feature simply not shown for that player. Joins existing player object → existing export/import covers it. No storage key renamed.

## 3. How roles + fit are computed (`src/utils/usageProjection.ts`)

Deterministic and explainable in v1 (no black box):

1. **Candidate roles.** From the player's position (and, for `FLEX`, the union of plausible homes), enumerate candidate `UsageRole`s from a **role catalog** (`src/data/usageRoles.ts`) — each role declares the position traits it rewards (keys from Spec 03's `TRAIT_SCHEMAS`) and an associated scheme/formation spot.
2. **Fit score.** For each candidate, `fitScore = weighted match between the player's `positionTraits` (Spec 03) and the role's rewarded traits`. Reuse `traitGrading` helpers.
3. **Scheme alignment.** Cross-reference `SCHEMES` (`favoredPositions`, type, description) and, where available, `coachesData` `FormationTrend.preferredArchetypes` / `keyAttributes` to place the role in a real formation spot and to bump fit for scheme-aligned traits.
4. **Rationale.** Generate a trait-grounded sentence from the top contributing traits (e.g. "Elite get-off and bend with average anchor → best as a wide-9 stand-up rusher, not a base 4-3 DE"). Template-based; deterministic.
5. **Rank** roles by `fitScore`; mark the top as `primaryRoleId`.

**Optional AI enhancement (not required for v1):** the app already has a server-side Gemini call (`server.ts`). It *may* be used to polish the `rationale` prose from the same deterministic inputs — but the **scores and role selection stay deterministic**; AI only rewords. Gate behind the existing API-key setup; degrade gracefully offline (template rationale).

## 4. UI (`PlayerProfileModal.tsx`)

- New **"Usage & Projection"** section/tab.
- **Primary projection** headline: best role + scheme + formation spot + fit score, with the rationale.
- **Avenues list:** all candidate roles ranked by fit, each showing scheme/formation spot, fit score, and its rationale — so the user sees the *spread* of how a player could be used.
- **User override:** let the user edit roles / set a different primary / write their own rationale (scout-notes style). Setting `userEdited = true` stops auto-recompute from clobbering their take. (Same "user owns their evaluation" tenet.)
- Emphasize this for `FLEX`/tweener players but make it available for anyone.
- Match the dark slate + emerald visual language; reuse the radar (Spec 03) to show which traits drive the top role.

## 5. Acceptance criteria

- [ ] `usageProjection.ts` enumerates candidate roles from a role catalog (incl. FLEX unions) and scores fit from Spec 03 `positionTraits`.
- [ ] Fit incorporates `SCHEMES` alignment; formation spots reference real formations where data exists.
- [ ] Deterministic template rationale is produced for every role; scores don't depend on AI.
- [ ] Optional Gemini rationale-polish degrades gracefully to templates offline.
- [ ] Profile shows primary projection + ranked avenues; user can override and lock (`userEdited`).
- [ ] Optional/absent for players without projections; export/import covers it; no key renamed.
- [ ] Works for a `FLEX` tweener end-to-end (e.g. a DE/OLB gets both edge-rush and off-ball roles ranked).

## 6. Out of scope (note, don't build)

Athletic-outlier weighting from RAS/combine (future thread — see `docs/research/data-sources.md`); team-specific "this GM/coach would deploy him as…" (needs GM/coach modeling depth — later); auto-editing `overallGrade` from fit; cross-position value normalization.

## 7. Open items

- **U-1 — Role catalog authoring.** The `usageRoles.ts` catalog (roles, rewarded traits, formation spots) is a scouting-judgment content task; author with the user. Ship the shape + seed roles for the FLEX-heavy cases (edge/off-ball, slot/TE, box-S/LB) first.
- **U-2 — AI rationale on/off by default.** Deterministic-only vs. AI-polished default. Recommend deterministic default, AI opt-in.
- **U-3 — Depends on Spec 03 landing first** (position traits). Sequence accordingly.
- **U-4 — Formation data needs normalization first.** The `FormationTrend.keyAttributes`/`preferredArchetypes` this spec consumes are currently **prose**, not machine-usable. Decision **F-2** in [`docs/research/formation-trends-audit.md`](../research/formation-trends-audit.md) covers structuring them (`{trait, op, value}` + position-group links). Do that normalization as part of, or just before, this spec.
</content>
