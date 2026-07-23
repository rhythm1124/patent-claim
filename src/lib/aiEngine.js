// Fully mocked "AI" engine. No network calls.
// Given the user's message and the current chart rows, it returns a reply
// plus a set of proposed updates (diffs) to apply to specific rows.

// Alternative, "stronger" evidence snippets keyed by element.
const strongerEvidence = {
  "1.a":
    "Product Manual §3.2 & Datasheet Table 2: '12 automotive-grade NTC thermistors (±0.5 °C, part MF52-103) are bonded to each cell-group busbar, providing distributed thermal coverage across all 8 modules of the pack.'",
  "1.b":
    "Product Manual §4.1 & Firmware Spec §2.6: 'The BMS controller (STM32H7) acquires all 12 thermistor channels every 100 ms via the internal CAN 2.0B bus and timestamps each frame for gradient analysis.'",
  "1.c":
    "Product Manual §4.3 & Firmware Spec §5.2: 'Each 100 ms cycle the controller computes ΔT = T_max − T_min across cell groups and maintains a rolling 10-sample gradient buffer.'",
  "1.d":
    "Service Bulletin SB-114 §2: 'When ΔT exceeds the calibrated 4.0 °C threshold, the BMS energizes the coolant pump relay (J7) to 60% duty and ramps to 100% at 6.0 °C.'",
  "2":
    "Product Manual §4.4 & Calibration Doc §7: 'The activation threshold is derived from a 2-D lookup table indexed by ambient cabin temperature (−20 °C to +55 °C), lowering the trigger point in hot conditions.'",
};

const strongerReasoning = {
  "1.a":
    "The 12 distributed NTC thermistors, bonded at every cell-group busbar across all 8 modules, unambiguously satisfy 'a plurality of temperature sensors distributed across a battery pack' — both the plurality (12 > 1) and the distribution (per-module coverage) limitations are met.",
  "1.b":
    "By acquiring all 12 thermistor channels every 100 ms over CAN, the STM32H7 controller is literally 'configured to receive temperature readings from the plurality of temperature sensors,' satisfying the receive limitation with a deterministic polling interval.",
  "1.c":
    "Computing ΔT = T_max − T_min each cycle is a direct determination of a 'thermal gradient based on the received temperature readings'; the rolling buffer further evidences continuous gradient tracking.",
  "1.d":
    "Energizing the coolant-pump relay once ΔT crosses the 4.0 °C calibrated threshold maps precisely onto 'actuates a coolant pump when the thermal gradient exceeds a predetermined threshold,' with the threshold value now documented in SB-114.",
  "2":
    "Because the threshold is read from a lookup table indexed on ambient cabin temperature, it is 'dynamically adjusted based on ambient temperature,' satisfying the dependent limitation of claim 2 with explicit calibration data.",
};

// A deliberately corrected evidence snippet for the "evidence is incorrect" flow.
const correctedEvidence = {
  "1.a":
    "Corrected — Product Manual §3.2 (rev C): 'The Model-X pack integrates 12 NTC thermistors; note earlier drafts incorrectly listed 8. The verified count is 12, one per cell-group.'",
  "1.b":
    "Corrected — Firmware Spec §2.6: 'Polling occurs every 100 ms (not 250 ms as previously cited) over the internal CAN bus.'",
  "1.c":
    "Corrected — Product Manual §4.3: 'The gradient is computed as T_max − T_min across cell groups (prior citation to §4.2 was inaccurate).'",
  "2":
    "Corrected — Product Manual §4.4: 'The threshold lookup is keyed on ambient CABIN temperature (an earlier note citing coolant-inlet temperature was mistaken).'",
};

function elementLabel(row) {
  return `element ${row.element}`;
}

// Try to find which element the user is referring to.
function resolveTarget(text, rows) {
  const t = text.toLowerCase();

  // Explicit element like "1.d", "1.a", "element 2"
  const dotted = t.match(/\b([1-9])\.([a-e])\b/);
  if (dotted) {
    const key = `${dotted[1]}.${dotted[2]}`;
    const r = rows.find((x) => x.element === key);
    if (r) return r;
  }

  // "element 2" / "claim 2" / "element two"
  const wordNums = { one: "1", two: "2", three: "3", four: "4", five: "5" };
  const numMatch =
    t.match(/\b(?:element|claim|row|limitation)\s+(\d)\b/) ||
    t.match(/\b(?:element|claim|row|limitation)\s+(one|two|three|four|five)\b/);
  if (numMatch) {
    const raw = numMatch[1];
    const num = wordNums[raw] || raw;
    // Prefer exact element match (e.g. "2"), else first element starting with num
    const exact = rows.find((x) => x.element === num);
    if (exact) return exact;
    const starts = rows.find((x) => x.element.startsWith(num));
    if (starts) return starts;
  }

  return null;
}

function pause() {
  // Simulated "thinking" latency for realism.
  return 700 + Math.floor(Math.random() * 700);
}

export function runAssistant(text, rows) {
  const t = text.toLowerCase().trim();
  const updates = [];
  let reply = "";
  let askUpload = false;

  const weakRow = rows.find((r) => r.weak && r.status !== "accepted");

  // --- Edge case: user says the evidence is incorrect -----------------------
  if (
    /(evidence|citation|it'?s)\s+(is\s+)?(incorrect|wrong|inaccurate|not right|mistaken)/.test(
      t
    ) ||
    /(wrong|incorrect|bad)\s+(evidence|citation)/.test(t) ||
    t === "the evidence is incorrect"
  ) {
    const target = resolveTarget(t, rows) || rows.find((r) => !r.weak);
    const key = target?.element;
    const newEv = correctedEvidence[key] || strongerEvidence[key];
    if (target && newEv) {
      updates.push({
        id: target.id,
        evidence: newEv,
        kind: "correction",
      });
      reply = `You're right — I apologize for that. I re-checked the source documents and the citation for **${elementLabel(
        target
      )}** was off. I've replaced it with the corrected evidence and highlighted the change on the right. Please review and **Accept** if it looks correct now.`;
    } else {
      reply =
        "I'm sorry about that. Could you tell me which element has the incorrect evidence (e.g. \"element 1.b\") so I can pull the correct citation?";
    }
    return { reply, updates, askUpload, delay: pause() };
  }

  // --- Edge case: AI cannot find evidence (explicit ask or weak element) -----
  if (
    /(can'?t|cannot|couldn'?t|unable to|no)\s+(find|locate|source)\s+(evidence|citation|support)/.test(
      t
    ) ||
    /find evidence for (element )?1\.d/.test(t) ||
    (weakRow &&
      resolveTarget(t, rows)?.id === weakRow.id &&
      /(strengthen|evidence|support|cite|find)/.test(t))
  ) {
    reply = `I searched the uploaded documentation but couldn't find a direct citation for **${elementLabel(
      weakRow || { element: "1.d" }
    )}** (coolant-pump actuation and its threshold). To strengthen this element, could you:\n\n1. **Upload another PDF** — e.g. a firmware spec or service bulletin, or\n2. **Provide a URL** to the relevant technical document.\n\nOnce I have that, I'll map the actuation logic and threshold value into the chart.`;
    askUpload = true;
    return { reply, updates, askUpload, delay: pause() };
  }

  // --- Strengthen / find stronger evidence ----------------------------------
  if (
    /(strengthen|stronger|better|improve|more)\s+.*\bevidence\b/.test(t) ||
    /\bevidence\b.*\b(stronger|better|strengthen)\b/.test(t) ||
    /find stronger technical evidence/.test(t) ||
    /(add|find|pull|get)\s+.*\bevidence\b/.test(t)
  ) {
    const target = resolveTarget(t, rows);
    const pool = target ? [target] : rows.filter((r) => !r.weak).slice(0, 3);

    pool.forEach((r) => {
      const newEv = strongerEvidence[r.element];
      if (newEv && newEv !== r.evidence) {
        updates.push({ id: r.id, evidence: newEv, kind: "strengthen" });
      }
    });

    if (updates.length) {
      reply = target
        ? `I found more specific technical support for **${elementLabel(
            target
          )}** by cross-referencing the datasheet and firmware spec. The proposed evidence is highlighted in green on the right — **Accept** to apply or **Reject** to keep the original.`
        : `I strengthened the evidence for ${updates.length} elements by pulling in datasheet tables and firmware references. Review the highlighted proposals on the right and Accept the ones you like.`;
      if (weakRow && (!target || target.id === weakRow.id)) {
        // handled above, but guard anyway
      }
    } else {
      reply =
        "The current evidence already looks strong for that element. Want me to try element 1.d instead, or tighten the reasoning?";
    }
    return { reply, updates, askUpload, delay: pause() };
  }

  // --- Improve reasoning -----------------------------------------------------
  if (/(improve|sharpen|strengthen|better|clearer|clarify).*(reasoning|analysis|argument)/.test(t) ||
      /reasoning/.test(t)) {
    const target = resolveTarget(t, rows);
    const pool = target ? [target] : rows.filter((r) => !r.weak);

    pool.forEach((r) => {
      const newR = strongerReasoning[r.element];
      if (newR && newR !== r.reasoning) {
        updates.push({ id: r.id, reasoning: newR, kind: "reasoning" });
      }
    });

    reply = target
      ? `I rewrote the AI reasoning for **${elementLabel(
          target
        )}** to tie each claim limitation explicitly to the cited evidence. See the highlighted change on the right.`
      : `I sharpened the reasoning across ${updates.length} elements so each one maps the claim language directly onto the evidence. Review and Accept the highlighted proposals.`;
    return { reply, updates, askUpload, delay: pause() };
  }

  // --- Generic help ----------------------------------------------------------
  reply =
    "Here's what I can do with this claim chart:\n\n• **Strengthen evidence** for a specific element (e.g. *\"strengthen evidence for element 2\"*)\n• **Improve the AI reasoning** so it maps cleanly to the claim language\n• **Find stronger technical evidence** from the datasheet & firmware spec\n• Fix anything that looks wrong — just say *\"the evidence is incorrect\"*\n\nWhich would you like to start with?";
  return { reply, updates, askUpload, delay: pause() };
}
