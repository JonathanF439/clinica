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
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/medicos", label: "Médicos", icon: Stethoscope },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MEDICO: "Médico",
  RECEPCIONISTA: "Recepcionista",
  ENFERMAGEM: "Enfermagem",
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-white border-r border-zinc-200 transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 shadow-sm"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-zinc-100 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold">
          CT
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="truncate text-sm font-semibold text-zinc-900">CLÍNICA TAYAH</p>
            <p className="truncate text-[11px] text-zinc-400">Oftalmologia</p>
          </div>
        )}
      </div>

      {/* New appointment button */}
      <div className="p-3">
        <Link
          href="/agendamento/novo"
          className={cn(
            "flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <Plus size={16} />
          {!collapsed && <span>Novo Agendamento</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                collapsed && "justify-center"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-zinc-100 p-3">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
            <User size={15} />
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-medium text-zinc-900">{user?.name}</p>
              <p className="truncate text-[11px] text-zinc-400">
                {user?.role ? ROLE_LABELS[user.role] ?? user.role : ""}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="shrink-0 rounded p-1 text-zinc-400 hover:text-red-500"
              title="Sair"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
        {collapsed && (
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
}
