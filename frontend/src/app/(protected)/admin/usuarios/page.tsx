"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, ShieldCheck, Pencil } from "lucide-react";
import { userService } from "@/services/api";
import type { User, CreateUserPayload } from "@/types/clinic";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MEDICO: "Médico",
  RECEPCIONISTA: "Recepcionista",
  ENFERMAGEM: "Enfermagem",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  MEDICO: "bg-blue-100 text-blue-700",
  RECEPCIONISTA: "bg-emerald-100 text-emerald-700",
  ENFERMAGEM: "bg-orange-100 text-orange-700",
};

function UserModal({
  user,
  onClose,
  onSave,
  isSaving,
  error,
}: {
  user?: User;
  onClose: () => void;
  onSave: (data: Partial<CreateUserPayload>) => void;
  isSaving?: boolean;
  error?: string;
}) {
  const isEdit = !!user;
  const [form, setForm] = useState<Partial<CreateUserPayload>>({
    name: user?.name ?? "",
    login: user?.login ?? "",
    password: "",
    role: (user?.role as CreateUserPayload["role"]) ?? "RECEPCIONISTA",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof CreateUserPayload, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name?.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.login?.trim()) newErrors.login = "Login é obrigatório";
    if (!isEdit && (!form.password || form.password.length < 6))
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const payload: Partial<CreateUserPayload> = {
      name: form.name,
      login: form.login,
      role: form.role,
    };
    if (!isEdit || form.password) payload.password = form.password;
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">
            {isEdit ? "Editar Usuário" : "Novo Usuário"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100 text-zinc-500">
            <X size={16} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const target = e.target as HTMLElement;
            if (target.tagName === "BUTTON" && (target as HTMLButtonElement).type === "submit") return;
            e.preventDefault();
            const focusable = Array.from(
              e.currentTarget.querySelectorAll<HTMLElement>(
                'input:not([type="radio"]), select, button[type="submit"]'
              )
            ).filter((el) => !(el as HTMLInputElement | HTMLSelectElement | HTMLButtonElement).disabled);
            const index = focusable.indexOf(target);
            if (index >= 0 && index < focusable.length - 1) focusable[index + 1].focus();
          }}
          className="space-y-3 p-5"
        >
          <div>
            <label className="label">Nome Completo *</label>
            <input
              className={`input ${errors.name ? "border-red-400" : ""}`}
              value={form.name ?? ""}
              onChange={(e) => set("name", e.target.value.toUpperCase())}
            />
            {errors.name && <p className="mt-0.5 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Login *</label>
            <input
              type="text"
              className={`input ${errors.login ? "border-red-400" : ""}`}
              value={form.login ?? ""}
              onChange={(e) => set("login", e.target.value.toUpperCase())}
              placeholder="ex: JOAO.SILVA"
            />
            {errors.login && <p className="mt-0.5 text-xs text-red-500">{errors.login}</p>}
          </div>
          <div>
            <label className="label">{isEdit ? "Nova Senha" : "Senha *"}</label>
            <input
              type="password"
              className={`input ${errors.password ? "border-red-400" : ""}`}
              value={form.password ?? ""}
              onChange={(e) => set("password", e.target.value)}
              placeholder={isEdit ? "Deixe em branco para não alterar" : "Mínimo 6 caracteres"}
            />
            {errors.password && <p className="mt-0.5 text-xs text-red-500">{errors.password}</p>}
          </div>
          <div>
            <label className="label">Perfil *</label>
            <select
              className="input"
              value={form.role ?? "RECEPCIONISTA"}
              onChange={(e) => set("role", e.target.value)}
            >
              <option value="RECEPCIONISTA">Recepcionista</option>
              <option value="ENFERMAGEM">Enfermagem</option>
              <option value="MEDICO">Médico</option>
            </select>
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isSaving ? "Salvando..." : isEdit ? "Salvar" : "Criar Usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsuariosPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalError, setModalError] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: userService.findAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<CreateUserPayload>) => userService.create(data as CreateUserPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsAdding(false);
      setModalError("");
    },
    onError: (err: { response?: { status?: number } }) => {
      setModalError(err?.response?.status === 409 ? "Login já cadastrado no sistema." : "Erro ao criar usuário. Tente novamente.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateUserPayload> }) =>
      userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      setModalError("");
    },
    onError: (err: { response?: { status?: number } }) => {
      setModalError(err?.response?.status === 409 ? "Login já cadastrado no sistema." : "Erro ao atualizar usuário. Tente novamente.");
    },
  });

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("pt-BR");
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Usuários</h1>
          <p className="text-sm text-zinc-600">{users.length} cadastrados</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setModalError(""); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Novo Usuário
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white border border-zinc-100 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <ShieldCheck size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Nenhum usuário cadastrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-[11px] font-semibold uppercase text-zinc-500">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Login</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Cadastrado em</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{user.name}</td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{user.login}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${ROLE_COLORS[user.role] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => { setEditingUser(user); setModalError(""); }}
                        className="rounded p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isAdding && (
        <UserModal
          onClose={() => { setIsAdding(false); setModalError(""); }}
          onSave={(data) => createMutation.mutate(data)}
          isSaving={createMutation.isPending}
          error={modalError}
        />
      )}
      {editingUser && (
        <UserModal
          user={editingUser}
          onClose={() => { setEditingUser(null); setModalError(""); }}
          onSave={(data) => updateMutation.mutate({ id: editingUser.id, data })}
          isSaving={updateMutation.isPending}
          error={modalError}
        />
      )}
    </div>
  );
}
