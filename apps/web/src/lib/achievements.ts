import { SupabaseClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/notify";

export async function checkAchievements(supabase: SupabaseClient, userId: string) {
  try {
    const { data: unlocked } = await supabase.rpc("check_and_unlock_achievements", {
      p_user_id: userId,
    });

    if (unlocked && Array.isArray(unlocked) && unlocked.length > 0) {
      // Get username for profile link
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();
      const profileLink = profile?.username ? `/profile/${profile.username}` : null;

      // Send notification for each newly unlocked achievement
      for (const a of unlocked) {
        await createNotification({
          supabase,
          userId,
          type: "achievement",
          title: `Achievement Unlocked: ${a.achievement_name}`,
          body: `${a.achievement_icon || "🏆"} You earned "${a.achievement_name}"!`,
          link: profileLink,
        });
      }
    }

    return unlocked || [];
  } catch {
    // Best-effort: don't break the main flow
    return [];
  }
}
