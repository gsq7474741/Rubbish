"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [institution, setInstitution] = useState("");
  const [researchField, setResearchField] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) {
        setDisplayName(profile.display_name || "");
        setBio(profile.bio || "");
        setInstitution(profile.institution || "");
        setResearchField(profile.research_field || "");
      }
      setLoading(false);
    });
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        bio: bio || null,
        institution: institution || null,
        research_field: researchField || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
    }
    setSaving(false);
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
      <div className="max-w-[600px]">
        <h1 className="text-[2.25rem] font-normal mb-2 mt-4" style={{ color: "var(--or-dark-blue)" }}>
          Settings
        </h1>
        <p className="text-sm text-[var(--or-subtle-gray)] mb-6">
          Update your profile information.
        </p>

        <hr className="border-0 border-t border-[rgba(0,0,0,0.1)] mb-6" />

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
              style={{ borderRadius: 0 }}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)] resize-y"
              style={{ borderRadius: 0 }}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Institution</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Your university or organization"
              className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
              style={{ borderRadius: 0 }}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Research Field</label>
            <input
              type="text"
              value={researchField}
              onChange={(e) => setResearchField(e.target.value)}
              placeholder="e.g. Nothing Studies, Useless AI"
              className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
              style={{ borderRadius: 0 }}
            />
          </div>

          {error && <p className="text-sm" style={{ color: "var(--destructive)" }}>{error}</p>}
          {success && <p className="text-sm" style={{ color: "var(--or-green)" }}>Profile updated successfully!</p>}

          <button
            type="submit"
            disabled={saving}
            className="h-[38px] px-6 text-sm text-white border-0 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <hr className="border-0 border-t border-[rgba(0,0,0,0.1)] my-6" />

        {/* Invite Codes Section */}
        <InviteCodesSection />

        <div className="my-8" />
      </div>
    </div>
  );
}

function InviteCodesSection() {
  const [codes, setCodes] = useState<{ code: string; used_by: string | null; used_at: string | null; expires_at: string | null; created_at: string }[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/invite-codes")
      .then((r) => r.json())
      .then((res) => setCodes(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingCodes(false));
  }, []);

  async function generateCode() {
    setGenerating(true);
    setCodeError(null);
    try {
      const res = await fetch("/api/invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
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
      <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--or-dark-blue)" }}>Invite Codes</h2>
      <p className="text-xs text-[var(--or-subtle-gray)] mb-4">Generate invite codes to share with friends. You can have up to 5 unused codes at a time.</p>

      <button
        onClick={generateCode}
        disabled={generating}
        className="h-[34px] px-4 text-sm text-white border-0 cursor-pointer disabled:opacity-50 mb-4"
        style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
      >
        {generating ? "Generating..." : "Generate New Code"}
      </button>

      {codeError && <p className="text-xs mb-2" style={{ color: "var(--destructive)" }}>{codeError}</p>}

      {loadingCodes ? (
        <p className="text-xs text-[var(--or-subtle-gray)]">Loading codes...</p>
      ) : codes.length === 0 ? (
        <p className="text-xs text-[var(--or-subtle-gray)]">No invite codes yet. Generate one above!</p>
      ) : (
        <div className="space-y-2">
          {codes.map((c) => (
            <div key={c.code} className="flex items-center gap-3 p-3 border border-[rgba(0,0,0,0.1)] text-sm" style={{ backgroundColor: c.used_by ? "var(--or-bg-gray)" : "white" }}>
              <code className="font-mono font-bold" style={{ color: c.used_by ? "var(--or-subtle-gray)" : "var(--or-green)" }}>{c.code}</code>
              <span className="flex-1" />
              {c.used_by ? (
                <span className="text-xs text-[var(--or-subtle-gray)]">Used {c.used_at ? new Date(c.used_at).toLocaleDateString() : ""}</span>
              ) : c.expires_at && new Date(c.expires_at) < new Date() ? (
                <span className="text-xs" style={{ color: "var(--destructive)" }}>Expired</span>
              ) : (
                <span className="text-xs" style={{ color: "var(--or-green)" }}>Available</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
