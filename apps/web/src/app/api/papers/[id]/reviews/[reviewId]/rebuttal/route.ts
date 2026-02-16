import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  const { reviewId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rebuttals")
    .select("*, author:profiles!author_id(*)")
    .eq("review_id", reviewId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  const { id: paperId, reviewId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the user is the paper author
  const { data: paper } = await supabase
    .from("papers")
    .select("author_id")
    .eq("id", paperId)
    .single();

  if (!paper || paper.author_id !== user.id) {
    return NextResponse.json({ error: "Only the paper author can submit a rebuttal" }, { status: 403 });
  }

  // Verify the review belongs to this paper
  const { data: review } = await supabase
    .from("reviews")
    .select("id")
    .eq("id", reviewId)
    .eq("paper_id", paperId)
    .single();

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const body = await request.json();
  const { content } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("rebuttals")
    .insert({
      review_id: reviewId,
      author_id: user.id,
      content: content.trim(),
    })
    .select("*, author:profiles!author_id(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
