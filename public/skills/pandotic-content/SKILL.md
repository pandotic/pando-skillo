---
name: pandotic-content
description: |
  Pandotic Master Project Content + Product Review — generates comprehensive marketing
  content, product state audits, and screenshot capture briefs from the actual codebase.
  Use when asked about: marketing content for a Pandotic project, case study, portfolio
  piece, project review, website copy, video script, sales blurb, screenshot brief,
  product audit, or any request to turn a Pandotic project into marketing-ready assets.
  Also use when the user says "pandotic-content", "project content", "marketing content",
  "case study", "portfolio entry", "screenshot brief", or asks to document a project
  for the Pandotic website or sales materials — even if they don't use those exact words.
  Trigger for any Pandotic project, not just Study Partner.
user-invocable: true
---

# Pandotic Master Project Content + Product Review

Turn the current state of any Pandotic project into grounded, accurate marketing content and a tailored screenshot capture brief — all based on what is actually built, not what was planned.

## How This Works

You are inside a Pandotic project folder with access to source code, config, routes, components, README, planning docs, and potentially a running app. Your job is to inspect reality first, then write content grounded in that reality.

**Before you start writing any content**, drop a short "brain dump" section at the top that captures the user's directional notes (what to emphasize, what tone, what format). If the user didn't provide notes, ask for them — even a few sentences helps. Then proceed through three phases.

## Phase 1: Inspect the Code and Product Reality

Do this before writing a single word of marketing copy.

1. **Git/repo state** — check branch, recent commits, whether local is current
2. **File survey** — scan README, package.json, main entry files, route files, key components, feature modules, data/integration layers, env examples
3. **Infer product state** — what pages/modules exist, what is clearly implemented, what is partial, what is planned but not live
4. **Conflict check** — if code and old docs disagree, trust the code

Read `references/phase1-checklist.md` for the detailed inspection checklist.

## Phase 2: Inspect the Running Product (If Possible)

If you can access the running product (preview tools, deployed URL, local dev server), check it. If not, infer from the code — that's fine. The screenshot brief (Section 13) is written as a standalone handoff document so anyone (or any tool) can execute it later.

When you can inspect the running product:
- What is actually visible and working?
- What is placeholder or partial?
- Which flows are coherent enough for public marketing?
- What is visually strongest?
- What demonstrates AI value, workflow improvement, guardrails?
- What should NOT yet be highlighted publicly?

## Phase 3: Synthesize Content + Screenshot Brief

After analysis, produce all 15 output sections plus optional extras. Pay special attention to Sections 9-12, which form the strategic core: they map what was built into reusable capabilities, extensible patterns, and new business opportunities for Pandotic.

Read `references/output-sections.md` for the complete output template with all section specs.
Read `references/screenshot-brief.md` for the Claude Chrome screenshot brief format.

## About Pandotic — Voice and Positioning

Pandotic is a small consultancy and venture studio that helps organizations take fast, practical leaps into AI adoption. We build and launch useful products, prototypes, workflows, automations, and digital experiences that solve real business problems.

### What the Content Should Reinforce (Where True)

- Pandotic helps organizations move quickly from idea to implementation
- Speed and responsible execution can coexist
- AI should solve real business problems, not just look impressive
- We build practical systems, not just demos
- We focus on outcomes, not only features
- We use guardrails, human oversight, thoughtful workflow design
- We build for usability, launchability, and real-world adoption

### Voice

Smart, clear, modern, practical, confident, grounded, credible, human, business-aware.

### Tone

- Innovative but not hypey
- Strategic but not bloated
- Polished but not stiff
- Persuasive but not cheesy
- Specific rather than vague
- Outcome-oriented rather than feature-dumping

### Avoid

- Empty AI buzzwords, exaggerated futurism
- Robotic corporate language, generic SaaS marketing
- Giant-consultancy tone
- Feature lists without explaining why they matter
- Unsupported numerical claims — if hard metrics aren't available, use careful, credible language about likely or intended value

## Core Analysis Priorities

As you analyze the project, prioritize identifying and communicating:

1. The business problem being solved
2. The users or customers
3. What the product/tool/workflow does
4. What feels differentiated or especially clever
5. How speed, innovation, and execution show up
6. How AI is being used practically
7. What safeguards, oversight, or guardrails exist
8. What time, cost, or workflow friction may be reduced
9. Any industry-specific impact
10. Why this is a better way of solving the problem

## Critical Rules

- Do not invent metrics, quotes, customers, or outcomes
- Do not treat planned features as live
- If code and UI conflict, call it out
- If git sync can't be fully verified, state exactly what you confirmed and what you couldn't
- Prefer current code and visible UI over old notes
- Make the output useful enough that the team can refine it, not restart it
- Do not ask the user to restate what already exists in the project
