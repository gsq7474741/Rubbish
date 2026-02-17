import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "RubbishReview <noreply@rubbishreview.com>";

interface SendNotificationEmailParams {
  to: string;
  subject: string;
  body: string;
  link?: string | null;
}

/**
 * Send a notification email via Resend.
 * Silently no-ops if RESEND_API_KEY is not configured.
 */
export async function sendNotificationEmail({
  to,
  subject,
  body,
  link,
}: SendNotificationEmailParams): Promise<void> {
  if (!resend) return; // email not configured, skip silently

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #138c24; padding: 16px 24px; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: bold;">RubbishReview</h1>
      </div>
      <div style="padding: 0 24px;">
        <h2 style="color: #333; font-size: 18px; margin-bottom: 12px;">${subject}</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">${body}</p>
        ${link ? `<a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://rubbishreview.com"}${link}" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background-color: #138c24; color: white; text-decoration: none; font-size: 14px;">View on RubbishReview</a>` : ""}
      </div>
      <div style="margin-top: 32px; padding: 16px 24px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; margin: 0;">You received this email because of your activity on RubbishReview. You can manage your notification preferences in Settings.</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `[RubbishReview] ${subject}`,
      html: htmlBody,
    });
  } catch (err) {
    console.error("[email] Failed to send notification email:", err);
  }
}
