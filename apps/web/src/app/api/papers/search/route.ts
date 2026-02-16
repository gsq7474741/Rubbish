import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  if (!q) {
    return NextResponse.json({ data: [], count: 0, page, limit });
  }

  const supabase = await createClient();

  // Search by title or abstract using ilike
  const searchPattern = `%${q}%`;

  const { data, error, count } = await supabase
    .from("papers")
    .select("*, author:profiles!author_id(*), venue:venues!venue_id(*)", { count: "exact" })
    .or(`title.ilike.${searchPattern},abstract.ilike.${searchPattern}`)
    .order("hot_score", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count, page, limit });
}
