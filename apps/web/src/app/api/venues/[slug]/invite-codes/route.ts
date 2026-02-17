import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: List invite codes for a venue (editors only)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: venue } = await supabase.from("venues").select("id, created_by").eq("slug", slug).single();
  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  // Check permission
  const isCreator = venue.created_by === user.id;
  const { data: editorCheck } = await supabase
    .from("venue_editors")
    .select("role")
    .eq("venue_id", venue.id)
    .eq("user_id", user.id)
    .single();

  if (!isCreator && !editorCheck) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("editor_invite_codes")
    .select("*")
    .eq("venue_id", venue.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST: Generate a new invite code for a venue (editors only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: venue } = await supabase.from("venues").select("id, created_by").eq("slug", slug).single();
  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  const isCreator = venue.created_by === user.id;
  const { data: editorCheck } = await supabase
    .from("venue_editors")
    .select("role")
    .eq("venue_id", venue.id)
    .eq("user_id", user.id)
    .single();

  if (!isCreator && !editorCheck) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const purpose = body.purpose || "instant_publish";
  const maxUses = body.max_uses || 1;
  const expiresInDays = body.expires_in_days || 30;

  const code = `ED-${randomString(4)}-${randomString(4)}`.toUpperCase();

  const { data, error } = await supabase
    .from("editor_invite_codes")
    .insert({
      venue_id: venue.id,
      code,
      created_by: user.id,
      purpose,
      max_uses: maxUses,
      expires_at: new Date(Date.now() + expiresInDays * 86400000).toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

function randomString(len: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
