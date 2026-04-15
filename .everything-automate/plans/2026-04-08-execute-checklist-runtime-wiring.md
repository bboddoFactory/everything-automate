---
title: Execute Checklist Runtime Wiring
status: draft
approval_state: draft
task_id: execute-checklist-runtime-wiring-2026-04-08
plan_path: .everything-automate/plans/2026-04-08-execute-checklist-runtime-wiring.md
mode: direct
execution_unit: section
recommended_mode: execute
recommended_agents:
  - explorer
  - plan-arch
  - plan-devil
verification_lane: docs-only
open_risks:
  - The helper flow may become too heavy if too many update points are required.
  - The checklist format may overlap too much with existing progress artifacts unless roles are made clear.
---

# Execute Checklist Runtime Wiring

## Task Summary

Define how `execute` should create and update a live execution checklist by calling runtime helpers directly.

The goal is to make `execute` less of a black box and make progress visible in a way that can survive interruption.

## Desired Outcome

Have a clear v0 design for:

- which helper calls happen during `execute`
- when they happen
- what each call updates
- how the live checklist differs from run-level state and QA handoff

## In Scope

- define helper call timing
- define checklist artifact role
- define how `execute` uses helper calls directly
- define minimal checklist fields
- define how QA reads the end result

## Non-Goals

- implement the runtime wiring
- redesign `planning`
- redesign `$qa`
- replace the existing runtime helpers fully

## Decision Boundaries

- v0 uses explicit helper calls from the LLM
- v0 does not rely on hooks for checklist updates
- `planning` remains the source of `Task -> AC -> TC`
- `execute` creates the live checklist from the approved plan
- QA reads a review packet, not the full live checklist history

## Design Direction

The design should follow this rule:

```text
planning
  -> plan with Task -> AC -> TC

execute
  -> explicit helper calls
  -> live checklist updates

qa
  -> QA handoff packet built from execute result
```

The preferred helper trigger points are:

1. `execute_start`
2. `ac_start`
3. `tc_start`
4. `tc_result`
5. `ac_complete`
6. `qa_handoff`

## Test Strategy

This is a docs-and-design slice, so the current test lane is `docs-only`.

Verification should check:

- trigger points are easy to understand
- checklist role is clearly different from plan, state, and QA handoff
- the design matches the current skill philosophy

## Task

### AC1. Define Trigger Points

The design must define the minimal helper call points during execution.

#### TC1

The trigger list is explicit and short.

#### TC2

Each trigger has a clear purpose.

### AC2. Define Checklist Artifact Role

The design must explain what the live checklist is for.

#### TC1

It is clear that the checklist is different from the plan.

#### TC2

It is clear that the checklist is different from run-level state.

### AC3. Define Minimal Checklist Shape

The design must explain what fields the live checklist needs.

#### TC1

The design shows task, AC, TC, status, and latest check information.

#### TC2

The design supports interruption and resume in a human-readable way.

### AC4. Define QA Connection

The design must explain how `$qa` gets what it needs.

#### TC1

The design says QA uses a handoff packet, not the full conversation.

#### TC2

The design says the packet is built from execute outputs, including checklist state.

## Execution Order

1. Define trigger points.
2. Define live checklist role.
3. Define minimal checklist shape.
4. Define the link from execute to QA.
5. Re-read for simple English.

## Open Risks

- The helper flow may become too heavy if too many update points are required.
- The checklist format may overlap too much with existing progress artifacts unless roles are made clear.

## Execute Handoff

- `task_id`: `execute-checklist-runtime-wiring-2026-04-08`
- `plan_path`: `.everything-automate/plans/2026-04-08-execute-checklist-runtime-wiring.md`
- `approval_state`: `draft`
- `execution_unit`: `section`
- `test_strategy`: `docs-only`
- `open_risks`:
  - `The helper flow may become too heavy if too many update points are required.`
  - `The checklist format may overlap too much with existing progress artifacts unless roles are made clear.`
