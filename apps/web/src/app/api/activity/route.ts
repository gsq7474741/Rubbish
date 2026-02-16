import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const venueId = searchParams.get("venue_id");
  const limit = parseInt(searchParams.get("limit") || "20");

  let query = supabase
    .from("activity_log")
    .select("*, user:profiles!user_id(username, display_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (venueId) {
    query = query.eq("venue_id", venueId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
