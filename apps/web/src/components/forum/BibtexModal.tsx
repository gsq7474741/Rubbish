"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface BibtexModalProps {
  paperId: string;
  title: string;
  authorName: string;
  year: string;
  venueName?: string;
}

export function BibtexButton({ paperId, title, authorName, year, venueName }: BibtexModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const sanitize = (s: string) => s.replace(/[{}]/g, "");
  const citeKey = `${authorName.split(" ").pop()?.toLowerCase() || "anon"}${year}${title.split(" ")[0]?.toLowerCase() || "paper"}`;

  const bibtex = `@article{${citeKey},
  title     = {${sanitize(title)}},
  author    = {${sanitize(authorName)}},
  journal   = {${sanitize(venueName || "RubbishReview")}},
  year      = {${year}},
  url       = {${typeof window !== "undefined" ? window.location.origin : "https://rubbishreview.org"}/paper/${paperId}},
  note      = {Certified Rubbish}
}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bibtex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs bg-transparent border border-[#ccc] px-2 py-1 cursor-pointer hover:bg-[#f5f5f5]"
        style={{ borderRadius: 0, color: "var(--or-medium-blue)" }}
      >
        BibTeX
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setOpen(false)}>
          <div
            className="bg-white border border-[rgba(0,0,0,0.1)] p-4 max-w-[600px] w-full mx-4 shadow-lg"
            style={{ borderRadius: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: "var(--or-dark-blue)" }}>
                BibTeX Citation
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-xs bg-transparent border-0 cursor-pointer"
                style={{ color: "var(--or-subtle-gray)" }}
              >
                ✕
              </button>
            </div>
            <pre
              className="text-xs font-mono p-3 border border-[rgba(0,0,0,0.1)] overflow-x-auto whitespace-pre-wrap"
              style={{ backgroundColor: "var(--or-sandy)" }}
            >
              {bibtex}
            </pre>
            <button
              onClick={handleCopy}
              className="mt-3 flex items-center gap-1 px-3 py-1 text-xs text-white border-0 cursor-pointer"
              style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
