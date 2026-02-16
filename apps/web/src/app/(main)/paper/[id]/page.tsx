import Link from "next/link";
import { DECISIONS } from "@/lib/constants";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Paper, Review, Comment, Rebuttal } from "@/lib/types";
import { PaperCommentForm } from "@/components/paper/PaperCommentForm";
import { ReviewForm } from "@/components/paper/ReviewForm";
import { RebuttalForm } from "@/components/paper/RebuttalForm";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { VoteButton } from "@/components/community/VoteButton";
import { BibtexButton } from "@/components/forum/BibtexModal";
import { ReplyTree } from "@/components/forum/ReplyTree";
import { ShareButtons } from "@/components/forum/ShareButtons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("papers").select("title").eq("id", id).single();
  return {
    title: data?.title || "Paper",
    description: "RubbishReview forum page",
  };
}

export default async function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id || null;

  // Fetch paper with author and venue
  const { data: paperData, error: paperError } = await supabase
    .from("papers")
    .select("*, author:profiles!author_id(*), venue:venues!venue_id(*)")
    .eq("id", id)
    .single();

  if (paperError || !paperData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-[1.875rem] font-normal" style={{ color: "var(--or-dark-blue)" }}>404 — Paper Not Found</h2>
        <p className="text-sm text-[var(--or-subtle-gray)] mt-2">This paper does not exist.</p>
        <Link href="/" className="text-sm mt-4 inline-block" style={{ color: "var(--or-medium-blue)" }}>← Back to Home</Link>
      </div>
    );
  }

  const paper = paperData as Paper;
  const decisionInfo = paper.decision ? DECISIONS[paper.decision] : null;
  const isAuthor = currentUserId === paper.author_id;

  // Fetch reviews with rebuttals
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviewer_id(*), rebuttals(*, author:profiles!author_id(*))")
    .eq("paper_id", id)
    .order("created_at", { ascending: false });
  const reviews = (reviewsData || []) as (Review & { rebuttals: (Rebuttal & { author?: { display_name: string | null; username: string } })[] })[];

  // Check if current user already submitted a review
  const hasReviewed = currentUserId ? reviews.some((r) => r.reviewer_id === currentUserId) : false;

  // Fetch current user's votes on reviews
  let userVotes: Record<string, 1 | -1> = {};
  if (currentUserId && reviews.length > 0) {
    const reviewIds = reviews.map((r) => r.id);
    const { data: votesData } = await supabase
      .from("votes")
      .select("target_id, value")
      .eq("user_id", currentUserId)
      .eq("target_type", "review")
      .in("target_id", reviewIds);
    if (votesData) {
      for (const v of votesData) {
        userVotes[v.target_id] = v.value as 1 | -1;
      }
    }
  }

  // Fetch comments
  const { data: commentsData } = await supabase
    .from("comments")
    .select("*, user:profiles!user_id(*)")
    .eq("paper_id", id)
    .order("created_at", { ascending: true });
  const comments = (commentsData || []) as Comment[];

  // Increment view count (best-effort)
  try { await supabase.rpc("increment_view_count", { paper_id: id }); } catch { /* ignore */ }

  // Determine if user can submit a review (logged in, not author, not already reviewed)
  const canReview = !!currentUserId && !isAuthor && !hasReviewed;

  // Status badge
  const statusLabels: Record<string, { label: string; color: string }> = {
    submitted: { label: "Submitted", color: "var(--or-subtle-gray)" },
    under_review: { label: "Under Review", color: "#d4a017" },
    published: { label: "Published", color: "var(--or-green)" },
    rejected_too_good: { label: "Rejected (Too Good)", color: "var(--destructive)" },
  };
  const statusInfo = statusLabels[paper.status] || null;

  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      {/* Breadcrumb banner */}
      <div className="py-2 border-b border-[#d0d0d0] mb-4" style={{ backgroundColor: "var(--or-bg-gray)", marginLeft: "-1rem", marginRight: "-1rem", paddingLeft: "1rem", paddingRight: "1rem" }}>
        <span className="text-sm text-[var(--or-subtle-gray)]">
          <Link href="/" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">RubbishReview</Link>
          {" › "}
          {paper.venue && (
            <>
              <Link href={`/venue/${paper.venue.slug}`} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">{paper.venue.name}</Link>
              {" › "}
            </>
          )}
          <span>Forum</span>
        </span>
      </div>

      <div className="max-w-[850px]">
        {/* Paper Title */}
        <h2 className="text-[1.875rem] font-normal mb-2" style={{ color: "var(--or-dark-blue)" }}>
          {paper.title}
        </h2>

        {/* Authors */}
        {paper.author && (
          <div className="italic text-sm mb-1" style={{ color: "var(--or-dark-blue)" }}>
            <Link href={`/profile/${paper.author.username}`} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">
              {paper.author.display_name || paper.author.username}
            </Link>
            {paper.author.institution && (
              <span className="not-italic text-[var(--or-subtle-gray)]"> · {paper.author.institution}</span>
            )}
          </div>
        )}

        {/* Meta info */}
        <ul className="list-none flex flex-wrap gap-x-2 m-0 p-0 text-xs leading-5 text-[var(--or-subtle-gray)] mb-4">
          <li>{new Date(paper.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</li>
          {paper.venue && <li className="before:content-['·'] before:mr-2">{paper.venue.name}</li>}
          {statusInfo && (
            <li className="before:content-['·'] before:mr-2 font-semibold" style={{ color: statusInfo.color }}>{statusInfo.label}</li>
          )}
          {decisionInfo && (
            <li className="before:content-['·'] before:mr-2 font-semibold" style={{ color: "var(--or-green)" }}>{decisionInfo.label}</li>
          )}
          <li className="before:content-['·'] before:mr-2">Readers: Everyone</li>
          <li className="before:content-['·'] before:mr-2">{paper.review_count} Reviews</li>
          <li className="before:content-['·'] before:mr-2">{paper.view_count} Views</li>
        </ul>

        {/* Keywords */}
        {paper.keywords && paper.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {paper.keywords.map((kw) => (
              <span key={kw} className="text-xs px-2 py-0.5 border border-[rgba(0,0,0,0.1)]" style={{ backgroundColor: "var(--or-sandy)", color: "var(--or-dark-blue)" }}>
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons: BibTeX, PDF, Share */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <BibtexButton
            paperId={id}
            title={paper.title}
            authorName={paper.author?.display_name || paper.author?.username || "Anonymous"}
            year={new Date(paper.created_at).getFullYear().toString()}
            venueName={paper.venue?.name}
          />
          {paper.pdf_url && (
            <a
              href={paper.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs border border-[#ccc] px-2 py-1 hover:bg-[#f5f5f5]"
              style={{ borderRadius: 0, color: "var(--or-medium-blue)" }}
            >
              Download PDF
            </a>
          )}
        </div>
        <div className="mb-4">
          <ShareButtons title={paper.title} paperId={id} />
        </div>

        <hr className="border-0 border-t border-[rgba(0,0,0,0.1)] my-6" />

        {/* Abstract */}
        {paper.abstract && (
          <div className="max-w-[850px] mb-2">
            <strong className="text-xs pr-1" style={{ color: "var(--or-green)" }}>Abstract:</strong>
            <MarkdownRenderer content={paper.abstract} className="text-xs mt-1" />
          </div>
        )}

        {/* Rubbish Scores */}
        {paper.avg_rubbish_score > 0 && (
          <>
            <div className="text-xs max-w-[850px] mb-2">
              <strong className="pr-1" style={{ color: "var(--or-green)" }}>Rubbish Score:</strong>
              <span>{paper.avg_rubbish_score}/10</span>
            </div>
            <div className="text-xs max-w-[850px] mb-2">
              <strong className="pr-1" style={{ color: "var(--or-green)" }}>Uselessness Score:</strong>
              <span>{paper.avg_uselessness_score}/10</span>
            </div>
            <div className="text-xs max-w-[850px] mb-2">
              <strong className="pr-1" style={{ color: "var(--or-green)" }}>Entertainment Score:</strong>
              <span>{paper.avg_entertainment_score}/10</span>
            </div>
          </>
        )}

        {/* Content toggle */}
        {paper.content_markdown && (
          <details className="my-4" open>
            <summary className="text-xs cursor-pointer" style={{ color: "var(--or-medium-blue)" }}>Show full content</summary>
            <div className="mt-2 p-3 border border-[rgba(0,0,0,0.1)]" style={{ backgroundColor: "var(--or-sandy)" }}>
              <MarkdownRenderer content={paper.content_markdown} />
            </div>
          </details>
        )}

        <hr className="border-0 border-t border-[rgba(0,0,0,0.1)] my-6" />

        {/* Reviews Section */}
        <h3 className="text-base font-normal mb-4" style={{ color: "var(--or-dark-blue)" }}>
          {reviews.length} Official Review{reviews.length !== 1 ? "s" : ""}
        </h3>

        {/* Submit Review Button / Form */}
        {canReview && <ReviewForm paperId={id} />}
        {currentUserId && !isAuthor && hasReviewed && (
          <p className="text-xs text-[var(--or-subtle-gray)] mb-4 italic">You have already submitted a review for this paper.</p>
        )}
        {currentUserId && isAuthor && (
          <p className="text-xs text-[var(--or-subtle-gray)] mb-4 italic">You cannot review your own paper.</p>
        )}
        {!currentUserId && (
          <p className="text-xs mb-4">
            <Link href="/login" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">Log in</Link>
            {" "}to submit a review.
          </p>
        )}

        {reviews.length === 0 && (
          <p className="text-xs text-[var(--or-subtle-gray)] mb-4">No reviews yet.</p>
        )}

        {reviews.map((review) => {
          const rec = DECISIONS[review.recommendation as keyof typeof DECISIONS];
          const reviewerName = review.is_anonymous
            ? "Anonymous Reviewer"
            : review.reviewer?.display_name || review.reviewer?.username || "Reviewer";
          const rebuttals = review.rebuttals || [];
          return (
            <div key={review.id} className="border-l-[3px] border-[#ddd] pl-4 mb-6">
              <h4 className="text-sm font-bold m-0" style={{ color: "var(--or-green)" }}>
                Official Review of Submission
              </h4>
              <div className="italic text-sm text-[var(--or-dark-blue)] mb-[2px]">
                {reviewerName}
              </div>
              <ul className="list-none flex flex-wrap gap-x-2 m-0 p-0 text-xs leading-5 text-[var(--or-subtle-gray)] mb-3">
                <li>{new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</li>
                <li className="before:content-['·'] before:mr-2">Readers: Everyone</li>
              </ul>

              <div className="text-xs space-y-2 max-w-[800px]">
                <div>
                  <strong style={{ color: "var(--or-green)" }}>Recommendation:</strong>{" "}
                  <span className="font-semibold">{rec?.label || review.recommendation}</span>
                </div>
                <div>
                  <strong style={{ color: "var(--or-green)" }}>Rubbish Score:</strong> {review.rubbish_score}/10 ·{" "}
                  <strong style={{ color: "var(--or-green)" }}>Uselessness:</strong> {review.uselessness_score}/10 ·{" "}
                  <strong style={{ color: "var(--or-green)" }}>Entertainment:</strong> {review.entertainment_score}/10
                </div>
                {review.summary && (
                  <div>
                    <strong style={{ color: "var(--or-green)" }}>Summary:</strong>
                    <MarkdownRenderer content={review.summary} className="mt-1" />
                  </div>
                )}
                {review.strengths && (
                  <div>
                    <strong style={{ color: "var(--or-green)" }}>Strengths:</strong>
                    <MarkdownRenderer content={review.strengths} className="mt-1" />
                  </div>
                )}
                {review.weaknesses && (
                  <div>
                    <strong style={{ color: "var(--or-green)" }}>Weaknesses:</strong>
                    <MarkdownRenderer content={review.weaknesses} className="mt-1" />
                  </div>
                )}
              </div>

              {/* Vote on review */}
              <div className="mt-3">
                <VoteButton
                  targetType="review"
                  targetId={review.id}
                  initialCount={review.upvote_count}
                  initialVote={userVotes[review.id] || null}
                />
              </div>

              {/* Rebuttals */}
              {rebuttals.length > 0 && (
                <div className="mt-3 space-y-2">
                  {rebuttals.map((rebuttal) => (
                    <div key={rebuttal.id} className="border-l-[3px] border-[var(--or-green)] pl-3 py-2" style={{ backgroundColor: "rgba(19,140,36,0.04)" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold" style={{ color: "var(--or-green)" }}>↩ Author Response</span>
                        <span className="text-xs text-[var(--or-subtle-gray)]">
                          {rebuttal.author?.display_name || rebuttal.author?.username || "Author"} · {new Date(rebuttal.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <MarkdownRenderer content={rebuttal.content} className="text-xs" />
                    </div>
                  ))}
                </div>
              )}

              {/* Rebuttal button (only for paper author) */}
              {isAuthor && <RebuttalForm paperId={id} reviewId={review.id} />}
            </div>
          );
        })}

        <hr className="border-0 border-t border-[rgba(0,0,0,0.1)] my-6" />

        {/* Discussion */}
        <h3 className="text-base font-normal mb-4" style={{ color: "var(--or-dark-blue)" }}>
          {comments.length} Repl{comments.length !== 1 ? "ies" : "y"}
        </h3>

        <ReplyTree comments={comments} paperId={id} />

        {/* Add Comment */}
        <PaperCommentForm paperId={id} />
      </div>
    </div>
  );
}
