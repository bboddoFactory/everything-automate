# Docs Knowledge

Use when the blueprint is about documentation, knowledge capture, indexes, report design, comparison analysis, audit-style writeups, or decision-support artifacts.

Design forces:
- Keep the source of truth clear.
- Match the document shape to the reader and use case.
- Prevent drift between the document and the system or evidence it describes.
- Make the supported decision or reader outcome explicit.
- Separate verified facts from interpretation, judgment, and open uncertainty.

Risk hints:
- Stale or duplicate docs.
- Too much detail for the intended reader.
- Missing ownership or update path.
- A document that looks complete but does not support the real decision.
- Report drift where planning has to invent the core structure, evidence model, or recommendation logic.

Output focus:
- Document structure, section shape, update rules, and source links.
- What evidence classes exist and how they should be labeled.
- What conflicts or ambiguities must be surfaced instead of smoothed over.
- What needs to stay aligned as the system or evidence changes.

For analysis, comparison, audit, or decision-report targets:
- Identify the decision, question, or reader outcome the artifact must support.
- Define what reader or user context must be captured before the final recommendation or conclusion.
- Define the main comparison axes or evaluation categories before planning.
- Define evidence source classes such as repository code, official docs, release notes, advisories, maintainer statements, and public claims.
- Define evidence confidence or status labels such as `verified`, `inferred`, and `unverified` when the artifact depends on mixed source quality.
- Define how to handle source conflicts, especially code-versus-doc mismatches.
- Require source snapshot metadata when recency matters, such as repo commits inspected, report date, doc access date, and relevant release or advisory dates.
- Define what counts as enough depth so the blueprint does not silently expand into exhaustive research.
- Define the recommendation outcomes or conclusion shapes when the artifact is meant to support a decision.
- Reject generic tables or summaries when the North Star requires a recommendation, comparison, or audit judgment.
