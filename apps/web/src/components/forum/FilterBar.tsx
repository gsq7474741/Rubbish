"use client";

import { useState } from "react";

interface FilterBarProps {
  reviewCount: number;
  commentCount: number;
  onFilterChange: (filter: string) => void;
}

export function FilterBar({ reviewCount, commentCount, onFilterChange }: FilterBarProps) {
  const [active, setActive] = useState("all");

  const filters = [
    { key: "all", label: `All (${reviewCount + commentCount})` },
    { key: "reviews", label: `Reviews (${reviewCount})` },
    { key: "comments", label: `Comments (${commentCount})` },
  ];

  return (
    <div className="flex items-center gap-4 mb-4 text-sm border-b border-[rgba(0,0,0,0.1)] pb-2">
      <span className="text-[var(--or-subtle-gray)]">Show:</span>
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => {
            setActive(f.key);
            onFilterChange(f.key);
          }}
          className="bg-transparent border-0 cursor-pointer text-sm"
          style={{
            color: active === f.key ? "var(--or-green)" : "var(--or-medium-blue)",
            fontWeight: active === f.key ? 600 : 400,
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
