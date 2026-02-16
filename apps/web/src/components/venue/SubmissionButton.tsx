import Link from "next/link";
import type { Venue } from "@/lib/types";

export function SubmissionButton({ venue }: { venue: Venue }) {
  const deadlineDate = venue.deadline ? new Date(venue.deadline) : null;
  const isPastDeadline = deadlineDate ? deadlineDate < new Date() : false;
  const isOpen = venue.accepting_submissions && !isPastDeadline;

  if (!isOpen) return null;

  return (
    <div
      className="flex items-center gap-3 py-3 px-4 border border-[rgba(0,0,0,0.1)] mb-4"
      style={{ backgroundColor: "var(--or-sandy)" }}
    >
      <strong className="text-sm" style={{ color: "var(--or-dark-blue)" }}>
        Add:
      </strong>
      <Link
        href={`/venue/${venue.slug}/submit`}
        className="inline-block px-3 py-1 text-sm text-white border-0 cursor-pointer hover:opacity-90"
        style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
      >
        {venue.name} Submission
      </Link>
      {deadlineDate && (
        <span className="text-xs text-[var(--or-subtle-gray)]">
          Deadline: {deadlineDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      )}
    </div>
  );
}
