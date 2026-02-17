import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--or-bg)" }}>
      {/* Green navbar */}
      <nav className="w-full h-[50px] flex items-center px-4" style={{ backgroundColor: "var(--or-green)" }}>
        <Link href="/" className="text-[1.375rem]">
          <span className="text-white font-bold">RubbishReview</span><span className="text-[#b8b8b8]">.org</span>
        </Link>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {children}
        <p className="text-xs text-[var(--or-subtle-gray)] mt-8 text-center max-w-sm">
          This is an entertainment community, not a formal academic publication. By signing up you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
