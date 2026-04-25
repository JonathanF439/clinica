"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Search, Stethoscope } from "lucide-react";
import { procedureService } from "@/services/api";
import type { Procedure } from "@/types/clinic";

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

function ProcedureModal({
  procedure,
  onClose,
  onSave,
  isSaving,
  error,
}: {
  procedure?: Procedure;
  onClose: () => void;
  onSave: (data: Omit<Procedure, "id">) => void;
  isSaving?: boolean;
  error?: string;
}) {
  const isEdit = !!procedure;
  const [form, setForm] = useState({
    code: procedure?.code ?? "",
    name: procedure?.name ?? "",
    isCirurgia: procedure?.isCirurgia ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.code.trim()) newErrors.code = "Código é obrigatório";
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">
            {isEdit ? "Editar Procedimento" : "Novo Procedimento"}
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
            <label className="label">Código *</label>
            <input
              className={`input ${errors.code ? "border-red-400" : ""}`}
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              placeholder="Ex: 001"
            />
            {errors.code && <p className="mt-0.5 text-xs text-red-500">{errors.code}</p>}
          </div>

          <div>
            <label className="label">Nome *</label>
            <input
              className={`input ${errors.name ? "border-red-400" : ""}`}
              value={form.name}
              onChange={(e) => set("name", e.target.value.toUpperCase())}
              placeholder="Nome do procedimento"
            />
            {errors.name && <p className="mt-0.5 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-zinc-800">Cirurgia</p>
              <p className="text-xs text-zinc-500">Marque se este procedimento é cirúrgico</p>
            </div>
            <Toggle checked={form.isCirurgia} onChange={(v) => set("isCirurgia", v)} />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isSaving ? "Salvando..." : isEdit ? "Salvar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProcedimentosPage() {
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<Procedure | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Procedure | null>(null);
  const [modalError, setModalError] = useState("");
  const queryClient = useQueryClient();

  const { data: procedures = [], isLoading } = useQuery<Procedure[]>({
    queryKey: ["procedures"],
    queryFn: () => procedureService.findAll(),
  });

  const sortByCode = (list: Procedure[]) =>
    [...list].sort((a, b) => Number(a.code) - Number(b.code) || a.code.localeCompare(b.code));

  const filtered = sortByCode(
    search.trim()
      ? procedures.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.code.toLowerCase().includes(search.toLowerCase())
        )
      : procedures
  );

  const createMutation = useMutation({
    mutationFn: (data: Omit<Procedure, "id">) => procedureService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
      setIsAdding(false);
      setModalError("");
    },
    onError: (err: { response?: { status?: number } }) => {
      setModalError(err?.response?.status === 409 ? "Código já cadastrado." : "Erro ao criar procedimento.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Procedure, "id">> }) =>
      procedureService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
      setEditing(null);
      setModalError("");
    },
    onError: (err: { response?: { status?: number } }) => {
      setModalError(err?.response?.status === 409 ? "Código já cadastrado." : "Erro ao atualizar procedimento.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => procedureService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
      setConfirmDelete(null);
    },
  });

  const toggleCirurgia = (proc: Procedure) => {
    updateMutation.mutate({ id: proc.id, data: { isCirurgia: !proc.isCirurgia } });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Procedimentos</h1>
          <p className="text-sm text-zinc-600">{procedures.length} cadastrados</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setModalError(""); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Novo Procedimento
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código ou nome..."
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-white border border-zinc-100 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <Stethoscope size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Nenhum procedimento encontrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-[11px] font-semibold uppercase text-zinc-500">
                <th className="px-4 py-3 w-24">Código</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3 w-32 text-center">Cirurgia</th>
                <th className="px-4 py-3 w-24 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((proc) => (
                <tr key={proc.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600">{proc.code}</td>
                  <td className="px-4 py-3 font-medium text-zinc-800">{proc.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <Toggle
                        checked={proc.isCirurgia ?? false}
                        onChange={() => toggleCirurgia(proc)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => { setEditing(proc); setModalError(""); }}
                        className="rounded p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(proc)}
                        className="rounded p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create modal */}
      {isAdding && (
        <ProcedureModal
          onClose={() => { setIsAdding(false); setModalError(""); }}
          onSave={(data) => createMutation.mutate(data)}
          isSaving={createMutation.isPending}
          error={modalError}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <ProcedureModal
          procedure={editing}
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
            <h3 className="text-base font-semibold text-zinc-900 mb-1">Excluir procedimento</h3>
            <p className="text-sm text-zinc-600 mb-5">
              Tem certeza que deseja excluir <span className="font-medium text-zinc-900">{confirmDelete.name}</span>? Esta ação não pode ser desfeita.
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
