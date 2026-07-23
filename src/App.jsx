import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage from "./components/LandingPage";
import Workspace from "./components/Workspace";

// Optional dev shortcut: open with ?demo to skip the upload step with sample files.
function demoSession() {
  if (typeof window === "undefined") return null;
  if (!window.location.search.includes("demo")) return null;
  return {
    claimChart: { name: "US10-claims.xlsx" },
    productDocs: { name: "model-x-manual.pdf" },
    instructions: "",
  };
}

export default function App() {
  const [session, setSession] = useState(demoSession);

  return (
    <AnimatePresence mode="wait">
      {session ? (
        <motion.div
          key="workspace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Workspace session={session} onReset={() => setSession(null)} />
        </motion.div>
      ) : (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <LandingPage onStart={setSession} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
