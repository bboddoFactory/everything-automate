---
name: ea-docs
description: Set up, check, and maintain an LLM Wiki docs structure for a project, including doc impact checks after code or product changes.
argument-hint: "help | setup | check | impact | update | log"
---

# ea-docs

Use this skill for LLM Wiki setup and maintenance.

`ea-docs` is the user-facing command surface.

It should feel like a small CLI. The user should not have to memorize every command.

## Commands

### `help`

Show the available commands and when to use them.

Output:

```text
ea-docs commands

help
  Show this help.

setup
  Install or merge the LLM Wiki v0 docs shape into this project.

check
  Inspect whether the docs follow the LLM Wiki shape.

impact
  Read the final diff and suggest docs that need updates.

update
  Update docs after impact review.

log
  Append an important project knowledge change to docs/log.md.
```

### `setup`

Use when entering a new or existing project and the project needs the LLM Wiki docs shape.

Setup is adaptive:

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

Fresh project:

- create the LLM Wiki skeleton
- fill safe facts from project files
- leave thin domains as skeletons when facts are missing

Existing project:

- preserve existing docs
- create missing entry points
- link existing docs into the routing table
- mark stale or conflicting facts as `Needs review` or `Unresolved`

In v0, only these domains should be richly filled from project analysis:

- product
- architecture
- operations

Backlog, testing, decisions, and open questions should stay thin unless confirmed project facts already exist.

The main LLM writes `docs/README.md` last because it is the routing index.
The main LLM writes `docs/log.md` after setup.

### `check`

Use when docs may be stale or when validating setup.

Check:

- required LLM Wiki entry points exist
- `docs/README.md` is a routing table
- active docs do not require full scans by default
- open questions are not being used as a backlog
- stale workflow names are not present in active instructions

### `impact`

Use after implementation and before QA.

Read final diff first.

Then decide which docs may need updates:

- product scope or feature state
- architecture or data flow
- operations, env, setup, release
- testing or verification guidance
- backlog/work state
- accepted decisions
- open questions

Do not update every doc just because it exists.

### `update`

Use after impact review to update only the docs that changed meaning.

Rules:

- preserve useful existing docs
- mark inferred facts
- put unresolved conflicts in `docs/open-questions.md`
- update docs before QA

### `log`

Use to append an important project knowledge change to `docs/log.md`.

Do not log every small edit.

Good log entries:

- product scope changed
- docs system initialized
- provider changed
- test boundary changed
- major architecture decision accepted

## Domain Worker Rule

For setup and larger updates, use `ea-docs-worker` for bounded docs work.

Each worker gets:

- one domain
- one checklist
- explicit allowed write paths

This skill bundles the common LLM Wiki template under:

- `templates/llm-wiki/`

When installed locally, resolve checklist paths relative to the installed `ea-docs` skill directory, for example:

- `.codex/skills/ea-docs/templates/llm-wiki/checklists/product.md`

Workers may run in parallel only when their write scopes are disjoint.

V0 parallel setup domains:

| Domain | Checklist | Allowed writes |
|--------|-----------|----------------|
| product | `templates/llm-wiki/checklists/product.md` | `docs/product/README.md`, `docs/product/vision.md` |
| architecture | `templates/llm-wiki/checklists/architecture.md` | `docs/architecture/README.md`, optionally `docs/architecture/project-structure.md` |
| operations | `templates/llm-wiki/checklists/operations.md` | `docs/operations/README.md` |

The main LLM owns:

- `docs/README.md`
- `docs/log.md`
- final review
- deciding whether conflicts become open questions

## Read Policy

Do not scan all docs by default.

Read:

1. `docs/README.md`
2. only the docs routed by that index
3. final diff for impact checks

## Safety

- Do not read real `.env`.
- Do not copy secrets.
- Do not invent product truth.
- Do not invent backlog items.
- Do not invent test strategy.
- Do not invent decisions.
- Use simple English.
