---
title: QA Reviewer Routing And Specialization
status: approved
approval_state: approved
task_id: qa-reviewer-routing-and-specialization-2026-04-16
plan_path: .everything-automate/plans/2026-04-16-qa-reviewer-routing-and-specialization.md
mode: direct
execution_unit: AC
recommended_mode: execute
recommended_agents:
  - plan-arch
  - plan-devil
verification_lane: mixed
open_risks:
  - Reviewer routing may drift if file-based rules and intent-based rules are not kept simple.
  - A weak ambiguity rule may still let the main LLM guess instead of asking the user.
  - Reviewer split may add complexity if the shared QA judgment stage is not kept simple.
---

# QA Reviewer Routing And Specialization

## Task Summary

Redesign QA so it no longer always runs one cold reviewer over two mandatory lenses.

Instead, keep one QA stage, route into specialist reviewer lanes, and let the main LLM ask the user when the right lane is still unclear.

## Desired Outcome

Have a follow-up change set that:

- keeps `$qa` as one final review stage before commit
- replaces the current always-two-lenses reviewer model with routed reviewer lanes
- introduces a `code reviewer` lane for general code changes
- introduces a `harness reviewer` lane for skill, prompt, runtime-boundary, and contract work
- makes the main LLM choose one lane, both lanes for mixed work, or ask the user when the change is ambiguous
- keeps final QA judgment with the main LLM instead of scripts or subagents

## In Scope

- redesign QA skill text around routed reviewer lanes
- add specialist reviewer agent prompts for:
  - code reviewer
  - harness reviewer
- define clear routing rules and ambiguity handling
- update QA handoff requirements only as needed to support routing and reviewer focus
- align execute-to-QA wording if QA entry or handoff wording must change
- write or update decision notes for the new reviewer model

## Non-Goals

- add a score-based rubric system
- add threshold or floor mechanics
- add runtime-enforced routing in scripts
- add more reviewer lanes than code and harness in this change
- redesign the whole QA stage into a multi-agent debate system
- move final QA judgment away from the main LLM

## Design Direction

Use this QA shape:

```text
[Execute Result]
   |
   v
[QA Entry Check]
   |
   v
[Main LLM Routing]
- inspect change type
- inspect affected files
- inspect user intent if stated
- if clear:
    -> choose code reviewer
    -> choose harness reviewer
    -> or choose both for mixed work
- if unclear:
    -> ask user
   |
   v
[Specialist Reviewer Lane(s)]
- code reviewer
- harness reviewer
   |
   v
[Main LLM QA Judgment]
- pass
- fix
- planning only if truly needed
```

Use this routing rule:

- `code reviewer` is for general source-code quality, structure, error handling, tests, and maintainability
- `harness reviewer` is for skill behavior, prompt shape, workflow contract, packet shape, runtime/helper boundaries, and LLM-vs-script ownership
- if the change clearly touches both app/code behavior and harness contract behavior, run both reviewers
- if the change intent is unclear after reading the diff and relevant files, ask the user instead of guessing

Use this ownership model:

- the main LLM owns reviewer routing
- the main LLM owns the final QA judgment
- reviewer agents return findings inside their specialty
- scripts may help build handoff data but do not choose reviewers or verdicts

## Relevant Accepted Decisions

This work should respect:

- `DEC-001` Scripts Validate State Not Behavior
- `DEC-003` Auto QA Is A Skill Level Rule
- `DEC-004` Stable Workflow Contract Lives In AGENTS And Skills

This work should supersede the current two-lens QA decision in `DEC-002`.

## Test Strategy

The lane is `mixed`.

Verification should include:

- re-read updated QA skill text for:
  - one-stage QA with routed reviewer lanes
  - explicit ambiguity handling
  - clear final judgment ownership
- re-read new reviewer prompts for:
  - code-review focus staying code-focused
  - harness-review focus staying harness-focused
  - no accidental overlap that recreates the old vague two-lens reviewer
- verify any changed Python helpers with `python3 -m py_compile`
- run helper smoke tests if handoff helper fields or validation rules change
- re-read related decision notes for clean supersede/update semantics

## Task

### AC1. Replace The Old Two-Lens QA Model With Routed Reviewer Lanes

The QA design must stop describing one cold reviewer that always checks both code and behavior/contract lenses.

#### TC1

`templates/codex/skills/qa/SKILL.md` clearly says QA is one stage that routes into reviewer lanes.

#### TC2

The QA flow clearly allows:

- code reviewer only
- harness reviewer only
- both reviewers for mixed changes

#### TC3

The QA docs clearly say the main LLM should ask the user when the right reviewer lane is still unclear.

### AC2. Define The Code Reviewer Lane

The code reviewer lane must own the code-quality review responsibilities that fit general implementation work.

#### TC1

A dedicated reviewer agent file exists for the code reviewer.

#### TC2

The code reviewer prompt focuses on code-lens concerns such as:

- scope and cohesion
- structure and boundaries
- failure-path safety
- test fit
- maintainability

#### TC3

The code reviewer prompt avoids drifting into harness-specific ownership or prompt-contract review except when needed to explain a concrete code issue.

### AC3. Define The Harness Reviewer Lane

The harness reviewer lane must own the review responsibilities that fit this repo's skill, prompt, runtime, and contract surfaces.

#### TC1

A dedicated reviewer agent file exists for the harness reviewer.

#### TC2

The harness reviewer prompt focuses on harness concerns such as:

- workflow contract fit
- skill and prompt behavior
- handoff and input completeness
- LLM-vs-script ownership boundaries
- runtime/helper boundary safety

#### TC3

The harness reviewer prompt avoids turning into a general code reviewer except where harness defects require a concrete code-level note.

### AC4. Define Reviewer Routing And Ambiguity Handling

The main LLM must have a simple and reviewable rule for picking the reviewer lane.

#### TC1

The QA skill text defines routing signals such as:

- changed-file type
- affected surface
- task intent
- mixed-change detection

#### TC2

The QA skill text defines a clear ambiguity rule:

- do not guess when the right lane is still unclear
- ask the user which review focus matters

#### TC3

The routing model stays LLM-led and is not pushed into helper scripts.

### AC5. Keep QA Judgment Simple And Central

Reviewer specialization must not split the final QA verdict across multiple owners.

#### TC1

The QA flow still ends with one main-LLM judgment stage.

#### TC2

The verdicts remain simple:

- `pass`
- `fix`

#### TC3

The QA docs clearly say how findings from one or both reviewer lanes are merged into one next-step decision.

### AC6. Align Handoff And Decision Notes With The New Reviewer Model

The reviewer split must be reflected in the handoff and decision surfaces without widening them unnecessarily.

#### TC1

If the QA handoff changes, it only adds the minimum routing or review-focus support needed for specialist review.

#### TC2

`DEC-002` is updated or superseded so the repo no longer claims that QA always uses one two-lens reviewer.

#### TC3

A new or updated decision note clearly records that:

- QA stays one stage
- reviewer lanes are specialized
- routing stays with the main LLM
- ambiguity should be escalated to the user

## Execution Order

1. Redefine the QA model from mandatory two-lens review to routed reviewer lanes.
2. Add the code reviewer and harness reviewer prompts.
3. Rewrite QA routing and ambiguity handling in the QA skill.
4. Update any handoff wording or helper contract only if needed.
5. Update decision notes so the new reviewer model is explicit.
6. Re-read all touched QA docs for clear ownership and simple English.

## Open Risks

- If routing rules become too file-path-specific, the model may miss intent-driven mixed cases.
- If reviewer prompts overlap too much, the split will not reduce ambiguity in practice.
- If ambiguity escalation is weakly worded, the model may still guess instead of asking the user.

## Execute Handoff

- `task_id`: `qa-reviewer-routing-and-specialization-2026-04-16`
- `plan_path`: `.everything-automate/plans/2026-04-16-qa-reviewer-routing-and-specialization.md`
- `approval_state`: `approved`
- `execution_unit`: `AC`
- `test_strategy`: `mixed`
- `open_risks`:
  - Reviewer routing may drift if file-based rules and intent-based rules are not kept simple.
  - A weak ambiguity rule may still let the main LLM guess instead of asking the user.
  - Reviewer split may add complexity if the shared QA judgment stage is not kept simple.
