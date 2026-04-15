---
title: Brainstorming Skill Redesign
status: draft
approval_state: draft
task_id: brainstorming-skill-redesign-2026-04-08
plan_path: .everything-automate/plans/2026-04-08-brainstorming-skill-redesign.md
mode: direct
execution_unit: section
recommended_mode: execute
recommended_agents:
  - explorer
verification_lane: docs-only
open_risks:
  - The new skill may become too abstract if lane rules are not concrete enough.
  - The new skill may become too rigid if output shape is over-specified.
---

# Brainstorming Skill Redesign

## Requirements Summary

Redesign the Codex `brainstorming` skill so it feels like our own workflow, not a reference copy.
The new skill should help with real idea shaping, not just act as a thin step before `$planning`.

## Desired Outcome

Have a new `brainstorming` skill that:

- is easy to understand
- uses simple English
- can end without moving to `$planning`
- routes different kinds of thinking into different lanes
- asks strong questions without forcing one fixed script
- stays useful for feature ideas, design thinking, doc thinking, and general idea shaping

## In Scope

- rewrite the purpose of `brainstorming`
- redefine when to use it and when not to use it
- add lane-based routing
- define what each lane needs to reveal
- define stop rules
- define flexible output modes
- align the skill with the new top-level flow

## Non-Goals

- redesign `$planning`
- redesign `$execute`
- implement runtime helpers
- add hidden state/progress logic
- force one rigid output template for every brainstorm

## Decision Boundaries

- `brainstorming` is a standalone thinking skill, not only a planning pre-step
- the skill must use simple language
- question wording stays flexible
- lane goals and stop rules should be explicit
- output should be guided, not over-formatted

## Problem Summary

The current `brainstorming` skill is helpful, but it still feels too close to "planning pre-work."
It does not clearly support broader thinking cases like general ideation, doc shaping, or non-execution idea cleanup.
It also risks feeling template-like because the flow is clear but the purpose is still too narrow.

## What Matters Most For The Choice

- easy to understand
- useful outside coding work
- strong enough to guide the model
- flexible enough to avoid stiff conversations

## Options Considered

### Option A. Keep the current shape and only tweak wording

Pros:

- low effort
- keeps a familiar flow

Cons:

- still feels too close to planning intake
- does not solve the "this is not really mine" problem

### Option B. Rebuild `brainstorming` around lane-based routing and flexible outputs

Pros:

- matches the new product direction
- supports more than one kind of thinking
- keeps the flow strong without forcing identical outputs

Cons:

- larger rewrite
- needs careful wording to stay simple

### Option C. Split brainstorming into several separate skills

Pros:

- could be very specialized

Cons:

- too early
- adds more surface area before the core flow is stable

## Recommended Direction

Choose **Option B**.

Rebuild `brainstorming` as a standalone thinking skill with 4 lanes:

- `idea shaping`
- `feature shaping`
- `design shaping`
- `doc shaping`

Use routing first, then lane-specific questioning goals, then a flexible end state.

## Acceptance Criteria

### AC1. Purpose And Positioning

The skill clearly says that `brainstorming` can stand alone and does not have to move to `$planning`.

### AC2. Entry And Routing

The skill explains how to enter brainstorming and how to route into one of the 4 lanes.

### AC3. Lane Logic

Each lane explains what the conversation should reveal, without forcing one fixed list of exact questions.

### AC4. Stop Rules

The skill explains when to:

- stop
- keep brainstorming
- move to `$planning`

### AC5. Output Modes

The skill defines flexible output modes instead of one rigid brief template.

### AC6. Language Quality

The whole skill uses simple English and avoids hard-to-follow framework words.

## Test Strategy

This is a docs-and-skill-text change, so the test lane is `docs-only`.

Verification should check:

- the new flow is easy to follow in one read
- the skill no longer frames brainstorming only as planning pre-work
- the 4 lanes are clear
- the output section is guided but not stiff
- the wording follows the simple-language rule

## Verification Steps

- re-read `templates/codex/skills/brainstorming/SKILL.md`
- confirm it matches [everything-automate-implementation-milestones.md](/home/yhyuntak/workspace/everything-automate/docs/specs/everything-automate-implementation-milestones.md)
- confirm it matches the simple-language rule in [everything-automate-operating-principles.md](/home/yhyuntak/workspace/everything-automate/docs/specs/everything-automate-operating-principles.md)
- check that the skill clearly separates:
  - route
  - lane
  - stop rule
  - output mode

## Implementation Order

1. Rewrite the purpose and positioning sections.
2. Replace the current one-size-fits-all flow with lane-based routing.
3. Add reveal goals for each lane.
4. Add stop rules and next-step rules.
5. Replace rigid output brief language with flexible output modes.
6. Re-read for simple English and remove hard words.

## Risks And How To Reduce Them

- Risk: the new skill becomes too vague
  - Reduce by keeping lane goals and stop rules explicit
- Risk: the new skill becomes too rigid
  - Reduce by keeping question wording flexible and output modes loose
- Risk: the skill overlaps too much with planning
  - Reduce by clearly stating that planning is for execution and brainstorming may stop before that

## Final Handoff Block

- `task_id`: `brainstorming-skill-redesign-2026-04-08`
- `plan_path`: `.everything-automate/plans/2026-04-08-brainstorming-skill-redesign.md`
- `approval_state`: `draft`
- `execution_unit`: `section`
- `recommended_mode`: `execute`
- `recommended_agents`: `explorer`
- `verification_lane`: `docs-only`
- `open_risks`:
  - `The new skill may become too abstract if lane rules are not concrete enough.`
  - `The new skill may become too rigid if output shape is over-specified.`
