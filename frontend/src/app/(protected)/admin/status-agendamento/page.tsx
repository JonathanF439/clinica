"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, GripVertical, Activity } from "lucide-react";
import { statusCatalogService } from "@/services/api";
import { COLOR_OPTIONS } from "@/lib/constants";
import type { AppointmentStatusConfig } from "@/types/clinic";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${
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

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_OPTIONS.map((c) => (
        <button
          key={c.key}
          type="button"
          title={c.label}
          onClick={() => onChange(c.key)}
          className={`h-7 w-7 rounded-full transition-transform ${c.bg} ${
            value === c.key
              ? "ring-2 ring-offset-2 ring-blue-500 scale-110"
              : "hover:scale-105"
          }`}
        />
      ))}
    </div>
  );
}

function StatusModal({
  status,
  onClose,
  onSave,
  isSaving,
  error,
}: {
  status?: AppointmentStatusConfig;
  onClose: () => void;
  onSave: (data: Omit<AppointmentStatusConfig, "id">) => void;
  isSaving?: boolean;
  error?: string;
}) {
  const isEdit = !!status;
  const [form, setForm] = useState({
    name: status?.name ?? "",
    color: status?.color ?? "zinc",
    order: status?.order ?? 0,
    isActive: status?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSave(form);
  };

  const selectedColor = COLOR_OPTIONS.find((c) => c.key === form.color);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">
            {isEdit ? "Editar Status" : "Novo Status"}
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
            ).filter((el) => !(el as HTMLInputElement | HTMLButtonElement).disabled);
            const index = focusable.indexOf(target);
            if (index >= 0 && index < focusable.length - 1) focusable[index + 1].focus();
          }}
          className="space-y-4 p-5"
        >
          <div>
            <label className="label">Nome *</label>
            <input
              className={`input ${errors.name ? "border-red-400" : ""}`}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: Confirmado"
            />
            {errors.name && <p className="mt-0.5 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="label">Cor</label>
            <div className="mt-2">
              <ColorPicker value={form.color} onChange={(k) => set("color", k)} />
            </div>
            {selectedColor && (
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-[12px] font-medium ${selectedColor.badge}`}
                >
                  {form.name || "Prévia"}
                </span>
                <span className="text-xs text-zinc-500">({selectedColor.label})</span>
              </div>
            )}
          </div>

          <div>
            <label className="label">Ordem</label>
            <input
              type="number"
              className="input"
              value={form.order}
              onChange={(e) => set("order", Number(e.target.value))}
              min={0}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-zinc-800">Ativo</p>
              <p className="text-xs text-zinc-500">Status visível nas opções de agendamento</p>
            </div>
            <Toggle checked={form.isActive} onChange={(v) => set("isActive", v)} />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Salvando..." : isEdit ? "Salvar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StatusAgendamentoPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<AppointmentStatusConfig | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AppointmentStatusConfig | null>(null);
  const [modalError, setModalError] = useState("");
  const queryClient = useQueryClient();

  const { data: statuses = [], isLoading } = useQuery<AppointmentStatusConfig[]>({
    queryKey: ["appointment-statuses"],
    queryFn: () => statusCatalogService.findAll(),
  });

  const sorted = [...statuses].sort((a, b) => a.order - b.order);

  const createMutation = useMutation({
    mutationFn: (data: Omit<AppointmentStatusConfig, "id">) => statusCatalogService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-statuses"] });
      setIsAdding(false);
      setModalError("");
    },
    onError: (err: { response?: { status?: number } }) => {
      setModalError(err?.response?.status === 409 ? "Nome já cadastrado." : "Erro ao criar status.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<AppointmentStatusConfig, "id">> }) =>
      statusCatalogService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-statuses"] });
      setEditing(null);
      setModalError("");
    },
    onError: (err: { response?: { status?: number } }) => {
      setModalError(err?.response?.status === 409 ? "Nome já cadastrado." : "Erro ao atualizar status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => statusCatalogService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-statuses"] });
      setConfirmDelete(null);
    },
  });

  const toggleActive = (s: AppointmentStatusConfig) => {
    updateMutation.mutate({ id: s.id, data: { isActive: !s.isActive } });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Status de Agendamento</h1>
          <p className="text-sm text-zinc-600">{statuses.length} cadastrados</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setModalError(""); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Novo Status
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-white border border-zinc-100 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <Activity size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Nenhum status cadastrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-[11px] font-semibold uppercase text-zinc-500">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3 w-16 text-center">Ordem</th>
                <th className="px-4 py-3">Nome / Prévia</th>
                <th className="px-4 py-3 w-28 text-center">Ativo</th>
                <th className="px-4 py-3 w-24 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => {
                const colorOpt = COLOR_OPTIONS.find((c) => c.key === s.color);
                return (
                  <tr key={s.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                    <td className="px-4 py-3 text-zinc-300">
                      <GripVertical size={14} />
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs text-zinc-500">
                      {s.order}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${colorOpt?.badge ?? "text-zinc-600 bg-zinc-100"}`}
                        >
                          {s.name}
                        </span>
                        <span
                          className={`inline-block h-3 w-3 rounded-full ${colorOpt?.bg ?? "bg-zinc-300"}`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <Toggle checked={s.isActive} onChange={() => toggleActive(s)} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => { setEditing(s); setModalError(""); }}
                          className="rounded p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(s)}
                          className="rounded p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create modal */}
      {isAdding && (
        <StatusModal
          onClose={() => { setIsAdding(false); setModalError(""); }}
          onSave={(data) => createMutation.mutate(data)}
          isSaving={createMutation.isPending}
          error={modalError}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <StatusModal
          status={editing}
          onClose={() => { setEditing(null); setModalError(""); }}
          onSave={(data) => updateMutation.mutate({ id: editing.id, data })}
          isSaving={updateMutation.isPending}
          error={modalError}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900 mb-1">Excluir status</h3>
            <p className="text-sm text-zinc-600 mb-5">
              Tem certeza que deseja excluir{" "}
              <span className="font-medium text-zinc-900">{confirmDelete.name}</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
