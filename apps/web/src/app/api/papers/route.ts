import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { anonymizeList } from "@/lib/anonymize";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const { searchParams } = new URL(request.url);

  const venue = searchParams.get("venue");
  const sort = searchParams.get("sort") || "hot";
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("papers")
    .select("*, author:profiles!author_id(*), venue:venues!venue_id(*)", { count: "exact" });

  if (venue) query = query.eq("venue_id", venue);
  if (status) query = query.eq("status", status);

  switch (sort) {
    case "latest":
      query = query.order("created_at", { ascending: false });
      break;
    case "top":
      query = query.order("avg_rubbish_score", { ascending: false });
      break;
    case "hot":
    default:
      query = query.order("hot_score", { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const anonymized = anonymizeList(data || [], "author", "author_id");
  return NextResponse.json({ data: anonymized, count, page, limit });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, abstract, keywords, content_type, content_markdown, pdf_url, image_urls, supplementary_urls, venue_id, review_mode, editor_invite_code } = body;

  if (!title || !content_type || !venue_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Instant mode requires a valid editor invite code
  if (review_mode === "instant") {
    if (!editor_invite_code?.trim()) {
      return NextResponse.json({ error: "Instant publish requires an editor invite code" }, { status: 400 });
    }

    const { data: inviteCode } = await supabase
      .from("editor_invite_codes")
      .select("*")
      .eq("code", editor_invite_code.trim().toUpperCase())
      .eq("venue_id", venue_id)
      .eq("purpose", "instant_publish")
      .single();

    if (!inviteCode) {
      return NextResponse.json({ error: "Invalid editor invite code for this venue" }, { status: 400 });
    }

    if (inviteCode.used_count >= inviteCode.max_uses) {
      return NextResponse.json({ error: "This invite code has been fully used" }, { status: 400 });
    }

    if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
      return NextResponse.json({ error: "This invite code has expired" }, { status: 400 });
    }

    // Atomically increment used_count with a guard to prevent race conditions
    const { data: updated, error: updateErr } = await supabase
      .from("editor_invite_codes")
      .update({ used_count: inviteCode.used_count + 1 })
      .eq("id", inviteCode.id)
      .lt("used_count", inviteCode.max_uses)
      .select("id")
      .maybeSingle();

    if (updateErr || !updated) {
      return NextResponse.json({ error: "This invite code has been fully used" }, { status: 400 });
    }
  }

  const status = review_mode === "instant" ? "published" : "submitted";
  const decision = review_mode === "instant" ? "certified_rubbish" : null;

  const { data, error } = await supabase
    .from("papers")
    .insert({
      title,
      abstract,
      keywords,
      content_type,
      content_markdown,
      pdf_url: pdf_url || null,
      image_urls: image_urls || [],
      supplementary_urls: supplementary_urls || null,
      venue_id,
      review_mode,
      author_id: user.id,
      status,
      decision,
      decision_at: decision ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Write to activity log (best-effort)
  try {
    await supabase.from("activity_log").insert({
      venue_id,
      user_id: user.id,
      action: "submission",
      target_type: "paper",
      target_id: data.id,
      metadata: { paper_title: title, paper_id: data.id },
    });
  } catch { /* ignore */ }

  // Submission confirmation notification (best-effort)
  try {
    const { createNotification } = await import("@/lib/notify");
    await createNotification({
      supabase,
      userId: user.id,
      type: "submission",
      title: "Paper submitted successfully",
      body: `Your paper "${title}" has been submitted and is ${status === "published" ? "published" : "awaiting review"}.`,
      link: `/paper/${data.id}`,
    });
  } catch { /* ignore */ }

  // Blind mode: auto-assign reviewers from venue editors pool
  if (review_mode === "blind") {
    try {
      const { createNotification } = await import("@/lib/notify");
      // Get all venue editors who are not the author
      const { data: editors } = await supabase
        .from("venue_editors")
        .select("user_id")
        .eq("venue_id", venue_id)
        .neq("user_id", user.id);

      if (editors && editors.length > 0) {
        // Fisher-Yates shuffle and pick up to 2 reviewers
        const shuffled = [...editors];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const assignees = shuffled.slice(0, Math.min(2, shuffled.length));

        for (const assignee of assignees) {
          // Create review assignment record
          await supabase.from("review_assignments").insert({
            paper_id: data.id,
            reviewer_id: assignee.user_id,
            assigned_by: "system",
            status: "pending",
          }).select().maybeSingle();

          // Notify the assigned reviewer
          await createNotification({
            supabase,
            userId: assignee.user_id,
            type: "new_review",
            title: "You have been assigned a paper to review",
            body: `A paper "${title}" has been assigned to you for blind review.`,
            link: `/paper/${data.id}`,
          });
        }
      }
    } catch { /* best-effort */ }
  }

  // Check achievements (best-effort)
  try {
    const { checkAchievements } = await import("@/lib/achievements");
    await checkAchievements(supabase, user.id);
  } catch { /* ignore */ }

  return NextResponse.json({ data }, { status: 201 });
}
