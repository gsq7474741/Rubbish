"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RebuttalFormProps {
  paperId: string;
  reviewId: string;
}

export function RebuttalForm({ paperId, reviewId }: RebuttalFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/papers/${paperId}/reviews/${reviewId}/rebuttal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit rebuttal.");
        setLoading(false);
        return;
      }

      setContent("");
      setOpen(false);
      setLoading(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2 py-1 border border-[#ccc] bg-white hover:bg-[#f5f5f5] cursor-pointer mt-2"
        style={{ borderRadius: 0, color: "var(--or-medium-blue)" }}
      >
        ↩ Author Response
      </button>
    );
  }

  return (
    <div className="mt-3 p-3 border border-[rgba(0,0,0,0.1)]" style={{ backgroundColor: "#fff" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold" style={{ color: "var(--or-dark-blue)" }}>Author Rebuttal</span>
        <button
          onClick={() => setOpen(false)}
          className="text-xs px-2 py-0.5 border border-[#ccc] bg-white hover:bg-[#f5f5f5] cursor-pointer"
          style={{ borderRadius: 0 }}
        >
          Cancel
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your rebuttal / response to this review... (Markdown supported)"
        className="w-full h-20 text-sm p-2 border border-[#ccc] resize-y focus:outline-none focus:border-[var(--or-green)]"
        style={{ borderRadius: 0 }}
      />
      {error && <p className="text-xs mt-1" style={{ color: "var(--destructive)" }}>{error}</p>}
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="px-4 py-1 text-sm text-white border-0 cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
        >
          {loading ? "Submitting..." : "Submit Rebuttal"}
        </button>
      </div>
    </div>
  );
}
