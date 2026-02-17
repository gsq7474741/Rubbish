import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { hashUserId } from "@/lib/anonymize";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const anonId = hashUserId(user.id);

  // Count unread notifications
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return NextResponse.json({
    user: {
      anonId,
      unreadCount: count || 0,
    },
  });
}
