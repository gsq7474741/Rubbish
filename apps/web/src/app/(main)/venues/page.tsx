import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Venue } from "@/lib/types";

export const metadata: Metadata = {
  title: "Venues — RubbishReview",
};

export default async function VenuesPage() {
  const supabase = await createClient();

  const { data: venues } = await supabase.from("venues").select("*").order("name");
  const typedVenues = (venues || []) as Venue[];

  // Fetch paper counts per venue
  const { data: paperCounts } = await supabase
    .from("papers")
    .select("venue_id")
    .then(({ data }) => {
      const counts: Record<string, number> = {};
      for (const p of data || []) {
        counts[p.venue_id] = (counts[p.venue_id] || 0) + 1;
      }
      return { data: counts };
    });

  const now = new Date();
  const openVenues = typedVenues.filter((v) => {
    if (!v.accepting_submissions) return false;
    if (v.deadline && new Date(v.deadline) < now) return false;
    return true;
  });
  const closedVenues = typedVenues.filter((v) => !openVenues.includes(v));

  const renderVenueCard = (v: Venue) => (
    <div key={v.slug} className="py-4 border-b border-[rgba(0,0,0,0.1)]">
      <h4 className="text-base font-bold m-0 leading-normal" style={{ color: "var(--or-green)" }}>
        <Link href={`/venue/${v.slug}`} className="hover:underline" style={{ color: "var(--or-green)" }}>
          {v.name}
        </Link>
      </h4>
      {v.subtitle && <p className="italic text-sm text-[var(--or-subtle-gray)] mb-1">{v.subtitle}</p>}
      {v.description && <p className="text-xs mb-2" style={{ color: "var(--or-dark-blue)" }}>{v.description}</p>}
      <ul className="list-none flex flex-wrap gap-x-4 m-0 p-0 text-xs text-[var(--or-subtle-gray)]">
        <li>{paperCounts?.[v.id] || 0} submissions</li>
        <li className="before:content-['·'] before:mr-2">
          Status:{" "}
          <strong style={{ color: v.accepting_submissions ? "var(--or-green)" : "var(--destructive)" }}>
            {v.accepting_submissions ? "Open" : "Closed"}
          </strong>
        </li>
        <li className="before:content-['·'] before:mr-2">
          Impact Factor: {v.impact_factor.toFixed(3)}
        </li>
        {v.deadline && (
          <li className="before:content-['·'] before:mr-2">
            Deadline:{" "}
            {new Date(v.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </li>
        )}
        {v.review_mode && (
          <li className="before:content-['·'] before:mr-2 capitalize">
            Review: {v.review_mode}
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-[850px]">
        <h1 className="text-[2.25rem] font-normal mb-2 mt-4" style={{ color: "var(--or-dark-blue)" }}>
          Venues
        </h1>
        <p className="text-sm text-[var(--or-subtle-gray)] mb-6">
          Browse all RubbishReview venues. Each venue focuses on a specific area of academic rubbish.
        </p>

        <hr className="border-0 border-t border-[rgba(0,0,0,0.1)] mb-6" />

        {/* Open for Submissions */}
        {openVenues.length > 0 && (
          <section className="mb-8">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--or-dark-blue)" }}>
              Open for Submissions ({openVenues.length})
            </h3>
            <div className="space-y-0">
              {openVenues.map(renderVenueCard)}
            </div>
          </section>
        )}

        {/* Closed / Other */}
        {closedVenues.length > 0 && (
          <section className="mb-8">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--or-subtle-gray)" }}>
              {openVenues.length > 0 ? `Other Venues (${closedVenues.length})` : `All Venues (${closedVenues.length})`}
            </h3>
            <div className="space-y-0">
              {closedVenues.map(renderVenueCard)}
            </div>
          </section>
        )}

        {typedVenues.length === 0 && (
          <p className="text-sm text-[var(--or-subtle-gray)] py-8 text-center">No venues available yet.</p>
        )}
      </div>
    </div>
  );
}
