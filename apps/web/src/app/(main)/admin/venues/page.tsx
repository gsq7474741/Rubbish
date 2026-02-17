"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Application {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  review_mode: string;
  website: string | null;
  contact: string | null;
  status: string;
  review_notes: string | null;
  created_at: string;
  applicant?: {
    id: string;
    display_name: string | null;
    username: string;
  };
}

export default function AdminVenuesPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const res = await fetch("/api/venue-applications");
      const data = await res.json();
      setApplications(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, action: "approved" | "rejected", notes?: string) {
    setProcessing(id);
    try {
      const res = await fetch(`/api/venue-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action, review_notes: notes }),
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  }

  const filtered = applications.filter((a) => filter === "all" || a.status === filter);

  return (
    <div className="container mx-auto px-4 py-8" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-sm" style={{ color: "var(--or-medium-blue)" }}>
            ← Back to Admin
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--or-dark-blue)" }}>
          Venue Applications
        </h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm border ${
                filter === f ? "bg-white" : "bg-transparent"
              }`}
              style={{
                borderRadius: 0,
                borderColor: "rgba(0,0,0,0.2)",
                color: filter === f ? "var(--or-dark-blue)" : "var(--or-subtle-gray)",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: "var(--or-subtle-gray)" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--or-subtle-gray)" }}>No applications found.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((app) => (
              <div
                key={app.id}
                className="p-4 border bg-white"
                style={{ borderRadius: 0, borderColor: "rgba(0,0,0,0.1)" }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--or-dark-blue)" }}>
                      {app.name}
                    </h3>
                    <p className="text-xs" style={{ color: "var(--or-light-gray)" }}>
                      slug: {app.slug}
                    </p>
                  </div>
                  <span
                    className="px-2 py-1 text-xs"
                    style={{
                      backgroundColor:
                        app.status === "approved"
                          ? "#c6f6d5"
                          : app.status === "rejected"
                          ? "#fed7d7"
                          : "#feebc8",
                      color:
                        app.status === "approved"
                          ? "#22543d"
                          : app.status === "rejected"
                          ? "#742a2a"
                          : "#744210",
                    }}
                  >
                    {app.status}
                  </span>
                </div>

                {app.subtitle && (
                  <p className="text-sm mb-2" style={{ color: "var(--or-subtle-gray)" }}>
                    {app.subtitle}
                  </p>
                )}

                {app.description && (
                  <p className="text-sm mb-2" style={{ color: "var(--or-medium-gray)" }}>
                    {app.description}
                  </p>
                )}

                <div className="flex gap-4 text-xs mb-2" style={{ color: "var(--or-light-gray)" }}>
                  <span>Mode: {app.review_mode}</span>
                  {app.website && (
                    <a
                      href={app.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: "var(--or-medium-blue)" }}
                    >
                      Website
                    </a>
                  )}
                  {app.contact && <span>Contact: {app.contact}</span>}
                </div>

                <div className="text-xs mb-3" style={{ color: "var(--or-light-gray)" }}>
                  Applicant: {app.applicant?.display_name || app.applicant?.username || "Unknown"} •{" "}
                  {new Date(app.created_at).toLocaleDateString()}
                </div>

                {app.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const notes = prompt("Optional notes for approval:");
                        handleAction(app.id, "approved", notes || undefined);
                      }}
                      disabled={processing === app.id}
                      className="px-3 py-1 text-sm text-white cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt("Reason for rejection (required):");
                        if (notes) handleAction(app.id, "rejected", notes);
                      }}
                      disabled={processing === app.id}
                      className="px-3 py-1 text-sm text-white cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: "#e53e3e", borderRadius: 0 }}
                    >
                      Reject
                    </button>
                  </div>
                )}

                {app.review_notes && (
                  <p className="text-xs mt-2 p-2" style={{ backgroundColor: "var(--or-sandy)", color: "var(--or-dark-blue)" }}>
                    Notes: {app.review_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
