"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DECISIONS } from "@/lib/constants";

interface ReviewFormProps {
  paperId: string;
}

export function ReviewForm({ paperId }: ReviewFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rubbishScore, setRubbishScore] = useState(5);
  const [uselessnessScore, setUselessnessScore] = useState(5);
  const [entertainmentScore, setEntertainmentScore] = useState(5);
  const [summary, setSummary] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [recommendation, setRecommendation] = useState<string>("certified_rubbish");
  const [isAnonymous, setIsAnonymous] = useState(false);

  async function handleSubmit() {
    if (!summary.trim()) {
      setError("Summary is required.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/papers/${paperId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rubbish_score: rubbishScore,
          uselessness_score: uselessnessScore,
          entertainment_score: entertainmentScore,
          summary: summary.trim(),
          strengths: strengths.trim() || null,
          weaknesses: weaknesses.trim() || null,
          recommendation,
          is_anonymous: isAnonymous,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit review.");
        setLoading(false);
        return;
      }

      setOpen(false);
      setSummary("");
      setStrengths("");
      setWeaknesses("");
      setRubbishScore(5);
      setUselessnessScore(5);
      setEntertainmentScore(5);
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
        className="h-[38px] px-4 text-sm text-white border-0 cursor-pointer mb-6"
        style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
      >
        ✏️ Submit Official Review
      </button>
    );
  }

  return (
    <div className="border border-[rgba(0,0,0,0.1)] p-4 mb-6" style={{ backgroundColor: "var(--or-sandy)" }}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold m-0" style={{ color: "var(--or-green)" }}>
          Official Review Form
        </h4>
        <button
          onClick={() => setOpen(false)}
          className="text-xs px-2 py-1 border border-[#ccc] bg-white hover:bg-[#f5f5f5] cursor-pointer"
          style={{ borderRadius: 0 }}
        >
          Cancel
        </button>
      </div>

      {/* Scores */}
      <div className="space-y-3 mb-4">
        <ScoreSlider label="Rubbish Score (垃圾程度)" value={rubbishScore} onChange={setRubbishScore} />
        <ScoreSlider label="Uselessness Score (无用程度)" value={uselessnessScore} onChange={setUselessnessScore} />
        <ScoreSlider label="Entertainment Score (娱乐价值)" value={entertainmentScore} onChange={setEntertainmentScore} />
      </div>

      {/* Summary */}
      <div className="mb-3">
        <label className="block text-xs font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>
          Summary *
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Summarize the main contributions and overall quality of this rubbish..."
          className="w-full h-24 text-sm p-2 border border-[#ccc] resize-y focus:outline-none focus:border-[var(--or-green)]"
          style={{ borderRadius: 0 }}
        />
      </div>

      {/* Strengths */}
      <div className="mb-3">
        <label className="block text-xs font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>
          Strengths (优点)
        </label>
        <textarea
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
          placeholder="What makes this paper particularly rubbish? List the strengths..."
          className="w-full h-20 text-sm p-2 border border-[#ccc] resize-y focus:outline-none focus:border-[var(--or-green)]"
          style={{ borderRadius: 0 }}
        />
      </div>

      {/* Weaknesses */}
      <div className="mb-3">
        <label className="block text-xs font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>
          Weaknesses (缺点 — 在这里是褒义)
        </label>
        <textarea
          value={weaknesses}
          onChange={(e) => setWeaknesses(e.target.value)}
          placeholder="Any aspects that are unfortunately too good or too useful?..."
          className="w-full h-20 text-sm p-2 border border-[#ccc] resize-y focus:outline-none focus:border-[var(--or-green)]"
          style={{ borderRadius: 0 }}
        />
      </div>

      {/* Recommendation */}
      <div className="mb-3">
        <label className="block text-xs font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>
          Recommendation *
        </label>
        <div className="space-y-1">
          {(Object.entries(DECISIONS) as [string, { label: string; description: string }][]).map(([key, dec]) => (
            <label
              key={key}
              className={`flex items-start gap-2 p-2 border cursor-pointer transition-colors ${
                recommendation === key
                  ? "border-[var(--or-green)] bg-[var(--accent)]"
                  : "border-[rgba(0,0,0,0.1)] hover:border-[var(--or-green)]"
              }`}
              style={{ borderRadius: 0 }}
            >
              <input
                type="radio"
                name="recommendation"
                value={key}
                checked={recommendation === key}
                onChange={() => setRecommendation(key)}
                className="mt-0.5"
              />
              <div>
                <span className="text-xs font-semibold" style={{ color: "var(--or-dark-blue)" }}>{dec.label}</span>
                <p className="text-xs text-[var(--or-subtle-gray)] m-0">{dec.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Anonymous toggle */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: "var(--or-dark-blue)" }}>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          Submit anonymously
        </label>
      </div>

      {error && <p className="text-xs mb-2" style={{ color: "var(--destructive)" }}>{error}</p>}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading || !summary.trim()}
          className="h-[38px] px-6 text-sm text-white border-0 cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}

function ScoreSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-bold" style={{ color: "var(--or-dark-blue)" }}>{label}</label>
        <span className="text-xs font-bold px-2 py-0.5" style={{ color: "var(--or-green)", backgroundColor: "var(--accent)" }}>
          {value}/10
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-[var(--or-subtle-gray)] w-4">1</span>
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="flex-1 h-2 accent-[#138c24]"
        />
        <span className="text-xs text-[var(--or-subtle-gray)] w-6 text-right">10</span>
      </div>
    </div>
  );
}
