# Next Actions — desk checklist

> ⚠️ **Superseded (kept for history).** 02/03/04 are landed in `main`; Spec 01 is being ported.
> The current finish plan is [`../action-plan.md`](../action-plan.md) and the live status table is
> [`../specs/README.md`](../specs/README.md). The steps below reflect an earlier point in the build.


> A rolling "what to do next" list. Do these in order; each is self-contained. Update as you go.
> Everything referenced is already in the repo on branch `claude/design-notes-repo-access-2b7bw3`.

## TL;DR order

1. **Kick off the first build** — hand **Spec 01 (Elo engine)** to Gemini 3.6. *(~10 min to set up)*
2. **Export the GM subset data** — manual PFR CSVs for Roseman / Schoen / Baalke. *(~10 min)*
3. *(If time)* queue **Spec 03** next, or just let Gemini finish Spec 01.

---

## Action 1 — Start the Elo build in Gemini 3.6

1. Open a **Google AI Studio chat** on **Gemini 3.6**.
2. Open [`docs/workflow/gemini-3.6-platform-engineer.md`](gemini-3.6-platform-engineer.md), copy the instruction block into the chat's **System Instructions** field.
3. Fill the **Current task** line at the bottom with:
   > Build Spec 01 — Pairwise Elo Preference Engine (`docs/specs/01-elo-preference-engine.md`). Replace `src/components/PlayerRankingMatrix.tsx`.
4. **Give Gemini the context it needs** (AI Studio chat won't see the repo on its own). Paste or attach:
   - The full text of [`docs/specs/01-elo-preference-engine.md`](../specs/01-elo-preference-engine.md).
   - These current files so it matches conventions: `src/types.ts`, `src/App.tsx` (for the `scouting_matrix` nav wiring + storage patterns), `src/components/PlayerRankingMatrix.tsx` (what it's replacing), and `src/components/RadarChart.tsx`.
   - Optionally point it at `docs/VISION.md` §6 for the "why."
5. Let it build. When it returns code + its test notes, that's what goes to the **AI Studio app-build environment** (Implementation Engineer) for assembly — see [`aistudio-implementation-engineer.md`](aistudio-implementation-engineer.md).

**If Gemini asks a question:** technical defaults inside the spec → let it decide. Anything that changes *product behavior* (how the number is used, what a control does) → bring it back here to Claude, don't let it guess.

---

## Action 2 — Export the GM subset (manual PFR CSVs)

Goal: local CSV files of each GM's draft classes, to feed Spec 02's pipeline later. This is the sanctioned, ToS-clean path (you use PFR's own export; no scraping).

**How to export any PFR table:** on the page, find the table's **"Share & more"** button → **"Get table as CSV (for Excel)"** → copy/save it.

**Pages to export** (each team's full draft history table, one CSV per team):
- Eagles — `pro-football-reference.com/teams/phi/draft.htm`
- Giants — `pro-football-reference.com/teams/nyg/draft.htm`
- 49ers — `pro-football-reference.com/teams/sfo/draft.htm`
- Jaguars — `pro-football-reference.com/teams/jax/draft.htm`

**Then tag which draft years belong to which GM** (this is the attribution step — *verify each year against the "General Manager" field on that season page* `.../teams/{code}/{year}.htm`, since cutovers are the tricky part):

| GM | Team(s) | Draft classes (verify cutovers) | Note |
|---|---|---|---|
| **Howie Roseman** | PHI | 2010–2014, **skip 2015**, 2016–2025 | 2015 was Chip Kelly's control — the classic attribution edge case; confirm on the season pages |
| **Joe Schoen** | NYG | 2022–2025 | Clean single tenure |
| **Trent Baalke** | SF, then JAX | SF 2011–2016; JAX 2021–2024 | Multi-team; JAX 2020 was Caldwell, not Baalke — confirm |

**Where to save them:** create `pipeline-input/gm-subset/` (or a folder of your choice) and save as e.g. `phi-draft.csv`, `nyg-draft.csv`, `sfo-draft.csv`, `jax-draft.csv`. Note the GM-year tagging in a small text file alongside. Spec 02's pipeline will read these; exact folder can be confirmed when that spec is built.

---

## Action 3 — (Optional) queue the next build

- If you want Phase 2 moving in parallel, start a second Gemini 3.6 session on **Spec 03 (Position-Aware Trait Model)** the same way as Action 1 (attach Spec 03 + `src/types.ts`, `src/components/RadarChart.tsx`, `src/components/PlayerProfileModal.tsx`, `src/components/PlayerComparer.tsx`). Spec 04 depends on 03, so 03 first.
- Otherwise, just let Spec 01 finish and review it with Claude before the next one.

---

## What to bring back to Claude (design/audit)

- Gemini's Spec 01 output → I review it against the spec's acceptance criteria before it's called done.
- Any product-level question Gemini raised.
- The exported GM CSVs' shape (column names) → so Spec 02's parser targets the real format.
- Decisions still open you want to close: **T-1** (trait lists), **U-1** (usage role catalog), **P-1** (license = MIT?), plus the low-priority ones in `VISION.md` §11.
</content>
