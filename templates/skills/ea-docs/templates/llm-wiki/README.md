# LLM Wiki Template

This template gives every project the same documentation shape for LLM-led work.

The goal is not to make many docs. The goal is to give agents a stable map:

- where current project truth lives
- where work state lives
- where testing and operations guidance lives
- where unresolved questions go
- how to update docs without scanning everything

## Setup Model

Use this flow for `$ea-docs setup`:

```text
[Install Skeleton]
   |
   v
[Run Domain Workers In Parallel]
   |
   +---- product
   +---- architecture
   +---- operations
   |
   v
[Main Creates Thin Domains]
   |
   +---- backlog
   +---- testing
   +---- decisions
   +---- open-questions
   |
   v
[Main Writes Index]
   |
   v
[Main Writes Log]
```

Only `product`, `architecture`, and `operations` are filled from project analysis in v0.

Other domains start thin unless confirmed project facts already exist.

## File Contract

Required v0 entry points:

| Path | Role |
|------|------|
| `docs/README.md` | LLM Wiki index. Read first when docs matter. Routes readers to the smallest useful doc set. |
| `docs/log.md` | Important project knowledge changes. Not a full changelog. |
| `docs/open-questions.md` | Real conflicts and risky unknowns that could cause wrong work. Not a backlog. |
| `docs/product/README.md` | Product domain entry point. Links purpose, scope, feature truth, and roadmap material. |
| `docs/product/vision.md` | Current product purpose, users, scope, and non-goals. |
| `docs/architecture/README.md` | Current code and system shape. Links deeper architecture docs. |
| `docs/backlog/README.md` | Work-state entry point or link to the real tracker. |
| `docs/testing/README.md` | Verification map, quick checks, full checks, smoke checks, and known gaps. |
| `docs/operations/README.md` | Setup, environment, run, build, release, and deploy guidance. |
| `docs/decisions/README.md` | Accepted long-lived decisions, or a pointer to the accepted ADR folder. |

Optional files:

- deeper domain docs, such as `docs/architecture/project-structure.md`
- existing feature status, research, legal, policy, scenario, or discovery docs linked from `docs/README.md`
- an existing ADR folder if the project already uses one

Optional files should be linked from the index when useful. Do not move old docs only to match this template.

## Folders

```text
skeleton/docs/
  README.md
  log.md
  open-questions.md
  product/README.md
  product/vision.md
  architecture/README.md
  backlog/README.md
  testing/README.md
  operations/README.md
  decisions/README.md

checklists/
  product.md
  architecture.md
  operations.md
  thin-domains.md
```

## Rules

- Do not read all docs by default.
- Read `docs/README.md` first.
- Read only the docs needed for the task.
- Use final diff for actual doc updates.
- Update docs before QA when project truth changes.
- Mark inferred facts as `Needs review`.
- Put real conflicts in `docs/open-questions.md`.
- Do not invent backlog items, test strategy, or decisions during setup.
