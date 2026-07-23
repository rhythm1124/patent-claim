import React, { useMemo } from "react";

// Lightweight word-level LCS diff so changed text can be highlighted.
function diffWords(oldStr = "", newStr = "") {
  const a = oldStr.split(/(\s+)/);
  const b = newStr.split(/(\s+)/);
  const m = a.length;
  const n = b.length;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      out.push({ type: "same", text: b[j] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "del", text: a[i] });
      i++;
    } else {
      out.push({ type: "add", text: b[j] });
      j++;
    }
  }
  while (i < m) out.push({ type: "del", text: a[i++] });
  while (j < n) out.push({ type: "add", text: b[j++] });
  return out;
}

/**
 * mode:
 *  - "diff": show del + add (Compare Changes)
 *  - "added": show only the new text with additions highlighted green
 *  - "plain": just the text
 */
export default function DiffText({ oldText, newText, mode = "added" }) {
  const parts = useMemo(
    () => diffWords(oldText || "", newText || ""),
    [oldText, newText]
  );

  if (mode === "plain") {
    return <span>{newText}</span>;
  }

  return (
    <span>
      {parts.map((p, idx) => {
        if (p.type === "same") return <span key={idx}>{p.text}</span>;
        if (p.type === "add")
          return (
            <mark key={idx} className="diff-add">
              {p.text}
            </mark>
          );
        // del
        if (mode === "diff")
          return (
            <mark key={idx} className="diff-del">
              {p.text}
            </mark>
          );
        return null;
      })}
    </span>
  );
}
