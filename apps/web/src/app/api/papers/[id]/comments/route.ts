import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { anonymizeList } from "@/lib/anonymize";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("comments")
    .select("*, user:profiles!user_id(*)")
    .eq("paper_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Anonymize user profiles before building tree
  const anonymized = anonymizeList(data || [], "user", "user_id");

  // Build comment tree
  type AnonComment = (typeof anonymized)[number] & { replies: typeof anonymized };
  const commentMap = new Map<string, AnonComment>();
  const roots: AnonComment[] = [];

  for (const comment of anonymized) {
    commentMap.set(comment.id as string, { ...comment, replies: [] });
  }

  for (const comment of anonymized) {
    const node = commentMap.get(comment.id as string)!;
    if (comment.parent_id && commentMap.has(comment.parent_id as string)) {
      commentMap.get(comment.parent_id as string)!.replies.push(node);
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

  // --- Notifications (best-effort) ---
  try {
    const { createNotification } = await import("@/lib/notify");

    // Get paper author to notify
    const { data: paper } = await supabase
      .from("papers")
      .select("author_id, title")
      .eq("id", id)
      .single();

    if (parent_id) {
      // Reply to an existing comment → notify the parent comment author
      const { data: parentComment } = await supabase
        .from("comments")
        .select("user_id")
        .eq("id", parent_id)
        .single();

      if (parentComment && parentComment.user_id !== user.id) {
        await createNotification({
          supabase,
          userId: parentComment.user_id,
          type: "new_comment",
          title: "New reply to your comment",
          body: `Someone replied to your comment on "${paper?.title || "a paper"}"`,
          link: `/paper/${id}`,
        });
      }
    }

    // Always notify paper author about new comment (unless it's the author themselves)
    if (paper && paper.author_id !== user.id) {
      await createNotification({
        supabase,
        userId: paper.author_id,
        type: "new_comment",
        title: "New comment on your paper",
        body: `Someone commented on "${paper.title}"`,
        link: `/paper/${id}`,
      });
    }
  } catch { /* ignore notification errors */ }

  // Anonymize the returned comment data
  const { anonymizeRecord } = await import("@/lib/anonymize");
  const anonymized = anonymizeRecord(data as unknown as Record<string, unknown>, "user", "user_id");

  return NextResponse.json({ data: anonymized }, { status: 201 });
}
