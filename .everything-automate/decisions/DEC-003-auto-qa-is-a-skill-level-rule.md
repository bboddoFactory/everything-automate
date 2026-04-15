---
title: Auto QA Is A Skill Level Rule
status: accepted
date: 2026-04-12
decision_id: DEC-003
---

## Context

The workflow wanted execute to lead naturally into QA, but runtime-enforced orchestration would push too much control into scripts.

## Decision

After normal execute completion, the main LLM should continue into `$qa` in the same workflow when review inputs are ready.

This is a skill-level rule, not a runtime-enforced script transition.

## Consequences

- execute and QA skill text should describe the same flow clearly
- scripts should help prepare handoff data, not own the stage transition
- future runtime automation can revisit this later, but it is not the current contract

## Related Plans Or Files

- .everything-automate/plans/2026-04-12-qa-behavior-contract-redesign-and-checklist-hardening.md
- templates/codex/skills/execute/SKILL.md
- templates/codex/skills/qa/SKILL.md
