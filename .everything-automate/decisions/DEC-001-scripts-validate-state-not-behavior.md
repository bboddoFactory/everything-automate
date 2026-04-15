---
title: Scripts Validate State Not Behavior
status: accepted
date: 2026-04-12
decision_id: DEC-001
---

## Context

Recent Codex workflow work needed a clearer line between what the LLM decides and what helper scripts do.

## Decision

Scripts should own:

- state persistence
- artifact writing
- schema checks
- live-context validation

Scripts should not own:

- behavior judgment
- retry policy
- advisor policy
- QA verdicts

## Consequences

- helper scripts can stay strict without becoming a workflow engine
- LLM-owned decisions remain visible and reviewable
- future runtime work should avoid moving behavior ownership into scripts

## Related Plans Or Files

- .everything-automate/plans/2026-04-12-qa-behavior-contract-redesign-and-checklist-hardening.md
- templates/codex/skills/execute/scripts/checklist.py
- templates/codex/skills/qa/scripts/build_handoff.py
