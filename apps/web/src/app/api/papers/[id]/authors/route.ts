import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: List authors for a paper
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("paper_authors")
    .select("*, user:profiles!user_id(username, display_name)")
    .eq("paper_id", id)
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST: Add authors to a paper (only by paper owner)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const { data: paper } = await supabase
    .from("papers")
    .select("author_id")
    .eq("id", id)
    .single();

  if (!paper || paper.author_id !== user.id) {
    return NextResponse.json({ error: "Only the paper owner can manage authors" }, { status: 403 });
  }

  const { authors } = await request.json();

  if (!Array.isArray(authors) || authors.length === 0) {
    return NextResponse.json({ error: "authors array is required" }, { status: 400 });
  }

  // Delete existing authors and re-insert
  await supabase.from("paper_authors").delete().eq("paper_id", id);

  const rows = authors.map((a: { name: string; institution?: string; email?: string; is_corresponding?: boolean }, i: number) => ({
    paper_id: id,
    user_id: null,
    name: a.name,
    institution: a.institution || null,
    email: a.email || null,
    position: i,
    is_corresponding: a.is_corresponding || false,
  }));

  const { data, error } = await supabase
    .from("paper_authors")
    .insert(rows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
