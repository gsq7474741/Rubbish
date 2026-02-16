import Link from "next/link";
import type { Venue } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { ActivityFeed } from "@/components/venue/ActivityFeed";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch all venues
  const { data: venues } = await supabase
    .from("venues")
    .select("*")
    .order("name");
  const typedVenues = (venues || []) as Venue[];

  // Split venues into categories
  const now = new Date();
  const openVenues = typedVenues.filter((v) => {
    if (!v.accepting_submissions) return false;
    if (v.deadline && new Date(v.deadline) < now) return false;
    return true;
  });
  const activeVenues = typedVenues.filter((v) => v.paper_count > 0 || v.accepting_submissions);
  const allVenues = typedVenues;

  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      {/* Hero Section */}
      <div
        className="py-8 mb-6 -mx-4 px-4"
        style={{ backgroundColor: "var(--or-green)" }}
      >
        <div className="max-w-[700px]">
          <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-white mb-2 leading-tight">
            We only accept rubbish.
          </h1>
          <p className="text-white/80 text-sm md:text-base mb-4 leading-relaxed">
            An open peer-review platform for academic failures, negative results, and spectacularly useless research.
            Submit your worst work — if it&apos;s too good, we&apos;ll reject it.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/submit"
              className="inline-block px-5 py-2 text-sm font-semibold bg-white hover:bg-[#f0f0f0] transition-colors"
              style={{ color: "var(--or-green)", borderRadius: 0 }}
            >
              Submit a Paper
            </Link>
            <Link
              href="/venues"
              className="inline-block px-5 py-2 text-sm font-semibold border border-white/60 text-white hover:bg-white/10 transition-colors"
              style={{ borderRadius: 0 }}
            >
              Browse Venues
            </Link>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left column */}
        <div className="flex-1 max-w-[550px]">
          {/* Open for Submissions */}
          {openVenues.length > 0 && (
            <section className="mb-8">
              <h2 className="text-base font-normal mb-3" style={{ color: "var(--or-dark-blue)" }}>
                Open for Submissions
              </h2>
              <ul className="list-none m-0 p-0 space-y-2">
                {openVenues.map((v) => (
                  <li key={v.slug} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/venue/${v.slug}`}
                      style={{ color: "var(--or-medium-blue)" }}
                      className="hover:underline"
                    >
                      {v.name}
                    </Link>
                    {v.deadline && (
                      <span className="text-xs text-[var(--or-subtle-gray)]">
                        Due: {new Date(v.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Active Venues */}
          <section className="mb-8">
            <h2 className="text-base font-normal mb-3" style={{ color: "var(--or-dark-blue)" }}>
              Active Venues
            </h2>
            <ul className="list-none m-0 p-0 space-y-2">
              {activeVenues.map((v) => (
                <li key={v.slug} className="text-sm">
                  <Link
                    href={`/venue/${v.slug}`}
                    style={{ color: "var(--or-medium-blue)" }}
                    className="hover:underline"
                  >
                    {v.name}
                  </Link>
                  {v.subtitle && (
                    <span className="text-xs text-[var(--or-subtle-gray)] ml-2">{v.subtitle}</span>
                  )}
                </li>
              ))}
              {activeVenues.length === 0 && (
                <li className="text-sm text-[var(--or-subtle-gray)]">No active venues yet.</li>
              )}
            </ul>
          </section>

          {/* Recent Activity */}
          <section className="mb-8">
            <h2 className="text-base font-normal mb-3" style={{ color: "var(--or-dark-blue)" }}>
              Recent Activity
            </h2>
            <ActivityFeed />
          </section>
        </div>

        {/* Right column */}
        <div className="hidden lg:block w-[350px]">
          {/* All Venues */}
          <section className="mb-8">
            <h2 className="text-base font-normal mb-3" style={{ color: "var(--or-dark-blue)" }}>
              All Venues
            </h2>
            <ul className="list-none m-0 p-0 space-y-1">
              {allVenues.map((v) => (
                <li key={v.slug} className="text-sm">
                  <Link
                    href={`/venue/${v.slug}`}
                    style={{ color: "var(--or-medium-blue)" }}
                    className="hover:underline"
                  >
                    {v.name}
                  </Link>
                  <span className="text-xs text-[var(--or-subtle-gray)] ml-1">
                    {v.accepting_submissions ? (
                      <span style={{ color: "var(--or-green)" }}>● open</span>
                    ) : (
                      <span>● closed</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Quick Links */}
          <section className="border-t border-[rgba(0,0,0,0.1)] pt-4">
            <h3 className="text-base font-normal mb-2" style={{ color: "var(--or-dark-blue)" }}>Quick Links</h3>
            <ul className="list-none m-0 p-0 text-sm space-y-1">
              <li><Link href="/submit" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">Submit a Paper</Link></li>
              <li><Link href="/about" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">About RubbishReview</Link></li>
              <li><Link href="/guidelines" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">Community Guidelines</Link></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
