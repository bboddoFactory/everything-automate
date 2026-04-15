---
title: Global Codex Setup v0
task_id: global-codex-setup-v0
status: draft
approval_state: draft
execution_mode: single_owner
verification_policy: local-script-and-dry-run
test_command: python3 -m py_compile scripts/install_codex_local_test.py runtime/ea_state.py runtime/ea_codex.py
---

# Requirements Summary

- Introduce a real install surface so `everything-automate` can be set up and used outside this repo.
- Make Codex the first actual install target.
- Keep the installer extensible so an internal company AI service can be added without redesigning the whole setup model.
- Reuse current `templates/` as source-of-truth rather than inventing a second install source.
- Keep v0 install behavior explicit, backup-safe, and understandable.

# Desired Outcome

After this work, the repo should have a provider-extensible installer shape where:

- Codex can be installed globally as the first supported target
- install behavior is explicit about what files it writes and where
- existing target files are backed up before replacement
- install logic is not hard-coded to Codex-only assumptions
- future provider targets can add their own install spec without rewriting the installer core

# In-Scope

- Define the v0 installer model for `everything-automate`
- Decide installer responsibilities vs provider adapter responsibilities
- Decide initial install targets for Codex
- Decide backup behavior and minimal doctor behavior
- Decide whether `config.toml` is in or out for v0
- Decide whether skills install into `~/.codex/skills` or another path for v0
- Define the minimum provider-extensibility contract for later internal-service support

# Non-Goals

- Fully implement internal-service installation right now
- Finalize OpenCode or Claude install paths right now
- Publish to npm or another package registry right now
- Design a full plugin marketplace story right now
- Solve every provider's config merge behavior in v0

# Decision Boundaries

- Codex is the first real install target
- The installer core must stay provider-extensible
- `templates/` remains the source-of-truth for distributable behavior
- v0 should prefer explicit file copy / materialization over magical behavior
- Backup before replacement is mandatory
- `config.toml` merge is optional and should be excluded unless clearly necessary
- Doctor can be minimal in v0
- v0 skills install into `~/.codex/skills/`
- partial install failure must stop immediately and report what was already materialized

# Problem Framing

## Problem Statement

`everything-automate` has real Codex template assets, but not yet a global installation path that turns those templates into a usable installed harness.

## Why Now

The project has crossed the point where local-only template experiments are not enough.
The next real proof is whether the Codex bundle can be installed and used as a harness.
At the same time, the installer should not trap the project into a Codex-only shape, because an internal company AI service is expected to follow soon.

## Success Definition

We can install the Codex bundle globally with a single setup command, understand exactly what it writes, recover from overwrite with backups, and see a clear path for adding an internal-service adapter later.

## Decision Drivers

- keep install behavior explicit and safe
- avoid Codex-only lock-in in the installer core
- minimize v0 ceremony and moving parts
- preserve `templates/` ownership
- enable future provider expansion with small adapters rather than installer rewrites

## Viable Options

### Option A. Codex-only installer

Build a simple installer that only knows how to write Codex files into Codex global paths.

Pros:
- fastest to ship
- least abstraction

Cons:
- likely needs redesign once internal-service support starts
- mixes installer logic and provider logic too early

### Option B. Provider-neutral installer core with Codex adapter

Build a small installer core in Python that:

- reads provider install specs
- performs backups
- materializes files
- runs minimal doctor checks

Then implement only the Codex adapter/spec in v0.

Pros:
- gives extensibility immediately
- keeps Codex as first concrete target without hard-coding everything
- fits current repo direction and existing Python utilities

Cons:
- slightly more design work than a Codex-only script

### Option C. Package-first installer

Design around eventual package publishing first, then shape install behavior around that.

Pros:
- clean long-term distribution story

Cons:
- premature for current maturity
- delays first usable global setup

## Recommended Direction

Choose **Option B**.

Build a small provider-neutral installer core in Python and ship **Codex** as the first concrete adapter/spec.

# Acceptance Criteria

- AC1. The plan defines a provider-neutral installer core and a Codex-specific v0 adapter/spec.
  - TC: The design clearly separates shared installer behavior from provider-specific install targets.
- AC2. The v0 Codex install surface is explicit.
  - TC: The plan names exactly which files or directories will be materialized for Codex.
- AC3. Backup behavior is mandatory and concrete.
  - TC: The plan defines where backups go and when they are created.
- AC4. The v0 scope avoids premature config complexity.
  - TC: The plan explicitly keeps `~/.codex/config.toml` out-of-scope in v0.
- AC5. The installer remains extensible for the internal company AI service.
  - TC: The plan defines the minimum provider adapter/spec contract that a future internal-service target would implement.
- AC6. The plan defines a minimal doctor surface.
  - TC: The plan includes a simple validation command that reports managed install root, managed assets found, missing assets, and latest manifest path when present.
- AC7. The plan preserves `templates/` as the only distributable source-of-truth.
  - TC: The plan does not introduce a parallel install-template source.
- AC8. The plan defines partial-failure behavior explicitly.
  - TC: The plan states whether install stops immediately on failure, what remains installed, and what the user can recover from backups.
- AC9. The v0 Codex skill install path is explicit.
  - TC: The plan explicitly installs Codex skills into `~/.codex/skills/` and treats alternate provider paths as adapter concerns.

# Verification Steps

- Re-read:
  - `references/codex-automate/README.md`
  - `references/codex-automate/src/cli.js`
  - `templates/codex/AGENTS.md`
  - `templates/codex/INSTALL.md`
  - `scripts/install_codex_local_test.py`
- Verify the plan explicitly answers:
  - installer language/runtime
  - provider boundary
  - Codex install targets
  - v0 skill install path
  - backup location
  - doctor scope
  - partial-failure behavior
  - `config.toml` policy
  - future internal-service extensibility path
- Run:
  - `python3 -m py_compile scripts/install_codex_local_test.py runtime/ea_state.py runtime/ea_codex.py`

# Implementation Order

1. Define the installer core responsibilities:
   - backup
   - file materialization
   - target-path resolution
   - minimal doctor checks
2. Define the provider adapter/spec contract:
   - provider name
   - install roots
   - install targets
   - path mapping rules
   - backup target mapping
   - optional post-install checks
3. Implement the Codex v0 adapter/spec:
   - `~/.codex/AGENTS.md`
   - `~/.codex/agents/*.toml`
   - `~/.codex/skills/{brainstorming,planning,execute}/`
4. Decide v0 policy for `~/.codex/config.toml`
   - final recommendation: leave out in v0
5. Add backup behavior:
   - `~/.codex/backups/<timestamp>/...`
6. Add a managed-asset manifest:
   - installed files and directories
   - provider name
   - install timestamp
7. Add minimal doctor:
   - detect installed files
   - report missing/extra managed assets
   - report managed install root and last install manifest when present
8. Define failure behavior:
   - stop immediately on the first failed materialization step
   - report which assets were already installed
   - keep created backups for manual recovery
9. Keep local test install path alive for development validation

# Risks and Mitigations

- Risk: installer is overfit to Codex and has to be rewritten for the internal service.
  - Mitigation: separate installer core from provider adapter/spec now.
- Risk: installer abstraction becomes too elaborate too early.
  - Mitigation: keep the provider contract tiny and implement only one real adapter in v0.
- Risk: writing to global paths is destructive.
  - Mitigation: backup before replacement and keep install targets explicit.
- Risk: `config.toml` merge becomes the hardest part of v0.
  - Mitigation: exclude it unless clearly necessary.
- Risk: template ownership drifts into install scripts.
  - Mitigation: keep `templates/` as the only distributable source-of-truth.
- Risk: local-test path diverges from global install behavior.
  - Mitigation: share path-mapping and materialization logic where possible.
- Risk: partial failure leaves the user unsure what was changed.
  - Mitigation: keep a managed-asset manifest and print installed-so-far plus backup paths on failure.

# Open Questions

- Does the internal company AI service want a path-based install model like Codex, or a different packaging/deployment shape?

# Angel Expansion

Missing work items to carry into implementation:

- define the exact provider adapter/spec shape as code-facing fields, not just prose
- decide whether global install should support `setup` only in v0 or include `doctor` in the first implementation slice
- define whether `AGENTS.md.global` has any role in install or stays as reference-only material
- define uninstall/restore expectations, even if full uninstall is deferred
- define what counts as a managed asset vs an ignored user-owned asset under `~/.codex/`

Missing edge cases:

- target directories do not exist yet
- target files already exist and are partially user-modified
- one asset installs successfully and a later asset fails
- Codex install succeeds but doctor reports a partial mismatch
- future internal-service adapter needs a non-filesystem install step

Useful improvements:

- keep a small install manifest of managed files
- treat backup and doctor output as first-class user-facing behavior
- keep path mapping logic shared between local test install and global install
- add a dry-run mode after setup works

# Architect Review

- Recommended approach: build a tiny installer core in Python and implement Codex as the first provider adapter/spec.
- Keep the shared core responsible only for:
  - backup
  - file copy/materialization
  - target-path resolution
  - managed-asset manifest
  - minimal doctor checks
- Keep provider adapters responsible only for:
  - install targets
  - source-to-target path mapping
  - optional provider-specific checks
- Exclude `config.toml` from v0 unless setup is clearly unusable without it.
- Prefer `~/.codex/skills/` for v0 so the first target stays conceptually local to Codex.
- Stop immediately on partial failure and surface installed-so-far plus backup information rather than attempting clever rollback in v0.
- Keep the internal company AI service as a future second adapter rather than baking its assumptions into Codex v0.

Structural conclusion:

```text
templates/
  -> provider adapter/spec
  -> installer core
  -> setup
  -> ~/.codex/*

later
  -> internal-service adapter/spec
```

# Devil Validation

Verdict: iterate

Critical gaps still to close:

- the plan says `doctor` is minimal and now needs a concrete first implementation output shape
- failure handling for partial installs is now explicit in principle but still needs exact UX wording in implementation
- rollback behavior is not defined beyond backup creation
- future internal-service adapter contract still needs one more round of concretization during implementation

Required revisions carried forward:

- make the v0 managed asset set explicit
- define the minimum doctor output
- define partial failure reporting shape
- keep `config.toml` out unless a specific blocked use case forces it in

# Self-Check

- placeholder scan: pass
- AC/testability check: pass for plan level
- handoff completeness check: pass
- implementation-order sanity check: pass
- unresolved contradiction check: one remaining decision on v0 skill install path
  - resolved: use `~/.codex/skills/` for Codex v0

# Execution Handoff

- task_id: `global-codex-setup-v0`
- plan_path: `.everything-automate/plans/2026-04-06-global-codex-setup-v0.md`
- approval_state: `draft`
- execution_unit: `AC`
- recommended_mode: `consensus`
- recommended_agents:
  - `explorer`
  - `angel`
  - `architect`
  - `devil`
- verification_lane: `reference-read + python-py_compile`
- open_risks:
  - internal-service install model is not yet known in enough detail
  - doctor output shape still needs to be fixed during implementation
  - partial install failure UX still needs to be made concrete in code
