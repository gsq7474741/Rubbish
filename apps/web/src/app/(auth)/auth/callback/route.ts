import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/";
  // Prevent open redirect: only allow relative paths starting with single /
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Defensive check: ensure profile exists (trigger may have failed)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!profile) {
          const meta = user.user_metadata || {};
          const baseUsername = (
            meta.username ||
            meta.preferred_username ||
            meta.user_name ||
            (user.email ? user.email.split("@")[0] : "user")
          ).replace(/[^a-zA-Z0-9_-]/g, "") || "user";

          await supabase.from("profiles").insert({
            id: user.id,
            username: `${baseUsername}_${Date.now().toString(36)}`,
            display_name: meta.full_name || meta.name || meta.display_name || baseUsername,
            avatar_url: meta.avatar_url || meta.picture || null,
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
