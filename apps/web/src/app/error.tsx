"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="text-center">
        <h1 className="text-[4rem] font-bold mb-2" style={{ color: "var(--destructive)" }}>Oops</h1>
        <p className="text-lg mb-1" style={{ color: "var(--or-dark-blue)" }}>
          Something went <strong>spectacularly wrong</strong>.
        </p>
        <p className="text-sm text-[var(--or-subtle-gray)] mb-6">
          Even our rubbish has standards. This error didn&apos;t meet them.
        </p>
        <button
          onClick={reset}
          className="inline-block px-4 py-2 text-sm text-white border-0 cursor-pointer"
          style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
