---
name: ea-feedback-router
description: Classify user feedback during repo work and recommend the next EA route: fix now, save to `ea-backlog`, capture an Everything Automate improvement with `ea-issue-capture`, or move to `ea-north-star`, `ea-brainstorming`, `ea-planning`, or `ea-execute`.
argument-hint: "<user feedback or follow-up idea>"
---

# ea-feedback-router

Use this when user feedback appears during a repo session and the right destination is not obvious yet.

## Purpose

`ea-feedback-router` is a small routing skill.

Its job is to:

- classify the feedback
- recommend the smallest useful next route
- keep current work from drifting
- send local product feedback to `ea-backlog`
- send Everything Automate improvements to `ea-issue-capture`
- send implementation-ready work to the normal EA workflow

## Route Table

| Feedback type | Route | Why |
| --- | --- | --- |
| Current task bug or regression | Fix now, or use `$ea-planning` then `$ea-execute` | It affects the active work. |
| Current repo product, feature, UX, research, or bug idea for later | `ea-backlog` | It belongs to this repo and should stay local for now. |
| Everything Automate workflow, skill, agent, setup, or runtime improvement found from another repo | `ea-issue-capture` | It belongs in the EA upstream backlog. |
| Fuzzy product direction or unclear goal | `$ea-north-star` | The target needs to be locked before milestones. |
| Chosen milestone with unclear design | `$ea-brainstorming` | The design needs a bounded conversation before planning. |
| Clear implementation request without a plan | `$ea-planning` | The work needs an execution plan. |
| Approved plan ready to build | `$ea-execute` | The work is ready for TC-first execution. |
| Finished work needing review before commit | `$ea-qa` | The change needs a final review gate. |

## Default Behavior

Start with the recommendation.

Use this shape:

```text
Recommended route: <route>
Reason: <one short reason>
Next action: <what I will do or what I need from the user>
```

If the user already asked to save local feedback, use `ea-backlog`.

If the route would create an external GitHub issue, ask for confirmation before writing.

If the route is obvious and low-risk, state the assumption and proceed.

## Local Backlog Rule

Use `ea-backlog` when all of these are true:

- the feedback belongs to the current repository
- it is not the current fix
- it should be remembered
- it does not need to become a GitHub issue right now

Default storage is `.backlog/`.

## Everything Automate Issue Rule

Use `ea-issue-capture` when all of these are true:

- the feedback is about EA itself
- the work is not meant to be fixed in the current repo right now
- the user wants it saved as upstream follow-up

Because this creates an external issue, confirm before writing unless the user clearly asked for issue capture.

## Core Flow

```text
[User feedback]
   |
   v
[Classify feedback target]
   |
   +-- current repo, later --> [ea-backlog]
   |
   +-- EA upstream, later --> [ea-issue-capture]
   |
   +-- active bug now --> [fix now or plan/execute]
   |
   +-- fuzzy goal --> [ea-north-star]
   |
   +-- unclear design --> [ea-brainstorming]
   |
   +-- clear build work --> [ea-planning or ea-execute]
```

## Rules

- route before expanding scope
- prefer the smallest useful next step
- do not turn every comment into a backlog item
- do not create external issues without confirmation
- do not hide uncertainty; ask one short question if the target is unclear
- keep the answer short enough that the user can accept or redirect quickly
