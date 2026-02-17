"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

const REPORT_REASONS = [
  "Spam or advertising",
  "Harassment or abuse",
  "Inappropriate content",
  "Plagiarism",
  "Off-topic",
  "Other",
];

export function ReportButton({
  targetType,
  targetId,
}: {
  targetType: "paper" | "comment" | "review" | "profile";
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!reason) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, reason, description }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit report");
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <span className="text-xs" style={{ color: "var(--or-subtle-gray)" }}>
        ✓ Reported
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-xs text-[var(--or-subtle-gray)] hover:text-[var(--destructive)] cursor-pointer bg-transparent border-0 p-0"
        title="Report"
      >
        <Flag className="h-3 w-3" />
        <span>Report</span>
      </button>

      {open && (
        <div className="absolute z-50 top-6 left-0 w-[280px] bg-white border border-[rgba(0,0,0,0.15)] shadow-lg p-3" style={{ borderRadius: 0 }}>
          <p className="text-xs font-bold mb-2" style={{ color: "var(--or-dark-blue)" }}>Report this {targetType}</p>
          <div className="space-y-1 mb-2">
            {REPORT_REASONS.map((r) => (
              <label key={r} className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-[var(--or-green)]"
                />
                {r}
              </label>
            ))}
          </div>
          <textarea
            placeholder="Additional details (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-2 py-1 text-xs border border-[#ccc] focus:outline-none focus:border-[var(--or-green)] resize-y mb-2"
            style={{ borderRadius: 0 }}
          />
          {error && <p className="text-xs mb-1" style={{ color: "var(--destructive)" }}>{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="h-[28px] px-3 text-xs text-white border-0 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: "var(--destructive)", borderRadius: 0 }}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
            <button
              onClick={() => { setOpen(false); setReason(""); setDescription(""); setError(null); }}
              className="h-[28px] px-3 text-xs border border-[#ccc] bg-white cursor-pointer"
              style={{ borderRadius: 0 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
