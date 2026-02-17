"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WithdrawButton({ paperId, paperTitle }: { paperId: string; paperTitle: string }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleWithdraw() {
    setWithdrawing(true);
    setError(null);
    try {
      const res = await fetch(`/api/papers/${paperId}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to withdraw");
        setWithdrawing(false);
        return;
      }
      router.refresh();
      setShowConfirm(false);
    } catch {
      setError("Network error");
      setWithdrawing(false);
    }
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="text-xs border border-[#ccc] px-3 py-1.5 bg-white hover:bg-[#f5f5f5] cursor-pointer inline-flex items-center gap-1"
        style={{ borderRadius: 0, color: "var(--destructive)" }}
      >
        🚫 Withdraw
      </button>
    );
  }

  return (
    <div className="w-full p-3 border border-[rgba(0,0,0,0.1)] mt-2" style={{ backgroundColor: "var(--or-sandy)" }}>
      <p className="text-sm font-semibold mb-2" style={{ color: "var(--destructive)" }}>
        Withdraw &quot;{paperTitle}&quot;?
      </p>
      <p className="text-xs text-[var(--or-subtle-gray)] mb-2">
        This action will mark your paper as withdrawn. It will remain visible but clearly labeled as withdrawn.
      </p>
      <textarea
        placeholder="Reason for withdrawal (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)] resize-y mb-2"
        style={{ borderRadius: 0 }}
      />
      {error && <p className="text-xs mb-2" style={{ color: "var(--destructive)" }}>{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleWithdraw}
          disabled={withdrawing}
          className="h-[32px] px-4 text-xs text-white border-0 cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: "var(--destructive)", borderRadius: 0 }}
        >
          {withdrawing ? "Withdrawing..." : "Confirm Withdraw"}
        </button>
        <button
          onClick={() => { setShowConfirm(false); setError(null); }}
          className="h-[32px] px-4 text-xs border border-[#ccc] bg-white hover:bg-[#f5f5f5] cursor-pointer"
          style={{ borderRadius: 0 }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
