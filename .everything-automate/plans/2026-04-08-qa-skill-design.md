---
title: QA Skill Design
status: draft
approval_state: draft
task_id: qa-skill-design-2026-04-08
plan_path: .everything-automate/plans/2026-04-08-qa-skill-design.md
mode: direct
execution_unit: section
recommended_mode: execute
recommended_agents:
  - qa-reviewer
verification_lane: docs-only
open_risks:
  - QA may become too broad if it tries to replace both execute and planning.
  - The QA handoff packet may become too large if it includes too much conversation history.
---

# QA Skill Design

## Task Summary

Design a new `$qa` skill for Everything Automate.

This skill should come after `$execute` and before `commit`.
Its main role is to act as a cold review gate, not a second planning step.

## Desired Outcome

Have a new `$qa` design that:

- clearly sits after `$execute`
- uses one cold reviewer subagent
- reviews finished work with fresh eyes
- uses a QA handoff packet instead of full conversation history
- returns a clear verdict before commit

## In Scope

- define the purpose of `$qa`
- define its place in the main flow
- define its entry check
- define the QA handoff packet
- define the cold reviewer subagent role
- define verdicts and next actions

## Non-Goals

- redesign `$execute`
- redesign `$planning`
- implement the reviewer runtime
- define PR review flow
- create a multi-reviewer system

## Decision Boundaries

- `$qa` is mainly a code review gate
- `$qa` is not implementation
- `$qa` is not brainstorming
- `$qa` should use one cold reviewer subagent
- that reviewer should receive only the needed review packet, not the whole conversation
- `$qa` should only send work back to `$planning` when the problem is truly plan-level

## Design Direction

The core shape should be:

```text
$execute finished
  -> QA entry check
  -> prepare QA handoff packet
  -> spawn cold qa-reviewer
  -> reviewer checks code, tests, structure, and risk
  -> reviewer returns verdict
  -> main agent decides next step
```

The main role of QA is not plan checking by itself.
Its main role is:

- code quality review
- architecture fit review
- risk and security smell review
- test quality review
- mismatch-with-goal review

## Test Strategy

This is a docs-and-skill-text change, so the current test lane is `docs-only`.

The future `$qa` skill should review:

- changed files or diff
- test or check results
- plan summary
- task summary

## Task

### AC1. Position And Purpose

The `$qa` skill must clearly say:

- it runs after `$execute`
- it runs before `commit`
- it is a review gate, not a second execution phase

#### TC1

The skill text clearly shows `$execute -> $qa -> commit`.

#### TC2

The skill text clearly says QA is mainly a cold code review gate.

### AC2. QA Entry Check

The skill must define what must exist before QA starts.

#### TC1

The skill requires enough finished work to review.

#### TC2

The skill requires changed files and test/check results.

### AC3. QA Handoff Packet

The skill must define a review packet that the cold reviewer uses.

#### TC1

The packet includes:

- task summary
- desired outcome
- scope / non-goals
- short plan summary
- changed files or diff
- test or check results
- open risks

#### TC2

The skill clearly says the full conversation history should not be passed blindly.

### AC4. Cold Reviewer Role

The skill must define a single cold reviewer subagent.

#### TC1

The reviewer checks:

- code quality
- architecture fit
- security or risk smells
- test quality
- mismatch with intended goal

#### TC2

The reviewer is told not to nitpick style or reopen planning casually.

### AC5. Verdict And Next Step

The skill must define simple QA outcomes.

#### TC1

The default verdicts are:

- `pass`
- `fix`

#### TC2

The skill clearly says "return to planning" should happen only when the problem is truly at the plan level.

## Execution Order

1. Write the purpose and position of `$qa`.
2. Define the QA entry check.
3. Define the QA handoff packet.
4. Define the cold reviewer subagent role.
5. Define verdicts and next-step rules.
6. Re-read the whole design in simple English.

## Open Risks

- `$qa` may become too broad if it tries to replace both execute and planning.
- The QA handoff packet may become too large if it includes too much conversation history.

## Execute Handoff

- `task_id`: `qa-skill-design-2026-04-08`
- `plan_path`: `.everything-automate/plans/2026-04-08-qa-skill-design.md`
- `approval_state`: `draft`
- `execution_unit`: `section`
- `test_strategy`: `docs-only`
- `open_risks`:
  - `QA may become too broad if it tries to replace both execute and planning.`
  - `The QA handoff packet may become too large if it includes too much conversation history.`
