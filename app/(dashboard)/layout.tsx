import { getSettings } from "@/lib/services/settings";
import { SidebarContent } from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen">
      <aside className="no-print hidden w-64 shrink-0 border-r md:block">
        <SidebarContent shopName={settings.shopName} />
      </aside>
      <main className="flex-1 overflow-x-hidden pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
