import Link from "next/link";
import type { Venue } from "@/lib/types";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Globe, Mail, Calendar, MapPin } from "lucide-react";
import { ShareButtons } from "@/components/forum/ShareButtons";

export function VenueHeader({ venue }: { venue: Venue }) {
  const deadlineDate = venue.deadline ? new Date(venue.deadline) : null;
  const isPastDeadline = deadlineDate ? deadlineDate < new Date() : false;

  return (
    <div className="mb-6">
      <h1 className="text-[2.25rem] font-normal mb-1" style={{ color: "var(--or-dark-blue)" }}>
        {venue.name}
      </h1>
      {venue.subtitle && (
        <h3 className="text-base font-normal mb-2" style={{ color: "var(--or-subtle-gray)" }}>
          {venue.subtitle}
        </h3>
      )}

      {/* Meta icons row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-4" style={{ color: "var(--or-dark-blue)" }}>
        {venue.location && (
          <span className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-[var(--or-subtle-gray)]" />
            {venue.location}
          </span>
        )}
        {venue.date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-[var(--or-subtle-gray)]" />
            {venue.date}
          </span>
        )}
        {venue.website && (
          <span className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-[var(--or-subtle-gray)]" />
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--or-medium-blue)" }}
              className="hover:underline"
            >
              {venue.website}
            </a>
          </span>
        )}
        {venue.contact && (
          <span className="flex items-center gap-1">
            <Mail className="h-3.5 w-3.5 text-[var(--or-subtle-gray)]" />
            <a
              href={`mailto:${venue.contact}`}
              style={{ color: "var(--or-medium-blue)" }}
              className="hover:underline"
            >
              {venue.contact}
            </a>
          </span>
        )}
      </div>

      {/* Stats row */}
      <ul className="list-none flex gap-x-4 m-0 p-0 text-xs text-[var(--or-subtle-gray)] mb-4">
        <li>
          Impact Factor: <strong>{venue.impact_factor.toFixed(3)}</strong>
        </li>
        <li>
          Status:{" "}
          <strong
            style={{
              color: venue.accepting_submissions ? "var(--or-green)" : "var(--destructive)",
            }}
          >
            {venue.accepting_submissions ? "Accepting Submissions" : "Closed"}
          </strong>
        </li>
        <li>
          Review Mode: <strong className="capitalize">{venue.review_mode}</strong>
        </li>
        {deadlineDate && (
          <li>
            Deadline:{" "}
            <strong style={{ color: isPastDeadline ? "var(--destructive)" : "var(--or-green)" }}>
              {deadlineDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              {isPastDeadline && " (expired)"}
            </strong>
          </li>
        )}
      </ul>

      {/* Share buttons */}
      <div className="mb-4">
        <ShareButtons title={venue.name} venueSlug={venue.slug} />
      </div>

      {/* Instructions (Markdown) */}
      {venue.instructions && (
        <div className="text-sm" style={{ color: "var(--or-dark-blue)" }}>
          <MarkdownRenderer content={venue.instructions} />
        </div>
      )}

      {deadlineDate && !isPastDeadline && (
        <p className="text-xs text-[var(--or-subtle-gray)] mt-2">
          Submission deadline: {deadlineDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
