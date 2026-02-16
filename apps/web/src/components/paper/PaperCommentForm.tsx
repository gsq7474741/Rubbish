"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function PaperCommentForm({ paperId }: { paperId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/papers/${paperId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          setError("Please log in to comment.");
        } else {
          setError(data.error || "Failed to submit comment.");
        }
        setLoading(false);
        return;
      }

      setContent("");
      setLoading(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="p-3 border border-[rgba(0,0,0,0.1)] mb-8" style={{ backgroundColor: "var(--or-sandy)" }}>
      <textarea
        placeholder="Write a reply..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
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
          {loading ? "Submitting..." : "Submit Reply"}
        </button>
      </div>
    </div>
  );
}
