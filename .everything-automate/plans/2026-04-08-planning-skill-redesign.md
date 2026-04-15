---
title: Planning Skill Redesign
status: draft
approval_state: draft
task_id: planning-skill-redesign-2026-04-08
plan_path: .everything-automate/plans/2026-04-08-planning-skill-redesign.md
mode: direct
execution_unit: section
recommended_mode: execute
recommended_agents:
  - explorer
verification_lane: docs-only
open_risks:
  - The new planning skill may still feel too heavy if it keeps too many old review stages.
  - The AC and TC structure may become too rigid if it is explained poorly.
---

# Planning Skill Redesign

## Requirements Summary

Redesign the Codex `planning` skill so it matches the new product flow:

```text
$brainstorming
  -> $planning
  -> $execute
  -> $qa
  -> commit
```

The new planning skill should feel like a strong execution-prep step, not like a copy of older reference flows.

## Desired Outcome

Have a new `planning` skill that:

- clearly comes after `brainstorming`
- produces a file-based plan
- locks scope, design direction, and test strategy
- uses a `Task -> AC -> TC` structure
- gives `$execute` a simple and usable handoff
- uses simple English and avoids over-complicated stage language

## In Scope

- rewrite the purpose and positioning of `planning`
- simplify the stage flow
- make test strategy a required part of planning
- define a `Task -> AC -> TC` plan shape
- rewrite the handoff to fit the new flow
- reduce old reference-heavy wording

## Non-Goals

- redesign `$brainstorming`
- redesign `$execute`
- implement runtime helpers
- define final `$qa` details
- add code examples or implementation snippets to the plan format

## Decision Boundaries

- `planning` is for execution preparation, not idea shaping
- `planning` should stay above code-level example design
- test strategy is required
- AC and TC should stay linked
- the skill should be understandable without knowing hidden runtime tools

## Problem Summary

The current `planning` skill still carries too much of the older structure.
It has useful parts, but it still feels more complex than needed and does not yet reflect the new main flow strongly enough.
It also does not yet make `Task -> AC -> TC` the clear backbone of the plan.

## What Matters Most For The Choice

- simple to understand
- strong enough to prepare execution
- test-aware by default
- easy for `$execute` to consume
- not overloaded with old ceremony

## Options Considered

### Option A. Keep the current planning flow and only simplify wording

Pros:

- small change
- low rewrite cost

Cons:

- keeps too much old structure
- still feels reference-shaped
- does not strongly express `Task -> AC -> TC`

### Option B. Redesign planning around execution preparation

Pros:

- fits the new top-level flow
- makes test strategy central
- makes the output easier to use
- better matches the new `$execute`

Cons:

- larger rewrite
- requires dropping some old sections or old stage framing

### Option C. Split planning into several smaller skills

Pros:

- could be very explicit

Cons:

- too much surface area too early
- makes the workflow harder to follow

## Recommended Direction

Choose **Option B**.

Rebuild `planning` as a strong execution-prep skill with this core idea:

```text
Task
  -> design direction
  -> scope and non-goals
  -> test strategy
  -> AC list
     -> each AC has TC list
  -> execution handoff
```

## Acceptance Criteria

### AC1. Purpose And Boundary

The skill clearly says:

- `brainstorming` is for choosing direction
- `planning` is for preparing execution
- `planning` is not implementation

### AC2. Simpler Flow

The planning flow is rewritten in simpler language and no longer feels overloaded with old review ceremony.

### AC3. Test Strategy Is Required

The skill makes test strategy a required planning section.

### AC4. Task -> AC -> TC Structure

The skill explains that the plan should use:

- one task
- ACs inside the task
- TCs inside each AC

### AC5. Clear Output

The skill explains what the plan file must contain without forcing unnecessary technical detail or code-level examples.

### AC6. Better Handoff

The handoff to `$execute` is simpler and easier to read.

### AC7. Language Quality

The rewritten skill uses simple English and removes hard-to-follow wording where possible.

## Test Strategy

This is a docs-and-skill-text change, so the test lane is `docs-only`.

Verification should check:

- the new flow reads clearly in one pass
- the skill feels like execution preparation, not idea shaping
- `Task -> AC -> TC` is visible and understandable
- test strategy is a required section
- the wording matches the simple-language rule

## Verification Steps

- re-read `templates/codex/skills/planning/SKILL.md`
- confirm it matches [everything-automate-implementation-milestones.md](/home/yhyuntak/workspace/everything-automate/docs/specs/everything-automate-implementation-milestones.md)
- confirm it aligns with the new `brainstorming -> planning -> execute -> qa -> commit` flow
- confirm the plan shape clearly shows `Task -> AC -> TC`
- confirm hidden runtime tools are not needed to understand the skill

## Implementation Order

1. Rewrite purpose and boundary sections.
2. Replace old heavy stage framing with a simpler planning flow.
3. Add required test strategy guidance.
4. Rewrite output structure around `Task -> AC -> TC`.
5. Simplify the execute handoff section.
6. Re-read for simple English and remove unnecessary hard words.

## Risks And How To Reduce Them

- Risk: planning becomes too abstract
  - Reduce by keeping the required output concrete
- Risk: planning becomes too rigid
  - Reduce by keeping code-level detail out of the plan
- Risk: planning still feels too much like the old design
  - Reduce by cutting or simplifying ceremony that does not help the new flow

## Final Handoff Block

- `task_id`: `planning-skill-redesign-2026-04-08`
- `plan_path`: `.everything-automate/plans/2026-04-08-planning-skill-redesign.md`
- `approval_state`: `draft`
- `execution_unit`: `section`
- `recommended_mode`: `execute`
- `recommended_agents`: `explorer`
- `verification_lane`: `docs-only`
- `open_risks`:
  - `The new planning skill may still feel too heavy if it keeps too many old review stages.`
  - `The AC and TC structure may become too rigid if it is explained poorly.`
