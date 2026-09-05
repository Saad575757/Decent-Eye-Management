"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Home" },
  { href: "/orders", label: "Orders" },
  { href: "/customers", label: "Customers" },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-40 flex border-t bg-card md:hidden">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 items-center justify-center px-1 py-3 text-xs font-medium",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
