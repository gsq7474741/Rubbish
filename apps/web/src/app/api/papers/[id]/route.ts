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

  const body = await request.json();

  const { data, error } = await supabase
    .from("papers")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("author_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
