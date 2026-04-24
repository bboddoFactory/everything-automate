---
title: Codex-Only Repo Flattening v1
task_id: codex-only-repo-flattening-v1-2026-04-24
status: approved
approval_state: approved
plan_path: .everything-automate/plans/2026-04-24-codex-only-repo-flattening-v1.md
mode: direct
execution_mode: single_owner
execution_unit: AC
recommended_mode: execute
recommended_agents:
  - ea-worker
verification_policy: install-and-local-test-checks
verification_lane: mixed
open_risks:
  - Path churn can break installers or local test helpers if even one active `templates/codex/` reference survives.
  - Deleting inactive provider template directories can leave stale path references in historical docs that are outside the active runtime slice.
  - Existing dirty changes in `templates/codex/skills/ea-issue-capture/SKILL.md` and `templates/codex/skills/ea-issue-pick/SKILL.md` will move with the flattening change.
test_command: python3 scripts/install_global.py setup && python3 scripts/install_global.py doctor && python3 scripts/install_codex_local_test.py
---

# Requirements Summary

- Flatten the active Codex runtime source of truth from `templates/codex/` into flat paths under `templates/`.
- Keep Everything Automate clearly Codex-only in the active repo shape.
- Update active installer, local-test, and directly adjacent docs to the new flat paths.

# Desired Outcome

After this work:

- The active runtime source of truth lives directly under `templates/`.
- Active installers and local-test helpers no longer read from `templates/codex/`.
- Inactive provider template directories are removed from `templates/`.
- Active user-facing and adjacent runtime docs point at the flat paths.
- Global setup and local test setup still work after the move.

# In Scope

- Move active runtime assets out of `templates/codex/` into flat `templates/` paths.
- Update active scripts that read the template root.
- Update active test helpers and active runtime docs that point at `templates/codex/`.
- Remove inactive provider template directories under `templates/`.

# Non-Goals

- Do not scrub every historical doc, plan, or research note that mentions `templates/codex/`.
- Do not redesign runtime state helpers beyond path updates required by the flattening.
- Do not change the bootstrap/setup/doctor contract again.
- Do not touch unrelated dirty files beyond the path move that naturally carries them.

# Design Direction

Treat `templates/` itself as the Codex runtime root.

Target shape:

```text
templates/
  AGENTS.md
  INSTALL.md
  agents/
  hooks/
  hooks.json
  overlays/
  skills/
```

Update active code to read `ROOT / "templates"` as the runtime source.

Delete inactive provider folders from `templates/` once the active paths are moved:

- `templates/codex/`
- `templates/claude-code/`
- `templates/opencode/`
- `templates/internal/`

Keep historical references outside the active runtime slice for later cleanup.

# Test Strategy

Strategy: `mixed`

Use path and install verification:

- Re-read the moved runtime docs and confirm they point at flat template paths.
- Run global setup and doctor after the move.
- Run local test install after the move.
- Run targeted path searches and confirm active scripts no longer rely on `templates/codex/`.

# Task

## AC1: Active Runtime Assets Move To Flat Template Paths

The active runtime source of truth moves from `templates/codex/` into flat `templates/` paths.

### TC1.1

Inspect `templates/`.

Expected evidence:

- `templates/AGENTS.md` exists.
- `templates/INSTALL.md` exists.
- `templates/agents/`, `templates/skills/`, `templates/hooks/`, `templates/hooks.json`, and `templates/overlays/` exist.

### TC1.2

Inspect `templates/codex/`.

Expected evidence:

- The active runtime assets no longer depend on `templates/codex/`.

## AC2: Active Install And Local-Test Code Use The Flat Template Root

Installers and local-test helpers read the new flat runtime source.

### TC2.1

Read active scripts that materialize runtime assets.

Expected evidence:

- `scripts/install_global.py`
- `scripts/install_project.py`
- `scripts/install_codex_local_test.py`

These files read from `ROOT / "templates"` or equivalent flat paths, not `ROOT / "templates" / "codex"`.

### TC2.2

Run active setup and local-test helpers.

Expected evidence:

- Global setup still succeeds.
- Doctor still reports ready after setup.
- Local test install still succeeds.

## AC3: Active Docs And Tests Point At The Flat Paths

Active runtime docs and adjacent tests follow the flattened repo shape.

### TC3.1

Read the active runtime docs and test helper text.

Expected evidence:

- `README.md`
- `templates/INSTALL.md`
- `templates/AGENTS.md`
- `templates/skills/README.md`
- `scripts/test_codex_planning.sh`

These files point at flat `templates/` paths where needed.

### TC3.2

Search active scripts and directly adjacent docs for `templates/codex/`.

Expected evidence:

- No active runtime path dependency remains in the touched install/test/doc slice.

## AC4: Inactive Provider Template Directories Are Removed

The active source tree no longer carries inactive provider template roots beside the flat Codex runtime root.

### TC4.1

Inspect `templates/`.

Expected evidence:

- `templates/claude-code/` is removed.
- `templates/opencode/` is removed.
- `templates/internal/` is removed.

### TC4.2

Read `templates/README.md`.

Expected evidence:

- It describes `templates/` as the flat active runtime source of truth.
- It no longer describes provider-specific template ownership as the active repo model.

## Execute Handoff

Start with AC1 and AC2 together because the path move and script updates must land as one usable slice.

Then do AC3 docs/test alignment.

Finish with AC4 cleanup and one more install verification pass.
