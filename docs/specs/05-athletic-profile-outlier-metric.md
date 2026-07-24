# Spec 05 — Athletic Profile & Outlier Metric

> **Phase:** 2.5 (bridges evaluation depth and GM intelligence). **Extends:** `PlayerProfileModal.tsx`, Spec 03 traits, Spec 02 GM tendencies, Spec 04 usage fits.
> **Owner:** Claude (design). **Builder:** Gemini 3.6 → AI Studio.
> **Reads with:** `docs/research/data-sources.md` (nflverse combine + RAS).
> **Enhances (not required by):** Specs 02, 03, 04. Buildable once we have athletic data.

---

## 0. What we're building (one paragraph)

An **athletic profile** for prospects — combine/pro-day measurables plus a positional athleticism score (0–10, à la RAS) — and, on top of it, an **outlier metric**: the gap between a player's *athleticism* and his *production/scouting grade*. A large positive gap = a **"toolsy" athletic outlier** (great tester, production lags); a negative gap = **production over traits**. This is the number that finally captures the **Baalke fingerprint** deferred from Spec 02, seeds athletic sub-traits for Spec 03, sharpens Spec 04's role fits, and adds an "athletic lean" tendency to GM profiles.

## 1. Why (the philosophy)

"Toolsy reach vs. proven producer" is one of the most important axes a scout learns to weigh — and one of the clearest ways to see a GM's (or your own) bias. Making it an explicit, contextualized number is squarely the learning-instrument mission. It also honestly fills the gap we flagged: PFR pick tables can't show it, but combine + RAS can.

## 2. Data sources (see `docs/research/data-sources.md`)

- **nflverse `load_combine()`** — combine measurables by year/position. **CC-BY 4.0**, redistribution-friendly with attribution. Primary raw source.
- **RAS (ras.football, Kent Lee Platte / "MathBomb")** — 0–10 positional athleticism since 1987. **Attribution required**; individual cards free, **bulk DB is premium**. Use as the ready-made positional score where available; otherwise compute our own percentiles from combine data.
- **Acquisition mirrors G-1:** prepare offline, ship **derived** athletic scores/percentiles (not RAS's raw DB verbatim), attribute sources. If we compute our own positional percentiles from nflverse combine data, that's fully CC-BY-clean.

## 3. Data model (`src/types.ts`)

```ts
export interface AthleticMeasurables {
  heightIn?: number; weightLb?: number; armIn?: number; handIn?: number;
  forty?: number; tenSplit?: number; twentyShuttle?: number; threeCone?: number;
  vertical?: number; broad?: number; bench?: number;
}

export interface AthleticProfile {
  measurables?: AthleticMeasurables;
  percentiles?: Record<string, number>;   // per-metric, 0..100 vs position group
  athleticScore?: number;                  // 0..10 composite (RAS-style)
  source?: 'ras' | 'nflverse' | 'computed' | 'manual';
  outlierDelta?: number;                   // athleticScore(0..10 -> 0..99) minus production/overallGrade
}

export interface Player {
  // ...existing...
  athleticProfile?: AthleticProfile;   // NEW, optional
}
```

Optional; absent = section hidden, no behavior change. No storage key renamed; rides existing export/import.

## 4. The outlier metric (`src/utils/athleticOutlier.ts`)

- Normalize `athleticScore` (0–10) to the 0–99 grade scale.
- `outlierDelta = normalizedAthleticScore − productionSignal`, where `productionSignal` is the player's production trait (Spec 03 `production` pillar) or `overallGrade` fallback.
- **Interpretation bands** (surface, don't hide): large positive → "Athletic Outlier (production lags traits)"; near zero → "Traits match production"; negative → "Producer (exceeds athletic profile)."
- Guard against missing data — only compute when both athleticism and a production signal exist; otherwise show "insufficient data," never a fake number.

## 5. Feeds into the rest of the system

- **Player profile:** an **Athletic Profile** card — measurables, per-metric percentiles (reuse heatmap styling), composite score, and the outlier band with its rationale.
- **Spec 03:** athletic sub-traits (burst, speed, explosion) can be *seeded* from percentiles instead of hand-graded.
- **Spec 04:** role fits can require athletic thresholds (e.g. a wide-9 rusher wants elite get-off percentiles).
- **Spec 02 GM Profiles:** aggregate `outlierDelta` across a GM's picks → an **"athletic lean" tendency**. **This is where the Baalke fingerprint finally shows** (SF→JAX picks skewing high-athleticism / high-outlier). Add it as a GM tendency metric once athletic data is joined to historical picks.

## 6. Acceptance criteria

- [ ] `AthleticProfile` added (optional); absent → no change.
- [ ] Positional percentiles computed from nflverse combine data (CC-BY-clean path), RAS used where licensed/available.
- [ ] `outlierDelta` computed only with sufficient data; interpretation band surfaced.
- [ ] Athletic Profile card in the player profile (measurables, percentiles, score, outlier band).
- [ ] GM Profiles gain an athletic-lean aggregate once picks are joined to athletic data (validates on Baalke).
- [ ] Sources attributed; derived data shipped, not raw third-party DBs verbatim; no key renamed.

## 7. Out of scope (note, don't build)

Pro-day data-quality normalization; predicting future athleticism; per-drill projection models; anything requiring RAS bulk DB if we stay on the free/attribution tier (compute our own percentiles from nflverse instead).

## 8. Open items

- **A-1 — RAS access.** Free cards + attribution vs. premium bulk. Default: compute percentiles from **nflverse combine (CC-BY)**; use RAS as a labeled reference/attribution, not a bulk dependency.
- **A-2 — Historical join for GM lean.** Joining draft picks (Spec 02) to combine data by player/year needs an id/name match; handle mismatches.
- **A-3 — Production signal choice.** Spec 03 `production` pillar vs. `overallGrade` as the outlier baseline.
