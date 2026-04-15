---
title: QA Routes Specialist Reviewers
status: accepted
date: 2026-04-16
decision_id: DEC-005
---

## Context

The current QA contract says one cold reviewer should always check both code and behavior/contract lenses.

That kept QA simple, but it also made reviewer focus too broad and forced harness-specific review onto changes that were mainly general code work.

## Decision

`$qa` stays one stage, but reviewer work should route into specialist lanes.

The initial reviewer lanes are:

- `code reviewer`
- `harness reviewer`

The main LLM should:

- inspect the change
- choose the right reviewer lane
- run both for mixed work
- ask the user when the right lane is still unclear

The main LLM still owns the final QA judgment.

## Consequences

- QA can stay one user-facing stage without keeping one vague reviewer prompt
- code review and harness review can use different checklists and prompts
- mixed changes can still receive both reviews
- future work can add more reviewer lanes without redesigning the whole QA stage

## Related Plans Or Files

- .everything-automate/plans/2026-04-16-qa-reviewer-routing-and-specialization.md
- templates/codex/skills/qa/SKILL.md
- templates/codex/agents/code-reviewer.md
- templates/codex/agents/harness-reviewer.md
