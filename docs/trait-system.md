# Trait & Usage System

Reference for the position-aware trait grading and positional-usage projection that
power the prospect profile, comparer, and GM analytics views. This documents the
system **as shipped** — file paths below are the source of truth.

## Data model (`src/types.ts`)

- `PlayerTraits` — the five core pillars: `athleticism`, `technique`, `production`,
  `footballIQ`, `sizeAndFrame`.
- `Pillar = keyof PlayerTraits` — convenience alias used by the usage engine.
- `Player.positionTraits?: Record<string, number>` — optional map of position
  sub-trait key → `50..99` score. Absent keys fall back to the owning pillar value.
- `Player.usageProjection?: UsageProjection` — optional cached usage/scheme projection
  (`roles`, `primaryRoleId`, `computedAt`, `userEdited`).

All fields are optional and additive — older saved/exported players without them fall
back gracefully.

## Position sub-trait schemas (`src/data/traitSchemas.ts`)

Each of the 12 app positions maps to an ordered list of sub-traits:

```ts
interface PositionTraitDef { key: string; label: string; pillar: keyof PlayerTraits; weight: number; }
```

- `pillar` is always one of the five `PlayerTraits` keys, so an unpopulated sub-trait
  can fall back to `traits[pillar]`.
- Weights within a position sum to ~1.0.
- `KEY_TRAIT_WEIGHT_THRESHOLD = 0.16` — sub-traits at or above this weight are flagged
  as "key" traits (the `KEY` badge in the UI).
- `getPositionSchema(position)` returns the schema, falling back to the `FLEX`
  (hybrid-athlete) schema for unknown/blank positions — never empty.

### Sub-trait keys per position

The only valid `positionTraits` keys. Anything else silently falls back to the pillar.

| Pos | Keys |
|-----|------|
| **QB** | `arm_talent, accuracy_short, accuracy_deep, pocket_processing, mobility_creation, decision_making, production_efficiency` |
| **RB** | `vision_patience, contact_balance, burst_acceleration, elusiveness, receiving_ability, pass_protection, production_volume` |
| **WR** | `release_vs_press, route_running, hands_catching, separation_quickness, deep_speed, yac_ability, production_volume` |
| **TE** | `inline_blocking, route_running, hands_catching, contested_catch, athleticism_seam, yac_ability, production_volume` |
| **OT** | `pass_set_footwork, anchor_strength, hand_technique, lateral_agility, run_block_power, second_level_climb, iq_recognition` |
| **IOL** | `drive_block_power, anchor_vs_bull, hand_technique, pull_mobility, pass_set_balance, iq_recognition, grip_finish` |
| **EDGE** | `first_step_getoff, bend_flexibility, pass_rush_moves, power_conversion, run_defense_setedge, motor_pursuit, production_pressures` |
| **DT** | `first_step_quickness, anchor_vs_double, pass_rush_power, hand_technique, gap_discipline, pursuit_range, production_disruption` |
| **LB** | `range_sideline, tackling_form, coverage_zone, coverage_man, run_diagnosis, blitz_ability, production_tackles` |
| **CB** | `man_coverage, press_technique, hip_fluidity, recovery_speed, ball_skills, zone_awareness, run_support_tackling` |
| **S** | `range_deep, instincts_processing, tackling_form, run_support_trigger, coverage_versatility, ball_skills, physicality_frame` |
| **FLEX** | `athletic_explosion, versatility_iq, technique_refinement, frame_size, production_impact, special_teams_value` |

To change the sub-traits, weights, or the key threshold, edit `traitSchemas.ts` — do not
introduce new keys in a consumer.

## Grading utilities (`src/utils/traitGrading.ts`)

| Export | Signature | Notes |
|--------|-----------|-------|
| `getSchema(position)` | `(string \| undefined) => PositionTraitDef[]` | Never empty; FLEX fallback. |
| `getValueForTrait(player, def)` | `=> number` | Resolves `positionTraits[key] ?? traits[pillar] ?? 70`. |
| `pillarRollup(player)` | `=> PlayerTraits` | Always returns all 5 pillar keys; rolls populated sub-traits up into pillars. |
| `computePositionGrade(player)` | `=> number` | Weighted average of sub-traits, clamped `50..99`. |
| `topTraits(player, n=3)` | `=> ScoredTrait[]` | Highest-value sub-traits. |
| `bottomTraits(player, n=3)` | `=> ScoredTrait[]` | Lowest-value sub-traits (growth areas). |
| `getWeightBadgeInfo(weight)` | `=> { isKey, percentage }` | `isKey` when `weight >= 0.16`. |

`DEFAULT_TRAIT_SCORE = 70` is the single source of truth for the absent-trait fallback;
components that read a sub-trait inline should use `?? 70` to match.

## Positional usage & scheme projection (Spec 04)

- **Role catalog** — `src/data/usageRoles.ts`. Each `RoleCatalogItem` lists the positions
  it applies to, a `schemeId` (a real `SCHEMES` id), a `formationSpot`, and `rewardedTraits`
  (each a `{ traitKey, pillarFallback, weight }` using the sub-trait keys above).
- **Fit engine** — `src/utils/usageProjection.ts`.
  - `computeUsageProjection(player)` scores every candidate role from the player's
    sub-traits (pillar fallback when unpopulated), applies a `+3` scheme-alignment bonus
    when the role's scheme favors the player's position, clamps to `50..99`, and returns
    roles ranked by fit with a generated trait-grounded rationale.
  - `setPrimaryUsageRole(projection, roleId)` pins a role and sets `userEdited = true` so
    auto-recompute stops respecting the user's manual choice.

### Scheme ids (`SCHEMES` in `src/data/teams.ts`)

`westcoast`, `spread`, `zoneblock`, `gapblock`, `34defense`, `43defense`, `pressman`,
`quarters`. Each has a `favoredPositions` list that drives the scheme bonus. Role
`schemeId`s must match one of these.

## Where it renders

- **`src/components/RadarChart.tsx`** — N-axis chart; plots the position sub-traits when
  given `positionTraits` + `position`, otherwise the 5 pillars.
- **`src/components/PlayerProfileModal.tsx`** — the sub-trait breakdown (sliders, computed
  position grade, top/growth chips) **and** the usage-projection section (primary role,
  ranked avenues, set-as-primary / reset) live in this single modal.
- **`src/components/PlayerComparer.tsx`** — when compared players share a position, shows a
  sub-trait comparison; otherwise the 5-pillar view.

## Related: GM tendencies (Spec 02)

Independent of the trait system but part of the same release. `src/data/gmData.ts` +
`src/utils/gmTendencies.ts` compute per-GM draft tendencies (`draftCapitalByPos` Jimmy
Johnson spend, frequency-sorted `r1LeanText`, round/position heatmap), rendered by
`src/components/GMProfiles.tsx` (the `gm_profiles` nav mode in `App.tsx`).
