import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST: Create a report
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { target_type, target_id, reason, description } = await request.json();

  if (!target_type || !target_id || !reason) {
    return NextResponse.json({ error: "target_type, target_id, and reason are required" }, { status: 400 });
  }

  const validTypes = ["paper", "comment", "review", "profile"];
  if (!validTypes.includes(target_type)) {
    return NextResponse.json({ error: "Invalid target_type" }, { status: 400 });
  }

  // Check for duplicate report
  const { data: existing } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_id", user.id)
    .eq("target_type", target_type)
    .eq("target_id", target_id)
    .eq("status", "pending")
    .single();

  if (existing) {
    return NextResponse.json({ error: "You have already reported this item" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      target_type,
      target_id,
      reason,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

// GET: List reports (admin only)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["content_admin", "system_admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

  const { data, error } = await supabase
    .from("reports")
    .select("*, reporter:profiles!reporter_id(username, display_name)")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
