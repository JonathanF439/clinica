"use client";

import Link from "next/link";
import Image from "next/image";
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
  ChevronDown,
  User,
  X,
  ShieldCheck,
  Lock,
  Settings,
  ClipboardList,
  Activity,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",      label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/agenda",         label: "Agenda",     icon: Calendar,        adminOnly: false },
  { href: "/pacientes",      label: "Pacientes",  icon: Users,           adminOnly: false },
  { href: "/medicos",        label: "Médicos",    icon: Stethoscope,     adminOnly: false },
  { href: "/admin/usuarios", label: "Usuários",   icon: ShieldCheck,     adminOnly: true  },
];

const CONFIGURADOR_ITEMS = [
  { href: "/admin/procedimentos",     label: "Procedimentos",      icon: ClipboardList },
  { href: "/admin/status-agendamento", label: "Status Agenda", icon: Activity      },
  { href: "/admin/permissoes",        label: "Permissões",         icon: Lock          },
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
  const pathname = usePathname();
  const isConfiguradorActive = CONFIGURADOR_ITEMS.some((item) =>
    pathname.startsWith(item.href)
  );

  const [collapsed, setCollapsed] = useState(false);
  const [configuradorOpen, setConfiguradorOpen] = useState(false);
  const forceExpanded = pathname.startsWith("/agendamento");
  const isCollapsed = collapsed && !forceExpanded;
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isAdmin, canCreateAppointment } = usePermissions();

  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const sidebarContent = (isMobile: boolean) => (
    <aside
      className={cn(
        "flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 h-full",
        isMobile ? "w-64" : cn("relative shrink-0", isCollapsed ? "w-16" : "w-52")
      )}
    >
      {/* Toggle button — desktop only */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:text-white shadow-sm transition-colors"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      )}

      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-4">
        <div className="shrink-0">
          <Image
            src="/logo.png"
            alt="Clínica Olhos David Tayah"
            width={isCollapsed && !isMobile ? 32 : 36}
            height={isCollapsed && !isMobile ? 32 : 36}
            className="rounded-lg object-contain"
          />
        </div>
        {(!isCollapsed || isMobile) && (
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-white leading-tight">Olhos David Tayah</p>
            <p className="truncate text-[11px] text-slate-500">Oftalmologia</p>
          </div>
        )}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="ml-auto rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
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
              "flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors",
              !isMobile && isCollapsed && "justify-center"
            )}
          >
            <Plus size={16} />
            {(!isCollapsed || isMobile) && <span>Novo Agendamento</span>}
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
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
                  ? "bg-slate-700/60 text-white font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                !isMobile && isCollapsed && "justify-center"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {(!isCollapsed || isMobile) && <span>{label}</span>}
            </Link>
          );
        })}

        {/* Configurador — admin only, collapses when sidebar is collapsed */}
        {isAdmin && (!isCollapsed || isMobile) && (
          <div className="pt-1">
            <button
              onClick={() => setConfiguradorOpen((v) => !v)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isConfiguradorActive
                  ? "text-slate-200"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Settings size={18} className="shrink-0" />
              <span className="flex-1 text-left">Configurador</span>
              <ChevronDown
                size={14}
                className={cn(
                  "shrink-0 transition-transform duration-200",
                  configuradorOpen ? "rotate-180" : "rotate-0"
                )}
              />
            </button>

            {configuradorOpen && (
              <div className="mt-0.5 ml-3 space-y-0.5 border-l border-slate-700/60 pl-3">
                {CONFIGURADOR_ITEMS.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={isMobile ? onMobileClose : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-slate-700/60 text-white font-medium"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      )}
                    >
                      <Icon size={15} className="shrink-0" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Configurador icon-only when sidebar is collapsed */}
        {isAdmin && isCollapsed && !isMobile && (
          <Link
            href="/admin/permissoes"
            title="Configurador"
            className={cn(
              "flex items-center justify-center rounded-lg px-3 py-2 text-sm transition-colors",
              isConfiguradorActive
                ? "bg-slate-700/60 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            )}
          >
            <Settings size={18} />
          </Link>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-800 p-3">
        <div className={cn("flex items-center gap-2", !isMobile && isCollapsed && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-slate-300">
            <User size={15} />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-medium text-slate-200">{user?.name}</p>
              <p className="truncate text-[11px] text-slate-500">
                {user?.role ? ROLE_LABELS[user.role] ?? user.role : ""}
              </p>
            </div>
          )}
          {(!isCollapsed || isMobile) && (
            <button
              onClick={handleLogout}
              className="shrink-0 rounded p-1 text-slate-500 hover:text-red-400 transition-colors"
              title="Sair"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
        {!isMobile && isCollapsed && (
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full justify-center rounded p-1 text-slate-500 hover:text-red-400 transition-colors"
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
