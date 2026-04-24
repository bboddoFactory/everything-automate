---
name: ea-blueprint
description: Turn one chosen milestone into a buildable design spec before planning.
argument-hint: "<locked milestone artifact or blueprint request>"
---

# ea-blueprint

Use this after Milestone and before Planning.

`ea-blueprint` turns one chosen milestone into a buildable design spec, then hands that design to planning.

## State

Use the single workspace active file:

- `.everything-automate/state/active.md`

Use the template at:

- `.codex/skills/ea-blueprint/templates/active.md`

Do not create mode-specific active files.

If `.everything-automate/state/active.md` already exists and belongs to Blueprint, continue from that file instead of creating a second blueprint file.

If the existing active file belongs to another workflow or conflicts with the current blueprint session, stop and ask before overwriting it.

Accepted blueprint outputs archive under:

- `.everything-automate/state/blueprint/archive/`

When the blueprint is accepted, archive the active file as the accepted blueprint output and then remove `.everything-automate/state/active.md` so hooks return to no-op.

## Inputs

Blueprint starts from:

- one chosen milestone from the locked milestone roadmap

It may also read:

- the parent locked North Star archive

The milestone is the primary input.
The parent North Star is supporting context only.

Blueprint should not reopen the final goal unless the user explicitly moves back a stage.

## v0 Target Kinds

Classify the chosen milestone into one of these target kinds:

- `code-change`
- `harness-workflow`
- `docs-knowledge`
- `general`

`docs-knowledge` includes more than maintenance docs. Use it for documentation, guides, research summaries, comparison analyses, decision reports, audit-style writeups, and other reader-facing artifacts where the main output is a knowledge artifact rather than a code change.

Load one matching reference file by default:

- `code-change` -> `references/code-change.md`
- `harness-workflow` -> `references/harness-workflow.md`
- `docs-knowledge` -> `references/docs-knowledge.md`
- `general` -> `references/general.md`

Only load extra reference files when the primary reference is not enough.

Before drafting, briefly tell the user:

- the target kind you chose
- the reference file you loaded
- the interaction style you will use for that kind

Then ask whether to continue, correct the classification, or stop.

## Required Lifecycle

Follow this lifecycle:

```text
[Read Source Goal Or Milestone]
   |
   v
[Classify Target Kind]
   |
   v
[Load One Matching Reference]
   |
   v
[Brief User And Ask]
   |
   v
[Draft Blueprint]
   |
   v
[Brief Draft In Plain Language]
   |
   v
[Type-Specific User Refinement]
   |
   v
[Read-Test]
   |
   +---- fail ----> [Show Problem, Risk, Smallest Fix]
   |                    |
   |                    v
   |               [Ask User Direction]
   |                    |
   |                    +---- revise ----> [Rerun Read-Test On Whole Blueprint]
   |                    |
   |                    +---- stop ------> [Leave Active Blueprint Open]
   |
   +---- pass ----> [Optional One-Time Design Review]
                        |
                        v
                   [Record Known Risks]
                        |
                        v
                   [Final Brief And Ask To Accept]
```

The first draft is not gate-ready by default. Use the loaded reference to brief the user on the important design pressure for that target kind, then ask the narrow question that matters most for the current draft.

If user feedback changes or blurs the target kind, reclassify, load the newly matching reference, brief the user again, and continue from that point.

If the user asks for a design change after read-test passes, treat it as a new refinement and rerun read-test on the whole Blueprint before acceptance.

## Blueprint Frame

Use this classification frame while drafting:

- `Blueprint Design Material`
- `Open Question`
- `Handoff Note`
- `Parking Lot`

## Acceptance Gates

Before accepting a blueprint, run:

1. `Interpretation Read-Test` as the hard gate
2. `Design Review` as an optional one-time advisory check

`Interpretation Read-Test` is interpretation-only. Use 3 agents to confirm they read the same target, scope, and design shape from the blueprint. Do not ask them to judge design quality.

If read-test fails, summarize the problem, risk, and smallest fix. Ask the user before changing the blueprint. After an approved change, rerun read-test on the whole current blueprint, not only the changed part.

`Design Review` is design-only and advisory by default. Use 1 `GPT-5.4` agent with `xhigh` reasoning when it is helpful to check the design itself. Do not ask it for TC breakdowns, file order, worker assignment, or test command sequences.

Do not let design review create an endless revision loop. Run it at most once by default, summarize findings as known risks and suggested fixes, then ask the user whether to revise or continue toward planning with the risks recorded.

Read-test pass plus explicit user acceptance is enough to accept the blueprint, even if advisory design review has remaining known risks.

Before any structured choice, brief the user in plain language:

- what was produced or found
- why it matters
- the recommended next step
- what each choice means

Before final acceptance, briefly summarize the final design shape, the main user-controlled stop points, the important non-goals, and what planning receives next.

## Boundary

Blueprint owns:

- design shape
- architecture and boundaries
- ownership
- data and control flow
- abstraction choices
- tradeoffs

Planning owns:

- AC and TC shape
- execution order
- file-level work
- worker handoff
- verification details

`Execution-Shape Sufficiency` means the design is clear enough on components, boundaries, ownership, flows, and decisions that planning does not invent the core shape. It does not require TC slices, file edit order, worker assignment, or verification command details.
