---
title: Stable Workflow Contract Lives In AGENTS And Skills
status: accepted
date: 2026-04-12
decision_id: DEC-004
---

## Context

Workflow guidance had drifted into a temporary global file, which made the true source of truth less clear.

## Decision

Stable workflow contract should live in:

- `templates/codex/AGENTS.md`
- relevant `templates/codex/skills/*/SKILL.md`

Temporary or duplicated global guidance should not be the source of truth for stable workflow rules.

## Consequences

- future workflow changes should update AGENTS and skills directly
- support files should not quietly become product contract documents
- planning and QA can rely on a clearer document hierarchy

## Related Plans Or Files

- .everything-automate/plans/2026-04-12-qa-behavior-contract-redesign-and-checklist-hardening.md
- templates/codex/AGENTS.md
