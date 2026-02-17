"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { label: "Venues", href: "/venues" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Submit", href: "/submit" },
  { label: "Notifications", href: "/notifications" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<null | { username: string; display_name: string | null; avatar_url: string | null; role?: string }>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (data.user?.anonId) {
        setUser({
          username: data.user.username || data.user.anonId,
          display_name: data.user.displayName || data.user.username || data.user.anonId,
          avatar_url: data.user.avatarUrl || null,
          role: data.user.role,
        });
        setUnreadCount(data.user.unreadCount || 0);

        // Verify pending invite code from registration (best-effort)
        try {
          const pendingCode = localStorage.getItem("pending_invite_code");
          if (pendingCode) {
            localStorage.removeItem("pending_invite_code");
            fetch("/api/invite-codes/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: pendingCode }),
            }).catch(() => {});
          }
        } catch {
          // localStorage unavailable — ignore
        }
      } else {
        setUser(null);
      }
    } catch {
      // fallback: not logged in
    }
  }, []);

  // Auth state subscription — only once
  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (mounted && authUser) loadProfile();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) loadProfile();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [loadProfile]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full" style={{ backgroundColor: "var(--or-green)", borderColor: "var(--or-green-dark)" }}>
      <div className="container mx-auto flex h-[50px] items-center px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center mr-6 shrink-0">
          <span className="text-[1.375rem]">
            <strong className="text-white font-bold">RubbishReview</strong><span className="text-[#b8b8b8] font-normal">.org</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-0 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "block px-3 py-[15px] text-white text-sm hover:bg-[var(--or-green-dark)] transition-colors",
                  pathname === link.href && "bg-[var(--or-green-dark)]"
                )}
              >
                {link.label}
                {link.href === "/notifications" && unreadCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full" style={{ backgroundColor: "#e53e3e" }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </li>
          ))}
          {user ? (
            <li className="relative group">
              <button className="block px-3 py-[15px] text-white text-sm hover:bg-[var(--or-green-dark)] transition-colors">
                {user.display_name || user.username}
              </button>
              <div className="absolute right-0 top-full hidden group-hover:block bg-white border border-[rgba(0,0,0,0.1)] shadow-md min-w-[160px] z-50">
                <Link href={`/profile/${user.username}`} className="block px-5 py-1 text-sm text-[var(--or-dark-blue)] hover:bg-[var(--or-bg-gray)]">
                  My Profile
                </Link>
                {(user.role === "content_admin" || user.role === "system_admin") ? (
                  <Link href="/admin" className="block px-5 py-1 text-sm font-medium hover:bg-[var(--or-bg-gray)]" style={{ color: "var(--or-medium-blue)" }}>
                    Admin Dashboard
                  </Link>
                ) : null}
                <Link href="/settings" className="block px-5 py-1 text-sm text-[var(--or-dark-blue)] hover:bg-[var(--or-bg-gray)]">
                  Settings
                </Link>
                <div className="border-t border-[rgba(0,0,0,0.1)] my-[5px]" />
                <button
                  onClick={async () => { const supabase = createClient(); await supabase.auth.signOut(); setUser(null); router.push('/'); router.refresh(); }}
                  className="block w-full text-left px-5 py-1 text-sm text-[var(--or-dark-blue)] hover:bg-[var(--or-bg-gray)]"
                >
                  Logout
                </button>
              </div>
            </li>
          ) : (
            <>
              <li>
                <Link
                  href="/login"
                  className="block px-3 py-[15px] text-white text-sm hover:bg-[var(--or-green-dark)] transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="block px-3 py-[15px] text-white text-sm hover:bg-[var(--or-green-dark)] transition-colors"
                >
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="flex-1" />

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px] lg:w-[380px] h-[30px] bg-[#ddd] border border-[#ccc] px-3 py-1 text-sm text-[var(--or-dark-blue)] placeholder:text-[#777] focus:bg-white focus:outline-none transition-colors"
            style={{ borderRadius: 0 }}
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#777]">
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--or-dark-blue)]" style={{ backgroundColor: "var(--or-green)" }}>
          <div className="px-4 py-2">
            <form onSubmit={handleSearch} className="mb-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[30px] bg-[#ddd] border border-[#ccc] px-3 py-1 text-sm focus:bg-white focus:outline-none"
              />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-white text-base"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href={`/profile/${user.username}`} className="block py-2 text-white text-base" onClick={() => setMobileOpen(false)}>
                  My Profile
                </Link>
                {(user.role === "content_admin" || user.role === "system_admin") && (
                  <Link href="/admin" className="block py-2 text-white text-base" onClick={() => setMobileOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}
                <Link href="/settings" className="block py-2 text-white text-base" onClick={() => setMobileOpen(false)}>
                  Settings
                </Link>
                <button
                  onClick={async () => { const supabase = createClient(); await supabase.auth.signOut(); setUser(null); router.push('/'); router.refresh(); }}
                  className="block py-2 text-white text-base w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 text-white text-base" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="block py-2 text-white text-base" onClick={() => setMobileOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
