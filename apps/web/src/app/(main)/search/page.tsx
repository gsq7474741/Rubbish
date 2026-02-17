"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Link from "next/link";
import type { Paper } from "@/lib/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQ);
  const [totalCount, setTotalCount] = useState(0);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/papers/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.data || []);
        setTotalCount(data.count || 0);
      } else {
        setResults([]);
        setTotalCount(0);
      }
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
  }, [initialQ, doSearch]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      doSearch(query.trim());
    }
  }

  const hotTags = ["failed experiment", "rejected paper", "overfitting", "reproducibility", "null result", "p-hacking"];

  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-[850px]">
        <h1 className="text-[2.25rem] font-normal mb-4 mt-4" style={{ color: "var(--or-dark-blue)" }}>
          Search
        </h1>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-0 mb-6">
          <input
            type="text"
            placeholder="Search papers by title, abstract, keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 h-[38px] px-3 text-sm border border-[#ccc] border-r-0 focus:outline-none focus:border-[var(--or-green)]"
            style={{ borderRadius: 0 }}
          />
          <button
            type="submit"
            className="h-[38px] px-4 text-sm text-white border-0 cursor-pointer flex items-center gap-1"
            style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
          >
            <Search className="h-4 w-4" /> Search
          </button>
        </form>

        {!searched && (
          <div className="py-8">
            <p className="text-sm text-[var(--or-subtle-gray)] mb-4">Popular search terms:</p>
            <div className="flex flex-wrap gap-2">
              {hotTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setQuery(tag); router.push(`/search?q=${encodeURIComponent(tag)}`); doSearch(tag); }}
                  className="text-xs px-3 py-1 border border-[rgba(0,0,0,0.1)] cursor-pointer hover:border-[var(--or-green)]"
                  style={{ backgroundColor: "var(--or-sandy)", color: "var(--or-dark-blue)", borderRadius: 0 }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {searched && loading && (
          <p className="text-sm text-[var(--or-subtle-gray)] py-8 text-center">Searching...</p>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-[var(--or-subtle-gray)]">
              No results found for &quot;{query}&quot;.
            </p>
          </div>
        )}

        {searched && !loading && results.length > 0 && (
          <div>
            <p className="text-sm text-[var(--or-subtle-gray)] mb-4">{totalCount} result{totalCount !== 1 ? "s" : ""} found</p>
            {results.map((paper) => (
              <div key={paper.id} className="py-[6px] border-b border-[rgba(0,0,0,0.1)]">
                <h4 className="text-base font-bold m-0 leading-normal" style={{ color: "var(--or-green)" }}>
                  <Link href={`/paper/${paper.id}`} prefetch={false} className="hover:underline" style={{ color: "var(--or-green)" }}>
                    {paper.title}
                  </Link>
                </h4>
                {paper.author && (
                  <div className="text-[var(--or-dark-blue)] mb-[2px] italic text-sm">
                    {paper.author.display_name || paper.author.username}
                  </div>
                )}
                {paper.abstract && (
                  <p className="text-xs text-[var(--or-subtle-gray)] mt-1 line-clamp-2">{paper.abstract}</p>
                )}
                <ul className="list-none flex flex-wrap gap-x-2 gap-y-0 m-0 p-0 text-xs leading-5 text-[var(--or-subtle-gray)] mt-1">
                  <li>{new Date(paper.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</li>
                  {paper.venue && <li className="before:content-['·'] before:mr-2">{paper.venue.name}</li>}
                  <li className="before:content-['·'] before:mr-2">{paper.review_count} Reviews</li>
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 text-center"><p className="text-sm text-[var(--or-subtle-gray)]">Loading...</p></div>}>
      <SearchContent />
    </Suspense>
  );
}
