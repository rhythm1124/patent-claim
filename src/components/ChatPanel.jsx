import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  User,
  ArrowUp,
  Shield,
  Brain,
  Search,
  AlertTriangle,
  Paperclip,
  Link2,
} from "lucide-react";
import { Button } from "./ui/button";
import TypingIndicator from "./TypingIndicator";
import { cn } from "@/lib/utils";

const iconMap = {
  shield: Shield,
  brain: Brain,
  search: Search,
  alert: AlertTriangle,
};

// Minimal, safe markdown-ish renderer: **bold**, bullets, numbered lists.
function renderRich(text) {
  const lines = text.split("\n");
  const blocks = [];
  let list = null;

  const flush = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  const inline = (str, keyBase) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return (
          <strong key={`${keyBase}-b-${i}`} className="font-semibold text-foreground">
            {p.slice(2, -2)}
          </strong>
        );
      }
      return <span key={`${keyBase}-t-${i}`}>{p}</span>;
    });
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[•\-]\s+(.*)$/);
    const numbered = line.match(/^\s*(\d+)\.\s+(.*)$/);

    if (bullet) {
      if (!list || list.type !== "ul") {
        flush();
        list = { type: "ul", items: [], key: `ul-${idx}` };
      }
      list.items.push(inline(bullet[1], `li-${idx}`));
    } else if (numbered) {
      if (!list || list.type !== "ol") {
        flush();
        list = { type: "ol", items: [], key: `ol-${idx}` };
      }
      list.items.push(inline(numbered[2], `li-${idx}`));
    } else {
      flush();
      if (line.trim() === "") {
        blocks.push({ type: "space", key: `sp-${idx}` });
      } else {
        blocks.push({ type: "p", content: inline(line, `p-${idx}`), key: `p-${idx}` });
      }
    }
  });
  flush();

  return blocks.map((b) => {
    if (b.type === "p")
      return (
        <p key={b.key} className="leading-relaxed">
          {b.content}
        </p>
      );
    if (b.type === "space") return <div key={b.key} className="h-1.5" />;
    if (b.type === "ul")
      return (
        <ul key={b.key} className="ml-1 space-y-1">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-2 leading-relaxed">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    if (b.type === "ol")
      return (
        <ol key={b.key} className="ml-1 space-y-1">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-2.5 leading-relaxed">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                {i + 1}
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ol>
      );
    return null;
  });
}

function Typewriter({ text, onDone }) {
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    setCount(0);
    doneRef.current = false;
    let i = 0;
    const step = Math.max(1, Math.round(text.length / 90)); // finish in ~90 ticks
    const timer = setInterval(() => {
      i += step;
      if (i >= text.length) {
        i = text.length;
        setCount(i);
        clearInterval(timer);
        if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
      } else {
        setCount(i);
      }
    }, 16);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <div className="space-y-2 text-sm text-foreground/90">{renderRich(text.slice(0, count))}</div>;
}

function MessageBubble({ msg, onStreamDone }) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm",
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm border border-border bg-card"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
        ) : msg.stream ? (
          <Typewriter text={msg.content} onDone={() => onStreamDone(msg.id)} />
        ) : (
          <div className="space-y-2 text-foreground/90">{renderRich(msg.content)}</div>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatPanel({
  messages,
  isThinking,
  suggestedPrompts,
  onSend,
  onStreamDone,
  showUploadHelp,
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  const submit = (text) => {
    const value = (text ?? input).trim();
    if (!value) return;
    onSend(value);
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
  };

  const autosize = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold leading-tight">Refinement Assistant</h2>
          <p className="text-xs text-muted-foreground">
            Chat to strengthen evidence &amp; reasoning
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Online
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} onStreamDone={onStreamDone} />
        ))}

        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        {showUploadHelp && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-11 flex flex-wrap gap-2"
          >
            <button
              onClick={() => submit("I've uploaded the firmware spec PDF.")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <Paperclip className="h-3.5 w-3.5 text-primary" />
              Upload another PDF
            </button>
            <button
              onClick={() =>
                submit("Here's a URL: https://docs.example.com/firmware-spec")
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <Link2 className="h-3.5 w-3.5 text-primary" />
              Provide a URL
            </button>
          </motion.div>
        )}
      </div>

      {/* Suggested prompts */}
      {!isThinking && (
        <div className="border-t border-border px-5 pt-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Suggested
          </p>
          <div className="flex flex-wrap gap-2 pb-3">
            {suggestedPrompts.map((p) => {
              const Icon = iconMap[p.icon] || Sparkles;
              return (
                <button
                  key={p.label}
                  onClick={() => submit(p.label)}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent hover:shadow"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-border p-4">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-primary/30">
          <textarea
            ref={taRef}
            value={input}
            onChange={autosize}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Ask the assistant to refine the chart…"
            className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl"
            disabled={!input.trim()}
            onClick={() => submit()}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Mocked AI · responses are simulated for demonstration
        </p>
      </div>
    </div>
  );
}
