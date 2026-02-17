import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST: Verify and use an invite code during registration
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await request.json();

  if (!code?.trim()) {
    return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
  }

  // Find the invite code
  const { data: invite, error } = await supabase
    .from("invite_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (error || !invite) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  if (invite.used_by) {
    return NextResponse.json({ error: "This invite code has already been used" }, { status: 400 });
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "This invite code has expired" }, { status: 400 });
  }

  // Mark the code as used
  const { error: updateError } = await supabase
    .from("invite_codes")
    .update({
      used_by: user.id,
      used_at: new Date().toISOString(),
    })
    .eq("code", invite.code);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Invite code applied successfully" });
}
