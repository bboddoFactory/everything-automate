# Architecture Setup Checklist

Use this checklist for the architecture domain during `$ea-docs setup`.

## Allowed Writes

- `docs/architecture/README.md`
- `docs/architecture/project-structure.md` only when already in scope

## Read Candidates

- file tree
- root `README.md`
- package/config files
- existing `docs/architecture/`
- source directory names
- service/module names

Do not inspect implementation details unless needed to describe the project shape.

## Fill

- app or package type
- main source directories
- framework and runtime hints
- major service/module areas
- important existing architecture docs
- stale or needs-review architecture warnings

## Rules

- Describe current code structure, not desired future structure.
- Do not infer deep architecture intent from file names alone.
- Link existing docs instead of rewriting them.
- Mark inferred facts as `Needs review`.
