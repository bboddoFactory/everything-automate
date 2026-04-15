---
title: Communication Style Hardening
status: draft
approval_state: draft
task_id: communication-style-hardening-2026-04-09
plan_path: .everything-automate/plans/2026-04-09-communication-style-hardening.md
mode: direct
execution_unit: AC
recommended_mode: execute
recommended_agents:
  - explorer
  - plan-devil
verification_lane: docs-only
open_risks:
  - The new rules may stay too vague unless they are written as clear output rules.
  - If the rules live only in AGENTS.md, some skill text may still drift back to harder wording.
---

# Communication Style Hardening

## Task Summary

Harden the Codex template so answers are easier to read.

The main problems to fix are:

- the conclusion does not come first often enough
- too much hard English and too many English terms appear in one answer
- answers are not structured cleanly enough
- flow explanations often collapse into arrow lists instead of real ASCII flow charts

## Desired Outcome

Update the active Codex template so it pushes answers toward this style:

- say the conclusion first
- use easy words first
- use English terms only when they really help
- keep the answer cleanly structured
- use real ASCII flow charts when a flow needs to be explained

## In Scope

- update the active communication rules in `templates/codex/AGENTS.md`
- update skill text where the communication rules should be reinforced
- define what a good ASCII flow chart looks like
- define a simple answer shape for status and implementation updates

## Non-Goals

- change the main workflow
- redesign brainstorming, planning, execute, or qa logic
- force Korean-only output
- ban all English words
- rewrite old legacy snapshot files unless needed later

## Design Direction

Write the rules in plain language and make them operational.

The style should push answers toward this shape:

```text
[Conclusion]
short answer first

[What Changed]
only the important points

[Check]
what was verified

[Next]
the next action
```

When a process needs a flow explanation, prefer a real ASCII flow chart like this:

```text
[Start]
   |
   v
[Read Plan]
   |
   v
[Pick AC]
   |
   +---- blocked ----> [Stop and Report]
   |
   v
[Pick TC]
   |
   v
[Run Check]
   |
   v
[Implement]
   |
   v
[Check Again]
   |
   +---- fail ----> [Fix and Retry]
   |
   v
[Next]
```

Do not treat a simple arrow list as a flow chart.

## Test Strategy

This is a docs-and-template wording change, so the test lane is `docs-only`.

Verification should confirm:

- the new rules are clear and concrete
- they appear in the active template, not only in old files
- they make a visible distinction between arrow lists and real ASCII flow charts
- the wording stays easy to follow

## Task

### AC1. Strengthen The Top-Level Communication Rules

The active Codex guidance must clearly say how answers should be structured.

#### TC1

The rules explicitly say to put the conclusion first.

#### TC2

The rules explicitly say to keep answers cleanly structured.

### AC2. Strengthen The Language Rules

The active Codex guidance must make the wording easier to follow.

#### TC1

The rules say to prefer easy words over harder professional English.

#### TC2

The rules say English terms are allowed but should not be overused.

### AC3. Define The Flow Chart Rule

The active Codex guidance must clearly distinguish a real ASCII flow chart from a simple arrow list.

#### TC1

The rules include a positive example of a real ASCII flow chart.

#### TC2

The rules say not to use a simple arrow list when the user asked for a flow chart.

### AC4. Reinforce The Rules In Skill Text

The most important skills should echo the same communication direction.

#### TC1

At least the active flow skills point back to the cleaner answer style.

#### TC2

The updated skill wording does not add harder language than the new top-level rule.

## Execution Order

1. Update the top-level communication rules in `templates/codex/AGENTS.md`.
2. Add concrete wording for conclusion-first answers.
3. Add concrete wording for easy-language answers.
4. Add the real ASCII flow chart rule and example.
5. Update the most important skill text if it needs reinforcement.
6. Re-read for clarity and simple wording.

## Open Risks

- The new rules may stay too vague unless they are written as clear output rules.
- If the rules live only in AGENTS.md, some skill text may still drift back to harder wording.

## Execute Handoff

- `task_id`: `communication-style-hardening-2026-04-09`
- `plan_path`: `.everything-automate/plans/2026-04-09-communication-style-hardening.md`
- `approval_state`: `draft`
- `execution_unit`: `AC`
- `test_strategy`: `docs-only`
- `open_risks`:
  - `The new rules may stay too vague unless they are written as clear output rules.`
  - `If the rules live only in AGENTS.md, some skill text may still drift back to harder wording.`
