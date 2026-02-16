import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select("*, user:profiles!user_id(*)")
    .eq("paper_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build comment tree
  const commentMap = new Map<string, typeof data[0] & { replies: typeof data }>();
  const roots: (typeof data[0] & { replies: typeof data })[] = [];

  for (const comment of data || []) {
    commentMap.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of data || []) {
    const node = commentMap.get(comment.id)!;
    if (comment.parent_id && commentMap.has(comment.parent_id)) {
      commentMap.get(comment.parent_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return NextResponse.json({ data: roots });
}

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

  const body = await request.json();
  const { content, parent_id } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      paper_id: id,
      user_id: user.id,
      content: content.trim(),
      parent_id: parent_id || null,
    })
    .select("*, user:profiles!user_id(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update comment count on paper
  await supabase.rpc("increment_comment_count", { p_paper_id: id });

  return NextResponse.json({ data }, { status: 201 });
}
