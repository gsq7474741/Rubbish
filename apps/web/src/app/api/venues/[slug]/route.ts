import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: venue, error } = await supabase
    .from("venues")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const { data: papers, count } = await supabase
    .from("papers")
    .select("*, author:profiles!author_id(*)", { count: "exact" })
    .eq("venue_id", venue.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return NextResponse.json({ venue, papers, count, page, limit });
}

const VENUE_EDITABLE_FIELDS = new Set([
  "name", "subtitle", "description", "cover_image_url", "logo_url",
  "accepting_submissions", "review_mode", "website", "contact",
  "location", "instructions", "deadline", "submission_open", "date",
]);

// PATCH: Update venue info (creator, editors, or system_admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: venue } = await supabase
    .from("venues")
    .select("id, created_by")
    .eq("slug", slug)
    .single();

  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  // Permission check: creator, venue editor, or system_admin
  const isCreator = venue.created_by === user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isSystemAdmin = profile?.role === "system_admin";

  const { data: editorCheck } = await supabase
    .from("venue_editors")
    .select("role")
    .eq("venue_id", venue.id)
    .eq("user_id", user.id)
    .single();
  const isEditor = !!editorCheck;

  if (!isCreator && !isEditor && !isSystemAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const updates: Record<string, unknown> = {};
  for (const key of Object.keys(body)) {
    if (VENUE_EDITABLE_FIELDS.has(key)) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("venues")
    .update(updates)
    .eq("id", venue.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
