import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const name = session?.user?.name ?? "Admin";

  return (
    <div className="flex min-h-screen bg-secondary/20">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminTopbar name={name} />
        <main className="flex-1 overflow-x-hidden p-6">{children}</main>
      </div>
    </div>
  );
}
