"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface VoteButtonProps {
  targetType: "paper" | "review" | "comment";
  targetId: string;
  initialCount: number;
  initialVote?: 1 | -1 | null;
}

export function VoteButton({ targetType, targetId, initialCount, initialVote = null }: VoteButtonProps) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [vote, setVote] = useState<1 | -1 | null>(initialVote);
  const [loading, setLoading] = useState(false);

  async function handleVote(value: 1 | -1) {
    setLoading(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          value: vote === value ? 0 : value,
        }),
      });

      if (res.status === 401) {
        setLoading(false);
        return;
      }

      if (res.ok) {
        if (vote === value) {
          // Removing vote
          setCount(count - value);
          setVote(null);
        } else if (vote === null) {
          // New vote
          setCount(count + value);
          setVote(value);
        } else {
          // Changing vote direction
          setCount(count + value * 2);
          setVote(value);
        }
        router.refresh();
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`text-xs px-1.5 py-0.5 border cursor-pointer transition-colors ${
          vote === 1
            ? "border-[var(--or-green)] bg-[var(--accent)]"
            : "border-[rgba(0,0,0,0.1)] bg-white hover:border-[var(--or-green)]"
        }`}
        style={{ borderRadius: 0, color: vote === 1 ? "var(--or-green)" : "var(--or-subtle-gray)" }}
        title="Upvote"
      >
        ▲
      </button>
      <span className="text-xs font-semibold min-w-[20px] text-center" style={{ color: count > 0 ? "var(--or-green)" : count < 0 ? "var(--destructive)" : "var(--or-subtle-gray)" }}>
        {count}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`text-xs px-1.5 py-0.5 border cursor-pointer transition-colors ${
          vote === -1
            ? "border-[var(--destructive)] bg-red-50"
            : "border-[rgba(0,0,0,0.1)] bg-white hover:border-[var(--destructive)]"
        }`}
        style={{ borderRadius: 0, color: vote === -1 ? "var(--destructive)" : "var(--or-subtle-gray)" }}
        title="Downvote"
      >
        ▼
      </button>
    </div>
  );
}
