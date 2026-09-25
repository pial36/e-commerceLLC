import { AccountNav } from "@/components/storefront/account-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-10">
      <h1 className="mb-8 font-display text-4xl font-bold">My Account</h1>
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <AccountNav />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
