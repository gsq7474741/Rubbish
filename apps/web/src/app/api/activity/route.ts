import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { anonymizeList } from "@/lib/anonymize";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const venueId = searchParams.get("venue_id");
  const limit = parseInt(searchParams.get("limit") || "20");

  // activity_log.user_id references auth.users, not profiles directly,
  // so we query activity_log first, then enrich with profile data.
  let query = supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (venueId) {
    query = query.eq("venue_id", venueId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with profile data
  const userIds = [...new Set((data || []).map((a) => a.user_id).filter(Boolean))];
  let profileMap: Record<string, { id: string; username: string; display_name: string | null }> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .in("id", userIds);
    for (const p of profiles || []) {
      profileMap[p.id] = p;
    }
  }

  const enriched = (data || []).map((a) => ({
    ...a,
    user: profileMap[a.user_id] || null,
  }));

  const anonymized = anonymizeList(enriched, "user", "user_id");
  return NextResponse.json({ data: anonymized });
}
