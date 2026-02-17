"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface VersionInfo {
  id: string;
  revision_number: number;
  title: string;
  status: string;
  created_at: string;
}

export default function RevisionsPage() {
  const params = useParams();
  const id = params.id as string;

  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/papers/${id}/revise`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) {
          setError(res.error);
        } else {
          setVersions(res.data || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load version history");
        setLoading(false);
      });
  }, [id]);

  const statusColors: Record<string, string> = {
    submitted: "var(--or-subtle-gray)",
    under_review: "#d4a017",
    published: "var(--or-green)",
    rejected_too_good: "var(--destructive)",
    withdrawn: "#888",
  };

  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-[700px]">
        <div className="py-2 border-b border-[#d0d0d0] mb-4" style={{ backgroundColor: "var(--or-bg-gray)", marginLeft: "-1rem", marginRight: "-1rem", paddingLeft: "1rem", paddingRight: "1rem" }}>
          <span className="text-sm text-[var(--or-subtle-gray)]">
            <Link href={`/paper/${id}`} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">← Back to Paper</Link>
          </span>
        </div>

        <h1 className="text-[2.25rem] font-normal mb-2 mt-4" style={{ color: "var(--or-dark-blue)" }}>
          Revision History
        </h1>
        <p className="text-xs text-[var(--or-subtle-gray)] mb-6">
          All versions of this submission, from earliest to latest.
        </p>

        {loading ? (
          <p className="text-sm text-[var(--or-subtle-gray)] py-8 text-center">Loading...</p>
        ) : error ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--destructive)" }}>{error}</p>
        ) : versions.length === 0 ? (
          <p className="text-sm text-[var(--or-subtle-gray)] py-8 text-center">No version history found.</p>
        ) : (
          <div className="space-y-0">
            {versions.map((v, i) => {
              const isCurrent = v.id === id;
              const isLatest = i === versions.length - 1;
              return (
                <div
                  key={v.id}
                  className={`flex items-start gap-4 p-4 border border-[rgba(0,0,0,0.1)] ${isCurrent ? "border-l-[3px] border-l-[var(--or-green)]" : ""}`}
                  style={{ backgroundColor: isCurrent ? "var(--accent)" : "white" }}
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-1">
                    <div
                      className="w-3 h-3 rounded-full border-2"
                      style={{
                        borderColor: isCurrent ? "var(--or-green)" : "#ccc",
                        backgroundColor: isCurrent ? "var(--or-green)" : "white",
                      }}
                    />
                    {i < versions.length - 1 && (
                      <div className="w-px h-8 mt-1" style={{ backgroundColor: "#ddd" }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold" style={{ color: "var(--or-dark-blue)" }}>
                        v{v.revision_number}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 font-semibold text-white" style={{ backgroundColor: "var(--or-green)" }}>
                          CURRENT
                        </span>
                      )}
                      {isLatest && !isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 font-semibold" style={{ backgroundColor: "var(--or-sandy)", color: "var(--or-dark-blue)" }}>
                          LATEST
                        </span>
                      )}
                      <span
                        className="text-[10px] px-1.5 py-0.5 font-semibold"
                        style={{ color: statusColors[v.status] || "var(--or-subtle-gray)" }}
                      >
                        {v.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                    <Link
                      href={`/paper/${v.id}`}
                      className="text-sm hover:underline block truncate"
                      style={{ color: isCurrent ? "var(--or-dark-blue)" : "var(--or-medium-blue)" }}
                    >
                      {v.title}
                    </Link>
                    <p className="text-xs text-[var(--or-subtle-gray)] mt-1">
                      {new Date(v.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
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
