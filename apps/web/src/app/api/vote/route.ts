import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { target_type, target_id, value } = await request.json();

  if (!target_type || !target_id || ![-1, 1].includes(value)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  // Check existing vote
  const { data: existing } = await supabase
    .from("votes")
    .select("id, value")
    .eq("user_id", user.id)
    .eq("target_type", target_type)
    .eq("target_id", target_id)
    .single();

  if (existing) {
    if (existing.value === value) {
      // Remove vote (toggle off)
      await supabase.from("votes").delete().eq("id", existing.id);
      return NextResponse.json({ action: "removed", value: 0 });
    } else {
      // Change vote
      await supabase.from("votes").update({ value }).eq("id", existing.id);
      return NextResponse.json({ action: "changed", value });
    }
  }

  // New vote
  const { error } = await supabase.from("votes").insert({
    user_id: user.id,
    target_type,
    target_id,
    value,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ action: "created", value }, { status: 201 });
}
