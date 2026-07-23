import { uid } from "./utils";

// A realistic-looking patent claim chart for a fictional
// "Adaptive Battery Thermal Management" patent (US 10,XXX,XXX B2).
export const initialRows = () => [
  {
    id: uid("row"),
    element: "1.a",
    claimText:
      "A battery thermal management system comprising a plurality of temperature sensors distributed across a battery pack.",
    evidence:
      "Product Manual §3.2: 'The Model-X pack integrates 12 discrete NTC thermistors mounted at cell-group boundaries.'",
    reasoning:
      "The 12 NTC thermistors correspond to the claimed 'plurality of temperature sensors distributed across a battery pack.'",
    status: "pending",
    proposal: null,
    history: [],
  },
  {
    id: uid("row"),
    element: "1.b",
    claimText:
      "a controller configured to receive temperature readings from the plurality of temperature sensors.",
    evidence:
      "Product Manual §4.1: 'The BMS controller polls all thermistors every 100 ms over the internal CAN bus.'",
    reasoning:
      "Polling thermistors over CAN maps directly to a controller 'configured to receive temperature readings.'",
    status: "pending",
    proposal: null,
    history: [],
  },
  {
    id: uid("row"),
    element: "1.c",
    claimText:
      "wherein the controller determines a thermal gradient based on the received temperature readings.",
    evidence:
      "Product Manual §4.3: 'Firmware computes the delta between hottest and coldest cell group each cycle.'",
    reasoning:
      "Computing the delta between hottest and coldest groups is a determination of a 'thermal gradient.'",
    status: "pending",
    proposal: null,
    history: [],
  },
  {
    id: uid("row"),
    element: "1.d",
    claimText:
      "and actuates a coolant pump when the thermal gradient exceeds a predetermined threshold.",
    evidence:
      "(No direct citation located in the provided documentation.)",
    reasoning:
      "Pending — the coolant actuation logic and threshold value were not found in the uploaded documents.",
    status: "pending",
    proposal: null,
    history: [],
    weak: true,
  },
  {
    id: uid("row"),
    element: "2",
    claimText:
      "The system of claim 1, wherein the predetermined threshold is dynamically adjusted based on ambient temperature.",
    evidence:
      "Product Manual §4.4: 'Threshold scales with cabin temperature via a lookup table.'",
    reasoning:
      "A lookup table keyed on cabin temperature shows the threshold is 'dynamically adjusted based on ambient temperature.'",
    status: "pending",
    proposal: null,
    history: [],
  },
];

export const suggestedPrompts = [
  { label: "Strengthen evidence for element 2", icon: "shield" },
  { label: "Improve AI reasoning", icon: "brain" },
  { label: "Find stronger technical evidence", icon: "search" },
  { label: "The evidence is incorrect", icon: "alert" },
];

export const welcomeMessage = {
  role: "assistant",
  content:
    "I've analyzed your **claim chart** against the **product documentation**. The mapping looks solid for elements 1.a–1.c and claim 2, but element **1.d** (coolant pump actuation) is missing a direct citation.\n\nHow would you like to refine the chart? You can ask me to strengthen evidence, sharpen the reasoning, or flag anything that looks incorrect.",
};
