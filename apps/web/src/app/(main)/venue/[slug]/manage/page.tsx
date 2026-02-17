"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";

interface Editor {
  venue_id: string;
  user_id: string;
  role: string;
  user?: { id: string; username: string; display_name: string | null; avatar_url: string | null };
}

export default function VenueManagePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [editors, setEditors] = useState<Editor[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState("editor");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/venues/${slug}/editors`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) {
          router.push(`/venue/${slug}`);
          return;
        }
        setEditors(res.data || []);
      })
      .catch(() => router.push(`/venue/${slug}`))
      .finally(() => setLoading(false));
  }, [slug, router]);

  async function addEditor() {
    if (!newUsername.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch(`/api/venues/${slug}/editors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername.trim(), role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add editor");
      } else {
        setEditors((prev) => [...prev.filter((e) => e.user_id !== data.data.user_id), data.data]);
        setNewUsername("");
      }
    } catch {
      setError("Network error");
    }
    setAdding(false);
  }

  async function removeEditor(userId: string) {
    try {
      const res = await fetch(`/api/venues/${slug}/editors`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (res.ok) {
        setEditors((prev) => prev.filter((e) => e.user_id !== userId));
      }
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-sm text-[var(--or-subtle-gray)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-[700px]">
        <div className="py-2 border-b border-[#d0d0d0] mb-4" style={{ backgroundColor: "var(--or-bg-gray)", marginLeft: "-1rem", marginRight: "-1rem", paddingLeft: "1rem", paddingRight: "1rem" }}>
          <span className="text-sm text-[var(--or-subtle-gray)]">
            <Link href={`/venue/${slug}`} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">← Back to Venue</Link>
          </span>
        </div>

        <h1 className="text-[2.25rem] font-normal mb-2 mt-4" style={{ color: "var(--or-dark-blue)" }}>
          Manage Editors
        </h1>
        <p className="text-xs text-[var(--or-subtle-gray)] mb-6">Add or remove editors for this venue.</p>

        {/* Add Editor */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <input
            placeholder="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="flex-1 min-w-[150px] h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
            style={{ borderRadius: 0 }}
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none"
            style={{ borderRadius: 0 }}
          >
            <option value="editor">Editor</option>
            <option value="chief_editor">Chief Editor</option>
          </select>
          <button
            onClick={addEditor}
            disabled={adding || !newUsername.trim()}
            className="h-[38px] px-4 text-sm text-white border-0 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
          >
            {adding ? "Adding..." : "Add Editor"}
          </button>
        </div>

        {error && <p className="text-xs mb-4" style={{ color: "var(--destructive)" }}>{error}</p>}

        {/* Editors List */}
        {editors.length === 0 ? (
          <p className="text-sm text-[var(--or-subtle-gray)]">No editors yet.</p>
        ) : (
          <div className="space-y-2">
            {editors.map((e) => (
              <div key={e.user_id} className="flex items-center gap-3 p-3 border border-[rgba(0,0,0,0.1)] bg-white">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold" style={{ color: "var(--or-dark-blue)" }}>
                    {e.user?.display_name || e.user?.username || "Unknown"}
                  </span>
                  <span className="text-xs text-[var(--or-subtle-gray)] ml-2">@{e.user?.username}</span>
                </div>
                <span className="text-xs px-2 py-0.5 font-semibold" style={{
                  backgroundColor: e.role === "chief_editor" ? "var(--or-green)" : "var(--or-sandy)",
                  color: e.role === "chief_editor" ? "white" : "var(--or-dark-blue)",
                }}>
                  {e.role === "chief_editor" ? "Chief Editor" : "Editor"}
                </span>
                <button
                  onClick={() => removeEditor(e.user_id)}
                  className="text-[var(--or-subtle-gray)] hover:text-[var(--destructive)] cursor-pointer bg-transparent border-0 p-1"
                  title="Remove editor"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <hr className="border-0 border-t border-[rgba(0,0,0,0.1)] my-6" />

        {/* Editor Invite Codes Section */}
        <EditorInviteCodesSection slug={slug} />
      </div>
    </div>
  );
}

function EditorInviteCodesSection({ slug }: { slug: string }) {
  const [codes, setCodes] = useState<{ id: string; code: string; purpose: string; max_uses: number; used_count: number; expires_at: string | null; created_at: string }[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("instant_publish");
  const [maxUses, setMaxUses] = useState(1);

  useEffect(() => {
    fetch(`/api/venues/${slug}/invite-codes`)
      .then((r) => r.json())
      .then((res) => setCodes(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingCodes(false));
  }, [slug]);

  async function generateCode() {
    setGenerating(true);
    setCodeError(null);
    try {
      const res = await fetch(`/api/venues/${slug}/invite-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose, max_uses: maxUses }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCodeError(data.error || "Failed to generate code");
      } else {
        setCodes((prev) => [data.data, ...prev]);
      }
    } catch {
      setCodeError("Network error");
    }
    setGenerating(false);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--or-dark-blue)" }}>Editor Invite Codes</h2>
      <p className="text-xs text-[var(--or-subtle-gray)] mb-4">
        Generate invite codes for contributors. <strong>Instant Publish</strong> codes allow direct publication without review.
      </p>

      <div className="flex gap-2 mb-4 flex-wrap items-end">
        <div>
          <label className="block text-xs text-[var(--or-subtle-gray)] mb-1">Purpose</label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="h-[34px] px-2 text-sm border border-[#ccc]"
            style={{ borderRadius: 0 }}
          >
            <option value="instant_publish">Instant Publish (约稿)</option>
            <option value="reviewer_invite">Reviewer Invite (邀审)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--or-subtle-gray)] mb-1">Max Uses</label>
          <input
            type="number"
            min={1}
            max={100}
            value={maxUses}
            onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
            className="w-[70px] h-[34px] px-2 text-sm border border-[#ccc]"
            style={{ borderRadius: 0 }}
          />
        </div>
        <button
          onClick={generateCode}
          disabled={generating}
          className="h-[34px] px-4 text-sm text-white border-0 cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
        >
          {generating ? "Generating..." : "Generate Code"}
        </button>
      </div>

      {codeError && <p className="text-xs mb-2" style={{ color: "var(--destructive)" }}>{codeError}</p>}

      {loadingCodes ? (
        <p className="text-xs text-[var(--or-subtle-gray)]">Loading codes...</p>
      ) : codes.length === 0 ? (
        <p className="text-xs text-[var(--or-subtle-gray)]">No invite codes yet.</p>
      ) : (
        <div className="space-y-2">
          {codes.map((c) => {
            const exhausted = c.used_count >= c.max_uses;
            const expired = c.expires_at && new Date(c.expires_at) < new Date();
            return (
              <div key={c.id} className="flex items-center gap-3 p-3 border border-[rgba(0,0,0,0.1)] text-sm" style={{ backgroundColor: exhausted || expired ? "var(--or-bg-gray)" : "white" }}>
                <code className="font-mono font-bold" style={{ color: exhausted || expired ? "var(--or-subtle-gray)" : "var(--or-green)" }}>{c.code}</code>
                <span className="text-xs px-1.5 py-0.5" style={{ backgroundColor: "var(--or-sandy)", color: "var(--or-dark-blue)" }}>
                  {c.purpose === "instant_publish" ? "约稿" : "邀审"}
                </span>
                <span className="text-xs text-[var(--or-subtle-gray)]">{c.used_count}/{c.max_uses} used</span>
                <span className="flex-1" />
                {exhausted ? (
                  <span className="text-xs text-[var(--or-subtle-gray)]">Exhausted</span>
                ) : expired ? (
                  <span className="text-xs" style={{ color: "var(--destructive)" }}>Expired</span>
                ) : (
                  <span className="text-xs" style={{ color: "var(--or-green)" }}>Active</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
