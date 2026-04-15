---
title: Execute Skill Redesign
status: draft
approval_state: draft
task_id: execute-skill-redesign-2026-04-08
plan_path: .everything-automate/plans/2026-04-08-execute-skill-redesign.md
mode: direct
execution_unit: section
recommended_mode: execute
recommended_agents:
  - explorer
  - plan-arch
  - plan-devil
verification_lane: docs-only
open_risks:
  - The new execute flow may become too heavy if checklist handling is over-specified.
  - TC-first exceptions may stay vague unless TC types are made explicit.
---

# Execute Skill Redesign

## Task Summary

Redesign the Codex `execute` skill so it matches the new main flow:

```text
$brainstorming
  -> $planning
  -> $execute
  -> $qa
  -> commit
```

The new `execute` should act like a TC-first work loop, not just a generic implement step.

## Desired Outcome

Have a new `execute` skill that:

- reads an approved plan
- turns `Task -> AC -> TC` into a working checklist
- uses TC-first execution when possible
- uses broader check-first behavior when strict test-first is not possible
- finishes the task and then hands off to `$qa`
- stays easy to understand

## In Scope

- rewrite the purpose and flow of `execute`
- make checklist creation explicit
- make `AC -> TC` the working loop
- explain TC-first behavior
- explain TC type exceptions
- simplify language
- make the end of `execute` point to `$qa`

## Non-Goals

- redesign `$planning`
- fully define `$qa`
- implement runtime helpers
- finalize progress/state storage details
- add provider-specific recovery behavior

## Decision Boundaries

- `execute` follows an approved plan and does not reopen planning
- the main unit of progress is still `AC`
- the main working loop is `TC`-first inside each `AC`
- `execute` should create a task checklist from the plan before real work starts
- `execute` should move to `$qa` after all work is complete

## Design Direction

`execute` should feel like:

- a TDD driver when that is possible
- an autonomous loop that keeps going until the task is done
- a checklist-based worker, not a vague implementation prompt

The main idea is:

```text
approved plan
  -> make execution checklist
  -> pick AC
  -> pick TC
  -> choose TC type
  -> run the earliest valid check first
  -> implement
  -> rerun the TC
  -> repeat
  -> move to $qa
```

## Test Strategy

This redesign is a docs-and-skill-text change, so the test lane is `docs-only`.

The redesigned skill itself must define how execution chooses a TC lane:

- `automated`
- `manual`
- `doc`
- `config`

This is not the test strategy for one feature.
It is the rule by which `execute` chooses the earliest useful check.

## Task

### AC1. Reposition `execute`

`execute` must clearly say that it:

- follows an approved plan
- does not reopen planning
- works toward task completion
- hands off to `$qa` after task completion

#### TC1

The skill text clearly says `execute` comes after `$planning` and before `$qa`.

#### TC2

The skill text no longer reads like a generic "implement this" prompt.

### AC2. Make Checklist Creation Explicit

`execute` must clearly say that it first turns the approved plan into a working checklist.

#### TC1

The skill text explains that `Task -> AC -> TC` becomes a live execution checklist.

#### TC2

The checklist shape makes it clear that runs can resume from visible progress.

### AC3. Make TC-First The Core Loop

`execute` must clearly say that inside each AC, the loop works from TC first when possible.

#### TC1

The flow shows:

```text
pick AC
  -> pick TC
  -> run check first if possible
  -> implement
  -> rerun TC
```

#### TC2

The skill text explains why TC-first is preferred over implementation-first.

### AC4. Define TC Types For Non-Ideal Cases

`execute` must say what to do when strict automated TDD is not realistic.

#### TC1

The skill defines TC types such as:

- `automated`
- `manual`
- `doc`
- `config`

#### TC2

The skill explains that the rule is not "skip tests," but "use the earliest valid check first."

### AC5. Keep Retry And Decision Rules Clear

The skill must still preserve the clear decision loop:

- `pass`
- `fail`
- `blocked`
- `scope_drift`

#### TC1

The branch meanings stay easy to understand.

#### TC2

The new TC-first flow still explains how retries work.

### AC6. End In `$qa`

`execute` must clearly say that finishing the task leads to `$qa`, not directly to commit.

#### TC1

The end-state wording clearly points to `$qa`.

#### TC2

The skill text separates `execute`-level success from final QA acceptance.

## Execution Order

1. Rewrite the purpose and position of `execute`.
2. Add checklist creation to the start of the flow.
3. Rewrite the core loop around `AC -> TC`.
4. Add TC type handling for non-ideal cases.
5. Keep decision and retry rules clear in simple language.
6. Rewrite the completion flow so task completion leads to `$qa`.
7. Re-read for simple English.

## Open Risks

- The new `execute` may become too detailed if checklist mechanics are explained too heavily.
- TC-first rules may become fuzzy if the difference between `automated`, `manual`, `doc`, and `config` is not explained simply.
- The handoff to `$qa` may still feel thin until `$qa` itself is designed.

## Execute Handoff

- `task_id`: `execute-skill-redesign-2026-04-08`
- `plan_path`: `.everything-automate/plans/2026-04-08-execute-skill-redesign.md`
- `approval_state`: `draft`
- `execution_unit`: `section`
- `test_strategy`: `docs-only`
- `open_risks`:
  - `The new execute flow may become too heavy if checklist handling is over-specified.`
  - `TC-first exceptions may stay vague unless TC types are made explicit.`
