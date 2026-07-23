npm -v# PRD — ClaimForge: AI Patent Claim Chart Refinement

**Author:** Product (APM candidate)  ·  **Status:** Draft v1  ·  **Last updated:** 2026-07-22
**Reviewers:** Eng, Design, Legal SME, GTM

---

## 1. TL;DR

Patent litigators spend hundreds of billable hours building **claim charts** — the
element-by-element tables that map each limitation of a patent claim to evidence in a
product or piece of prior art. The work is high-stakes, repetitive, and unforgiving:
a single weak or wrong citation can sink an infringement or invalidity contention.

**ClaimForge** is a **human-in-the-loop AI** workspace that refines claim charts
conversationally. A lawyer uploads a draft chart and the supporting documentation, then
*talks* to an assistant to strengthen evidence, sharpen reasoning, and fix errors — while
every AI suggestion stays a **proposal the lawyer must accept, reject, or undo**. The AI
accelerates the work; the attorney stays accountable for the record.

**The bet:** in legal AI, the winning product is not the one that automates the most —
it is the one lawyers *trust* enough to put their name on. Trust is the feature.

---

## 2. Problem & context

### The workflow
Claim charts sit at the center of **enterprise legal workflows** — patent litigation,
inter partes review (IPR), licensing, and freedom-to-operate analysis. A typical chart
maps 15–60 claim elements, each requiring: (a) a precise citation to a source document,
and (b) a reasoned argument that the citation satisfies the claim language.

### Why it hurts
- **Expensive & slow.** Charting is done by associates at $400–$1,000/hr; a single chart
  can take 20–80 hours. Firms eat write-offs; clients push back on bills.
- **High variance in quality.** Junior associates miss stronger evidence buried in a
  400-page spec; reasoning is inconsistent across elements.
- **Error cost is asymmetric.** A wrong citation isn't just a typo — it can be
  sanctionable, discoverable, and case-losing.

### Why now
LLMs are finally good enough to *draft* legal reasoning and retrieve evidence — but
raw LLMs **hallucinate citations**, which is precisely the failure mode this domain
cannot tolerate. The opportunity is not "AI writes the chart." It is **AI proposes,
the lawyer disposes** — a controlled, auditable loop that fits how legal work is
actually reviewed and signed.

---

## 3. Users & personas

| Persona | Role | What they need | Success looks like |
|---|---|---|---|
| **Maya — Litigation Associate** (primary) | Builds the chart | Speed without losing control or defensibility | Cuts charting time in half; every cite checks out |
| **David — Partner** (approver) | Signs the work | Confidence the chart is accurate and defensible | Reviews faster; fewer surprises in front of a judge |
| **Priya — Patent Agent / Technical Expert** | Supplies technical grounding | To flag where evidence is thin or wrong | Weak elements surfaced early, not the night before a deadline |

**Primary JTBD:** *"When I'm building a claim chart under deadline, help me find the
strongest evidence and articulate why it reads on the claim — without making me second-guess
whether the AI invented something."*

---

## 4. Goals, non-goals, and principles

### Goals (V1)
1. Reduce time-to-a-defensible-chart for a mapped element by **≥40%**.
2. Keep the human in control: **zero** AI change reaches the final document without an
   explicit human Accept.
3. Make every suggestion **explainable and traceable** back to a source.

### Non-goals (V1)
- Not auto-filing or auto-generating final legal work product without review.
- Not a document management system or a substitute for e-discovery tooling.
- Not giving legal advice or a "confidence score" that implies legal judgment.
- No multi-user real-time co-editing (fast-follow, not V1).

### Product principles
1. **Human-in-the-loop by default.** The AI is a drafting copilot, never the author of
   record. Every mutation is a *proposal* with Accept / Reject / Undo.
2. **Trust over automation.** We optimize for suggestions a lawyer will actually keep,
   not the raw number of edits generated.
3. **Explainability is non-optional.** No claim of evidence without a visible, checkable
   citation and a reasoning trail.
4. **Fail honest.** When the AI can't find support, it says so and asks for more input
   — it never fabricates to look complete.

---

## 5. Solution overview

A **split-screen conversational workspace** — the interaction model deliberately mirrors
how lawyers already work: *argue in prose, record in a table.*

- **Left — Conversational UX.** A ChatGPT-style assistant. The lawyer directs refinement
  in natural language ("strengthen the evidence for element 2", "the citation is wrong").
  Conversation lowers the learning curve to near zero and makes intent — not clicks — the
  interface. Suggested prompts scaffold users toward high-value actions.
- **Right — The claim chart canvas.** A live, Notion-like table (Patent Claim · Evidence ·
  AI Reasoning). This is the **system of record** and the object of trust. AI proposals
  render *as diffs on top of it*, never as silent overwrites.

The two panels enforce the core loop: **AI proposes on the left, human disposes on the
right.**

---

## 6. Key features & requirements

### 6.1 Conversational refinement (Conversational UX)
- Natural-language commands map to structured operations (strengthen evidence, improve
  reasoning, correct a cite, locate stronger support).
- Streaming/"typing" responses and suggested prompts reduce blank-page paralysis and set
  expectations that the assistant is *working with* the user.
- **Requirement:** ambiguous requests resolve to a specific claim element, or the assistant
  asks a clarifying question rather than guessing.

### 6.2 Proposal → disposition model (Human-in-the-loop AI)
- Every AI edit is a **staged proposal**, not a committed change.
- Per-row controls: **Accept**, **Reject**, **Compare Changes**, **Undo**.
- **Requirement:** no proposal mutates the final chart or export until a human accepts.
- **Requirement:** Undo restores the prior state, so the human can always walk a change back.

### 6.3 Change transparency (Explainability + Trust)
- Changed text is highlighted (green for additions); **Compare Changes** shows a full
  word-level diff (additions and deletions) so the lawyer sees *exactly* what changed.
- Every proposed piece of evidence carries its **source citation** (document + section),
  and reasoning explicitly ties the claim language to that evidence.
- **Requirement:** the reviewer can answer "what changed, why, and on what basis?" without
  leaving the row.

### 6.4 Honest-failure handling (Hallucination mitigation)
- When support cannot be found in the uploaded corpus, the assistant **declines to
  fabricate** and instead asks the user to upload another document or provide URLs.
- Elements without a grounded citation are visibly flagged ("Needs evidence") rather than
  silently filled.
- **Requirement:** the AI never presents unsourced text as a citation.

### 6.5 Export to enterprise workflow (Enterprise legal workflows)
- One-click **Export to Word** (`.doc`) — the format legal teams already file, redline,
  and circulate.
- Export preserves element, claim, evidence, reasoning, and disposition status.
- **Requirement:** exported output is clean work product a partner can review in-tool.

---

## 7. Hallucination mitigation strategy (deep-dive)

Because the cost of a fabricated citation is catastrophic in legal work, this is treated
as a **first-class product surface**, not an afterthought:

1. **Grounded-only evidence.** Proposed citations are drawn from the uploaded corpus; the
   assistant refuses to invent sources.
2. **Visible provenance.** Each cite shows document + section so it is checkable in seconds.
3. **Abstention over confabulation.** No-evidence → the AI says "I couldn't find support"
   and requests more input, rather than producing plausible-but-fake text.
4. **Diff-gated commits.** Because nothing lands without human Accept, a hallucination that
   does slip through is caught at the review gate — not in front of a judge.
5. **Correction loop.** "The evidence is incorrect" triggers an apology and a re-grounded
   replacement, keeping the human's correction authoritative.

*(V2)* per-citation confidence signals and a "verify against source" quote-locator.

---

## 8. Trust & explainability by design

Trust is earned through **predictability and reversibility**, and we design for both:

- **No silent changes** — the chart never edits itself.
- **Everything is reversible** — Undo and Reject mean the lawyer is never trapped by an
  AI action.
- **Everything is inspectable** — diffs + citations make the AI's work auditable at a glance.
- **Honest about limits** — flagged weak elements and explicit "can't find it" responses
  build calibrated trust (the user learns when to rely on the AI and when not to).

This is the moat: a model can be copied; a workflow lawyers *trust to sign* is sticky.

---

## 9. Success metrics

**North Star:** *Accepted, human-approved refinements per chart* — captures both AI
usefulness (it proposed something good) and trust (a human kept it).

| Layer | Metric | Target (V1) |
|---|---|---|
| Value | Time-to-defensible-element | −40% vs. manual baseline |
| Adoption | % charts refined in-tool | 30% of eligible matters in 2 quarters |
| Quality | **Suggestion acceptance rate** | ≥ 55% (too high = rubber-stamping risk; too low = noise) |
| **Trust guardrail** | Post-accept **Undo/edit rate** | < 10% (accepted changes stay accepted) |
| **Safety guardrail** | Fabricated-citation incidents | **0 tolerated**; tracked via review sampling |

**Counter-metric watch:** high acceptance + high downstream reversal = users trusting the
AI *too* much. We monitor for over-reliance, not just under-use.

---

## 10. Prioritization

| Priority | Item | Rationale |
|---|---|---|
| **P0 — Must** | Conversational refinement, proposal/Accept/Reject/Undo, diff highlighting, grounded evidence + citations, honest-failure handling, Word export | This *is* the trustworthy loop; without any one, the product isn't defensible |
| **P1 — Should** | Per-citation confidence, jump-to-source verification, audit log of every accept/reject | Deepens explainability & enterprise defensibility |
| **P2 — Could** | Multi-user review/approval routing, template libraries, matter-level analytics | Scales the workflow across a firm |
| **Won't (yet)** | Auto-file, unsupervised bulk charting | Violates the human-in-the-loop principle |

---

## 11. Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Hallucinated citation reaches a filing** | Catastrophic (sanctions, malpractice) | Grounded-only + abstention + human Accept gate + review sampling |
| **Over-reliance / rubber-stamping** | Erodes the very defensibility we promise | Diff-first UI forces a look; monitor reversal rate; friction on bulk-accept |
| **Low trust → non-adoption** | Product dies in pilot | Reversibility + transparency + honest limits; design for the skeptical partner |
| **Data/privilege exposure** | Deal-breaker for legal buyers | Enterprise security posture (isolation, retention controls) — gating requirement for GTM |

---

## 12. Rollout & open questions

**Rollout:** design-partner pilot with 2–3 firms → measure acceptance & reversal on real
matters → expand behind security/compliance review. Land with associates (who feel the
pain), expand to partners (who control the budget).

**Open questions**
1. What's the credible manual baseline for "time-to-defensible-element" per practice group?
2. Where's the acceptance-rate sweet spot before it signals rubber-stamping?
3. What audit trail do firms need to make AI-assisted charts defensible in court?
4. Build vs. integrate with existing DMS/e-discovery for the corpus?

---

### Appendix — one-line thesis
> The value isn't that AI drafts the claim chart. It's that a lawyer will **trust,
> verify, and sign** a chart the AI helped build — because the product kept them in
> control, showed its work, and never made something up.
