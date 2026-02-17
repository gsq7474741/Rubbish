"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { Paper } from "@/lib/types";
import { DECISIONS, PAPER_STATUS } from "@/lib/constants";

interface PaperCardProps {
  paper: Paper;
}

export function PaperCard({ paper }: PaperCardProps) {
  const decisionInfo = paper.decision ? DECISIONS[paper.decision] : null;

  return (
    <div className="py-[6px] border-b border-[rgba(0,0,0,0.1)]">
      {/* Title - OpenReview h4 style */}
      <h4 className="text-base font-bold m-0 leading-normal" style={{ color: "var(--or-green)" }}>
        <Link href={`/paper/${paper.id}`} prefetch={false} className="hover:underline" style={{ color: "var(--or-green)" }}>
          {paper.title}
        </Link>
        {paper.pdf_url && (
          <Link href={paper.pdf_url} className="inline-block ml-2 align-middle" target="_blank">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--or-green)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </Link>
        )}
      </h4>

      {/* Authors - italic like OpenReview */}
      {paper.author && (
        <div className="text-[var(--or-dark-blue)] mb-[2px] italic text-sm">
          {paper.author.display_name || paper.author.username}
          {paper.author.institution && (
            <span className="not-italic text-[var(--or-subtle-gray)]"> · {paper.author.institution}</span>
          )}
        </div>
      )}

      {/* Meta info - OpenReview style inline list */}
      <ul className="list-none flex flex-wrap gap-x-2 gap-y-0 m-0 p-0 text-xs leading-5 text-[var(--or-subtle-gray)]">
        <li>
          {formatDistanceToNow(new Date(paper.created_at), { addSuffix: true, locale: zhCN })}
        </li>
        <li className="before:content-['·'] before:mr-2">
          {paper.venue?.name || "RubbishReview"}
        </li>
        {decisionInfo && (
          <li className="before:content-['·'] before:mr-2 font-semibold" style={{ color: paper.decision === "certified_rubbish" ? "var(--or-green)" : paper.decision === "too_good" ? "var(--destructive)" : "var(--or-subtle-gray)" }}>
            {decisionInfo.label}
          </li>
        )}
        {!decisionInfo && (
          <li className="before:content-['·'] before:mr-2">
            {PAPER_STATUS[paper.status]}
          </li>
        )}
        {paper.avg_rubbish_score > 0 && (
          <li className="before:content-['·'] before:mr-2">
            Rubbish Score: {paper.avg_rubbish_score}/10
          </li>
        )}
        <li className="before:content-['·'] before:mr-2">
          {paper.review_count} {paper.review_count === 1 ? "Review" : "Reviews"}
        </li>
        <li className="before:content-['·'] before:mr-2">
          {paper.comment_count} {paper.comment_count === 1 ? "Reply" : "Replies"}
        </li>
      </ul>
    </div>
  );
}
