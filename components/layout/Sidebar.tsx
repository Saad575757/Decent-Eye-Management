"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarContent({ shopName }: { shopName: string }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <Eye className="h-6 w-6 text-primary" />
        <div className="leading-none">
          <div className="font-bold">{shopName}</div>
          <div className="text-xs text-muted-foreground">
            Optical Shop Management
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="mb-2 flex items-center gap-2 px-3 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold">
            A
          </div>
          <div className="leading-tight">
            <div className="font-medium">Admin</div>
            <div className="text-xs text-muted-foreground">
              {shopName} Owner
            </div>
          </div>
        </div>
        <form action="/api/auth/logout" method="post">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  );
}
