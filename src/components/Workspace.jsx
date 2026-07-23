import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, PanelsTopLeft } from "lucide-react";
import ChatPanel from "./ChatPanel";
import ClaimChart from "./ClaimChart";
import { Button } from "./ui/button";
import { runAssistant } from "@/lib/aiEngine";
import { initialRows, suggestedPrompts, welcomeMessage } from "@/lib/mockData";
import { uid, sleep } from "@/lib/utils";
import { exportToWord } from "@/lib/exportWord";

export default function Workspace({ session, onReset }) {
  const [rows, setRows] = useState(() => initialRows());
  const [messages, setMessages] = useState(() => [
    { id: uid("msg"), stream: false, ...welcomeMessage },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [showUploadHelp, setShowUploadHelp] = useState(false);
  const [mobileTab, setMobileTab] = useState("chat"); // chat | chart
  const busy = useRef(false);

  const stats = useMemo(() => {
    const accepted = rows.filter((r) => r.status === "accepted").length;
    const pending = rows.filter((r) => r.proposal).length;
    return { accepted, pending, total: rows.length };
  }, [rows]);

  const lastChangedRef = useRef(null);

  const addAssistant = (content, stream = true) => {
    setMessages((m) => [...m, { id: uid("msg"), role: "assistant", content, stream }]);
  };

  const applyUpdatesAsProposals = (updates) => {
    if (!updates.length) return;
    setRows((prev) =>
      prev.map((r) => {
        const u = updates.find((x) => x.id === r.id);
        if (!u) return r;
        const proposal = { kind: u.kind };
        if (u.evidence != null) proposal.evidence = u.evidence;
        if (u.reasoning != null) proposal.reasoning = u.reasoning;
        return { ...r, proposal };
      })
    );
  };

  const handleSend = async (text) => {
    if (busy.current) return;
    busy.current = true;
    setShowUploadHelp(false);

    setMessages((m) => [...m, { id: uid("msg"), role: "user", content: text }]);

    // --- Global "undo" intent handled directly (edge case 2) ---------------
    if (/^\s*undo\b/i.test(text) || /undo (the )?(previous|last) (refinement|change)/i.test(text)) {
      setIsThinking(true);
      await sleep(650);
      let undone = false;
      let label = "";
      setRows((prev) => {
        // Find most recently accepted row with history.
        const candidates = prev.filter((r) => r.history && r.history.length);
        if (!candidates.length) return prev;
        const target = candidates[candidates.length - 1];
        label = target.element;
        undone = true;
        return prev.map((r) => {
          if (r.id !== target.id) return r;
          const snap = r.history[r.history.length - 1];
          return {
            ...r,
            ...snap,
            history: r.history.slice(0, -1),
            proposal: null,
          };
        });
      });
      setIsThinking(false);
      addAssistant(
        undone
          ? `Done — I've reverted **element ${label}** to its previous state. The earlier evidence and reasoning are restored on the right.`
          : "There's nothing to undo yet. Once you accept a refinement, you can ask me to undo it or use the **Undo** button on that row."
      );
      busy.current = false;
      return;
    }

    setIsThinking(true);
    const result = runAssistant(text, rows);
    await sleep(result.delay);
    setIsThinking(false);

    applyUpdatesAsProposals(result.updates);
    if (result.updates.length) lastChangedRef.current = result.updates[0].id;
    addAssistant(result.reply);
    setShowUploadHelp(result.askUpload);
    busy.current = false;
  };

  const onStreamDone = (id) => {
    setMessages((m) =>
      m.map((msg) => (msg.id === id ? { ...msg, stream: false } : msg))
    );
  };

  const handleAccept = (id) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.proposal) {
          const snapshot = {
            evidence: r.evidence,
            reasoning: r.reasoning,
            status: r.status,
            weak: r.weak,
          };
          const next = {
            ...r,
            history: [...(r.history || []), snapshot],
            proposal: null,
            status: "accepted",
          };
          if (r.proposal.evidence != null) {
            next.evidence = r.proposal.evidence;
            next.weak = false;
          }
          if (r.proposal.reasoning != null) next.reasoning = r.proposal.reasoning;
          return next;
        }
        return { ...r, status: "accepted" };
      })
    );
  };

  const handleReject = (id) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.proposal) {
          // Discard the suggestion, keep the original untouched.
          return { ...r, proposal: null };
        }
        return { ...r, status: "rejected" };
      })
    );
  };

  const handleUndo = (id) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id || !(r.history && r.history.length)) return r;
        const snap = r.history[r.history.length - 1];
        return {
          ...r,
          ...snap,
          history: r.history.slice(0, -1),
          proposal: null,
        };
      })
    );
  };

  const handleExport = () => {
    exportToWord(rows, session);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-2.5">
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">New session</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-tight">ClaimForge</span>
        </div>

        {/* Mobile tab switcher */}
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-border bg-secondary/60 p-0.5 lg:hidden">
          <button
            onClick={() => setMobileTab("chat")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              mobileTab === "chat"
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setMobileTab("chart")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              mobileTab === "chart"
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Chart
          </button>
        </div>

        <div className="ml-auto hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex">
          <PanelsTopLeft className="h-3.5 w-3.5" />
          Split workspace
        </div>
      </header>

      {/* Split screen */}
      <div className="flex min-h-0 flex-1">
        {/* LEFT — conversation */}
        <motion.section
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className={`min-w-0 flex-col border-r border-border lg:flex lg:w-[42%] lg:max-w-[560px] ${
            mobileTab === "chat" ? "flex w-full" : "hidden"
          }`}
        >
          <ChatPanel
            messages={messages}
            isThinking={isThinking}
            suggestedPrompts={suggestedPrompts}
            onSend={handleSend}
            onStreamDone={onStreamDone}
            showUploadHelp={showUploadHelp}
          />
        </motion.section>

        {/* RIGHT — claim chart */}
        <motion.section
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className={`min-w-0 flex-1 flex-col lg:flex ${
            mobileTab === "chart" ? "flex w-full" : "hidden"
          }`}
        >
          <ClaimChart
            rows={rows}
            onAccept={handleAccept}
            onReject={handleReject}
            onUndo={handleUndo}
            onExport={handleExport}
            fileName={session?.claimChart?.name}
            stats={stats}
          />
        </motion.section>
      </div>
    </div>
  );
}
