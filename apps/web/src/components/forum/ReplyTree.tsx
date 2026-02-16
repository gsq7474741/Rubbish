"use client";

import { useState } from "react";
import Link from "next/link";
import type { Comment } from "@/lib/types";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

function buildTree(comments: Comment[]): Comment[] {
  const map = new Map<string, Comment>();
  const roots: Comment[] = [];

  for (const c of comments) {
    map.set(c.id, { ...c, replies: [] });
  }

  for (const c of comments) {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function ReplyNode({
  comment,
  depth,
  paperId,
  onReplySubmitted,
}: {
  comment: Comment;
  depth: number;
  paperId: string;
  onReplySubmitted: () => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/papers/${paperId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, parent_id: comment.id }),
      });
      if (res.ok) {
        setReplyContent("");
        setShowReplyForm(false);
        onReplySubmitted();
      }
    } catch {
      /* ignore */
    }
    setSubmitting(false);
  };

  return (
    <div
      className="border-l-[3px] pl-4 mb-3"
      style={{
        borderColor: depth === 0 ? "#ddd" : depth === 1 ? "#e8e8e8" : "#f0f0f0",
        marginLeft: depth > 0 ? "0" : undefined,
      }}
    >
      <div className="text-sm font-semibold" style={{ color: "var(--or-dark-blue)" }}>
        {comment.user ? (
          <Link
            href={`/profile/${comment.user.username}`}
            style={{ color: "var(--or-medium-blue)" }}
            className="hover:underline"
          >
            {comment.user.display_name || comment.user.username}
          </Link>
        ) : (
          "Anonymous"
        )}
      </div>
      <div className="text-xs text-[var(--or-subtle-gray)] mb-1">
        {new Date(comment.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
        {comment.comment_type !== "public_comment" && (
          <span
            className="ml-2 px-1 py-0.5 text-[10px] border border-[rgba(0,0,0,0.1)]"
            style={{ backgroundColor: "var(--or-sandy)" }}
          >
            {comment.comment_type === "official_comment"
              ? "Official Comment"
              : comment.comment_type === "meta_review"
              ? "Meta Review"
              : comment.comment_type === "decision"
              ? "Decision"
              : comment.comment_type}
          </span>
        )}
      </div>
      <MarkdownRenderer content={comment.content} className="text-xs" />

      {/* Reply button */}
      {depth < 3 && (
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-xs mt-1 bg-transparent border-0 cursor-pointer"
          style={{ color: "var(--or-medium-blue)" }}
        >
          {showReplyForm ? "Cancel" : "Reply"}
        </button>
      )}

      {/* Inline reply form */}
      {showReplyForm && (
        <div className="mt-2 mb-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows={3}
            className="w-full px-3 py-2 text-xs border border-[#ccc] focus:outline-none focus:border-[var(--or-green)] resize-y"
            style={{ borderRadius: 0 }}
          />
          <button
            onClick={handleSubmitReply}
            disabled={submitting || !replyContent.trim()}
            className="mt-1 px-3 py-1 text-xs text-white border-0 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
          >
            {submitting ? "Posting..." : "Post Reply"}
          </button>
        </div>
      )}

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <ReplyNode
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              paperId={paperId}
              onReplySubmitted={onReplySubmitted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ReplyTree({
  comments,
  paperId,
}: {
  comments: Comment[];
  paperId: string;
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const tree = buildTree(comments);

  const handleReplySubmitted = () => {
    setRefreshKey((k) => k + 1);
    // In a real app, we'd refetch comments here. For now, the page will need a refresh.
    window.location.reload();
  };

  return (
    <div key={refreshKey}>
      {tree.length === 0 ? (
        <p className="text-xs text-[var(--or-subtle-gray)] mb-4">No replies yet. Be the first to comment.</p>
      ) : (
        tree.map((comment) => (
          <ReplyNode
            key={comment.id}
            comment={comment}
            depth={0}
            paperId={paperId}
            onReplySubmitted={handleReplySubmitted}
          />
        ))
      )}
    </div>
  );
}
