# Operations Setup Checklist

Use this checklist for the operations domain during `$ea-docs setup`.

## Allowed Writes

- `docs/operations/README.md`

## Read Candidates

- root `README.md`
- `package.json`
- lockfiles
- `.env.example`
- app config files
- build or deploy config files
- existing setup, release, deploy, or operations docs

Never read real `.env` files.

## Fill

- install command
- dev server or local run command
- test/check commands if they are operations-level commands
- build/export/release commands
- environment variable names from examples only
- secret handling rules

## Rules

- Do not include real secret values.
- If a command is inferred from scripts, mark it as inferred or needs review when uncertain.
- If no deploy/release path is found, say so plainly.
