import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { anonymizeRecord } from "@/lib/anonymize";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("papers")
    .select("*, author:profiles!author_id(*), venue:venues!venue_id(*)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Increment view count (best-effort)
  try {
    await supabase.rpc("increment_view_count", { paper_id: id });
  } catch {
    // ignore
  }

  const anonymized = anonymizeRecord(data, "author", "author_id");
  return NextResponse.json({ data: anonymized });
}

const EDITABLE_FIELDS = new Set([
  "title", "abstract", "keywords", "content_type", "content_markdown",
  "pdf_url", "image_urls", "supplementary_urls",
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership and editable status
  const { data: paper } = await supabase
    .from("papers")
    .select("author_id, status")
    .eq("id", id)
    .single();

  if (!paper) {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  }
  if (paper.author_id !== user.id) {
    return NextResponse.json({ error: "Only the author can edit this paper" }, { status: 403 });
  }
  if (paper.status !== "submitted" && paper.status !== "under_review") {
    return NextResponse.json({ error: "Cannot edit a paper that has been published or rejected" }, { status: 400 });
  }

  const body = await request.json();

  // Filter to allowed fields only
  const updates: Record<string, unknown> = {};
  for (const key of Object.keys(body)) {
    if (EDITABLE_FIELDS.has(key)) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("papers")
    .update(updates)
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
      venue_id: data.venue_id,
      user_id: user.id,
      action: "edit",
      target_type: "paper",
      target_id: id,
      metadata: { edited_fields: Object.keys(updates).filter(k => k !== "updated_at") },
    });
  } catch { /* ignore */ }

  return NextResponse.json({ data });
}
