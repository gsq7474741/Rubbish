"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FileText, CheckCircle, Loader2, X, Upload } from "lucide-react";
import type { Paper } from "@/lib/types";

interface UploadedFile {
  url: string;
  filename: string;
  size: number;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export default function EditPaperPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isReviseMode = searchParams.get("mode") === "revise";

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Editable fields
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [supplementaryFiles, setSupplementaryFiles] = useState<{ url: string; filename: string; size: number }[]>([]);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const suppInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/papers/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }
        const p = res.data as Paper;
        setPaper(p);
        setTitle(p.title);
        setAbstract(p.abstract || "");
        setKeywords(p.keywords || []);
        setContentMarkdown(p.content_markdown || "");
        setPdfUrl(p.pdf_url);
        setSupplementaryFiles(
          Array.isArray(p.supplementary_urls)
            ? p.supplementary_urls.map((s) => ({
                url: (s as Record<string, string>).url || (s as unknown as string),
                filename: (s as Record<string, string>).filename || "File",
                size: Number((s as Record<string, string>).size) || 0,
              }))
            : []
        );
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load paper");
        setLoading(false);
      });
  }, [id]);

  const uploadFile = useCallback(async (file: File, category: string): Promise<UploadedFile | null> => {
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.error || "Upload failed"); return null; }
      return { url: data.url, filename: data.filename, size: data.size };
    } catch {
      setUploadError("Upload failed");
      return null;
    }
  }, []);

  async function handlePdfUpload(file: File) {
    if (file.type !== "application/pdf" &&
        file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
        file.type !== "application/msword") {
      setUploadError("Only PDF or Word files are accepted");
      return;
    }
    setUploading(true);
    const result = await uploadFile(file, "paper");
    if (result) setPdfUrl(result.url);
    setUploading(false);
  }

  async function handleSuppUpload(files: FileList) {
    setUploading(true);
    for (const file of Array.from(files)) {
      if (file.size > 50 * 1024 * 1024) continue;
      const result = await uploadFile(file, "supplementary");
      if (result) {
        setSupplementaryFiles((prev) => [...prev, result]);
      }
    }
    setUploading(false);
  }

  function addKeyword() {
    const kw = keywordInput.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
    }
    setKeywordInput("");
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const body: Record<string, unknown> = {
      title,
      abstract: abstract || null,
      keywords,
      content_markdown: contentMarkdown || null,
      pdf_url: pdfUrl,
      supplementary_urls: supplementaryFiles.map((f) => ({ url: f.url, filename: f.filename, size: f.size })),
    };

    try {
      let url: string;
      let method: string;

      if (isReviseMode) {
        // Submit as a new revision
        url = `/api/papers/${id}/revise`;
        method = "POST";
        body.content_type = paper?.content_type;
        body.image_urls = paper?.image_urls || [];
      } else {
        // In-place edit
        url = `/api/papers/${id}`;
        method = "PATCH";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
      } else {
        setSuccess(true);
        const targetId = isReviseMode ? data.data?.id || id : id;
        setTimeout(() => router.push(`/paper/${targetId}`), 1500);
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

  if (error && !paper) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-sm" style={{ color: "var(--destructive)" }}>{error}</p>
        <Link href={`/paper/${id}`} className="text-sm mt-4 inline-block" style={{ color: "var(--or-medium-blue)" }}>← Back to Paper</Link>
      </div>
    );
  }

  const canEdit = isReviseMode
    ? paper && (paper.status === "submitted" || paper.status === "under_review" || paper.status === "published")
    : paper && (paper.status === "submitted" || paper.status === "under_review");

  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-[700px]">
        <div className="py-2 border-b border-[#d0d0d0] mb-4" style={{ backgroundColor: "var(--or-bg-gray)", marginLeft: "-1rem", marginRight: "-1rem", paddingLeft: "1rem", paddingRight: "1rem" }}>
          <span className="text-sm text-[var(--or-subtle-gray)]">
            <Link href={`/paper/${id}`} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">← Back to Paper</Link>
          </span>
        </div>

        <h1 className="text-[2.25rem] font-normal mb-2 mt-4" style={{ color: "var(--or-dark-blue)" }}>
          {isReviseMode ? "Submit Revision" : "Edit Submission"}
        </h1>
        {isReviseMode && (
          <p className="text-xs text-[var(--or-subtle-gray)] mb-4">
            This will create a new version of your paper. The previous version will remain accessible in the revision history.
          </p>
        )}

        {!canEdit && (
          <div className="p-3 mb-4 border border-[rgba(0,0,0,0.1)]" style={{ backgroundColor: "var(--or-sandy)" }}>
            <p className="text-sm" style={{ color: "var(--destructive)" }}>
              This paper cannot be edited because its status is &quot;{paper?.status}&quot;.
            </p>
          </div>
        )}

        {canEdit && (
          <div className="space-y-4 mb-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
                style={{ borderRadius: 0 }}
              />
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Abstract</label>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)] resize-y"
                style={{ borderRadius: 0 }}
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Keywords</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {keywords.map((kw) => (
                  <span key={kw} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 border border-[rgba(0,0,0,0.1)]" style={{ backgroundColor: "var(--or-sandy)" }}>
                    {kw}
                    <button onClick={() => setKeywords(keywords.filter((k) => k !== kw))} className="text-[var(--or-subtle-gray)] hover:text-[var(--destructive)] bg-transparent border-0 cursor-pointer p-0">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add keyword..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                  className="flex-1 h-[34px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
                  style={{ borderRadius: 0 }}
                />
                <button onClick={addKeyword} className="h-[34px] px-3 text-xs text-white border-0 cursor-pointer" style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}>Add</button>
              </div>
            </div>

            {/* Content (Markdown) */}
            {(paper?.content_type === "markdown") && (
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Content (Markdown)</label>
                <textarea
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 text-sm font-mono border border-[#ccc] focus:outline-none focus:border-[var(--or-green)] resize-y"
                  style={{ borderRadius: 0 }}
                />
              </div>
            )}

            {/* PDF/Word file */}
            {(paper?.content_type === "pdf" || paper?.content_type === "word") && (
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>
                  {paper.content_type === "word" ? "Word File" : "PDF File"}
                </label>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept={paper.content_type === "word" ? ".doc,.docx" : "application/pdf"}
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f); }}
                />
                {pdfUrl ? (
                  <div className="flex items-center gap-3 p-3 border border-[var(--or-green)] bg-[var(--accent)]">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: "var(--or-green)" }} />
                    <span className="text-sm flex-1 truncate" style={{ color: "var(--or-dark-blue)" }}>File uploaded</span>
                    <button
                      onClick={() => pdfInputRef.current?.click()}
                      className="text-xs border border-[#ccc] px-2 py-1 bg-white hover:bg-[#f5f5f5] cursor-pointer"
                      style={{ borderRadius: 0 }}
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-[#ccc] p-6 text-center cursor-pointer hover:border-[var(--or-green)]"
                    onClick={() => pdfInputRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="h-6 w-6 mx-auto mb-1 animate-spin text-[var(--or-green)]" />
                    ) : (
                      <FileText className="h-6 w-6 mx-auto mb-1 text-[var(--or-subtle-gray)]" />
                    )}
                    <p className="text-xs text-[var(--or-subtle-gray)]">{uploading ? "Uploading..." : "Click to upload"}</p>
                  </div>
                )}
              </div>
            )}

            {/* Supplementary Materials */}
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Supplementary Materials</label>
              <input
                ref={suppInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files) handleSuppUpload(e.target.files); }}
              />
              {supplementaryFiles.length > 0 && (
                <div className="space-y-2 mb-2">
                  {supplementaryFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 border border-[rgba(0,0,0,0.1)] bg-white text-sm">
                      <span className="flex-1 truncate">{f.filename}</span>
                      <span className="text-xs text-[var(--or-subtle-gray)]">{formatSize(f.size)}</span>
                      <button
                        onClick={() => setSupplementaryFiles(supplementaryFiles.filter((_, j) => j !== i))}
                        className="text-[var(--or-subtle-gray)] hover:text-[var(--destructive)] bg-transparent border-0 cursor-pointer p-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => suppInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1 text-xs border border-[#ccc] px-3 py-1.5 bg-white hover:bg-[#f5f5f5] cursor-pointer disabled:opacity-50"
                style={{ borderRadius: 0 }}
              >
                <Upload className="h-3 w-3" /> Add Supplementary File
              </button>
            </div>

            {uploadError && <p className="text-xs" style={{ color: "var(--destructive)" }}>{uploadError}</p>}
            {error && <p className="text-xs" style={{ color: "var(--destructive)" }}>{error}</p>}
            {success && <p className="text-xs" style={{ color: "var(--or-green)" }}>Saved successfully! Redirecting...</p>}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="h-[38px] px-6 text-sm text-white border-0 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
              >
                {saving ? "Saving..." : isReviseMode ? "Submit Revision" : "Save Changes"}
              </button>
              <Link
                href={`/paper/${id}`}
                className="h-[38px] px-4 text-sm border border-[#ccc] bg-white hover:bg-[#f5f5f5] flex items-center"
                style={{ borderRadius: 0, color: "var(--or-dark-blue)" }}
              >
                Cancel
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
