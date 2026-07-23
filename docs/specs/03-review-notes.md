# Spec 03 — Build Review & Fix List

> **Reviewer:** Claude (design/audit). **Build:** Gemini 3.6 first pass of the Position-Aware Trait Model.
> **RESOLVED — Spec 03 fully LANDED.** Pass 1 (repo unlinked) was rejected as blind rewrites; the foundation was landed separately. Pass 2 (repo linked) came back as proper additive changes and is now landed after fixes (two `} font-mono finally {` syntax errors, a `TrendLineChart` prop, and a `bigBoards` cast). All imports/endpoints verified real; `tsc` + build green. The three real contracts were preserved. Kept below as the audit record. Remaining: **T-1** (author the trait content).
>
> **Original verdict (pass 1):** Foundation landed; three components rejected and sent back — built against an imagined codebase.

---

## Acceptance-criteria scorecard (Spec 03 §6)

| Criterion | Status |
|---|---|
| `TRAIT_SCHEMAS` per-position with pillars + weights | ✅ Landed (all 12 sum to 1.00) |
| `Player.positionTraits` optional; absent → unchanged | ✅ Landed (additive) |
| `computePositionGrade` / `topTraits` / `pillarRollup` | ✅ Landed (fall back to pillars/overallGrade) |
| Computed grade shown alongside, never overwrites | ⚠️ Component redo (logic present in modal, contract wrong) |
| Profile editor edits position traits; radar dual-mode | ❌ Redo — see F-2, F-3 |
| Comparer: position axes same-pos, pillars cross-pos | ❌ Redo — see F-4 |
| No storage key renamed; existing players unaffected | ⚠️ True only after the rewrites are rejected |

**Landed and verified (`tsc` + build green):** `src/types.ts` (additive: `positionTraits`, `Pillar`, `TraitDef`), `src/data/traitSchemas.ts`, `src/utils/traitGrading.ts`. Gemini should **import from these**, not redefine them.

---

## CRITICAL — what went wrong

Gemini rewrote the core files from scratch against a `Player` shape and component contracts that **do not exist in this repo**. Concretely:

- **`types.ts` (rejected).** Gemini's `Player` **deletes** real fields — `year`, `scoutingReport`, `strengths`, `weaknesses`, **`bigBoards` (required)**, `archetype`, `isCustom`, `scoutNotes`, `gradeHistory`, `labels`, `photoUrl` — and invents ~13 that don't exist (`rank`, `avatarUrl`, `rasScore`, `tier`, `fortyYard`, …). Applying it breaks the whole app and loses data. **The only Player change needed was `positionTraits?` — already landed.** Do not touch `Player` again.

The three component rewrites have the same root cause and must be redone **additively** — extend the real file, preserve its export style, props, and every existing feature; add the trait UI on top.

---

## F-2 — `RadarChart.tsx` (redo additively)

**Real contract (must be preserved):**
```ts
// default export, hand-drawn SVG
export default function RadarChart({ traits, color = '#10B981' }:
  { traits: PlayerTraits; color?: string }) { ... }
```
**Consumed (default import) in 2 places — both must keep working unchanged:**
- `PlayerComparer.tsx`: `<RadarChart traits={player.traits} color="#10B981" />`
- `PlayerProfileModal.tsx`: `<RadarChart traits={editedPlayer.traits} />`

**Do:** keep the **default export** and the `{ traits, color }` path rendering exactly as today. Add the position-trait / multi-player capability behind **new optional props** (e.g. `players?`, `mode?`), so a call with only `traits` is unchanged. **Don't** switch it to a named export, and don't swap to recharts if that changes the existing single-player render. (If a multi-series overlay is cleaner as its own component, add a new `RadarOverlay` and leave `RadarChart` alone.)

## F-3 — `PlayerProfileModal.tsx` (redo additively)

**Real contract (must be preserved):**
```ts
// default export
export default function PlayerProfileModal({ player, onClose, onSave, teamContext,
  customLabels, onAddCustomLabel }: PlayerProfileModalProps) { ... }
```
Internally it edits an `editedPlayer` and saves via **`onSave`**. It already contains the full editor: scouting report, strengths/weaknesses, **media big boards + AI quote generation**, labels, grade history, archetype, scout notes.

**Do:** ADD a **position-traits section** into the existing modal — sliders from `getSchema(editedPlayer.position)` editing `editedPlayer.positionTraits`, the computed `computePositionGrade` shown **alongside** `overallGrade` with an explicit "Apply" action, and top/bottom traits. Persist through the **existing `onSave`** flow. **Do not** change the props, introduce `isOpen`/`onUpdatePlayer`, or remove any existing editor feature.

## F-4 — `PlayerComparer.tsx` (redo additively)

**Real contract (must be preserved):**
```ts
// default export
export default function PlayerComparer({ players, onSelectPlayer }:
  { players: Player[]; onSelectPlayer: (player: Player) => void }) { ... }
```
It receives the **full prospect pool** and manages its own selection of who to compare; it renders `<RadarChart traits={player.traits} … />`.

**Do:** ADD same-position detection → show the position-trait radar/table; cross-position → keep the 5-pillar view. Preserve the `{ players, onSelectPlayer }` contract and the existing selection UI. **Do not** introduce `onRemovePlayer`/`className` as the contract or assume `players` is a pre-selected 2–4 set.

---

## Content note — T-1 is the user's call

`traitSchemas.ts` shipped as a **working draft**. The authoritative per-position trait lists, weights, and the OLB/DB alias targets are a **scouting-judgment content task (T-1)** to finalize with the user — not for Gemini to invent further. Build against the schema *shape*; the values get authored separately.

## Definition of done (after redo)

- [ ] `npm run lint` (`tsc --noEmit`) passes; `npm run build` succeeds.
- [ ] `Player` type unchanged beyond the landed `positionTraits` (no fields lost).
- [ ] Both existing `RadarChart` call sites render unchanged; default export intact.
- [ ] `PlayerProfileModal` keeps `onSave`/`teamContext`/`customLabels`/`onAddCustomLabel` and every existing editor feature; adds the trait section saving via `onSave`.
- [ ] `PlayerComparer` keeps `{ players, onSelectPlayer }` and existing selection; adds same-position trait view.
- [ ] Components import from the landed `traitSchemas.ts` / `traitGrading.ts` (no redefinition).
- [ ] No storage key renamed; players without `positionTraits` behave exactly as today.
