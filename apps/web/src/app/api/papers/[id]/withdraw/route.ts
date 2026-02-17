import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST: Withdraw a submitted paper (author only)
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

  // Verify ownership
  const { data: paper } = await supabase
    .from("papers")
    .select("author_id, status, venue_id, title")
    .eq("id", id)
    .single();

  if (!paper) {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  }
  if (paper.author_id !== user.id) {
    return NextResponse.json({ error: "Only the author can withdraw this paper" }, { status: 403 });
  }
  if (paper.status === "withdrawn") {
    return NextResponse.json({ error: "Paper is already withdrawn" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const reason = body.reason || null;

  const { data, error } = await supabase
    .from("papers")
    .update({
      status: "withdrawn",
      withdrawal_reason: reason,
      withdrawn_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("author_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Activity log (best-effort)
  try {
    await supabase.from("activity_log").insert({
      venue_id: paper.venue_id,
      user_id: user.id,
      action: "withdrawal",
      target_type: "paper",
      target_id: id,
      metadata: { paper_title: paper.title, reason },
    });
  } catch { /* ignore */ }

  // Notify author (best-effort)
  try {
    const { createNotification } = await import("@/lib/notify");
    await createNotification({
      supabase,
      userId: user.id,
      type: "submission",
      title: "Paper withdrawn",
      body: `Your paper "${paper.title}" has been withdrawn.${reason ? ` Reason: ${reason}` : ""}`,
      link: `/paper/${id}`,
    });
  } catch { /* ignore */ }

  return NextResponse.json({ data });
}
