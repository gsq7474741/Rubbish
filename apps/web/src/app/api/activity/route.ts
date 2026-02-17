import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { anonymizeList } from "@/lib/anonymize";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const { searchParams } = new URL(request.url);

  const venueId = searchParams.get("venue_id");
  const limit = parseInt(searchParams.get("limit") || "20");

  let query = supabase
    .from("activity_log")
    .select("*, user:profiles!user_id(id, username, display_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (venueId) {
    query = query.eq("venue_id", venueId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const anonymized = anonymizeList(data || [], "user", "user_id");
  return NextResponse.json({ data: anonymized });
}
