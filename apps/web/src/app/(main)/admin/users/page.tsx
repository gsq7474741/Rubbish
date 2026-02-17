"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  display_name: string | null;
  role: string;
  created_at: string;
}

const ROLES = ["user", "content_admin", "system_admin"] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 403) {
        alert("You don't have permission to access this page");
        window.location.href = "/admin";
        return;
      }
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(userId: string, newRole: string) {
    if (!confirm(`Change this user's role to ${newRole}?`)) return;

    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update role");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  }

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.display_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const roleColors: Record<string, { bg: string; text: string }> = {
    user: { bg: "#e2e8f0", text: "#1a202c" },
    content_admin: { bg: "#bee3f8", text: "#1a365d" },
    system_admin: { bg: "#fed7d7", text: "#742a2a" },
  };

  return (
    <div className="container mx-auto px-4 py-8" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-sm" style={{ color: "var(--or-medium-blue)" }}>
            ← Back to Admin
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--or-dark-blue)" }}>
          User Management
        </h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-64 px-3 py-2 mb-6 border text-sm"
          style={{ borderRadius: 0, borderColor: "rgba(0,0,0,0.2)" }}
        />

        {loading ? (
          <p className="text-sm" style={{ color: "var(--or-subtle-gray)" }}>Loading...</p>
        ) : (
          <div className="border bg-white" style={{ borderRadius: 0 }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ backgroundColor: "var(--or-sandy)" }}>
                  <th className="text-left px-4 py-2 font-semibold" style={{ color: "var(--or-dark-blue)" }}>User</th>
                  <th className="text-left px-4 py-2 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Role</th>
                  <th className="text-left px-4 py-2 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Joined</th>
                  <th className="text-right px-4 py-2 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="font-medium" style={{ color: "var(--or-dark-blue)" }}>
                        {user.display_name || user.username}
                      </div>
                      <div className="text-xs" style={{ color: "var(--or-light-gray)" }}>
                        @{user.username}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 text-xs"
                        style={{
                          backgroundColor: roleColors[user.role]?.bg || "#e2e8f0",
                          color: roleColors[user.role]?.text || "#1a202c",
                        }}
                      >
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--or-subtle-gray)" }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        disabled={updating === user.id}
                        className="px-2 py-1 text-xs border cursor-pointer disabled:opacity-50"
                        style={{ borderRadius: 0 }}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
