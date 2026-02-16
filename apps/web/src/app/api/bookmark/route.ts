import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paper_id } = await request.json();

  if (!paper_id) {
    return NextResponse.json({ error: "paper_id is required" }, { status: 400 });
  }

  // Check existing bookmark
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("paper_id", paper_id)
    .single();

  if (existing) {
    // Remove bookmark (toggle off)
    await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("paper_id", paper_id);
    return NextResponse.json({ bookmarked: false });
  }

  // Add bookmark
  const { error } = await supabase.from("bookmarks").insert({
    user_id: user.id,
    paper_id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookmarked: true }, { status: 201 });
}
