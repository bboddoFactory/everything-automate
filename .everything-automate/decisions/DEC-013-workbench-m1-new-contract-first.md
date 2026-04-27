---
title: Workbench M1 Starts From A New Source Contract
status: accepted
date: 2026-04-26
decision_id: DEC-013
---

## Context

The first Workbench prototype proved that a visual graph is useful, but it also carried prototype assumptions:

- repo-fixed discovery
- `kind:name` node identity
- hard-coded workflow order
- mixed support/runtime/edit/agent concerns in one script

The locked Workbench North Star now needs a smaller first contract:

- Codex-first
- skill and agent first
- deterministic script-based discovery
- no mandatory workflow order
- no LLM or agent edge judgment in the base graph

## Decision

M1 will not refactor or revive the existing Workbench POC as the implementation base.

M1 starts from a new source/graph contract:

- define the contract in `docs/workbench-source-contract.md`
- include JSON examples for the core objects
- keep the existing POC only as reference evidence and as something later work may replace
- do not preserve POC behavior just because it exists

## Consequences

- Planning and execution should not treat `scripts/ea_workbench.py` as the source of truth for M1.
- The old `WORKFLOW_ORDER` model should be removed from the M1 contract.
- Any future code work should implement the new contract deliberately instead of reshaping the old prototype in place.
- Existing Workbench files may remain in the repo until a later milestone decides whether to replace, remove, or migrate them.

## Related Artifacts

- `.everything-automate/state/north-star/archive/20260426-104436-codex-workbench-north-star.md`
- `.everything-automate/state/milestone/archive/20260426-105927-codex-workbench-roadmap.md`
- `.everything-automate/state/brainstorming/archive/20260426-115152-m1-harness-source-contract-design.md`
