"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { permissionService } from "@/services/api";
import type { Permission } from "@/types/clinic";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === "ADMIN";

  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ["permissions"],
    queryFn: permissionService.findAll,
    enabled: !!user && !isAdmin,
    staleTime: 60_000,
  });

  function can(resource: string, action: string): boolean {
    if (!role) return false;
    if (isAdmin) return true;
    const match = permissions.find(
      (p) => p.role === role && p.resource === resource && p.action === action
    );
    return match?.allowed ?? false;
  }

  function canAccessRoute(path: string): boolean {
    if (!role) return false;
    if (path.startsWith("/admin")) return isAdmin;
    return true;
  }

  return {
    isAdmin,
    isMedico: role === "MEDICO",
    isRecepcionista: role === "RECEPCIONISTA",
    isEnfermagem: role === "ENFERMAGEM",

    canCreateAppointment: can("appointment", "create"),
    canEditAppointment:   can("appointment", "update"),
    canChangeStatus:      can("appointment", "change_status"),
    canCreatePatient:     can("patient", "create"),
    canEditPatient:       can("patient", "update"),
    canCreateDoctor:      can("doctor", "create"),
    canEditDoctor:        can("doctor", "update"),
    canManageUsers:       can("user", "create"),

    canAccessRoute,
  };
}
