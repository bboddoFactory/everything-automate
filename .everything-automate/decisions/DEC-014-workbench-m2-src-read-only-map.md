---
title: Workbench M2 Uses Src Read-Only Map
status: accepted
date: 2026-04-26
decision_id: DEC-014
---

## Context

M1 created the Workbench source contract.
The old Workbench POC is useful evidence, but it scans repo templates, includes hooks and support nodes, has edit/apply surfaces, and uses old graph assumptions.

M2 needs the first usable visual Workbench map while staying inside the M1 contract.

## Decision

M2 will create a fresh read-only Workbench under `src/workbench/`.

It will:

- use Global, Local, or Custom Codex-home-like roots
- scan only `skills/` and `agents/`
- show one selected source at a time
- use fixed M2 source ids: `global-codex-home`, `local-codex-home`, and `custom-codex-home`
- use the M1 `selection_id` shape
- create only deterministic script-based `detected` edges
- render a graph-first UI based on the accepted graph-map screenshot direction
- use a precomputed Tidy Map with stable `x`, `y`, `size`, and `degree` fields
- keep the UI read-only

The old `workbench/` POC folder will be removed.
The old `scripts/ea_workbench.py` POC entrypoint will be removed or reduced to a thin launcher for the new code.

## Consequences

- M2 planning and execution should not adapt the old POC as the base.
- Browser verification is required because the milestone includes a real UI.
- Editing, apply-back, hooks, agent scenario tests, runtime/support nodes, and LLM edge inference remain later work.

## Related Artifacts

- `docs/workbench-source-contract.md`
- `.everything-automate/decisions/DEC-013-workbench-m1-new-contract-first.md`
- `.everything-automate/state/brainstorming/archive/20260426-125607-m2-read-only-visual-harness-map.md`
