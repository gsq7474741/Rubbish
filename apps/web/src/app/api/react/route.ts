import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { target_type, target_id, emoji } = await request.json();

  if (!target_type || !target_id || !emoji) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Check existing reaction
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", target_type)
    .eq("target_id", target_id)
    .eq("emoji", emoji)
    .single();

  if (existing) {
    // Remove reaction (toggle off)
    await supabase.from("reactions").delete().eq("id", existing.id);
    return NextResponse.json({ reacted: false });
  }

  // Add reaction
  const { error } = await supabase.from("reactions").insert({
    user_id: user.id,
    target_type,
    target_id,
    emoji,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reacted: true }, { status: 201 });
}
