# ClaimForge — AI Patent Claim Chart Refinement

A production-quality, front-end-only React app for refining patent claim charts
conversationally. It feels like **ChatGPT + Notion + Linear**: a chat assistant on
the left, a live claim-chart table on the right. Everything is **mocked** — no backend.

## Stack

- **React 18** + **Vite 5**
- **TailwindCSS 3** with a shadcn/ui-style component layer (`src/components/ui`)
- **Framer Motion** for animations, **lucide-react** for icons

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview
```

> Tip: append `?demo` to the URL (e.g. `http://localhost:5173/?demo`) to skip the
> upload step and jump straight into the workspace with sample files.

## Features

### Landing page
- Upload **Claim Chart** and **Product Documentation** (drag & drop or browse)
- Optional, collapsible **System Instructions**
- Simulated "Analyzing documents…" loading state before entering the workspace

### Split-screen workspace
**Left — Conversation** (ChatGPT-like)
- Streaming **typing animation** for assistant replies + animated typing indicator
- **Suggested prompts**: _Strengthen evidence for element 2_, _Improve AI reasoning_,
  _Find stronger technical evidence_, _The evidence is incorrect_
- Auto-growing composer, markdown-style formatting (bold, lists)

**Right — Claim Chart** (Notion/Linear-like)
- Columns: **Patent Claim · Evidence · AI Reasoning**
- Per-row **Accept / Reject / Compare Changes**
- AI suggestions **highlight changed text on a green background**; _Compare Changes_
  reveals a full word-level diff (additions in green, deletions struck through)
- Per-row **Undo** to restore the previous state
- **Export Word** (top right) — generates a `.doc` file entirely client-side

### Edge cases handled
1. **"The evidence is incorrect"** → the assistant apologizes and replaces the
   evidence with a corrected citation (highlighted for review).
2. **Undo** → both a per-row `Undo` button and a chat command ("undo the previous
   refinement") restore the prior state.
3. **AI cannot find evidence** (element 1.d) → the assistant asks the user to upload
   another PDF or provide URLs, with one-click helper actions.

## Project structure

```
src/
  App.jsx                 # landing ↔ workspace routing + transitions
  lib/
    aiEngine.js           # mocked "AI" — intent detection + proposed diffs
    mockData.js           # sample claim chart, prompts, welcome message
    exportWord.js         # client-side .doc export
    utils.js              # cn(), uid(), sleep()
  components/
    LandingPage.jsx       # uploads + system instructions
    Workspace.jsx         # state, accept/reject/undo, split layout
    ChatPanel.jsx         # messages, typing animation, suggested prompts
    ClaimChart.jsx        # the table, per-row actions, diff highlighting
    DiffText.jsx          # word-level LCS diff renderer
    UploadCard.jsx, TypingIndicator.jsx
    ui/                   # button, card, textarea, badge (shadcn-style)
```

All AI behavior is deterministic and simulated for demonstration purposes.
