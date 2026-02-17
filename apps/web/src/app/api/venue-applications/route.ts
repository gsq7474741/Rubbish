import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: List venue applications (own applications for users, all for admins)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "content_admin" || profile?.role === "system_admin";

  let query = supabase
    .from("venue_applications")
    .select("*")
    .order("created_at", { ascending: false });

  // Non-admins can only see their own applications
  if (!isAdmin) {
    query = query.eq("applicant_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST: Submit a new venue application
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug, subtitle, description, review_mode, website, contact, deadline, submission_open, date, location } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Slug must be lowercase letters, numbers, and hyphens only" }, { status: 400 });
  }

  // Check if slug already exists
  const { data: existingVenue } = await supabase
    .from("venues")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existingVenue) {
    return NextResponse.json({ error: "A venue with this slug already exists" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("venue_applications")
    .insert({
      applicant_id: user.id,
      name,
      slug,
      subtitle: subtitle || null,
      description: description || null,
      review_mode: review_mode || "open",
      website: website || null,
      contact: contact || null,
      deadline: deadline || null,
      submission_open: submission_open || null,
      date: date || null,
      location: location || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
