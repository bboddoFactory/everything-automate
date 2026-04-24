---
name: ea-qa
description: Review finished work before commit by routing into the right cold reviewer lane and then making one final QA judgment.
argument-hint: "[plan path, ea-execute result, or ready-for-review task]"
---

# ea-qa

Use this after `$ea-execute` and before `commit`.

`ea-qa` may be entered automatically after a normal successful `$ea-execute`.
It may also be run again explicitly when a rerun is needed.

## Purpose

`ea-qa` is the final review gate before commit.

Its job is to:

- review finished work with fresh eyes
- route the work into the right reviewer lane
- catch important problems without making the reviewer guess its job
- decide whether the work is ready for commit
- send the work back for fixes when needed

`ea-qa` is not:

- implementation
- ea-brainstorming
- full replanning

## Position In The Main Flow

```text
$ea-brainstorming
  -> $ea-planning
  -> $ea-execute
  -> $ea-qa
  -> commit
```

## Use When

Use `ea-qa` when:

- `$ea-execute` has finished enough work to review
- changed files exist
- test or check results exist
- the user wants a commit decision

## Do Not Use When

Do **not** use `ea-qa` when:

- implementation is still actively in progress
- there is no real result to review yet
- there are no changed files
- there are no test or check results to inspect

If that is the case, go back to `$ea-execute`.

## Core Flow

```text
ea-execute result
  -> QA entry check
  -> prepare QA handoff packet
  -> main LLM routes reviewer lane
     -> code reviewer
     -> harness reviewer
     -> both for mixed work
     -> ask user if still unclear
  -> collect findings
  -> main LLM judges findings
  -> decide
     -> pass
     -> fix and return to ea-execute
     -> return to ea-planning only if truly needed
```

## Entry Check

Before QA starts, make sure:

- there is finished enough work to review
- changed files or a diff exist
- test or check results exist
- a task summary or plan summary exists

If not, stop and say what is missing.

## QA Handoff Packet

Do not dump the full conversation into the reviewer.

Prepare a focused packet with:

- task summary
- desired outcome
- scope / non-goals
- short plan summary
- changed files or diff
- test or check results
- behavior goal
- LLM reads or decision inputs
- LLM-owned decisions
- script-owned validation
- contract changes
- open risks

This packet is the review input.

Use the installed helper in this skill:

- `scripts/build_handoff.py`

Build the packet before spawning the reviewer lane.

The helper should fail if the packet is missing the basics needed for a real review.

## Reviewer Routing

`ea-qa` stays one stage, but it should route into the right cold reviewer lane.

The main LLM owns that routing.

### Available Reviewer Lanes

- `ea-code-reviewer`
- `ea-harness-reviewer`

### Route To `ea-code-reviewer` When

Use `ea-code-reviewer` when the change is mainly about general code work such as:

- source code behavior
- structure and boundaries
- failure-path safety
- test quality
- maintainability

### Route To `ea-harness-reviewer` When

Use `ea-harness-reviewer` when the change is mainly about harness-facing work such as:

- skills
- agent prompts
- workflow contract text
- handoff shape
- runtime/helper boundaries
- LLM-vs-script ownership

### Route To Both When

Use both reviewers when the change clearly mixes both surfaces.

Examples:

- a code change that also changes skill or contract behavior
- a helper or runtime change that also changes normal implementation behavior
- a task where both code defects and harness defects are plausible first-order risks

### Ask The User When Routing Is Still Unclear

Do not guess when the right reviewer lane is still unclear after reading the changed files, diff, plan summary, and task intent.

Ask the user which review focus matters more, or whether both reviews are wanted.

## Cold Reviewer Rule

Any reviewer lane used by `ea-qa` should be cold.

"Cold" means:

- not the implementer
- not heavily biased by the full working conversation
- given only the focused review packet plus the routing context it needs

## Reviewer Focus

`ea-code-reviewer` should focus on code-lens concerns such as:

- scope and cohesion
- structure and boundaries
- failure-path safety
- test fit
- maintainability

`ea-harness-reviewer` should focus on harness concerns such as:

- workflow contract fit
- skill and prompt behavior
- handoff and input completeness
- LLM-vs-script ownership boundaries
- runtime/helper boundary safety

Focus on important problems.
Do not nitpick style.

## QA Judgment

The reviewer lane finds problems.

The main LLM running `ea-qa` must still judge those findings.

That means:

- decide which findings are true blockers
- separate real defects from weaker concerns
- merge findings from one or both reviewer lanes
- judge whether the work should:
  - `pass`
  - `fix`
  - rarely return to `$ea-planning`

`ea-qa` is not only a reviewer call.
It is the final review-and-judgment stage before commit.

## Verdicts

Use simple verdicts:

- `pass`
- `fix`

Only recommend going back to `$ea-planning` if the problem is truly at the plan level.

## Output

QA should return:

- verdict
- reviewer lane used
- important findings
- open risks
- recommended next step

## Rules

- Do not implement inside `ea-qa`.
- Do not reopen ea-planning casually.
- Do not block commit for tiny style preferences.
- Do not treat QA like a second execution loop.
- Do not guess the reviewer lane when the change is still ambiguous.
- After a normal successful `$ea-execute`, continue into `$ea-qa` in the same LLM-led workflow when the review inputs are ready.
- Do not describe this as a runtime-enforced script transition in this version.
- Use simple English.
- Put the verdict first.
- Keep findings grouped and easy to scan.
- If you explain the review flow, use a real ASCII flow chart instead of a simple arrow list.

## Installed Helper

This skill ships its own helper script:

- `scripts/build_handoff.py`

Do not depend on a repo-only runtime helper for the review packet.

## Completion

`ea-qa` is complete when:

- the review verdict is clear
- the reviewer lane choice is clear
- the important findings are clear
- the next step is clear
- the work is either ready for commit or clearly sent back for fixes
