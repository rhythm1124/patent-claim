import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, UploadCloud, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UploadCard({
  title,
  description,
  accept = ".pdf,.docx,.doc,.csv,.xlsx",
  file,
  onFile,
  icon: Icon = FileText,
  accentClass = "from-indigo-500 to-violet-600",
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const pick = () => inputRef.current?.click();

  const handleFiles = (files) => {
    if (files && files[0]) onFile(files[0]);
  };

  return (
    <motion.div
      layout
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={pick}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-sm transition-all duration-200 hover:shadow-md",
        dragOver
          ? "border-primary ring-2 ring-primary/30"
          : file
          ? "border-emerald-300"
          : "border-dashed border-border hover:border-primary/50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform group-hover:scale-105",
            accentClass
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {file && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>

          {file ? (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="truncate text-sm font-medium text-emerald-800">
                {file.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFile(null);
                }}
                className="ml-auto rounded p-0.5 text-emerald-600 transition-colors hover:bg-emerald-100"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <UploadCloud className="h-4 w-4" />
              <span>
                Drag &amp; drop or <span className="text-primary">browse</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
