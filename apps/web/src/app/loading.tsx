export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="text-center">
        <div className="text-4xl mb-3 animate-spin inline-block">🗑️</div>
        <p className="text-sm text-[var(--or-subtle-gray)]">Loading rubbish...</p>
      </div>
    </div>
  );
}
