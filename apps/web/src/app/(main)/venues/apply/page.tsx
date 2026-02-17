"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ApplyVenuePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    subtitle: "",
    description: "",
    review_mode: "open",
    website: "",
    contact: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Auto-generate slug from name
    if (field === "name" && !form.slug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setForm((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/venue-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit application");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8" style={{ backgroundColor: "var(--or-bg)" }}>
        <div className="max-w-lg mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--or-dark-blue)" }}>
            Application Submitted!
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--or-subtle-gray)" }}>
            Your venue application for <strong>{form.name}</strong> has been submitted and is pending review.
            You'll be notified once it's approved.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 text-white"
            style={{ backgroundColor: "var(--or-medium-blue)", borderRadius: 0 }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-lg mx-auto">
        <Link href="/venues" className="text-sm" style={{ color: "var(--or-medium-blue)" }}>
          ← Back to Venues
        </Link>

        <h1 className="text-2xl font-bold mt-4 mb-2" style={{ color: "var(--or-dark-blue)" }}>
          Apply to Create a Venue
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--or-subtle-gray)" }}>
          Submit your venue for review. Once approved, you'll become the chief editor.
        </p>

        {error && (
          <p className="text-sm mb-4 p-2" style={{ backgroundColor: "#fed7d7", color: "#742a2a" }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--or-dark-blue)" }}>
              Venue Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
              className="w-full px-3 py-2 border text-sm"
              style={{ borderRadius: 0, borderColor: "rgba(0,0,0,0.2)" }}
              placeholder="e.g., Journal of Rejected Ideas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--or-dark-blue)" }}>
              URL Slug *
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              required
              pattern="[a-z0-9-]+"
              className="w-full px-3 py-2 border text-sm"
              style={{ borderRadius: 0, borderColor: "rgba(0,0,0,0.2)" }}
              placeholder="e.g., rejected-ideas"
            />
            <p className="text-xs mt-1" style={{ color: "var(--or-light-gray)" }}>
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--or-dark-blue)" }}>
              Subtitle
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => updateField("subtitle", e.target.value)}
              className="w-full px-3 py-2 border text-sm"
              style={{ borderRadius: 0, borderColor: "rgba(0,0,0,0.2)" }}
              placeholder="A short tagline"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--or-dark-blue)" }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border text-sm"
              style={{ borderRadius: 0, borderColor: "rgba(0,0,0,0.2)" }}
              placeholder="What is this venue about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--or-dark-blue)" }}>
              Review Mode
            </label>
            <select
              value={form.review_mode}
              onChange={(e) => updateField("review_mode", e.target.value)}
              className="w-full px-3 py-2 border text-sm"
              style={{ borderRadius: 0 }}
            >
              <option value="open">Open Review (public)</option>
              <option value="blind">Blind Review (anonymous)</option>
              <option value="instant">Instant Decision</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--or-dark-blue)" }}>
              Website
            </label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => updateField("website", e.target.value)}
              className="w-full px-3 py-2 border text-sm"
              style={{ borderRadius: 0, borderColor: "rgba(0,0,0,0.2)" }}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--or-dark-blue)" }}>
              Contact Email
            </label>
            <input
              type="email"
              value={form.contact}
              onChange={(e) => updateField("contact", e.target.value)}
              className="w-full px-3 py-2 border text-sm"
              style={{ borderRadius: 0, borderColor: "rgba(0,0,0,0.2)" }}
              placeholder="contact@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 text-white font-medium cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: "var(--or-medium-blue)", borderRadius: 0 }}
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
