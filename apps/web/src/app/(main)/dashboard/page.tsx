import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DECISIONS, PAPER_STATUS } from "@/lib/constants";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import type { Paper, Review } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard — RubbishReview",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "submissions" } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's submissions
  const { data: submissions } = await supabase
    .from("papers")
    .select("*, venue:venues!venue_id(name, slug)")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });
  const typedSubmissions = (submissions || []) as (Paper & { venue: { name: string; slug: string } | null })[];

  // Fetch user's reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, paper:papers!paper_id(id, title, status, venue_id, venue:venues!venue_id(name, slug))")
    .eq("reviewer_id", user.id)
    .order("created_at", { ascending: false });
  const typedReviews = (reviews || []) as (Review & { paper: { id: string; title: string; status: string; venue: { name: string; slug: string } | null } })[];

  // Fetch tasks: papers that need review (under_review, not authored by user, not yet reviewed by user)
  const { data: taskPapers } = await supabase
    .from("papers")
    .select("id, title, status, created_at, venue:venues!venue_id(name, slug), review_count")
    .eq("status", "under_review")
    .neq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Filter out papers already reviewed by user
  const reviewedPaperIds = new Set(typedReviews.map((r) => r.paper?.id).filter(Boolean));
  const tasks = (taskPapers || []).filter((p: { id: string }) => !reviewedPaperIds.has(p.id));

  // Unread notifications count
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  // Build submissions tab content
  const submissionsContent = (
    <div>
      {typedSubmissions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.1)]">
                <th className="text-left py-2 pr-4 font-semibold" style={{ color: "var(--or-dark-blue)" }}>#</th>
                <th className="text-left py-2 pr-4 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Title</th>
                <th className="text-left py-2 pr-4 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Venue</th>
                <th className="text-left py-2 pr-4 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Status</th>
                <th className="text-left py-2 pr-4 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Decision</th>
                <th className="text-left py-2 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Reviews</th>
              </tr>
            </thead>
            <tbody>
              {typedSubmissions.map((p) => (
                <tr key={p.id} className="border-b border-[rgba(0,0,0,0.05)]">
                  <td className="py-2 pr-4 text-[var(--or-subtle-gray)]">{p.number}</td>
                  <td className="py-2 pr-4">
                    <Link href={`/paper/${p.id}`} prefetch={false} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">
                    {p.venue ? (
                      <Link href={`/venue/${p.venue.slug}`} prefetch={false} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">
                        {p.venue.name}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="py-2 pr-4">
                    <span style={{ color: p.status === "published" ? "var(--or-green)" : p.status === "rejected_too_good" ? "var(--destructive)" : "var(--or-dark-blue)" }}>
                      {PAPER_STATUS[p.status as keyof typeof PAPER_STATUS] || p.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    {p.decision ? (
                      <span>{DECISIONS[p.decision as keyof typeof DECISIONS]?.label || p.decision}</span>
                    ) : "—"}
                  </td>
                  <td className="py-2">{p.review_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-[var(--or-subtle-gray)] mb-4">You haven&apos;t submitted any papers yet.</p>
          <Link
            href="/submit"
            className="inline-block px-4 py-2 text-sm text-white"
            style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
          >
            Submit a Paper
          </Link>
        </div>
      )}
    </div>
  );

  // Build reviews tab content
  const reviewsContent = (
    <div>
      {typedReviews.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.1)]">
                <th className="text-left py-2 pr-4 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Paper</th>
                <th className="text-left py-2 pr-4 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Venue</th>
                <th className="text-left py-2 pr-4 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Rubbish</th>
                <th className="text-left py-2 pr-4 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Uselessness</th>
                <th className="text-left py-2 pr-4 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Entertainment</th>
                <th className="text-left py-2 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {typedReviews.map((r) => (
                <tr key={r.id} className="border-b border-[rgba(0,0,0,0.05)]">
                  <td className="py-2 pr-4">
                    <Link href={`/paper/${r.paper?.id}`} prefetch={false} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">
                      {r.paper?.title || "Unknown"}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">
                    {r.paper?.venue ? (
                      <Link href={`/venue/${r.paper.venue.slug}`} prefetch={false} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">
                        {r.paper.venue.name}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="py-2 pr-4">{r.rubbish_score}/10</td>
                  <td className="py-2 pr-4">{r.uselessness_score}/10</td>
                  <td className="py-2 pr-4">{r.entertainment_score}/10</td>
                  <td className="py-2">
                    {DECISIONS[r.recommendation as keyof typeof DECISIONS]?.label || r.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-[var(--or-subtle-gray)] py-8 text-center">You haven&apos;t submitted any reviews yet.</p>
      )}
    </div>
  );

  // Build tasks tab content
  const tasksContent = (
    <div className="space-y-4">
      {(unreadCount || 0) > 0 && (
        <div className="p-3 border border-[rgba(0,0,0,0.1)]" style={{ backgroundColor: "var(--or-sandy)" }}>
          <span className="text-xs" style={{ color: "var(--or-dark-blue)" }}>
            You have <strong>{unreadCount}</strong> unread notification{(unreadCount || 0) > 1 ? "s" : ""}.{" "}
            <Link href="/notifications" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">
              View notifications →
            </Link>
          </span>
        </div>
      )}

      {tasks.length > 0 ? (
        <div>
          <h4 className="text-xs font-semibold mb-2" style={{ color: "var(--or-dark-blue)" }}>
            Papers Awaiting Review
          </h4>
          <ul className="list-none m-0 p-0 space-y-2">
            {tasks.map((p: Record<string, unknown>) => {
              const venue = Array.isArray(p.venue) ? p.venue[0] : p.venue;
              return (
                <li key={p.id as string} className="text-xs border-l-[3px] border-[#ddd] pl-3 py-1">
                  <Link href={`/paper/${p.id}`} prefetch={false} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">
                    {p.title as string}
                  </Link>
                  <span className="text-[var(--or-subtle-gray)] ml-2">
                    {(venue as { name: string })?.name || "Unknown venue"} · {p.review_count as number} reviews · {new Date(p.created_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-[var(--or-subtle-gray)] py-4">No pending tasks. You&apos;re all caught up!</p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-[950px]">
        <h1 className="text-[2.25rem] font-normal mb-2 mt-4" style={{ color: "var(--or-dark-blue)" }}>
          Dashboard
        </h1>
        <p className="text-sm text-[var(--or-subtle-gray)] mb-6">
          Manage your submissions, reviews, and tasks.
        </p>

        <hr className="border-0 border-t border-[rgba(0,0,0,0.1)] mb-4" />

        <DashboardTabs
          tabs={[
            { id: "submissions", label: `My Submissions (${typedSubmissions.length})`, content: submissionsContent },
            { id: "reviews", label: `My Reviews (${typedReviews.length})`, content: reviewsContent },
            { id: "tasks", label: `Tasks${tasks.length > 0 ? ` (${tasks.length})` : ""}`, content: tasksContent },
          ]}
          defaultTab={tab}
        />
      </div>
    </div>
  );
}
