---
title: QA Reviews Behavior And Contract
status: superseded
date: 2026-04-12
decision_id: DEC-002
---

## Context

Code review alone was too narrow for Codex workflow work because skill text, prompts, and ownership boundaries also shape system behavior.

## Decision

`$qa` should review two lenses:

- code and test quality
- behavior and contract quality

The main LLM still owns the final QA judgment.

This decision is superseded by `DEC-005`, which keeps behavior and contract review but moves it under a routed `harness reviewer` lane instead of one always-two-lenses reviewer.

## Consequences

- QA handoff packets need behavior and ownership fields, not only diff and tests
- the cold reviewer should look for contract and behavior-shaping defects
- QA remains a review-and-judgment stage rather than only a reviewer call

## Related Plans Or Files

- .everything-automate/plans/2026-04-12-qa-behavior-contract-redesign-and-checklist-hardening.md
- .everything-automate/plans/2026-04-16-qa-reviewer-routing-and-specialization.md
- templates/codex/skills/qa/SKILL.md
- templates/codex/agents/harness-reviewer.md
