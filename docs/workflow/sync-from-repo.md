# Runbook — Sync the AI Studio App-Build Environment from the Repo

> **When to use:** any time the AI Studio app-build environment has fallen behind the repo — after a spec lands, after a rename, after any change Claude/Gemini committed that the app-build env didn't make itself. The **repo is the source of truth**; this brings the environment back in line without letting it clobber verified work.
>
> **Prereq:** the implementation-engineer system instructions ([`aistudio-implementation-engineer.md`](aistudio-implementation-engineer.md)) are already applied in that environment. This runbook is the per-sync *task* you paste in.

## How to use

1. Fill in the **"Changes since last sync"** block with what actually changed (files + one-line why). Keep it specific — it's what stops the environment from "helpfully" regenerating and clobbering repo state.
2. Paste the prompt below into the AI Studio app-build environment.
3. If the env is **connected to GitHub**, it pulls the branch directly. If **not**, it will ask you for the listed files — paste them from the repo.
4. Read its report: which files it updated, any conflicts, and confirmation the app builds/runs. If it says it had to change repo files to build, stop and bring that back to Claude — don't let it push a divergent version.

## The core principle (why this runbook exists)

An out-of-date build environment's failure mode is to **regenerate files and overwrite what's in the repo**. This task reframes its job as **"adopt, don't improve"**: pull the repo state verbatim, verify it runs, report — never push a cached/divergent version back over verified work.

---

## Prompt template (paste into AI Studio app-build env)

```
CATCH-UP / SYNC TASK — bring this app in line with the repository.

You've been out of the loop while work happened in the repo. The repository is
the source of truth. Your job right now is NOT to build anything new — it's to
update this app to exactly match the current repo state, then verify it runs.

REPO: pierce-trahan/draft-sicko-hub
BRANCH: claude/design-notes-repo-access-2b7bw3   (use this branch, not main)

STEP 1 — Orient yourself. Read these first:
- docs/VISION.md — what the product is and its guardrails
- docs/specs/README.md — the spec index (build order + status)
- the review notes for anything recently landed (docs/specs/NN-review-notes.md)

STEP 2 — Adopt the repo's current source. Pull the latest of the branch above
and make this app's files match the repo HEAD. Do NOT re-implement or "improve"
— adopt the repo versions verbatim.

  >>> CHANGES SINCE LAST SYNC (fill this in each time): <<<
  [ list the files that changed + a one-line why for each ]

STEP 3 — Hard rules (do not violate):
  - Never rename or drop existing localStorage keys (nfl_draft_*, prospect_engine_*).
    Keep any new keys and keep them in the Data Hub full-backup export/import.
  - Do not revert renames or landed features. Repo wins over anything cached in
    this environment. Never reintroduce "ProspectEngine" or "react-example".
  - Don't restyle or refactor unrelated modules.

STEP 4 — Verify, then report:
  - Confirm it builds/runs (npm run dev, and npm run build). Type-check must be
    clean (repo state already passes tsc --noEmit and a full build).
  - Confirm the app runs WITHOUT a GEMINI_API_KEY (AI features degrade to
    fallbacks) and WITH one.
  - Sanity-check the feature(s) that changed actually load and work.
  - Report back: which files you updated, anything that conflicted with cached
    state, and confirmation the app builds and runs. Do NOT push a divergent
    version back over the repo — if something in the repo won't build here, stop
    and report it instead of "fixing" by reverting.
```

---

## Current "Changes since last sync" fill-in (as of Spec 01 landing)

Paste this into the `>>> CHANGES SINCE LAST SYNC <<<` slot when syncing an environment that last saw the pre-Spec-01 code:

```
A) Product rename: the app is now "Sicko's Draft Hub" (was "ProspectEngine").
   Affected: index.html <title>, package.json name (sickos-draft-hub),
   metadata.json, README.md, and in-app copy in src/App.tsx.
   Do NOT reintroduce "ProspectEngine" or "react-example" anywhere.

B) Spec 01 — the Scouting Matrix was rebuilt into a Pairwise Elo engine.
   Take the repo's versions of these files exactly as they are:
     - src/types.ts                          (adds Preference* types)
     - src/utils/elo.ts                       (NEW — the Elo engine)
     - src/utils/draftValue.ts               (NEW — getDraftRange helper)
     - src/components/PlayerRankingMatrix.tsx (rewritten)
     - src/components/PlayerProfileModal.tsx  (import path change)
     - src/App.tsx                            (Data Hub full-backup now includes
                                               nfl_draft_preferences; new props
                                               wired to the matrix)
```

> Update this fill-in block as later specs (03, 04, 02, …) land, so the runbook always reflects the newest sync point.
