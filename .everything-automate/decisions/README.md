# Decision Notes

This directory stores short decision notes for settled choices that future sessions should remember.

## Purpose

Use this directory for choices that are already accepted and should survive:

- compaction
- long-running work
- agent switches
- later planning sessions

## Use This For

Write or update a decision note when:

- a meaningful design or workflow choice becomes accepted
- the choice is broader than one small implementation detail
- future work would likely repeat the same discussion without a note

## Do Not Use This For

Do not write a decision note for:

- open brainstorming options
- tiny implementation details
- short-lived execution notes that only matter inside one plan

## Split From Plans

Use this rule of thumb:

- `plans/` answer: how do we execute this work now?
- `decisions/` answer: what did we already choose, and why?

## Note Format

Each decision note should stay short and include:

- title
- status
- date
- decision id
- context
- decision
- consequences
- related plans or files

## Status

Use simple states:

- `accepted`
- `superseded`
- `dropped`

## File Naming

Use:

- `.everything-automate/decisions/{decision-id}-{slug}.md`

Example:

- `.everything-automate/decisions/DEC-001-scripts-validate-state-not-behavior.md`
