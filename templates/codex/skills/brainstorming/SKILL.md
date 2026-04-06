---
name: brainstorming
description: Help turn a vague idea into a clearer direction before planning.
argument-hint: "<idea, feature direction, or vague request>"
---

# brainstorming

Use this when the user has an idea, but it is still too fuzzy to plan.

## Purpose

Use brainstorming when the user needs help deciding what they want before turning it into a real plan.

Brainstorming should:

- clarify what the user is really trying to achieve
- surface limits and non-goals early
- explore a few realistic directions
- recommend one direction and explain the tradeoffs
- leave behind a short brief that can later feed `$planning`

Brainstorming comes before planning.
It is not implementation and it is not step-by-step execution planning.

## Use When

- the user has an idea but not yet a clear plan
- the user wants to compare approaches before planning
- the request is exploratory, product-focused, or design-focused
- scope feels fuzzy enough that planning would be premature
- the user explicitly asks to brainstorm

## Do Not Use When

- the request is already concrete enough for `$planning`
- the user already has a clear direction and wants an execution plan
- the task is only to review an existing plan

## Interaction Policy

Brainstorming is interactive by default.

- Ask one question at a time.
- Prefer one strong question over a long checklist.
- Do not ask the user for codebase facts that can be explored directly.
- If the request touches an existing codebase, ground yourself first with `explorer`.
- Once the direction is clear enough, stop asking and move into options and recommendation.

## Default Flow

```text
request
  -> quick context check
  -> explorer if repo context helps
  -> one-question-at-a-time clarification
  -> identify intent / constraints / non-goals
  -> propose 2-3 directions
  -> compare tradeoffs
  -> recommend one direction
  -> user reacts
  -> revise if needed
  -> finalize brainstorm brief
  -> recommend next step: stop or move to $planning
```

## Rules

- Do not implement during brainstorming.
- Do not jump into implementation steps too early.
- Clarify why the user wants the change before narrowing how to build it.
- Ask about scope boundaries and non-goals before polishing solution details.
- Explore the codebase before asking technical questions the repository can answer.
- Offer 2-3 options unless the space is obviously binary or heavily constrained.
- Lead with your recommended option and explain why.
- Keep the conversation collaborative, but aim to end with one clear recommendation.

## Suggested Question Order

When clarification is needed, prefer this order:

1. intent
2. desired outcome
3. scope
4. non-goals
5. constraints
6. decision boundaries

Do not ask every category by default if the answer is already obvious from context or easy to explore.

## Output

Brainstorming should end with a short brief containing:

- problem or opportunity
- user intent
- desired outcome
- in-scope
- non-goals
- constraints
- options considered
- recommended direction
- open questions, if any
- recommended next step

## Handoff Boundary

Brainstorming does not produce the final execution plan.

If the user wants to move forward after the direction is chosen:

```text
brainstorming
  -> approved direction
  -> $planning
```

If the user only wanted ideation or comparison, stop after the brief.

## Completion

Brainstorming is complete when:

- the user understands the main options
- one direction is recommended clearly
- scope and non-goals are visible enough to avoid premature planning mistakes
- the next step is explicit: stop, refine further, or move to `$planning`
