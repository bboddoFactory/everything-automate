---
name: planning
description: Turn a clear request into a plan that `$execute` can follow.
argument-hint: "[--direct|--consensus|--review] <task or spec>"
---

# planning

Turn a user request into a plan that `$execute` can follow.

## Purpose

Planning is not implementation.
Its job is to:

- clarify intent
- lock scope
- define non-goals and decision boundaries
- define the problem clearly before breaking work into steps
- compare a few realistic directions when design choice matters
- produce testable acceptance criteria
- prepare a clear final block for `$execute`

## Interaction Policy

Planning is interactive only at two points:

1. clarification when the request is still unclear after the first context check and exploration
2. final approval

Everything else should run as a fixed planning flow.

```text
interactive
  -> clarification when needed
  -> final approval

non-interactive
  -> quick context check
  -> explore
  -> define the problem
  -> draft
  -> angel
  -> architect
  -> devil
  -> self-check
  -> revise
```

## Default Flow

```text
mode detection
  -> quick context check
  -> explore
  -> decide if clarification is needed
  -> define the problem
  -> draft plan
  -> angel review
  -> revise
  -> architect review
  -> revise
  -> devil validation
  -> revise
  -> plan self-check
  -> user approval
  -> final handoff
```

## Modes

| Mode | Trigger | Behavior |
| --- | --- | --- |
| `direct` | request already concrete | still checks for missing context, but may pass without user questions |
| `interview` | broad or vague request | clarification is expected before planning can continue |
| `consensus` | risky, high-impact, or architecture-heavy work | require architect then devil review and make the reason for the choice stronger |
| `review` | existing plan needs evaluation | review without rewriting from scratch unless critical gaps require it |

## Rules

- Planning always checks whether clarification is needed.
  - This does **not** mean it always asks the user questions.
  - It means it always checks whether important ambiguity remains after the first context check and exploration.
- Explore repo facts before asking the user about them.
- Ask one question at a time only when clarification is still needed.
- Do not implement during planning.
- Do not break work into implementation order until the problem is defined clearly enough.
- Do not hand off to execution until non-goals and decision boundaries are explicit.
- Keep the final plan small enough to execute, but concrete enough to verify.
- Do not keep asking the user for intermediate confirmation once ambiguity is low enough.
- Run the planning stages in order and absorb each stage result into the draft before moving on.
- Keep planning light by default, but be stricter for high-risk work.

## Stage Order

Planning is a staged workflow, not a single draft-and-dump step.

```text
request
  -> mode detection
  -> quick context check
  -> explore
  -> decide if clarification is needed
  -> define the problem
  -> draft
  -> angel
  -> revise
  -> architect
  -> revise
  -> devil
  -> revise
  -> self-check
  -> approval
  -> handoff
```

Stage rules:

- `quick context check` runs before any user questioning.
- `explore` runs before the first draft when repo facts matter.
- `clarification` decides whether user interaction is still necessary after the first context check and exploration.
- `define the problem` locks intent, outcome, and scope boundaries before breaking work into steps.
- `angel` expands the first real draft.
- `architect` reviews the revised draft for structure and execution shape.
- `devil` gives the final critical verdict on the revised draft.
- `self-check` runs after the final revise pass and before user approval.
- Each stage result must be reflected in the draft before the next stage begins.
- `devil` may return `approve`, `iterate`, or `reject`.

Verdict handling:

```text
devil approve
  -> self-check
  -> user approval

devil iterate
  -> revise draft
  -> re-run only the stages still needed

devil reject
  -> go back to draft or clarification depending on the failure
```

## Required Output

The plan must include:

- requirements summary
- desired outcome
- in-scope
- non-goals
- decision boundaries
- clear problem summary
- what matters most for the choice
- options considered
- recommended direction
- acceptance criteria
- verification steps
- implementation order
- risks and how to reduce them
- final handoff block

## Plan Artifact Path

During local Everything Automate development, write plan artifacts to:

- `.everything-automate/plans/{YYYY-MM-DD}-{slug}.md`

If a caller already provides a plan path, use that path instead of inventing a new one.

## Handoff Block

Every approved plan must end with a handoff block containing:

- `task_id`
- `plan_path`
- `approval_state`
- `execution_unit`
- `recommended_mode`
- `recommended_agents`
- `verification_lane`
- `open_risks`

## Agent Usage

- `explorer`
  collect repo facts, patterns, and touchpoints before the draft
- `angel`
  add missing work items, edge cases, and verification gaps after the draft
- `architect`
  check structure, alternatives, and execution shape after angel revisions
- `devil`
  attack unclear parts, weak verification, and hidden risk after architect revisions

## Stage Outputs

- `quick context check`
  - task statement
  - desired outcome
  - known facts
  - constraints
  - unknowns
  - likely touchpoints
- `clarification`
  - clarified task statement or confirmation that no user question was required
  - desired outcome
  - in-scope
  - non-goals
  - decision boundaries
- `explorer`
  - relevant files
  - current pattern
  - likely touchpoints
  - open unknowns
- `define the problem`
  - problem statement
  - why now
  - success definition
  - what matters most for the choice
  - options considered
  - recommended direction
- `angel`
  - missing work items
  - missing validation points
  - edge cases
  - optional improvements
- `architect`
  - recommended approach
  - alternatives considered
  - tradeoffs
  - execution recommendation
  - architecture risks
- `devil`
  - verdict: `approve | iterate | reject`
  - critical gaps
  - ambiguous points
  - verification failures
  - required revisions
- `self-check`
  - placeholder scan
  - AC/testability check
  - handoff completeness check
  - implementation-order sanity check
  - contradiction check

## Mode Selection Guidance

- If the request names files, symbols, or concrete behavior, prefer `direct`.
- If the request uses vague verbs like "improve", "refactor", or "make it better", prefer `interview`.
- If the request touches auth, security, migration, public API breakage, or other high-risk areas, prefer `consensus`.

## Completion

Planning is complete only when:

- the plan is execution-ready
- user approval is explicit when needed
- the handoff block is present
- the plan can be handed off to later execution work without reopening basic scope questions
- all required subagent review stages have been incorporated into the final draft
- the problem is defined clearly enough that task decomposition is not guessing at intent
- what matters most for the choice and the recommended direction are visible when design choice mattered
- self-check passed with no blocking placeholder, contradiction, or handoff gap
