import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { sendNotificationEmail } from "./email";

/**
 * Create a Supabase admin client using the service role key.
 * Returns null if the service role key is not configured.
 */
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

interface CreateNotificationParams {
  supabase: SupabaseClient;
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
}

// Only these notification types trigger an email; others are site-only.
const EMAIL_WORTHY_TYPES = new Set(["decision", "new_review"]);

/**
 * Create a notification in the database AND send an email for important types.
 * This is a best-effort operation — errors are logged but not thrown.
 */
export async function createNotification({
  supabase,
  userId,
  type,
  title,
  body,
  link,
}: CreateNotificationParams): Promise<void> {
  try {
    // 1. Insert into notifications table (always)
    await supabase.from("notifications").insert({
      user_id: userId,
      type,
      title,
      body,
      link: link || null,
    });

    // 2. Send email only for important notification types
    if (EMAIL_WORTHY_TYPES.has(type)) {
      const admin = getAdminClient();
      if (admin) {
        const { data: authData } = await admin.auth.admin.getUserById(userId);
        const email = authData?.user?.email;

        if (email) {
          await sendNotificationEmail({
            to: email,
            subject: title,
            body,
            link,
          });
        }
      }
    }
  } catch (err) {
    console.error("[notify] Failed to create notification:", err);
  }
}
