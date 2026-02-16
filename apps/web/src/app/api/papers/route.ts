import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const venue = searchParams.get("venue");
  const sort = searchParams.get("sort") || "hot";
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("papers")
    .select("*, author:profiles!author_id(*), venue:venues!venue_id(*)", { count: "exact" });

  if (venue) query = query.eq("venue_id", venue);
  if (status) query = query.eq("status", status);

  switch (sort) {
    case "latest":
      query = query.order("created_at", { ascending: false });
      break;
    case "top":
      query = query.order("avg_rubbish_score", { ascending: false });
      break;
    case "hot":
    default:
      query = query.order("hot_score", { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count, page, limit });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, abstract, keywords, content_type, content_markdown, pdf_url, image_urls, supplementary_urls, venue_id, review_mode } = body;

  if (!title || !content_type || !venue_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const status = review_mode === "instant" ? "published" : "submitted";
  const decision = review_mode === "instant" ? "certified_rubbish" : null;

  const { data, error } = await supabase
    .from("papers")
    .insert({
      title,
      abstract,
      keywords,
      content_type,
      content_markdown,
      pdf_url: pdf_url || null,
      image_urls: image_urls || [],
      supplementary_urls: supplementary_urls || null,
      venue_id,
      review_mode,
      author_id: user.id,
      status,
      decision,
      decision_at: decision ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Write to activity log (best-effort)
  try {
    await supabase.from("activity_log").insert({
      venue_id,
      user_id: user.id,
      action: "submission",
      target_type: "paper",
      target_id: data.id,
      metadata: { paper_title: title, paper_id: data.id },
    });
  } catch { /* ignore */ }

  return NextResponse.json({ data }, { status: 201 });
}
