import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviewer_id(*), rebuttals(*)")
    .eq("paper_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prevent reviewing own paper
  const { data: paper } = await supabase
    .from("papers")
    .select("author_id, review_mode, status")
    .eq("id", id)
    .single();

  if (!paper) {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  }
  if (paper.author_id === user.id) {
    return NextResponse.json({ error: "Cannot review your own paper" }, { status: 403 });
  }

  // Prevent duplicate reviews
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("paper_id", id)
    .eq("reviewer_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this paper" }, { status: 409 });
  }

  const body = await request.json();
  const {
    rubbish_score,
    uselessness_score,
    entertainment_score,
    summary,
    strengths,
    weaknesses,
    recommendation,
    is_anonymous,
  } = body;

  if (!rubbish_score || !uselessness_score || !entertainment_score || !recommendation) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      paper_id: id,
      reviewer_id: user.id,
      rubbish_score,
      uselessness_score,
      entertainment_score,
      summary,
      strengths,
      weaknesses,
      recommendation,
      is_anonymous: is_anonymous || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // --- Decision Engine: auto-decide based on review count and majority ---
  // Update paper status to under_review if still submitted
  if (paper.status === "submitted") {
    await supabase.from("papers").update({ status: "under_review", updated_at: new Date().toISOString() }).eq("id", id);
  }

  // Fetch all reviews for this paper to evaluate decision
  const { data: allReviews } = await supabase
    .from("reviews")
    .select("recommendation")
    .eq("paper_id", id);

  if (allReviews && allReviews.length >= 2) {
    const reviewMode = paper.review_mode;
    const threshold = reviewMode === "open" ? 3 : 2;

    if (allReviews.length >= threshold) {
      // Count recommendations
      const counts: Record<string, number> = {};
      for (const r of allReviews) {
        counts[r.recommendation] = (counts[r.recommendation] || 0) + 1;
      }

      // Find majority (> 50%)
      let majorityDecision: string | null = null;
      for (const [rec, count] of Object.entries(counts)) {
        if (count > allReviews.length / 2) {
          majorityDecision = rec;
          break;
        }
      }

      // If no majority in open mode, pick the one with highest avg rubbish score
      if (!majorityDecision && reviewMode === "open") {
        // Take the most common recommendation; ties broken by first alphabetically
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
          majorityDecision = sorted[0][0];
        }
      }

      if (majorityDecision) {
        const newStatus = majorityDecision === "too_good" ? "rejected_too_good" : "published";
        await supabase
          .from("papers")
          .update({
            decision: majorityDecision,
            decision_at: new Date().toISOString(),
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        // Create notification for paper author
        await supabase.from("notifications").insert({
          user_id: paper.author_id,
          type: "decision",
          title: `Decision on your paper`,
          body: `Your paper has received a decision: ${majorityDecision === "certified_rubbish" ? "🗑️ Certified Rubbish" : majorityDecision === "recyclable" ? "♻️ Recyclable" : "❌ Too Good, Rejected"}`,
          link: `/paper/${id}`,
        });
      }
    }
  }

  // Create notification for paper author about new review
  await supabase.from("notifications").insert({
    user_id: paper.author_id,
    type: "new_review",
    title: "New review on your paper",
    body: `A reviewer has submitted an official review.`,
    link: `/paper/${id}`,
  });

  // Write to activity log (best-effort)
  try {
    // Get venue_id from paper
    const { data: paperForVenue } = await supabase.from("papers").select("venue_id, title").eq("id", id).single();
    await supabase.from("activity_log").insert({
      venue_id: paperForVenue?.venue_id || null,
      user_id: user.id,
      action: "review",
      target_type: "review",
      target_id: data.id,
      metadata: { paper_title: paperForVenue?.title || "", paper_id: id },
    });
  } catch { /* ignore */ }

  return NextResponse.json({ data }, { status: 201 });
}
