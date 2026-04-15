---
name: qa
description: Review finished work before commit by routing into the right cold reviewer lane and then making one final QA judgment.
argument-hint: "[plan path, execute result, or ready-for-review task]"
---

# qa

Use this after `$execute` and before `commit`.

`qa` may be entered automatically after a normal successful `$execute`.
It may also be run again explicitly when a rerun is needed.

## Purpose

`qa` is the final review gate before commit.

Its job is to:

- review finished work with fresh eyes
- route the work into the right reviewer lane
- catch important problems without making the reviewer guess its job
- decide whether the work is ready for commit
- send the work back for fixes when needed

`qa` is not:

- implementation
- brainstorming
- full replanning

## Position In The Main Flow

```text
$brainstorming
  -> $planning
  -> $execute
  -> $qa
  -> commit
```

## Use When

Use `qa` when:

- `$execute` has finished enough work to review
- changed files exist
- test or check results exist
- the user wants a commit decision

## Do Not Use When

Do **not** use `qa` when:

- implementation is still actively in progress
- there is no real result to review yet
- there are no changed files
- there are no test or check results to inspect

If that is the case, go back to `$execute`.

## Core Flow

```text
execute result
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
     -> fix and return to execute
     -> return to planning only if truly needed
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

`qa` stays one stage, but it should route into the right cold reviewer lane.

The main LLM owns that routing.

### Available Reviewer Lanes

- `code-reviewer`
- `harness-reviewer`

### Route To `code-reviewer` When

Use `code-reviewer` when the change is mainly about general code work such as:

- source code behavior
- structure and boundaries
- failure-path safety
- test quality
- maintainability

### Route To `harness-reviewer` When

Use `harness-reviewer` when the change is mainly about harness-facing work such as:

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

Any reviewer lane used by `qa` should be cold.

"Cold" means:

- not the implementer
- not heavily biased by the full working conversation
- given only the focused review packet plus the routing context it needs

## Reviewer Focus

`code-reviewer` should focus on code-lens concerns such as:

- scope and cohesion
- structure and boundaries
- failure-path safety
- test fit
- maintainability

`harness-reviewer` should focus on harness concerns such as:

- workflow contract fit
- skill and prompt behavior
- handoff and input completeness
- LLM-vs-script ownership boundaries
- runtime/helper boundary safety

Focus on important problems.
Do not nitpick style.

## QA Judgment

The reviewer lane finds problems.

The main LLM running `qa` must still judge those findings.

That means:

- decide which findings are true blockers
- separate real defects from weaker concerns
- merge findings from one or both reviewer lanes
- judge whether the work should:
  - `pass`
  - `fix`
  - rarely return to `$planning`

`qa` is not only a reviewer call.
It is the final review-and-judgment stage before commit.

## Verdicts

Use simple verdicts:

- `pass`
- `fix`

Only recommend going back to `$planning` if the problem is truly at the plan level.

## Output

QA should return:

- verdict
- reviewer lane used
- important findings
- open risks
- recommended next step

## Rules

- Do not implement inside `qa`.
- Do not reopen planning casually.
- Do not block commit for tiny style preferences.
- Do not treat QA like a second execution loop.
- Do not guess the reviewer lane when the change is still ambiguous.
- After a normal successful `$execute`, continue into `$qa` in the same LLM-led workflow when the review inputs are ready.
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

`qa` is complete when:

- the review verdict is clear
- the reviewer lane choice is clear
- the important findings are clear
- the next step is clear
- the work is either ready for commit or clearly sent back for fixes
