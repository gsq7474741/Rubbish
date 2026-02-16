"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface VenueOption {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  accepting_submissions: boolean;
  deadline: string | null;
}

export default function SubmitPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/venues")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setVenues(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openVenues = venues.filter((v) => v.accepting_submissions);
  const closedVenues = venues.filter((v) => !v.accepting_submissions);

  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-[850px]">
        <h1 className="text-[2.25rem] font-normal mb-2 mt-4" style={{ color: "var(--or-dark-blue)" }}>
          Submit a Paper
        </h1>
        <p className="text-sm text-[var(--or-subtle-gray)] mb-6">
          Select a venue to submit your academic rubbish. Each venue has its own submission page and guidelines.
        </p>

        <hr className="border-0 border-t border-[rgba(0,0,0,0.1)] mb-6" />

        {loading ? (
          <p className="text-sm text-[var(--or-subtle-gray)] py-4">Loading venues...</p>
        ) : (
          <>
            {/* Open Venues */}
            {openVenues.length > 0 && (
              <div className="mb-8">
                <h3 className="text-base font-normal mb-3" style={{ color: "var(--or-dark-blue)" }}>
                  Open for Submissions
                </h3>
                <div className="space-y-2">
                  {openVenues.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => router.push(`/venue/${v.slug}/submit`)}
                      className="p-4 border border-[rgba(0,0,0,0.1)] cursor-pointer hover:border-[var(--or-green)] transition-colors"
                      style={{ borderRadius: 0 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-semibold" style={{ color: "var(--or-green)" }}>
                            {v.name}
                          </span>
                          {v.subtitle && (
                            <span className="text-xs text-[var(--or-subtle-gray)] ml-2">{v.subtitle}</span>
                          )}
                        </div>
                        {v.deadline && (
                          <span className="text-xs text-[var(--or-subtle-gray)]">
                            Deadline: {new Date(v.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Closed Venues */}
            {closedVenues.length > 0 && (
              <div className="mb-8">
                <h3 className="text-base font-normal mb-3" style={{ color: "var(--or-subtle-gray)" }}>
                  Closed
                </h3>
                <div className="space-y-2 opacity-60">
                  {closedVenues.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 border border-[rgba(0,0,0,0.1)]"
                      style={{ borderRadius: 0 }}
                    >
                      <span className="text-sm" style={{ color: "var(--or-dark-blue)" }}>
                        {v.name}
                      </span>
                      <span className="text-xs text-[var(--or-subtle-gray)] ml-2">— Submissions closed</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {venues.length === 0 && (
              <p className="text-sm text-[var(--or-subtle-gray)] py-4">No venues available.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
