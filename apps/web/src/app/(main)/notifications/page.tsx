"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Notification } from "@/lib/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setNotifications(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-[850px]">
        <div className="flex items-center justify-between mt-4 mb-6">
          <h1 className="text-[2.25rem] font-normal" style={{ color: "var(--or-dark-blue)" }}>Notifications</h1>
          <button
            onClick={markAllRead}
            className="text-xs px-3 py-1 border border-[#ccc] bg-white hover:bg-[#f5f5f5] cursor-pointer"
            style={{ borderRadius: 0 }}
          >
            Mark all as read
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--or-subtle-gray)] py-8 text-center">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-[var(--or-subtle-gray)] py-8 text-center">No notifications yet.</p>
        ) : (
          <div>
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link || "#"}
                className={`block py-3 border-b border-[rgba(0,0,0,0.1)] hover:bg-[var(--or-sandy)] transition-colors ${n.is_read ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {!n.is_read && (
                    <span className="mt-1.5 w-2 h-2 shrink-0" style={{ backgroundColor: "var(--or-green)", borderRadius: "50%" }} />
                  )}
                  {n.is_read && <span className="mt-1.5 w-2 h-2 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--or-dark-blue)" }}>{n.title}</p>
                    {n.body && <p className="text-xs text-[var(--or-subtle-gray)] mt-0.5">{n.body}</p>}
                    <p className="text-xs text-[var(--or-light-gray)] mt-1">
                      {new Date(n.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
