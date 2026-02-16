"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PenSquare, Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "首页", href: "/", icon: Home },
  { label: "搜索", href: "/search", icon: Search },
  { label: "投稿", href: "/submit", icon: PenSquare },
  { label: "通知", href: "/notifications", icon: Bell },
  { label: "我的", href: "/profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-full h-full text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", item.href === "/submit" && "h-6 w-6")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
