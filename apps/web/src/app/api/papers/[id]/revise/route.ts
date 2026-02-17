import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST: Submit a revision of an existing paper
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const { data: original } = await supabase
    .from("papers")
    .select("*")
    .eq("id", id)
    .single();

  if (!original) {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  }

  if (original.author_id !== user.id) {
    return NextResponse.json({ error: "Only the author can submit a revision" }, { status: 403 });
  }

  const body = await request.json();
  const {
    title,
    abstract,
    keywords,
    content_type,
    content_markdown,
    pdf_url,
    image_urls,
    supplementary_urls,
  } = body;

  const newRevisionNumber = (original.revision_number || 1) + 1;

  const { data, error } = await supabase
    .from("papers")
    .insert({
      title: title || original.title,
      abstract: abstract || original.abstract,
      keywords: keywords || original.keywords,
      content_type: content_type || original.content_type,
      content_markdown: content_markdown ?? original.content_markdown,
      pdf_url: pdf_url ?? original.pdf_url,
      image_urls: image_urls ?? original.image_urls,
      supplementary_urls: supplementary_urls ?? original.supplementary_urls,
      venue_id: original.venue_id,
      review_mode: original.review_mode,
      author_id: user.id,
      status: "submitted",
      decision: null,
      revision_number: newRevisionNumber,
      previous_version_id: id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Activity log (best-effort)
  try {
    await supabase.from("activity_log").insert({
      venue_id: original.venue_id,
      user_id: user.id,
      action: "submission",
      target_type: "paper",
      target_id: data.id,
      metadata: { paper_title: data.title, revision_of: id, revision_number: newRevisionNumber },
    });
  } catch { /* ignore */ }

  return NextResponse.json({ data }, { status: 201 });
}

// GET: Get version history for a paper
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Walk the version chain backwards
  type VersionInfo = { id: string; revision_number: number; title: string; status: string; created_at: string };
  const versions: VersionInfo[] = [];
  let currentId: string | null = id;

  while (currentId) {
    const result = await supabase
      .from("papers")
      .select("id, revision_number, title, status, created_at, previous_version_id")
      .eq("id", currentId)
      .single();

    const vData = result.data as { id: string; revision_number: number; title: string; status: string; created_at: string; previous_version_id: string | null } | null;
    if (!vData) break;
    versions.push({
      id: vData.id,
      revision_number: vData.revision_number || 1,
      title: vData.title,
      status: vData.status,
      created_at: vData.created_at,
    });
    currentId = vData.previous_version_id;
  }

  // Also find newer versions that point to this paper
  const { data: newerVersions } = await supabase
    .from("papers")
    .select("id, revision_number, title, status, created_at")
    .eq("previous_version_id", id)
    .order("revision_number", { ascending: false });

  if (newerVersions) {
    for (const v of newerVersions) {
      if (!versions.find((x) => x.id === v.id)) {
        versions.unshift({
          id: v.id,
          revision_number: v.revision_number || 1,
          title: v.title,
          status: v.status,
          created_at: v.created_at,
        });
      }
    }
  }

  // Sort by revision number
  versions.sort((a, b) => a.revision_number - b.revision_number);

  return NextResponse.json({ data: versions });
}
