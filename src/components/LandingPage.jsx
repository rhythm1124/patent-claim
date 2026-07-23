import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSpreadsheet,
  BookText,
  Settings2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Loader2,
} from "lucide-react";
import UploadCard from "./UploadCard";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { sleep } from "@/lib/utils";

const features = [
  { icon: Sparkles, label: "AI-guided refinement" },
  { icon: ShieldCheck, label: "Evidence-backed mapping" },
  { icon: Zap, label: "One-click Word export" },
];

export default function LandingPage({ onStart }) {
  const [claimChart, setClaimChart] = useState(null);
  const [productDocs, setProductDocs] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [loading, setLoading] = useState(false);

  const ready = claimChart && productDocs;

  const start = async () => {
    if (!ready) return;
    setLoading(true);
    await sleep(1600); // simulated analysis
    onStart({ claimChart, productDocs, instructions });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background bg-mesh">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.4]" />

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">ClaimForge</span>
        </div>
        <div className="hidden items-center gap-1 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          AI engine ready
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-8 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI Patent Claim Chart Refinement
          </div>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Refine your claim charts,{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              conversationally
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Upload a claim chart and your product documentation. Then chat with
            an AI to strengthen evidence, sharpen reasoning, and export a
            polished Word document.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {features.map((f) => (
              <div
                key={f.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
              >
                <f.icon className="h-3.5 w-3.5 text-primary" />
                {f.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upload cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="mt-10 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <UploadCard
              title="Claim Chart"
              description="The patent claim chart to refine (.xlsx, .csv, .docx)"
              accept=".xlsx,.csv,.docx,.doc,.pdf"
              file={claimChart}
              onFile={setClaimChart}
              icon={FileSpreadsheet}
              accentClass="from-indigo-500 to-violet-600"
            />
            <UploadCard
              title="Product Documentation"
              description="Manuals, datasheets or specs to cite as evidence (.pdf)"
              accept=".pdf,.docx,.doc"
              file={productDocs}
              onFile={setProductDocs}
              icon={BookText}
              accentClass="from-sky-500 to-cyan-600"
            />
          </div>

          {/* Optional system instructions */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <button
              onClick={() => setShowInstructions((s) => !s)}
              className="flex w-full items-center gap-3 text-left"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 text-white shadow-sm">
                <Settings2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">
                    System Instructions
                  </h3>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Optional
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Guide the AI's tone, jurisdiction, or citation style.
                </p>
              </div>
              <ArrowRight
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  showInstructions ? "rotate-90" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {showInstructions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Use USPTO citation formatting. Prioritize firmware evidence. Keep reasoning under 3 sentences per element."
                    className="mt-4 min-h-[96px]"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Button
              size="lg"
              className="group w-full text-base"
              disabled={!ready || loading}
              onClick={start}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing documents…
                </>
              ) : (
                <>
                  Start Refining
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
            {!ready && !loading && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Upload both a claim chart and product documentation to continue.
              </p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
