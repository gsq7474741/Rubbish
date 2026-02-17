import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PaperCard } from "@/components/paper/PaperCard";
import { VenueHeader } from "@/components/venue/VenueHeader";
import { SubmissionButton } from "@/components/venue/SubmissionButton";
import { VenueTabs } from "@/components/venue/VenueTabs";
import { ActivityFeed } from "@/components/venue/ActivityFeed";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { anonymizeList } from "@/lib/anonymize";
import type { Paper, Venue } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: venue } = await supabase.from("venues").select("name, subtitle").eq("slug", slug).single();
  return {
    title: venue?.name || "Venue",
    description: venue?.subtitle || `${venue?.name} on RubbishReview`,
    openGraph: { title: venue?.name || "Venue" },
  };
}

export default async function VenuePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { slug } = await params;
  const { status, page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Fetch venue
  const { data: venueData, error: venueError } = await supabase
    .from("venues")
    .select("*")
    .eq("slug", slug)
    .single();

  if (venueError || !venueData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-[1.875rem] font-normal" style={{ color: "var(--or-dark-blue)" }}>404 — Venue Not Found</h2>
        <p className="text-sm text-[var(--or-subtle-gray)] mt-2">This venue does not exist.</p>
      </div>
    );
  }

  const venue = venueData as Venue;

  // Fetch papers for this venue
  let papersQuery = supabase
    .from("papers")
    .select("*, author:profiles!author_id(*), venue:venues!venue_id(*)", { count: "exact" })
    .eq("venue_id", venue.id)
    .order("created_at", { ascending: false });

  if (status) {
    papersQuery = papersQuery.eq("status", status);
  }

  const { data: papers, count } = await papersQuery.range(offset, offset + limit - 1);
  const anonPapers = anonymizeList((papers || []) as unknown as Record<string, unknown>[], "author", "author_id");
  const typedPapers = anonPapers as unknown as Paper[];
  const totalPages = Math.ceil((count || 0) / limit);

  const filterOptions = [
    { key: "", label: "All" },
    { key: "published", label: "Published" },
    { key: "under_review", label: "Under Review" },
    { key: "submitted", label: "Submitted" },
  ];

  // Build submissions tab content
  const submissionsContent = (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-4 mb-4 text-sm border-b border-[rgba(0,0,0,0.1)] pb-2">
        <span className="text-[var(--or-subtle-gray)]">Filter:</span>
        {filterOptions.map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/venue/${slug}?status=${f.key}` : `/venue/${slug}`}
            prefetch={false}
            className={(status || "") === f.key ? "font-semibold" : "hover:underline"}
            style={{ color: (status || "") === f.key ? "var(--or-green)" : "var(--or-medium-blue)" }}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Papers list */}
      {typedPapers.length > 0 ? (
        <div>
          <p className="text-sm text-[var(--or-subtle-gray)] mb-4">Showing {count || 0} submissions</p>
          {typedPapers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-[var(--or-subtle-gray)] mb-4">No submissions yet. Be the first to submit!</p>
          <Link
            href={`/venue/${slug}/submit`}
            prefetch={false}
            className="inline-block px-4 py-2 text-sm text-white"
            style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
          >
            Submit to {venue.name}
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm">
          {page > 1 ? (
            <Link href={`/venue/${slug}?${status ? `status=${status}&` : ""}page=${page - 1}`} prefetch={false} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">← Previous</Link>
          ) : (
            <span className="text-[var(--or-subtle-gray)]">← Previous</span>
          )}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = i + 1;
            return p === page ? (
              <span key={p} className="px-2 py-1 font-bold" style={{ color: "var(--or-green)" }}>{p}</span>
            ) : (
              <Link key={p} href={`/venue/${slug}?${status ? `status=${status}&` : ""}page=${p}`} prefetch={false} style={{ color: "var(--or-medium-blue)" }} className="px-2 py-1 hover:underline">{p}</Link>
            );
          })}
          {page < totalPages ? (
            <Link href={`/venue/${slug}?${status ? `status=${status}&` : ""}page=${page + 1}`} prefetch={false} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">Next →</Link>
          ) : (
            <span className="text-[var(--or-subtle-gray)]">Next →</span>
          )}
        </div>
      )}
    </div>
  );

  // Fetch sub-venues (child venues)
  const { data: subVenues } = await supabase
    .from("venues")
    .select("id, slug, name, subtitle, paper_count, accepting_submissions")
    .eq("parent_venue_id", venue.id)
    .order("name", { ascending: true });

  // Fetch parent venue if this is a sub-venue
  let parentVenue: { slug: string; name: string } | null = null;
  if (venue.parent_venue_id) {
    const { data: pv } = await supabase
      .from("venues")
      .select("slug, name")
      .eq("id", venue.parent_venue_id)
      .single();
    parentVenue = pv;
  }

  // Build about tab content
  const aboutContent = (
    <div className="text-sm space-y-4" style={{ color: "var(--or-dark-blue)" }}>
      {venue.description && <p>{venue.description}</p>}
      {venue.instructions && <MarkdownRenderer content={venue.instructions} />}
      {!venue.description && !venue.instructions && (
        <p className="text-[var(--or-subtle-gray)]">No additional information available for this venue.</p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      {/* Breadcrumb banner */}
      <div className="py-2 border-b border-[#d0d0d0] mb-4" style={{ backgroundColor: "var(--or-bg-gray)", marginLeft: "-1rem", marginRight: "-1rem", paddingLeft: "1rem", paddingRight: "1rem" }}>
        <span className="text-sm text-[var(--or-subtle-gray)]">
          <Link href="/venues" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">All Venues</Link>
          {parentVenue && (
            <>
              {" › "}
              <Link href={`/venue/${parentVenue.slug}`} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">{parentVenue.name}</Link>
            </>
          )}
        </span>
      </div>

      <div className="max-w-[850px]">
        {/* Venue Header */}
        <VenueHeader venue={venue} />

        <hr className="border-0 border-t border-[rgba(0,0,0,0.1)] my-4" />

        {/* Submission Button */}
        <SubmissionButton venue={venue} />

        {/* Management links (creator/editors/system_admin) */}
        {await (async () => {
          if (!currentUser) return null;
          const isCreator = venue.created_by === currentUser.id;
          const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single();
          const isSystemAdmin = userProfile?.role === "system_admin";
          const { data: editorCheck } = await supabase
            .from("venue_editors")
            .select("role")
            .eq("venue_id", venue.id)
            .eq("user_id", currentUser.id)
            .single();
          const isEditor = !!editorCheck;
          const canManage = isCreator || isEditor || isSystemAdmin;
          if (!canManage) return null;
          return (
            <div className="mb-4 flex items-center gap-4">
              <Link href={`/venue/${slug}/edit`} className="text-xs hover:underline" style={{ color: "var(--or-medium-blue)" }}>
                ✏️ Edit Venue
              </Link>
              <Link href={`/venue/${slug}/manage`} className="text-xs hover:underline" style={{ color: "var(--or-medium-blue)" }}>
                ⚙ Manage Editors
              </Link>
            </div>
          );
        })()}

        {/* Tabs: Submissions | Sub-Venues? | Activity | About */}
        <VenueTabs
          tabs={[
            { id: "submissions", label: `Submissions (${count || 0})`, content: submissionsContent },
            ...((subVenues && subVenues.length > 0) ? [{
              id: "sub-venues",
              label: `Sub-Venues (${subVenues.length})`,
              content: (
                <div className="space-y-2">
                  {subVenues.map((sv) => (
                    <Link
                      key={sv.id}
                      href={`/venue/${sv.slug}`}
                      prefetch={false}
                      className="block p-4 border border-[rgba(0,0,0,0.1)] bg-white hover:shadow-sm transition-shadow"
                      style={{ borderRadius: 0 }}
                    >
                      <h3 className="text-sm font-semibold" style={{ color: "var(--or-dark-blue)" }}>{sv.name}</h3>
                      {sv.subtitle && <p className="text-xs text-[var(--or-subtle-gray)] mt-1">{sv.subtitle}</p>}
                      <div className="flex gap-3 mt-2 text-xs text-[var(--or-subtle-gray)]">
                        <span>{sv.paper_count || 0} papers</span>
                        <span style={{ color: sv.accepting_submissions ? "var(--or-green)" : "var(--destructive)" }}>
                          {sv.accepting_submissions ? "Open" : "Closed"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ),
            }] : []),
            { id: "activity", label: "Activity", content: <ActivityFeed venueId={venue.id} /> },
            { id: "about", label: "About", content: aboutContent },
          ]}
          defaultTab="submissions"
        />
      </div>
    </div>
  );
}
