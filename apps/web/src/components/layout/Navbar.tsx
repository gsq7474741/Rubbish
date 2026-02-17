"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [user, setUser] = useState<null | { username: string; display_name: string | null }>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    async function loadAnonId() {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (data.user?.anonId) {
          setUser({ username: data.user.anonId, display_name: data.user.anonId });
          setUnreadCount(data.user.unreadCount || 0);
        }
      } catch {
        // fallback: not logged in
      }
    }

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) loadAnonId();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadAnonId();
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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
        <Link href="/" className="flex items-center gap-1 mr-6 shrink-0">
          <span className="text-[#b8b8b8] text-[1.375rem] font-normal">
            <strong className="text-white">RubbishReview</strong>
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
                <Link href="/dashboard" className="block px-5 py-1 text-sm text-[var(--or-dark-blue)] hover:bg-[var(--or-bg-gray)]">
                  My Dashboard
                </Link>
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
                <Link href="/dashboard" className="block py-2 text-white text-base" onClick={() => setMobileOpen(false)}>
                  My Dashboard
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
