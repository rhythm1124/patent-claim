import React from "react";
import { Sparkles } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 shadow-sm">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
