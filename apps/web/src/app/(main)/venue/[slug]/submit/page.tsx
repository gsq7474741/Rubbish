"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { REVIEW_MODES } from "@/lib/constants";
import { X, Upload, FileText, Image as ImageIcon, Paperclip, CheckCircle, Loader2 } from "lucide-react";

interface VenueInfo {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  accepting_submissions: boolean;
  deadline: string | null;
  review_mode: string;
}

interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  contentType: string;
}

const steps = ["Basic Info", "Content", "Review Mode", "Preview"];

export default function VenueSubmitPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [venue, setVenue] = useState<VenueInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [contentType, setContentType] = useState<string>("markdown");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [reviewMode, setReviewMode] = useState<string>("open");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editorInviteCode, setEditorInviteCode] = useState("");

  // Co-authors state
  const [authors, setAuthors] = useState<{ name: string; institution: string; email: string; is_corresponding: boolean }[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [authorInst, setAuthorInst] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");

  // File upload state
  const [pdfFile, setPdfFile] = useState<UploadedFile | null>(null);
  const [imageFiles, setImageFiles] = useState<UploadedFile[]>([]);
  const [supplementaryFiles, setSupplementaryFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const suppInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File, category: string): Promise<UploadedFile | null> => {
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        setUploadError(err.error || "Upload failed");
        return null;
      }
      return await res.json();
    } catch {
      setUploadError("Network error during upload");
      return null;
    }
  }, []);

  const handlePdfUpload = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") { setUploadError("Only PDF files are accepted"); return; }
    if (file.size > 50 * 1024 * 1024) { setUploadError("File too large (max 50MB)"); return; }
    setUploading(true);
    const result = await uploadFile(file, "paper");
    if (result) setPdfFile(result);
    setUploading(false);
  }, [uploadFile]);

  // Word file state
  const [wordFile, setWordFile] = useState<UploadedFile | null>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);

  const handleWordUpload = useCallback(async (file: File) => {
    const validTypes = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];
    if (!validTypes.includes(file.type)) { setUploadError("Only Word (.doc/.docx) files are accepted"); return; }
    if (file.size > 50 * 1024 * 1024) { setUploadError("File too large (max 50MB)"); return; }
    setUploading(true);
    const result = await uploadFile(file, "paper");
    if (result) setWordFile(result);
    setUploading(false);
  }, [uploadFile]);

  const handleImageUpload = useCallback(async (files: FileList) => {
    setUploading(true);
    const newImages: UploadedFile[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 20 * 1024 * 1024) continue;
      const result = await uploadFile(file, "image");
      if (result) newImages.push(result);
    }
    setImageFiles((prev) => [...prev, ...newImages]);
    setUploading(false);
  }, [uploadFile]);

  const handleSuppUpload = useCallback(async (files: FileList) => {
    setUploading(true);
    const newFiles: UploadedFile[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 50 * 1024 * 1024) continue;
      const result = await uploadFile(file, "supplementary");
      if (result) newFiles.push(result);
    }
    setSupplementaryFiles((prev) => [...prev, ...newFiles]);
    setUploading(false);
  }, [uploadFile]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  useEffect(() => {
    fetch(`/api/venues/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        const v = res.venue || res.data;
        if (v) {
          setVenue(v);
          setReviewMode(v.review_mode || "open");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  function addKeyword() {
    const kw = keywordInput.trim();
    if (kw && keywords.length < 5 && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setKeywordInput("");
    }
  }

  function removeKeyword(kw: string) {
    setKeywords(keywords.filter((k) => k !== kw));
  }

  const canNext = () => {
    if (step === 0) return !!title && !!abstract;
    if (step === 1) {
      if (contentType === "markdown") return !!contentMarkdown;
      if (contentType === "pdf") return !!pdfFile;
      if (contentType === "word") return !!wordFile;
      if (contentType === "image") return imageFiles.length > 0;
      return true;
    }
    if (step === 2) {
      if (reviewMode === "instant") return !!editorInviteCode.trim();
      return true;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-sm text-[var(--or-subtle-gray)]">Loading venue...</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-[1.875rem] font-normal" style={{ color: "var(--or-dark-blue)" }}>Venue Not Found</h2>
        <Link href="/venues" className="text-sm mt-4 inline-block" style={{ color: "var(--or-medium-blue)" }}>← Back to Venues</Link>
      </div>
    );
  }

  if (!venue.accepting_submissions) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-[1.875rem] font-normal" style={{ color: "var(--or-dark-blue)" }}>Submissions Closed</h2>
        <p className="text-sm text-[var(--or-subtle-gray)] mt-2">{venue.name} is not currently accepting submissions.</p>
        <Link href={`/venue/${slug}`} className="text-sm mt-4 inline-block" style={{ color: "var(--or-medium-blue)" }}>← Back to {venue.name}</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      {/* Breadcrumb */}
      <div className="py-2 border-b border-[#d0d0d0] mb-4" style={{ backgroundColor: "var(--or-bg-gray)", marginLeft: "-1rem", marginRight: "-1rem", paddingLeft: "1rem", paddingRight: "1rem" }}>
        <span className="text-sm text-[var(--or-subtle-gray)]">
          <Link href="/venues" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">All Venues</Link>
          {" › "}
          <Link href={`/venue/${slug}`} style={{ color: "var(--or-medium-blue)" }} className="hover:underline">{venue.name}</Link>
          {" › "}
          <span>Submit</span>
        </span>
      </div>

      <div className="max-w-[850px]">
        <h1 className="text-[2.25rem] font-normal mb-1 mt-4" style={{ color: "var(--or-dark-blue)" }}>
          Submit to {venue.name}
        </h1>
        {venue.deadline && (
          <p className="text-xs text-[var(--or-subtle-gray)] mb-4">
            Deadline: {new Date(venue.deadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        )}

        {/* Step Indicator */}
        <div className="flex items-center gap-1 mb-6 text-sm">
          {steps.map((s, i) => (
            <span key={s} className="flex items-center gap-1">
              <span
                className={`inline-flex items-center justify-center w-6 h-6 text-xs ${
                  i === step
                    ? "text-white"
                    : i < step
                    ? "text-white opacity-70"
                    : "text-[var(--or-subtle-gray)] bg-[var(--or-bg-gray)]"
                }`}
                style={i <= step ? { backgroundColor: "var(--or-green)", borderRadius: 0 } : { borderRadius: 0 }}
              >
                {i + 1}
              </span>
              <span className={i === step ? "font-semibold" : "text-[var(--or-subtle-gray)]"}>{s}</span>
              {i < steps.length - 1 && <span className="text-[var(--or-light-gray)] mx-1">›</span>}
            </span>
          ))}
        </div>

        <hr className="border-0 border-t border-[rgba(0,0,0,0.1)] mb-6" />

        {/* Step 1: Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Title *</label>
              <input
                type="text"
                placeholder="Your paper title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
                style={{ borderRadius: 0 }}
              />
              <p className="text-xs text-[var(--or-subtle-gray)] mt-1">{title.length}/200</p>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Abstract *</label>
              <textarea
                placeholder="Briefly describe your rubbish..."
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)] resize-y"
                style={{ borderRadius: 0 }}
              />
              <p className="text-xs text-[var(--or-subtle-gray)] mt-1">{abstract.length}/500</p>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Keywords (max 5)</label>
              <div className="flex gap-2">
                <input
                  placeholder="Type keyword and press Enter"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                  className="flex-1 h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
                  style={{ borderRadius: 0 }}
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="h-[38px] px-3 text-sm border border-[#ccc] bg-white hover:bg-[#f5f5f5] cursor-pointer"
                  style={{ borderRadius: 0 }}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {keywords.map((kw) => (
                  <span key={kw} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 border border-[rgba(0,0,0,0.1)]" style={{ backgroundColor: "var(--or-sandy)" }}>
                    {kw}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeKeyword(kw)} />
                  </span>
                ))}
              </div>
            </div>

            {/* Co-Authors */}
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Co-Authors (optional)</label>
              <p className="text-xs text-[var(--or-subtle-gray)] mb-2">Add co-authors for this paper. You are automatically listed as the submitting author.</p>
              <div className="flex gap-2 flex-wrap">
                <input
                  placeholder="Name *"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="flex-1 min-w-[120px] h-[34px] px-2 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
                  style={{ borderRadius: 0 }}
                />
                <input
                  placeholder="Institution"
                  value={authorInst}
                  onChange={(e) => setAuthorInst(e.target.value)}
                  className="flex-1 min-w-[120px] h-[34px] px-2 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
                  style={{ borderRadius: 0 }}
                />
                <input
                  placeholder="Email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  className="w-[160px] h-[34px] px-2 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
                  style={{ borderRadius: 0 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (authorName.trim()) {
                      setAuthors([...authors, { name: authorName.trim(), institution: authorInst.trim(), email: authorEmail.trim(), is_corresponding: false }]);
                      setAuthorName(""); setAuthorInst(""); setAuthorEmail("");
                    }
                  }}
                  className="h-[34px] px-3 text-sm border border-[#ccc] bg-white hover:bg-[#f5f5f5] cursor-pointer"
                  style={{ borderRadius: 0 }}
                >
                  Add
                </button>
              </div>
              {authors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {authors.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-2 border border-[rgba(0,0,0,0.1)]">
                      <span className="font-semibold" style={{ color: "var(--or-dark-blue)" }}>{a.name}</span>
                      {a.institution && <span className="text-[var(--or-subtle-gray)]">· {a.institution}</span>}
                      {a.email && <span className="text-[var(--or-subtle-gray)]">· {a.email}</span>}
                      <label className="ml-auto flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={a.is_corresponding}
                          onChange={() => setAuthors(authors.map((au, j) => j === i ? { ...au, is_corresponding: !au.is_corresponding } : au))}
                          className="accent-[var(--or-green)]"
                        />
                        <span>Corresponding</span>
                      </label>
                      <X className="h-3 w-3 cursor-pointer text-[var(--or-subtle-gray)] hover:text-[var(--destructive)]" onClick={() => setAuthors(authors.filter((_, j) => j !== i))} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Content */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
                style={{ borderRadius: 0 }}
              >
                <option value="markdown">Markdown</option>
                <option value="pdf">PDF Upload</option>
                <option value="word">Word (.docx) Upload</option>
                <option value="latex">LaTeX (Online Editor)</option>
                <option value="image">Images</option>
              </select>
            </div>
            {contentType === "markdown" && (
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Content</label>
                <textarea
                  placeholder="Write your paper in Markdown..."
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 text-sm font-mono border border-[#ccc] focus:outline-none focus:border-[var(--or-green)] resize-y"
                  style={{ borderRadius: 0 }}
                />
              </div>
            )}
            {contentType === "pdf" && (
              <div>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePdfUpload(f);
                  }}
                />
                {pdfFile ? (
                  <div className="flex items-center gap-3 p-4 border border-[var(--or-green)] bg-[var(--accent)]">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: "var(--or-green)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--or-dark-blue)" }}>{pdfFile.filename}</p>
                      <p className="text-xs text-[var(--or-subtle-gray)]">{formatSize(pdfFile.size)}</p>
                    </div>
                    <button
                      onClick={() => { setPdfFile(null); if (pdfInputRef.current) pdfInputRef.current.value = ""; }}
                      className="text-xs border border-[#ccc] px-2 py-1 bg-white hover:bg-[#f5f5f5] cursor-pointer"
                      style={{ borderRadius: 0 }}
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-[#ccc] p-8 text-center cursor-pointer hover:border-[var(--or-green)] transition-colors"
                    onClick={() => pdfInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault(); e.stopPropagation();
                      const f = e.dataTransfer.files[0];
                      if (f) handlePdfUpload(f);
                    }}
                  >
                    {uploading ? (
                      <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-[var(--or-green)]" />
                    ) : (
                      <FileText className="h-8 w-8 mx-auto mb-2 text-[var(--or-subtle-gray)]" />
                    )}
                    <p className="text-sm text-[var(--or-subtle-gray)]">
                      {uploading ? "Uploading..." : "Drag and drop PDF here, or click to upload"}
                    </p>
                    <p className="text-xs text-[var(--or-subtle-gray)] mt-1">Max 50MB</p>
                  </div>
                )}
              </div>
            )}
            {contentType === "word" && (
              <div>
                <input
                  ref={wordInputRef}
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleWordUpload(f);
                  }}
                />
                {wordFile ? (
                  <div className="flex items-center gap-3 p-4 border border-[var(--or-green)] bg-[var(--accent)]">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: "var(--or-green)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--or-dark-blue)" }}>{wordFile.filename}</p>
                      <p className="text-xs text-[var(--or-subtle-gray)]">{formatSize(wordFile.size)}</p>
                    </div>
                    <button
                      onClick={() => { setWordFile(null); if (wordInputRef.current) wordInputRef.current.value = ""; }}
                      className="text-xs border border-[#ccc] px-2 py-1 bg-white hover:bg-[#f5f5f5] cursor-pointer"
                      style={{ borderRadius: 0 }}
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-[#ccc] p-8 text-center cursor-pointer hover:border-[var(--or-green)] transition-colors"
                    onClick={() => wordInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault(); e.stopPropagation();
                      const f = e.dataTransfer.files[0];
                      if (f) handleWordUpload(f);
                    }}
                  >
                    {uploading ? (
                      <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-[var(--or-green)]" />
                    ) : (
                      <FileText className="h-8 w-8 mx-auto mb-2 text-[var(--or-subtle-gray)]" />
                    )}
                    <p className="text-sm text-[var(--or-subtle-gray)]">
                      {uploading ? "Uploading..." : "Drag and drop Word file here, or click to upload"}
                    </p>
                    <p className="text-xs text-[var(--or-subtle-gray)] mt-1">.doc / .docx — Max 50MB</p>
                  </div>
                )}
              </div>
            )}
            {contentType === "latex" && (
              <div className="p-4 text-center border border-[rgba(0,0,0,0.1)]" style={{ backgroundColor: "var(--or-sandy)" }}>
                <p className="text-sm text-[var(--or-subtle-gray)]">LaTeX online editor coming soon. Please upload a compiled PDF for now.</p>
              </div>
            )}
            {contentType === "image" && (
              <div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) handleImageUpload(e.target.files);
                  }}
                />
                <div
                  className="border-2 border-dashed border-[#ccc] p-6 text-center cursor-pointer hover:border-[var(--or-green)] transition-colors"
                  onClick={() => imageInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    if (e.dataTransfer.files.length) handleImageUpload(e.dataTransfer.files);
                  }}
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin text-[var(--or-green)]" />
                  ) : (
                    <ImageIcon className="h-6 w-6 mx-auto mb-2 text-[var(--or-subtle-gray)]" />
                  )}
                  <p className="text-sm text-[var(--or-subtle-gray)]">
                    {uploading ? "Uploading..." : "Drag and drop images here, or click to upload"}
                  </p>
                  <p className="text-xs text-[var(--or-subtle-gray)] mt-1">PNG, JPG, GIF, WebP — Max 20MB each</p>
                </div>
                {imageFiles.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {imageFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs p-2 border border-[rgba(0,0,0,0.1)]">
                        <ImageIcon className="h-4 w-4 flex-shrink-0 text-[var(--or-subtle-gray)]" />
                        <span className="flex-1 truncate" style={{ color: "var(--or-dark-blue)" }}>{f.filename}</span>
                        <span className="text-[var(--or-subtle-gray)]">{formatSize(f.size)}</span>
                        <X className="h-3 w-3 cursor-pointer text-[var(--or-subtle-gray)] hover:text-[var(--destructive)]" onClick={() => setImageFiles((prev) => prev.filter((_, j) => j !== i))} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Supplementary Materials — always shown */}
            <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.1)]">
              <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Supplementary Materials (optional)</label>
              <p className="text-xs text-[var(--or-subtle-gray)] mb-2">Upload code, data, appendices, or other supporting files (PDF, ZIP, images — max 50MB each)</p>
              <input
                ref={suppInputRef}
                type="file"
                multiple
                accept="application/pdf,application/zip,application/x-tar,application/gzip,image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) handleSuppUpload(e.target.files);
                }}
              />
              <button
                type="button"
                onClick={() => suppInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm border border-[#ccc] bg-white hover:bg-[#f5f5f5] cursor-pointer disabled:opacity-50"
                style={{ borderRadius: 0 }}
              >
                <Paperclip className="h-3.5 w-3.5" />
                {uploading ? "Uploading..." : "Attach Files"}
              </button>
              {supplementaryFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {supplementaryFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-2 border border-[rgba(0,0,0,0.1)]">
                      <Paperclip className="h-3.5 w-3.5 flex-shrink-0 text-[var(--or-subtle-gray)]" />
                      <span className="flex-1 truncate" style={{ color: "var(--or-dark-blue)" }}>{f.filename}</span>
                      <span className="text-[var(--or-subtle-gray)]">{formatSize(f.size)}</span>
                      <X className="h-3 w-3 cursor-pointer text-[var(--or-subtle-gray)] hover:text-[var(--destructive)]" onClick={() => setSupplementaryFiles((prev) => prev.filter((_, j) => j !== i))} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            {uploadError && <p className="text-xs mt-2" style={{ color: "var(--destructive)" }}>{uploadError}</p>}
          </div>
        )}

        {/* Step 3: Review Mode */}
        {step === 2 && (
          <div className="space-y-2">
            <label className="block text-sm font-bold mb-2" style={{ color: "var(--or-dark-blue)" }}>Review Mode *</label>
            {(Object.entries(REVIEW_MODES) as [string, { label: string; description: string }][]).map(([key, mode]) => (
              <div
                key={key}
                onClick={() => setReviewMode(key)}
                className={`p-3 border cursor-pointer transition-colors ${
                  reviewMode === key
                    ? "border-[var(--or-green)] bg-[var(--accent)]"
                    : "border-[rgba(0,0,0,0.1)] hover:border-[var(--or-green)]"
                }`}
                style={{ borderRadius: 0 }}
              >
                <span className="text-sm font-semibold" style={{ color: "var(--or-dark-blue)" }}>{mode.label}</span>
                <p className="text-xs text-[var(--or-subtle-gray)] mt-1">{mode.description}</p>
              </div>
            ))}

            {/* Editor invite code for instant mode */}
            {reviewMode === "instant" && (
              <div className="mt-4 p-3 border border-[rgba(0,0,0,0.1)]" style={{ backgroundColor: "var(--or-sandy)" }}>
                <label className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Editor Invite Code *</label>
                <p className="text-xs text-[var(--or-subtle-gray)] mb-2">
                  Instant publish requires an invite code from a venue editor. Contact the venue editors to obtain one.
                </p>
                <input
                  type="text"
                  placeholder="e.g. ED-XXXX-XXXX"
                  value={editorInviteCode}
                  onChange={(e) => setEditorInviteCode(e.target.value)}
                  className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
                  style={{ borderRadius: 0 }}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Preview */}
        {step === 3 && (
          <div className="border border-[rgba(0,0,0,0.1)] p-4" style={{ backgroundColor: "var(--or-sandy)" }}>
            <h3 className="text-base font-normal mb-3" style={{ color: "var(--or-dark-blue)" }}>Preview</h3>
            <div className="text-xs space-y-2">
              <div><strong style={{ color: "var(--or-green)" }}>Venue:</strong> {venue.name}</div>
              <div><strong style={{ color: "var(--or-green)" }}>Title:</strong> {title}</div>
              <div><strong style={{ color: "var(--or-green)" }}>Abstract:</strong> {abstract}</div>
              <div><strong style={{ color: "var(--or-green)" }}>Keywords:</strong> {keywords.join(", ") || "None"}</div>
              <div><strong style={{ color: "var(--or-green)" }}>Content Type:</strong> {contentType}</div>
              <div><strong style={{ color: "var(--or-green)" }}>Review Mode:</strong> {REVIEW_MODES[reviewMode as keyof typeof REVIEW_MODES]?.label}</div>
              {pdfFile && (
                <div><strong style={{ color: "var(--or-green)" }}>PDF:</strong> {pdfFile.filename} ({formatSize(pdfFile.size)})</div>
              )}
              {wordFile && (
                <div><strong style={{ color: "var(--or-green)" }}>Word:</strong> {wordFile.filename} ({formatSize(wordFile.size)})</div>
              )}
              {imageFiles.length > 0 && (
                <div><strong style={{ color: "var(--or-green)" }}>Images:</strong> {imageFiles.length} file(s)</div>
              )}
              {supplementaryFiles.length > 0 && (
                <div><strong style={{ color: "var(--or-green)" }}>Supplementary:</strong> {supplementaryFiles.length} file(s)</div>
              )}
            </div>
          </div>
        )}

        {submitError && (
          <p className="text-sm mt-4" style={{ color: "var(--destructive)" }}>{submitError}</p>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 mb-8">
          <button
            onClick={() => step === 0 ? router.push(`/venue/${slug}`) : setStep(step - 1)}
            className="h-[38px] px-4 text-sm border border-[#ccc] bg-white hover:bg-[#f5f5f5] cursor-pointer"
            style={{ borderRadius: 0 }}
          >
            {step === 0 ? "← Back to Venue" : "← Previous"}
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="h-[38px] px-4 text-sm text-white border-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={async () => {
                setSubmitting(true);
                setSubmitError(null);
                try {
                  const res = await fetch("/api/papers", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title,
                      abstract,
                      keywords,
                      content_type: contentType,
                      content_markdown: contentType === "markdown" ? contentMarkdown : null,
                      pdf_url: pdfFile?.url || wordFile?.url || null,
                      image_urls: imageFiles.map((f) => f.url),
                      supplementary_urls: supplementaryFiles.map((f) => ({ url: f.url, filename: f.filename, size: f.size })),
                      venue_id: venue.id,
                      review_mode: reviewMode,
                      editor_invite_code: reviewMode === "instant" ? editorInviteCode : undefined,
                    }),
                  });
                  if (!res.ok) {
                    const data = await res.json();
                    setSubmitError(data.error || "Failed to submit paper.");
                    setSubmitting(false);
                    return;
                  }
                  const { data } = await res.json();
                  // Save co-authors if any
                  if (authors.length > 0 && data.id) {
                    try {
                      await fetch(`/api/papers/${data.id}/authors`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ authors }),
                      });
                    } catch { /* non-blocking */ }
                  }
                  router.push(`/paper/${data.id}`);
                } catch {
                  setSubmitError("Network error. Please try again.");
                  setSubmitting(false);
                }
              }}
              disabled={submitting}
              className="h-[38px] px-4 text-sm text-white border-0 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
            >
              {submitting ? "Submitting..." : "Submit Paper"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
