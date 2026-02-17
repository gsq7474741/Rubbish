"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Report {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter?: { username: string; display_name: string | null };
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?status=${filter}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) {
          router.push("/dashboard");
          return;
        }
        setReports(res.data || []);
      })
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [filter, router]);

  async function handleResolve(id: string, status: "resolved" | "dismissed") {
    setResolving(id);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    } catch { /* ignore */ }
    setResolving(null);
  }

  function getTargetLink(r: Report) {
    if (r.target_type === "paper") return `/paper/${r.target_id}`;
    if (r.target_type === "profile") return `/profile/${r.target_id}`;
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-sm hover:underline" style={{ color: "var(--or-medium-blue)" }}>← Admin</Link>
          <h1 className="text-2xl font-bold" style={{ color: "var(--or-dark-blue)" }}>Reports</h1>
        </div>

        <div className="flex gap-2 mb-4">
          {["pending", "resolved", "dismissed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`h-[32px] px-3 text-sm border cursor-pointer ${filter === s ? "text-white" : "bg-white"}`}
              style={{
                borderRadius: 0,
                backgroundColor: filter === s ? "var(--or-green)" : undefined,
                borderColor: filter === s ? "var(--or-green)" : "#ccc",
                color: filter === s ? "white" : "var(--or-dark-blue)",
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-[var(--or-subtle-gray)]">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-[var(--or-subtle-gray)]">No {filter} reports.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => {
              const link = getTargetLink(r);
              return (
                <div key={r.id} className="p-4 border border-[rgba(0,0,0,0.1)] bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 font-semibold" style={{ backgroundColor: "var(--or-sandy)", color: "var(--or-dark-blue)" }}>
                          {r.target_type}
                        </span>
                        <span className="text-xs text-[var(--or-subtle-gray)]">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-semibold mb-1" style={{ color: "var(--or-dark-blue)" }}>{r.reason}</p>
                      {r.description && <p className="text-xs text-[var(--or-subtle-gray)] mb-1">{r.description}</p>}
                      <p className="text-xs text-[var(--or-subtle-gray)]">
                        Reported by: {r.reporter?.display_name || r.reporter?.username || "Unknown"}
                      </p>
                      {link && (
                        <Link href={link} className="text-xs hover:underline" style={{ color: "var(--or-medium-blue)" }}>
                          View target →
                        </Link>
                      )}
                    </div>
                    {filter === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleResolve(r.id, "resolved")}
                          disabled={resolving === r.id}
                          className="h-[28px] px-3 text-xs text-white border-0 cursor-pointer disabled:opacity-50"
                          style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleResolve(r.id, "dismissed")}
                          disabled={resolving === r.id}
                          className="h-[28px] px-3 text-xs border border-[#ccc] bg-white cursor-pointer disabled:opacity-50"
                          style={{ borderRadius: 0 }}
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
