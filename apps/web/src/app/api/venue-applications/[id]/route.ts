import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// PATCH: Approve or reject a venue application
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is content_admin or system_admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["content_admin", "system_admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { status, review_notes } = body;

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Status must be 'approved' or 'rejected'" }, { status: 400 });
  }

  // Get the application first
  const { data: application } = await supabase
    .from("venue_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (application.status !== "pending") {
    return NextResponse.json({ error: "Application already processed" }, { status: 400 });
  }

  // Update the application (trigger will create venue if approved)
  const { data, error } = await supabase
    .from("venue_applications")
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: review_notes || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify the applicant
  try {
    const { createNotification } = await import("@/lib/notify");
    await createNotification({
      supabase,
      userId: application.applicant_id,
      type: "decision",
      title: status === "approved" ? "Venue application approved" : "Venue application rejected",
      body: status === "approved"
        ? `Your venue "${application.name}" has been approved and is now live!`
        : `Your venue application for "${application.name}" was not approved.${review_notes ? ` Reason: ${review_notes}` : ""}`,
      link: status === "approved" ? `/venue/${application.slug}` : null,
    });
  } catch { /* ignore */ }

  return NextResponse.json({ data });
}
