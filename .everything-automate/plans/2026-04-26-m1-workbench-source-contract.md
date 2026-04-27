---
title: M1 Workbench Source Contract
task_id: m1-workbench-source-contract-2026-04-26
status: approved
approval_state: approved
plan_path: .everything-automate/plans/2026-04-26-m1-workbench-source-contract.md
mode: direct
execution_mode: single_owner
execution_unit: AC
recommended_mode: execute
recommended_agents:
  - ea-worker
verification_policy: docs-contract-and-static-checks
verification_lane: mixed
open_risks:
  - JSON examples inside the contract may look valid to a reader but fail copy-paste parsing if formatting drifts.
  - The old Workbench POC can accidentally leak old assumptions such as `WORKFLOW_ORDER` back into the new contract.
  - The custom source boundary can grow too broad unless it stays limited to known Codex-home-like skill and agent locations.
test_command: python3 -m py_compile scripts/install_global.py scripts/install_common.py scripts/bootstrap.py runtime/ea_codex.py runtime/ea_progress.py runtime/ea_state.py
---

# Requirements Summary

Create the M1 contract artifact for the Codex-first Workbench source/graph model.

This is a new contract-first milestone.
Do not refactor the existing Workbench POC as the implementation base.

# Desired Outcome

After this work:

- `docs/workbench-source-contract.md` defines the first Workbench source/graph contract.
- The contract is intentionally small:
  - global Codex home
  - local Codex home/source shape
  - custom folder only when it follows the same known Codex-home shape
  - `skill` and `agent` surfaces only
  - deterministic script-based name/alias detected edges only
  - stable `selection_id`
- The contract includes JSON examples for the core objects.
- `WORKFLOW_ORDER`, reference edges, hooks, runtime/support nodes, partial-source modeling, LLM/agent edge judgment, editing, work packages, testing, and apply-back stay out of M1.
- Current docs index and decision notes point future sessions to the new contract-first direction.

# In Scope

- Add `docs/workbench-source-contract.md`.
- Include contract sections for:
  - purpose
  - non-goals
  - Harness Source
  - Discovered Surface
  - Graph Node
  - Graph Edge
  - Selection Identity
  - edge discovery rules
  - JSON examples
  - future extension parking lot
- Update `docs/README.md` so the new contract is discoverable.
- Preserve the old Workbench POC as reference only.
- Add or keep the accepted decision note that M1 starts from a new contract instead of reusing the POC.

# Non-Goals

- Do not implement a new graph API.
- Do not refactor `scripts/ea_workbench.py`.
- Do not change `workbench/` UI files.
- Do not implement source picker UI.
- Do not add hooks, runtime, guidance, setup/install, docs, or partial-source modeling to the M1 contract.
- Do not add reference, route, fallback, metadata-backed, or LLM/agent-suggested edge kinds.
- Do not implement timestamped work packages, agent scenario tests, or apply-back.
- Do not support arbitrary custom repo/template scanning.

# Design Direction

M1 is contract-first.

The contract should describe this model:

```text
[Codex Harness Source]
   |
   v
[skill / agent surfaces]
   |
   v
[Graph nodes with stable selection_id]
   |
   v
[detected edges from script-only name/alias matches]
```

Use simple object shapes:

- `HarnessSource`
- `DiscoveredSurface`
- `GraphNode`
- `GraphEdge`
- `SelectionIdentity`

Keep current `kind:name` style IDs only as display/backward-compatible IDs.
Use this stable identity for future work:

```text
selection_id = source_id + surface_type + logical_name + relative_path
```

M1 edge discovery is deterministic:

- collect known skill and agent names and aliases
- scan skill/agent source text
- create `detected` edges for name/alias matches
- filter self-edges
- do not use LLM or agent judgment
- do not use `WORKFLOW_ORDER`

# Test Strategy

Strategy: `mixed`

Use docs-contract checks plus static checks:

- Reader-flow checks for the new contract.
- JSON-example checks by copying examples into a parseable validation snippet or manually verifying each fenced JSON block is valid.
- Search checks to confirm the new contract does not reintroduce out-of-scope concepts as M1 requirements.
- Python compile checks for touched Python files if execution changes any Python. If execution only edits docs, still run the current light syntax command as a baseline.

# Task

## AC1: Contract Artifact Exists And States The Small M1 Boundary

`docs/workbench-source-contract.md` exists and clearly defines M1 as a small source/graph contract.

### TC1.1

Read `docs/workbench-source-contract.md`.

Expected evidence:

- The doc says M1 is contract-first and Workbench POC is reference only.
- The doc lists `skill` and `agent` as the only first-pass surfaces.
- The doc excludes hooks, runtime/support nodes, partial-source modeling, reference edges, route/fallback classification, LLM/agent edge judgment, work packages, tests, and apply-back from M1.

### TC1.2

Search the new contract for old forced-pipeline language.

Expected evidence:

- `WORKFLOW_ORDER` is described only as excluded or removed from the M1 contract.
- The doc does not describe `ea-north-star -> ea-milestone -> ...` as a mandatory workflow order.

## AC2: Contract Defines The Core Object Shapes

The contract defines the object shapes later implementation can follow.

### TC2.1

Read the sections for `HarnessSource`, `DiscoveredSurface`, `GraphNode`, `GraphEdge`, and `SelectionIdentity`.

Expected evidence:

- Each object has a short purpose.
- Each object has required fields.
- Each object has a JSON example.

### TC2.2

Check the JSON examples.

Expected evidence:

- The examples are valid JSON when copied from the fenced blocks.
- The examples include at least:
  - one local source
  - one skill node
  - one agent node
  - one detected edge
  - one selection identity example

## AC3: Stable Identity And Edge Rules Are Locked

The contract gives future implementation a deterministic identity and edge model.

### TC3.1

Read the identity section.

Expected evidence:

- It defines `selection_id = source_id + surface_type + logical_name + relative_path`.
- It states current `kind:name` IDs are display/backward-compatible IDs only.

### TC3.2

Read the edge discovery section.

Expected evidence:

- It states edge discovery is script-only.
- It states LLM/agent judgment is not used for the base graph.
- It states name/alias matches create `detected` edges.
- It states self-matches are skipped.
- It states `detected` is the only M1 edge kind.

## AC4: Source Boundaries Stay Narrow

The contract supports only the source shapes accepted for M1.

### TC4.1

Read the source section.

Expected evidence:

- It supports global Codex home.
- It supports local Codex home/source shape.
- It allows custom folders only when they follow known Codex-home-like skill and agent locations.
- It explicitly excludes arbitrary repo template scanning.

### TC4.2

Search for broad source language.

Expected evidence:

- The contract does not require scanning `templates/`, runtime helpers, docs, or setup/install surfaces as part of M1.

## AC5: Docs Index And Decision Trail Point To The New Contract

Future sessions can find the M1 contract and the accepted POC boundary.

### TC5.1

Read `docs/README.md`.

Expected evidence:

- It lists `docs/workbench-source-contract.md` under current reference specs.

### TC5.2

Read `.everything-automate/decisions/DEC-013-workbench-m1-new-contract-first.md`.

Expected evidence:

- It states M1 starts from a new contract.
- It states the existing Workbench POC is reference only.
- It states planning/execution should not treat `scripts/ea_workbench.py` as M1 source of truth.

# Execution Order

1. Write `docs/workbench-source-contract.md`.
2. Update `docs/README.md`.
3. Check or adjust `DEC-013-workbench-m1-new-contract-first.md` if needed.
4. Run doc and JSON-example checks.
5. Run the light Python syntax baseline if any Python changed, or as a no-regression sanity check.

# Open Risks

- If JSON examples become too schema-like, the contract may over-design M1.
- If examples are too loose, M2 implementation may still guess.
- If old POC language remains in current docs without a clear boundary, later work may reuse old assumptions by accident.
- If custom source support is worded too broadly, M1 can drift into arbitrary repo scanning.

# Execute Handoff

task_id: m1-workbench-source-contract-2026-04-26
plan_path: .everything-automate/plans/2026-04-26-m1-workbench-source-contract.md
approval_state: pending
execution_unit: AC
test_strategy: mixed
open_risks:
  - Keep the contract small and avoid implementing M2-M7.
  - Do not refactor or reuse the Workbench POC as the implementation base.
  - Keep custom source support limited to known Codex-home-like skill and agent locations.
