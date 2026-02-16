import Link from "next/link";

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-[rgba(0,0,0,0.1)] mt-8" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between text-xs text-[var(--or-subtle-gray)]">
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} <strong>RubbishReview</strong></span>
            <Link href="/about" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">About</Link>
            <Link href="/guidelines" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">Guidelines</Link>
            <Link href="/terms" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">Terms</Link>
            <Link href="/privacy" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">Privacy</Link>
          </div>
          <div>
            <span className="italic">We only accept rubbish.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
