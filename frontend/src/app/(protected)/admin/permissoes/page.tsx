"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { permissionService } from "@/services/api";
import type { Permission } from "@/types/clinic";

const ROLES = ["RECEPCIONISTA", "ENFERMAGEM", "MEDICO"] as const;
type EditableRole = (typeof ROLES)[number];

const ROLE_LABELS: Record<EditableRole, string> = {
  RECEPCIONISTA: "Recepcionista",
  ENFERMAGEM: "Enfermagem",
  MEDICO: "Médico",
};

const RESOURCE_GROUPS = [
  {
    label: "Agendamentos",
    resource: "appointment",
    actions: [
      { action: "create",        label: "Criar" },
      { action: "read",          label: "Visualizar" },
      { action: "update",        label: "Editar" },
      { action: "change_status", label: "Alterar status" },
    ],
  },
  {
    label: "Pacientes",
    resource: "patient",
    actions: [
      { action: "create", label: "Criar" },
      { action: "read",   label: "Visualizar" },
      { action: "update", label: "Editar" },
    ],
  },
  {
    label: "Médicos",
    resource: "doctor",
    actions: [
      { action: "create", label: "Criar" },
      { action: "read",   label: "Visualizar" },
      { action: "update", label: "Editar" },
    ],
  },
  {
    label: "Usuários",
    resource: "user",
    actions: [
      { action: "create", label: "Criar" },
      { action: "read",   label: "Visualizar" },
    ],
  },
];

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none disabled:opacity-40 ${
        checked ? "bg-blue-600" : "bg-zinc-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function PermissoesPage() {
  const queryClient = useQueryClient();

  const { data: permissions = [], isLoading } = useQuery<Permission[]>({
    queryKey: ["permissions"],
    queryFn: permissionService.findAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      role,
      resource,
      action,
      allowed,
    }: {
      role: string;
      resource: string;
      action: string;
      allowed: boolean;
    }) => permissionService.update(role, resource, action, allowed),
    onMutate: async ({ role, resource, action, allowed }) => {
      await queryClient.cancelQueries({ queryKey: ["permissions"] });
      const prev = queryClient.getQueryData<Permission[]>(["permissions"]);
      queryClient.setQueryData<Permission[]>(["permissions"], (old = []) =>
        old.map((p) =>
          p.role === role && p.resource === resource && p.action === action
            ? { ...p, allowed }
            : p
        )
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["permissions"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });

  function getPermission(role: string, resource: string, action: string): boolean {
    const match = permissions.find(
      (p) => p.role === role && p.resource === resource && p.action === action
    );
    return match?.allowed ?? false;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-2 flex items-center gap-3">
        <Lock size={20} className="text-zinc-400" />
        <h1 className="text-xl font-bold text-zinc-900">Permissões</h1>
      </div>
      <p className="mb-6 text-sm text-zinc-400">
        Configure o que cada perfil pode fazer. Alterações entram em vigor imediatamente.
        O perfil <strong>Administrador</strong> tem acesso total e não é configurável.
      </p>

      <div className="overflow-x-auto rounded-xl bg-white border border-zinc-100 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-[11px] font-semibold uppercase text-zinc-400">
              <th className="px-4 py-3 w-48">Permissão</th>
              {ROLES.map((role) => (
                <th key={role} className="px-4 py-3 text-center">
                  {ROLE_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RESOURCE_GROUPS.map((group) => (
              <React.Fragment key={group.resource}>
                <tr className="border-b border-zinc-100 bg-zinc-50/60">
                  <td
                    colSpan={ROLES.length + 1}
                    className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-zinc-500"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.actions.map(({ action, label }) => (
                  <tr
                    key={`${group.resource}-${action}`}
                    className="border-b border-zinc-50 hover:bg-zinc-50/50"
                  >
                    <td className="px-4 py-3 pl-6 text-zinc-600">{label}</td>
                    {ROLES.map((role) => (
                      <td key={role} className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <Toggle
                            checked={getPermission(role, group.resource, action)}
                            onChange={(allowed) =>
                              updateMutation.mutate({
                                role,
                                resource: group.resource,
                                action,
                                allowed,
                              })
                            }
                            disabled={updateMutation.isPending}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
