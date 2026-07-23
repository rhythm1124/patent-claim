import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Undo2,
  GitCompare,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileDown,
  ScrollText,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import DiffText from "./DiffText";
import { cn } from "@/lib/utils";

function StatusBadge({ status, weak, hasProposal }) {
  if (hasProposal)
    return (
      <Badge variant="warning" className="animate-pulse">
        <Sparkles className="h-3 w-3" />
        AI suggestion
      </Badge>
    );
  if (status === "accepted")
    return (
      <Badge variant="success">
        <CheckCircle2 className="h-3 w-3" />
        Accepted
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3" />
        Rejected
      </Badge>
    );
  if (weak)
    return (
      <Badge variant="warning">
        <AlertTriangle className="h-3 w-3" />
        Needs evidence
      </Badge>
    );
  return (
    <Badge variant="secondary">
      <Clock className="h-3 w-3" />
      Pending
    </Badge>
  );
}

function Cell({ label, children, className }) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">
        {label}
      </div>
      <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
    </div>
  );
}

function Row({ row, onAccept, onReject, onUndo, index }) {
  const [compare, setCompare] = useState(false);
  const p = row.proposal;
  const evChanged = p && p.evidence != null;
  const rsChanged = p && p.reasoning != null;
  const canUndo = row.history && row.history.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      className={cn(
        "group relative rounded-xl border bg-card shadow-sm transition-all",
        p
          ? "border-amber-300 ring-1 ring-amber-200"
          : row.status === "accepted"
          ? "border-emerald-200"
          : row.status === "rejected"
          ? "border-border opacity-70"
          : "border-border hover:shadow-md"
      )}
    >
      {/* Meta bar */}
      <div className="flex items-center gap-2 border-b border-border/70 px-4 py-2.5">
        <span className="flex h-6 items-center rounded-md bg-primary/10 px-2 font-mono text-xs font-semibold text-primary">
          {row.element}
        </span>
        <StatusBadge status={row.status} weak={row.weak} hasProposal={!!p} />
        <div className="ml-auto flex items-center gap-1.5">
          {p && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setCompare((c) => !c)}
            >
              <GitCompare className="h-3.5 w-3.5" />
              {compare ? "Hide diff" : "Compare Changes"}
            </Button>
          )}
          {p ? (
            <>
              <Button
                size="sm"
                variant="success"
                className="h-7 gap-1.5 text-xs"
                onClick={() => onAccept(row.id)}
              >
                <Check className="h-3.5 w-3.5" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs"
                onClick={() => onReject(row.id)}
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </Button>
            </>
          ) : (
            <>
              {row.status !== "accepted" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
                  onClick={() => onAccept(row.id)}
                >
                  <Check className="h-3.5 w-3.5" />
                  Accept
                </Button>
              )}
              {row.status !== "rejected" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1.5 text-xs text-red-600 hover:bg-red-50"
                  onClick={() => onReject(row.id)}
                >
                  <X className="h-3.5 w-3.5" />
                  Reject
                </Button>
              )}
            </>
          )}
          {canUndo && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1.5 text-xs"
              onClick={() => onUndo(row.id)}
              title="Undo previous refinement"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Undo
            </Button>
          )}
        </div>
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[1.1fr_1fr_1fr]">
        <Cell label="Patent Claim">
          <span className="text-foreground">{row.claimText}</span>
        </Cell>

        <Cell label="Evidence" className="lg:border-l lg:border-border/60 lg:pl-4">
          {evChanged ? (
            <DiffText
              oldText={row.evidence}
              newText={p.evidence}
              mode={compare ? "diff" : "added"}
            />
          ) : (
            <span className={cn(row.weak && "italic text-muted-foreground")}>
              {row.evidence}
            </span>
          )}
        </Cell>

        <Cell label="AI Reasoning" className="lg:border-l lg:border-border/60 lg:pl-4">
          {rsChanged ? (
            <DiffText
              oldText={row.reasoning}
              newText={p.reasoning}
              mode={compare ? "diff" : "added"}
            />
          ) : (
            <span className={cn(row.weak && "italic text-muted-foreground")}>
              {row.reasoning}
            </span>
          )}
        </Cell>
      </div>

      {/* Proposal note */}
      <AnimatePresence>
        {p && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                The assistant proposed{" "}
                {evChanged && rsChanged
                  ? "new evidence and reasoning"
                  : evChanged
                  ? "new evidence"
                  : "new reasoning"}
                . Changed text is highlighted in{" "}
                <span className="rounded bg-emerald-100 px-1 font-medium text-emerald-700">
                  green
                </span>
                . Accept to apply or Reject to keep the original.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ClaimChart({
  rows,
  onAccept,
  onReject,
  onUndo,
  onExport,
  fileName,
  stats,
}) {
  return (
    <div className="flex h-full flex-col bg-secondary/30">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-background/80 px-5 py-3 backdrop-blur">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-sm">
          <ScrollText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold leading-tight">
            Claim Chart
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {fileName || "claim-chart.xlsx"} · {rows.length} elements
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-3 text-xs sm:flex">
            <span className="flex items-center gap-1 font-medium text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {stats.accepted}
            </span>
            <span className="flex items-center gap-1 font-medium text-amber-600">
              <Sparkles className="h-3.5 w-3.5" />
              {stats.pending}
            </span>
            <span className="flex items-center gap-1 font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {stats.total}
            </span>
          </div>
          <Button size="sm" className="gap-2" onClick={onExport}>
            <FileDown className="h-4 w-4" />
            Export Word
          </Button>
        </div>
      </div>

      {/* Column header (lg only) */}
      <div className="hidden border-b border-border bg-background/60 px-9 py-2.5 lg:block">
        <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Patent Claim</span>
          <span className="border-l border-border/60 pl-4">Evidence</span>
          <span className="border-l border-border/60 pl-4">AI Reasoning</span>
        </div>
      </div>

      {/* Rows */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {rows.map((row, i) => (
          <Row
            key={row.id}
            row={row}
            index={i}
            onAccept={onAccept}
            onReject={onReject}
            onUndo={onUndo}
          />
        ))}
        <div className="py-4 text-center text-xs text-muted-foreground">
          End of claim chart · {rows.length} elements mapped
        </div>
      </div>
    </div>
  );
}
