import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="text-center">
        <h1 className="text-[4rem] font-bold mb-2" style={{ color: "var(--or-green)" }}>404</h1>
        <p className="text-lg mb-1" style={{ color: "var(--or-dark-blue)" }}>
          This page has been <strong>Certified Not Found</strong>.
        </p>
        <p className="text-sm text-[var(--or-subtle-gray)] mb-6">
          Even by our standards, this is too rubbish to exist.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 text-sm text-white"
          style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
