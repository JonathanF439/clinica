"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  X,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

const ALL_NAV_ITEMS = [
  { href: "/dashboard",         label: "Dashboard",  icon: LayoutDashboard, adminOnly: false },
  { href: "/agenda",            label: "Agenda",      icon: Calendar,       adminOnly: false },
  { href: "/pacientes",         label: "Pacientes",   icon: Users,          adminOnly: false },
  { href: "/medicos",           label: "Médicos",     icon: Stethoscope,    adminOnly: false },
  { href: "/admin/usuarios",    label: "Usuários",    icon: ShieldCheck,    adminOnly: true  },
  { href: "/admin/permissoes",  label: "Permissões",  icon: Lock,           adminOnly: true  },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MEDICO: "Médico",
  RECEPCIONISTA: "Recepcionista",
  ENFERMAGEM: "Enfermagem",
};

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isAdmin, canCreateAppointment } = usePermissions();

  const navItems = ALL_NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const sidebarContent = (isMobile: boolean) => (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-zinc-200 transition-all duration-300 h-full",
        isMobile ? "w-64" : cn("relative shrink-0", collapsed ? "w-16" : "w-60")
      )}
    >
      {/* Toggle button — desktop only */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 shadow-sm"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      )}

      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-zinc-100 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold">
          CT
        </div>
        {(!collapsed || isMobile) && (
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-zinc-900">CLÍNICA TAYAH</p>
            <p className="truncate text-[11px] text-zinc-400">Oftalmologia</p>
          </div>
        )}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="ml-auto rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* New appointment button */}
      {canCreateAppointment && (
        <div className="p-3">
          <Link
            href="/agendamento/novo"
            onClick={isMobile ? onMobileClose : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors",
              !isMobile && collapsed && "justify-center"
            )}
          >
            <Plus size={16} />
            {(!collapsed || isMobile) && <span>Novo Agendamento</span>}
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={isMobile ? onMobileClose : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                !isMobile && collapsed && "justify-center"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {(!collapsed || isMobile) && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-zinc-100 p-3">
        <div className={cn("flex items-center gap-2", !isMobile && collapsed && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
            <User size={15} />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-medium text-zinc-900">{user?.name}</p>
              <p className="truncate text-[11px] text-zinc-400">
                {user?.role ? ROLE_LABELS[user.role] ?? user.role : ""}
              </p>
            </div>
          )}
          {(!collapsed || isMobile) && (
            <button
              onClick={handleLogout}
              className="shrink-0 rounded p-1 text-zinc-400 hover:text-red-500"
              title="Sair"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
        {!isMobile && collapsed && (
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full justify-center rounded p-1 text-zinc-400 hover:text-red-500"
            title="Sair"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent(true)}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        {sidebarContent(false)}
      </div>
    </>
  );
}
