import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "content_admin" || profile?.role === "system_admin";
  const isSystemAdmin = profile?.role === "system_admin";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Get pending venue applications count
  const { count: pendingApplications } = await supabase
    .from("venue_applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  // Get pending reports count
  const { count: pendingReports } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  // Get total users count (for system admin)
  const { count: totalUsers } = isSystemAdmin
    ? await supabase.from("profiles").select("id", { count: "exact", head: true })
    : { count: 0 };

  return (
    <div className="container mx-auto px-4 py-8" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--or-dark-blue)" }}>
          Admin Dashboard
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--or-subtle-gray)" }}>
          Welcome, {profile?.display_name || "Admin"} ({profile?.role})
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Venue Applications */}
          <Link
            href="/admin/venues"
            className="block p-6 border border-[rgba(0,0,0,0.1)] bg-white hover:shadow-md transition-shadow"
            style={{ borderRadius: 0 }}
          >
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--or-dark-blue)" }}>
              Venue Applications
            </h2>
            <p className="text-sm mb-3" style={{ color: "var(--or-subtle-gray)" }}>
              Review and approve venue creation requests
            </p>
            {pendingApplications && pendingApplications > 0 && (
              <span className="inline-block px-2 py-1 text-xs font-bold text-white" style={{ backgroundColor: "#e53e3e" }}>
                {pendingApplications} pending
              </span>
            )}
          </Link>

          {/* Reports Management */}
          <Link
            href="/admin/reports"
            className="block p-6 border border-[rgba(0,0,0,0.1)] bg-white hover:shadow-md transition-shadow"
            style={{ borderRadius: 0 }}
          >
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--or-dark-blue)" }}>
              Reports
            </h2>
            <p className="text-sm mb-3" style={{ color: "var(--or-subtle-gray)" }}>
              Review user reports on papers, comments, and reviews
            </p>
            {pendingReports && pendingReports > 0 && (
              <span className="inline-block px-2 py-1 text-xs font-bold text-white" style={{ backgroundColor: "#e53e3e" }}>
                {pendingReports} pending
              </span>
            )}
          </Link>

          {/* User Management (system admin only) */}
          {isSystemAdmin && (
            <Link
              href="/admin/users"
              className="block p-6 border border-[rgba(0,0,0,0.1)] bg-white hover:shadow-md transition-shadow"
              style={{ borderRadius: 0 }}
            >
              <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--or-dark-blue)" }}>
                User Management
              </h2>
              <p className="text-sm mb-3" style={{ color: "var(--or-subtle-gray)" }}>
                Manage user roles and permissions
              </p>
              <span className="inline-block px-2 py-1 text-xs" style={{ backgroundColor: "var(--or-sandy)", color: "var(--or-dark-blue)" }}>
                {totalUsers} users
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
