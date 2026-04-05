"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { usePermissions } from "@/hooks/usePermissions";
import { Sidebar } from "@/components/layout/Sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { canAccessRoute } = usePermissions();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && !canAccessRoute(pathname)) {
      router.replace("/agenda");
    }
  }, [user, isLoading, pathname, canAccessRoute, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans">
      {/* Mobile top header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold">
            CT
          </div>
          <span className="text-sm font-semibold text-zinc-900">CLÍNICA TAYAH</span>
        </div>
        <div className="w-8" />
      </header>

      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
