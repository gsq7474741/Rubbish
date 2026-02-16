"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface ActivityItem {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  user?: { username: string; display_name: string | null };
}

export function ActivityFeed({ venueId }: { venueId?: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = venueId
      ? `/api/activity?venue_id=${venueId}&limit=20`
      : `/api/activity?limit=20`;
    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setActivities(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [venueId]);

  if (loading) {
    return <p className="text-xs text-[var(--or-subtle-gray)] py-4">Loading activity...</p>;
  }

  if (activities.length === 0) {
    return <p className="text-xs text-[var(--or-subtle-gray)] py-4">No recent activity.</p>;
  }

  const actionLabels: Record<string, string> = {
    submission: "submitted a paper",
    review: "submitted a review",
    comment: "posted a comment",
    decision: "decision made",
  };

  return (
    <ul className="list-none m-0 p-0 space-y-3">
      {activities.map((a) => {
        const userName = a.user?.display_name || a.user?.username || "Someone";
        const paperTitle = (a.metadata?.paper_title as string) || "a paper";
        const paperId = (a.metadata?.paper_id as string) || a.target_id;

        return (
          <li key={a.id} className="text-xs border-l-[3px] border-[#ddd] pl-3 py-1">
            <span style={{ color: "var(--or-dark-blue)" }}>
              <strong>{userName}</strong> {actionLabels[a.action] || a.action}:{" "}
              <Link
                href={`/paper/${paperId}`}
                style={{ color: "var(--or-medium-blue)" }}
                className="hover:underline"
              >
                {paperTitle}
              </Link>
            </span>
            <br />
            <span className="text-[var(--or-subtle-gray)]">
              {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: zhCN })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
