---
name: issue-pick
description: Show open backlog issues from yhyuntak/everything-automate, let the user pick one, and turn it into a brainstorming-ready note.
argument-hint: "[optional issue number, backlog request, or pick-one request]"
---

# issue-pick

Use this in the EA repo when the user wants to start from a backlog GitHub issue instead of a fresh prompt.

## Purpose

`issue-pick` is a backlog intake skill.

Its job is to:

- read open backlog issues from `yhyuntak/everything-automate`
- show a short shortlist to the user
- let the user pick one issue
- read the chosen issue body and comments
- turn that issue into a brainstorming-ready note

## Use When

Use `issue-pick` when:

- the user wants to work from the EA backlog
- the user wants to choose one GitHub issue to discuss next
- the next step should start at `$brainstorming`

## Do Not Use When

Do **not** use `issue-pick` when:

- the user already has a clear new request and does not need backlog intake
- the user already approved a plan and wants implementation
- the user wants pure GitHub triage without starting work

If the user wants planning or implementation directly, use the normal workflow skill instead.

## Repo And Filter Contract

Use this fixed target in v1:

- repo: `yhyuntak/everything-automate`
- state: `open`
- label: `backlog`

Default ordering in v1:

- newest first

## Tool Rule

Use the GitHub app issue tools when available.

If GitHub issue read access is not available, stop and say so clearly.

## Interaction Policy

`issue-pick` is interactive.

Default rule:

- list a short backlog shortlist first
- keep the list easy to scan
- let the user choose by issue number or list number
- after selection, read the issue before reshaping it

Do not ask the user to browse GitHub manually first.

## Shortlist Shape

Show about 5 to 10 issues when possible.

For each one, show:

- issue number
- title
- one-line summary when useful

If there are no open backlog issues, say that clearly and stop.

## Brainstorming-Ready Note

After one issue is picked, reshape it into a short note that `$brainstorming` can start from.

Use this shape:

### Picked Issue

- number
- title
- URL

### Problem

What the issue is really about in plain words.

### Why It Matters

Why this is worth discussing now.

### Current Pain

What feels broken, slow, missing, or awkward.

### Possible Directions

One or two rough directions if they are already visible.

### Open Questions For Brainstorming

What `$brainstorming` should help answer next.

## Core Flow

```text
ask for backlog intake
  -> list open backlog issues
  -> user picks one
  -> read issue body and comments
  -> reshape into brainstorming-ready note
  -> continue with $brainstorming
```

## Stop Rule

`issue-pick` stops at the start of `$brainstorming`.

It should not:

- jump straight into `$planning`
- jump straight into `$execute`
- pretend the issue is already solution-ready

## Rules

- do not skip the shortlist unless the user already named one issue
- do not dump the full issue thread if a short note is enough
- do not turn issue-pick into broad GitHub backlog management
- do not skip ahead past `$brainstorming`
