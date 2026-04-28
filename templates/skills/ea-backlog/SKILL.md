---
name: ea-backlog
description: Manage the current repository's local product, feature, UX, research, and bug backlog in `.backlog/`. Use when the user wants to save, append, review, organize, or promote repo-local backlog feedback without creating external issues.
argument-hint: "<feedback, idea, backlog action, or item title>"
---

# ea-backlog

Use this when the user wants to keep a current-repo idea without turning it into a plan, code change, or external issue yet.

## Purpose

`ea-backlog` is a repo-local backlog skill.

Its job is to:

- create `.backlog/` when needed
- save product, feature, UX, research, and bug follow-up ideas
- keep ideas easy to review later
- avoid interrupting the current milestone
- avoid creating external issues unless the user explicitly asks for that

## Use When

Use `ea-backlog` when:

- the feedback belongs to the current repository
- the idea should be remembered, but not implemented now
- the user asks to save feedback, make a backlog item, or park an idea
- the user wants to review or organize local backlog items
- a local product backlog is better than a GitHub issue

## Do Not Use When

Do **not** use `ea-backlog` when:

- the user wants to fix the issue now
- the next step is already clear enough for `$ea-planning` or `$ea-execute`
- the idea is an Everything Automate workflow or skill improvement found while working in another repo
- the user explicitly asks to create a GitHub issue

For Everything Automate improvements found from another project, use `ea-issue-capture`.

## Storage Contract

Use this fixed location in the current repository:

```text
.backlog/
```

Create `.backlog/README.md` if it is missing.

Default to `.backlog/product.md` for new items unless:

- the user names a file
- an existing backlog file clearly matches the topic
- the idea is better grouped into a small topic file, such as `.backlog/workbench-ux.md`

Do not write backlog items under `.everything-automate/`.

## README Template

Use this shape when creating `.backlog/README.md`:

```md
# Local Backlog

This folder stores repo-local product, feature, UX, research, and bug follow-up ideas.

Use this when:

- the idea belongs to this repository
- the idea is real
- it is not urgent
- it should not interrupt the current milestone
- it should stay local instead of becoming an external issue right now

Move an item into a milestone or plan only when we decide to work on it.
```

## Item Shape

Append concise Markdown cards.

Use this shape:

```md
### <Short Title>

Type:
<product | feature | UX | research | bug | cleanup>

Status:
Backlog.

Context:
<Where this came from.>

Problem:
<What feels wrong, missing, slow, confusing, or risky.>

Why it matters:
<Why this should not be forgotten.>

Possible direction:
<A small next direction if one is visible.>
```

If the item came from a user quote, keep only the useful short quote or paraphrase.
Do not dump a whole conversation.

## Core Flow

```text
[User feedback]
   |
   v
[Confirm it is current-repo backlog]
   |
   v
[Find or create .backlog/]
   |
   v
[Choose the smallest useful Markdown file]
   |
   v
[Append or update one concise item]
   |
   v
[Report the saved path and title]
```

## Interaction Policy

`ea-backlog` should stay light.

Default rule:

- if the title and destination are clear, write the item
- if the destination is unclear, choose a simple default
- if the core idea is unclear, ask one short question

Do not run a long interview before saving a backlog item.

## Output

After saving, return:

- the backlog file path
- the item title
- whether it was added or updated

Keep the report short.

## Rules

- use `.backlog/` as the fixed default storage location
- do not write outside the current repository
- do not create GitHub issues
- do not turn backlog capture into planning
- do not over-categorize
- preserve existing backlog text
- keep cards short and scan-friendly
