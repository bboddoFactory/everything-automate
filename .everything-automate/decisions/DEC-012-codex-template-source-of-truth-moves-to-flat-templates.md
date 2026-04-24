---
title: Codex Template Source Of Truth Moves To Flat Templates
status: accepted
date: 2026-04-24
decision_id: DEC-012
---

## Context

Everything Automate now uses a Codex-only setup story.

The next source-level mismatch is the repo shape itself:

- active runtime assets still live under `templates/codex/`
- old provider-specific template folders still sit beside them
- active install and local-test scripts still point at `templates/codex/`

That structure keeps the old multi-provider shape visible even though the active product direction is now Codex-only.

## Decision

Move the active Codex runtime source of truth from `templates/codex/` to flat paths under `templates/`.

For this flattening step:

- `templates/AGENTS.md` becomes the runtime guidance source
- `templates/INSTALL.md` becomes the install guide source
- `templates/agents/`, `templates/skills/`, `templates/hooks/`, `templates/hooks.json`, and `templates/overlays/` become the active runtime asset roots

Also remove inactive provider template directories from `templates/` in the same change.

Do not mix this with a full historical docs cleanup.
Only update active scripts, tests, and directly adjacent docs that must follow the new flat paths.

## Consequences

- Active installer and local-test code should stop reading from `templates/codex/`.
- User-facing and adjacent runtime docs should stop pointing at `templates/codex/`.
- Old provider template directories can be removed from the active source tree.
- Historical docs and archived plans may still mention the old paths until later cleanup work.

## Related Plans Or Files

- .everything-automate/plans/2026-04-24-codex-only-repo-flattening-v1.md
- templates/
- scripts/install_global.py
- scripts/install_project.py
- scripts/install_codex_local_test.py
