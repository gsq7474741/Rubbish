import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: List current user's invite codes
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("invite_codes")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST: Generate a new invite code
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check how many unused codes the user already has
  const { count } = await supabase
    .from("invite_codes")
    .select("code", { count: "exact", head: true })
    .eq("creator_id", user.id)
    .is("used_by", null);

  if ((count || 0) >= 5) {
    return NextResponse.json({ error: "You already have 5 unused invite codes. Wait until some are used." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const expiresInDays = body.expires_in_days || 30;

  // Generate a random code
  const code = `RR-${randomString(4)}-${randomString(4)}`.toUpperCase();

  const { data, error } = await supabase
    .from("invite_codes")
    .insert({
      code,
      creator_id: user.id,
      expires_at: new Date(Date.now() + expiresInDays * 86400000).toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

function randomString(len: number): string {
  const { randomBytes } = require("crypto") as typeof import("crypto");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(len);
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}
