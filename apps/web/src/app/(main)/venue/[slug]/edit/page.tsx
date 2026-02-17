"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Venue } from "@/lib/types";

export default function EditVenuePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [reviewMode, setReviewMode] = useState("open");
  const [acceptingSubmissions, setAcceptingSubmissions] = useState(true);
  const [website, setWebsite] = useState("");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState("");
  const [instructions, setInstructions] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submissionOpen, setSubmissionOpen] = useState("");
  const [date, setDate] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/venues/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.venue) {
          setError("Venue not found");
          setLoading(false);
          return;
        }
        const v = res.venue as Venue;
        setVenue(v);
        setName(v.name || "");
        setSubtitle(v.subtitle || "");
        setDescription(v.description || "");
        setReviewMode(v.review_mode || "open");
        setAcceptingSubmissions(v.accepting_submissions ?? true);
        setWebsite(v.website || "");
        setContact(v.contact || "");
        setLocation(v.location || "");
        setInstructions(v.instructions || "");
        setDeadline(v.deadline || "");
        setSubmissionOpen(v.submission_open || "");
        setDate(v.date || "");
        setCoverImageUrl(v.cover_image_url || "");
        setLogoUrl(v.logo_url || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load venue");
        setLoading(false);
      });
  }, [slug]);

  async function handleImageUpload(file: File, setter: (url: string) => void) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "venue");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) setter(data.url);
    } catch { /* ignore */ }
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/venues/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subtitle: subtitle || null,
          description: description || null,
          review_mode: reviewMode,
          accepting_submissions: acceptingSubmissions,
          website: website || null,
          contact: contact || null,
          location: location || null,
          instructions: instructions || null,
          deadline: deadline || null,
          submission_open: submissionOpen || null,
          date: date || null,
          cover_image_url: coverImageUrl || null,
          logo_url: logoUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
      } else {
        setSuccess(true);
        setTimeout(() => router.push(`/venue/${slug}`), 1500);
      }
    } catch {
      setError("Network error");
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

  if (error && !venue) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-sm" style={{ color: "var(--destructive)" }}>{error}</p>
        <Link href={`/venue/${slug}`} className="text-sm mt-4 inline-block" style={{ color: "var(--or-medium-blue)" }}>← Back to Venue</Link>
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
          Edit Venue
        </h1>
        <p className="text-xs text-[var(--or-subtle-gray)] mb-6">Update venue information, settings, and appearance.</p>

        <div className="space-y-4 mb-8">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]" style={{ borderRadius: 0 }} />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Subtitle</label>
            <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
              className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]" style={{ borderRadius: 0 }} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
              className="w-full px-3 py-2 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)] resize-y" style={{ borderRadius: 0 }} />
          </div>

          {/* Review Mode */}
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Review Mode</label>
            <select value={reviewMode} onChange={(e) => setReviewMode(e.target.value)}
              className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none" style={{ borderRadius: 0 }}>
              <option value="open">Open Review</option>
              <option value="blind">Blind Review</option>
              <option value="instant">Instant (Invite Code)</option>
            </select>
          </div>

          {/* Accepting Submissions */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="accepting" checked={acceptingSubmissions} onChange={(e) => setAcceptingSubmissions(e.target.checked)} />
            <label htmlFor="accepting" className="text-sm" style={{ color: "var(--or-dark-blue)" }}>Accepting Submissions</label>
          </div>

          {/* Website & Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]" style={{ borderRadius: 0 }} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Contact Email</label>
              <input type="email" value={contact} onChange={(e) => setContact(e.target.value)}
                className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]" style={{ borderRadius: 0 }} />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]" style={{ borderRadius: 0 }} />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Submission Instructions</label>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={4}
              className="w-full px-3 py-2 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)] resize-y" style={{ borderRadius: 0 }} />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Submission Open</label>
              <input type="date" value={submissionOpen} onChange={(e) => setSubmissionOpen(e.target.value)}
                className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none" style={{ borderRadius: 0 }} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none" style={{ borderRadius: 0 }} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Event Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none" style={{ borderRadius: 0 }} />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Cover Image</label>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, setCoverImageUrl); }} />
            <div className="flex items-center gap-3">
              {coverImageUrl && (
                <img src={coverImageUrl} alt="Cover" className="h-16 w-24 object-cover border border-[#ccc]" />
              )}
              <button onClick={() => coverInputRef.current?.click()} disabled={uploading}
                className="text-xs border border-[#ccc] px-3 py-1.5 bg-white hover:bg-[#f5f5f5] cursor-pointer disabled:opacity-50" style={{ borderRadius: 0 }}>
                {coverImageUrl ? "Replace" : "Upload"}
              </button>
              {coverImageUrl && (
                <button onClick={() => setCoverImageUrl("")}
                  className="text-xs hover:underline cursor-pointer bg-transparent border-0 p-0" style={{ color: "var(--destructive)" }}>
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Logo</label>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, setLogoUrl); }} />
            <div className="flex items-center gap-3">
              {logoUrl && (
                <img src={logoUrl} alt="Logo" className="h-12 w-12 object-cover border border-[#ccc]" />
              )}
              <button onClick={() => logoInputRef.current?.click()} disabled={uploading}
                className="text-xs border border-[#ccc] px-3 py-1.5 bg-white hover:bg-[#f5f5f5] cursor-pointer disabled:opacity-50" style={{ borderRadius: 0 }}>
                {logoUrl ? "Replace" : "Upload"}
              </button>
              {logoUrl && (
                <button onClick={() => setLogoUrl("")}
                  className="text-xs hover:underline cursor-pointer bg-transparent border-0 p-0" style={{ color: "var(--destructive)" }}>
                  Remove
                </button>
              )}
            </div>
          </div>

          {error && <p className="text-xs" style={{ color: "var(--destructive)" }}>{error}</p>}
          {success && <p className="text-xs" style={{ color: "var(--or-green)" }}>Saved successfully! Redirecting...</p>}

          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving || !name.trim()}
              className="h-[38px] px-6 text-sm text-white border-0 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href={`/venue/${slug}`}
              className="h-[38px] px-4 text-sm border border-[#ccc] bg-white hover:bg-[#f5f5f5] flex items-center"
              style={{ borderRadius: 0, color: "var(--or-dark-blue)" }}>
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
