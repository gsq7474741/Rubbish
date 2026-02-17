import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PaperCard } from "@/components/paper/PaperCard";
import { DECISIONS } from "@/lib/constants";
import type { Paper, Profile } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return { title: `${username} — Profile` };
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { username } = await params;
  const { tab = "papers" } = await searchParams;
  const supabase = await createClient();

  // Try to find profile by username first, then by id
  let profileData: Profile | null = null;
  const { data: byUsername } = await supabase.from("profiles").select("*").eq("username", username).single();
  if (byUsername) {
    profileData = byUsername as Profile;
  } else {
    const { data: byId } = await supabase.from("profiles").select("*").eq("id", username).single();
    if (byId) profileData = byId as Profile;
  }

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-[1.875rem] font-normal" style={{ color: "var(--or-dark-blue)" }}>404 — User Not Found</h2>
        <p className="text-sm text-[var(--or-subtle-gray)] mt-2">This user does not exist.</p>
        <Link href="/" className="text-sm mt-4 inline-block" style={{ color: "var(--or-medium-blue)" }}>← Back to Home</Link>
      </div>
    );
  }

  const profile = profileData;

  // Fetch stats
  const { count: paperCount } = await supabase.from("papers").select("id", { count: "exact", head: true }).eq("author_id", profile.id);
  const { count: certifiedCount } = await supabase.from("papers").select("id", { count: "exact", head: true }).eq("author_id", profile.id).eq("decision", "certified_rubbish");
  const { count: reviewCount } = await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("reviewer_id", profile.id);
  const { count: commentCount } = await supabase.from("comments").select("id", { count: "exact", head: true }).eq("user_id", profile.id);

  const stats = {
    papers: paperCount || 0,
    certified: certifiedCount || 0,
    reviews: reviewCount || 0,
    comments: commentCount || 0,
  };

  // Fetch tab content
  let papers: Paper[] = [];
  if (tab === "papers" || !tab) {
    const { data } = await supabase
      .from("papers")
      .select("*, author:profiles!author_id(*), venue:venues!venue_id(*)")
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);
    papers = (data || []) as Paper[];
  }

  // Fetch reviews for reviews tab
  let userReviews: { id: string; rubbish_score: number; uselessness_score: number; entertainment_score: number; recommendation: string; created_at: string; paper: { id: string; title: string } | null }[] = [];
  if (tab === "reviews") {
    const { data } = await supabase
      .from("reviews")
      .select("id, rubbish_score, uselessness_score, entertainment_score, recommendation, created_at, paper:papers!paper_id(id, title)")
      .eq("reviewer_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);
    userReviews = (data || []).map((r: Record<string, unknown>) => ({
      ...r,
      paper: Array.isArray(r.paper) ? r.paper[0] : r.paper,
    })) as typeof userReviews;
  }

  // Fetch achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("*, achievement:achievements!achievement_id(*)")
    .eq("user_id", profile.id);

  const { data: allAchievements } = await supabase.from("achievements").select("*");

  const unlockedIds = new Set((userAchievements || []).map((ua: { achievement_id: string }) => ua.achievement_id));

  const tabs = [
    { key: "papers", label: "Papers" },
    { key: "reviews", label: "Reviews" },
    { key: "achievements", label: "Achievements" },
  ];

  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-[850px]">
        {/* Profile Header */}
        <div className="mt-4 mb-6">
          <h1 className="text-[2.25rem] font-normal mb-1" style={{ color: "var(--or-dark-blue)" }}>
            {profile.display_name || profile.username}
          </h1>
          <p className="text-sm text-[var(--or-subtle-gray)]">@{profile.username}</p>
          {profile.title && (
            <span className="inline-block text-xs px-2 py-0.5 mt-2 border border-[rgba(0,0,0,0.1)]" style={{ backgroundColor: "var(--or-sandy)", color: "var(--or-dark-blue)", borderRadius: 0 }}>
              {profile.title}
            </span>
          )}
        </div>

        {/* Profile details */}
        <div className="text-xs space-y-2 mb-6">
          {profile.bio && (
            <div><strong style={{ color: "var(--or-green)" }}>Bio:</strong> {profile.bio}</div>
          )}
          {profile.institution && (
            <div><strong style={{ color: "var(--or-green)" }}>Institution:</strong> {profile.institution}</div>
          )}
          {profile.research_field && (
            <div><strong style={{ color: "var(--or-green)" }}>Research Field:</strong> {profile.research_field}</div>
          )}
          <div><strong style={{ color: "var(--or-green)" }}>Karma:</strong> {profile.karma}</div>
          <div><strong style={{ color: "var(--or-green)" }}>Member since:</strong> {new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</div>
        </div>

        <hr className="border-0 border-t border-[rgba(0,0,0,0.1)] my-6" />

        {/* Stats */}
        <div className="flex gap-8 mb-6 text-sm">
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: "var(--or-dark-blue)" }}>{stats.papers}</p>
            <p className="text-xs text-[var(--or-subtle-gray)]">Papers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: "var(--or-green)" }}>{stats.certified}</p>
            <p className="text-xs text-[var(--or-subtle-gray)]">Certified</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: "var(--or-dark-blue)" }}>{stats.reviews}</p>
            <p className="text-xs text-[var(--or-subtle-gray)]">Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: "var(--or-dark-blue)" }}>{stats.comments}</p>
            <p className="text-xs text-[var(--or-subtle-gray)]">Comments</p>
          </div>
        </div>

        <hr className="border-0 border-t border-[rgba(0,0,0,0.1)] my-6" />

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-4 text-sm border-b border-[rgba(0,0,0,0.1)] pb-2">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.key === "papers" ? `/profile/${username}` : `/profile/${username}?tab=${t.key}`}
              className={tab === t.key || (t.key === "papers" && !tab) ? "font-semibold" : "hover:underline"}
              style={{ color: tab === t.key || (t.key === "papers" && !tab) ? "var(--or-green)" : "var(--or-medium-blue)" }}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Tab Content */}
        {(tab === "papers" || !tab) && (
          papers.length > 0 ? (
            <div>{papers.map((p) => <PaperCard key={p.id} paper={p} />)}</div>
          ) : (
            <p className="text-sm text-[var(--or-subtle-gray)] py-4">No papers submitted yet.</p>
          )
        )}

        {tab === "reviews" && (
          userReviews.length > 0 ? (
            <div className="space-y-0">
              {userReviews.map((r) => (
                <div key={r.id} className="py-3 border-b border-[rgba(0,0,0,0.05)]">
                  <div className="text-sm">
                    <Link href={`/paper/${r.paper?.id}`} prefetch={false} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">
                      {r.paper?.title || "Unknown paper"}
                    </Link>
                  </div>
                  <ul className="list-none flex flex-wrap gap-x-3 m-0 p-0 text-xs text-[var(--or-subtle-gray)] mt-1">
                    <li>Rubbish: <strong>{r.rubbish_score}/10</strong></li>
                    <li>Uselessness: <strong>{r.uselessness_score}/10</strong></li>
                    <li>Entertainment: <strong>{r.entertainment_score}/10</strong></li>
                    <li>
                      Recommendation:{" "}
                      <strong>{DECISIONS[r.recommendation as keyof typeof DECISIONS]?.label || r.recommendation}</strong>
                    </li>
                    <li>{new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</li>
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--or-subtle-gray)] py-4">No reviews submitted yet.</p>
          )
        )}

        {tab === "achievements" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {(allAchievements || []).map((a: { id: string; icon: string | null; name: string; description: string | null }) => (
              <div
                key={a.id}
                className={`p-3 border border-[rgba(0,0,0,0.1)] text-center ${unlockedIds.has(a.id) ? "" : "opacity-40"}`}
                style={{ backgroundColor: unlockedIds.has(a.id) ? "var(--or-sandy)" : "var(--or-bg)", borderRadius: 0 }}
              >
                <span className="text-2xl">{a.icon || "🏆"}</span>
                <p className="text-xs font-semibold mt-1" style={{ color: "var(--or-dark-blue)" }}>{a.name}</p>
                {a.description && <p className="text-xs text-[var(--or-subtle-gray)]">{a.description}</p>}
              </div>
            ))}
            {(!allAchievements || allAchievements.length === 0) && (
              <p className="text-sm text-[var(--or-subtle-gray)] col-span-4">No achievements defined yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
