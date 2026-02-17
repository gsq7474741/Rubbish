import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: List editors for a venue
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: venue } = await supabase.from("venues").select("id").eq("slug", slug).single();
  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("venue_editors")
    .select("*, user:profiles!user_id(id, username, display_name, avatar_url)")
    .eq("venue_id", venue.id)
    .order("role", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST: Add an editor to a venue
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

  // Check permission: must be creator or existing editor
  const isCreator = venue.created_by === user.id;
  const { data: existingEditor } = await supabase
    .from("venue_editors")
    .select("role")
    .eq("venue_id", venue.id)
    .eq("user_id", user.id)
    .single();

  if (!isCreator && (!existingEditor || !["editor", "chief_editor"].includes(existingEditor.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { username, role } = await request.json();

  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  // Find user by username
  const { data: targetUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("venue_editors")
    .upsert({
      venue_id: venue.id,
      user_id: targetUser.id,
      role: role || "editor",
    })
    .select("*, user:profiles!user_id(id, username, display_name)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

// DELETE: Remove an editor from a venue
export async function DELETE(
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
  const { data: myRole } = await supabase
    .from("venue_editors")
    .select("role")
    .eq("venue_id", venue.id)
    .eq("user_id", user.id)
    .single();

  if (!isCreator && myRole?.role !== "chief_editor") {
    return NextResponse.json({ error: "Only creator or chief editor can remove editors" }, { status: 403 });
  }

  const { user_id } = await request.json();

  if (!user_id) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("venue_editors")
    .delete()
    .eq("venue_id", venue.id)
    .eq("user_id", user_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
