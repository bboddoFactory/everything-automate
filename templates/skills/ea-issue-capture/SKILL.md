---
name: ea-issue-capture
description: Capture an Everything Automate improvement idea from another project session and create a backlog GitHub issue in bboddoFactory/everything-automate.
argument-hint: "<EA improvement idea, pain point, missing feature, or raw context>"
---

# ea-issue-capture

Use this when work in another project reveals something that Everything Automate should improve.

## Purpose

`ea-issue-capture` is a backlog input skill.

Its job is to:

- capture an EA improvement idea without moving the whole session
- reshape rough context into a short GitHub issue
- create the issue in `bboddoFactory/everything-automate`
- add the `backlog` label
- return the created issue link

## Use When

Use `ea-issue-capture` when:

- you are in another project session
- you notice missing EA workflow help
- you notice a prompt, skill, or repo-flow pain point
- you want to save the idea now and handle it later in the EA repo

## Do Not Use When

Do **not** use `ea-issue-capture` when:

- the work should be fixed in the current repo, not in EA
- you already have the EA issue open and want to continue that work
- you want to plan or implement the EA change right now

If the idea should be handled now inside the EA repo, go there and use the normal flow instead.

## Repo And Label Contract

Use this fixed target in v1:

- repo: `bboddoFactory/everything-automate`
- label: `backlog`

Do not add extra labels in v1 unless the user explicitly asks for them.

## Tool Rule

Use the GitHub app issue tools when available.

If GitHub issue write access is not available, stop and say so clearly.

Do not pretend the issue was created if the tool call failed.

## Interaction Policy

`ea-issue-capture` is mostly non-interactive.

Default rule:

- if the idea already has enough context, create the issue directly
- if the title or core problem is too weak, ask one short question
- after that, create the issue

Do not run a long interview before capture.

## Issue Body Template

Keep the issue body short and useful.

Use this shape:

### Summary

What should improve in EA.

### Why This Matters

Why the missing behavior, gap, or pain matters.

### Observed In

Where this came from:

- repo
- task type
- workflow moment

### Current Pain

What feels slow, awkward, missing, or easy to forget right now.

### Suggested Direction

The rough direction if one is already visible.

### Raw Context

Only the most useful raw notes, quotes, or examples from the current session.

Do not dump the full conversation if a short extract is enough.

## Core Flow

```text
notice EA improvement idea
  -> restate the problem shortly
  -> shape issue title
  -> fill issue template
  -> create GitHub issue in bboddoFactory/everything-automate
  -> add backlog label
  -> return issue number and URL
```

## Output

After creation, return:

- issue number
- issue title
- issue URL

Keep the final report short.

## Rules

- do not turn capture into ea-planning
- do not spend time on duplicate hunting in v1
- do not add many labels in v1
- do not create the issue in the wrong repository
- do not hide tool failure
