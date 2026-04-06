"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, X, Stethoscope } from "lucide-react";
import { doctorService } from "@/services/api";
import { usePermissions } from "@/hooks/usePermissions";
import type { Doctor } from "@/types/clinic";

const emptyForm = (): Omit<Doctor, "id"> => ({
  name: "",
  crm: "",
});

function DoctorModal({
  doctor,
  onClose,
  onSave,
  isSaving,
}: {
  doctor?: Doctor;
  onClose: () => void;
  onSave: (data: Omit<Doctor, "id"> | Partial<Doctor>) => void;
  isSaving?: boolean;
}) {
  const [form, setForm] = useState<Omit<Doctor, "id">>(
    doctor ? { name: doctor.name, crm: doctor.crm ?? "" }
           : emptyForm()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof form, v: string) => { setForm((f) => ({ ...f, [k]: v })); setErrors((prev) => ({ ...prev, [k]: "" })); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">
            {doctor ? "Editar Médico" : "Novo Médico"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100 text-zinc-500">
            <X size={16} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const newErrors: Record<string, string> = {};
            if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
            if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
            onSave(form);
          }}
          className="space-y-3 p-5"
        >
          <div>
            <label className="label">Nome Completo *</label>
            <input className={`input ${errors.name ? "border-red-400" : ""}`} value={form.name} onChange={(e) => set("name", e.target.value.toUpperCase())} />
            {errors.name && <p className="mt-0.5 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="label">CRM</label>
            <input className="input" value={form.crm ?? ""} onChange={(e) => set("crm", e.target.value)} placeholder="00000-AM" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isSaving ? "Salvando..." : doctor ? "Salvar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MedicosPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const queryClient = useQueryClient();
  const { canCreateDoctor, canEditDoctor } = usePermissions();

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: doctorService.findAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Doctor, "id">) => doctorService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setIsAdding(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Doctor> }) =>
      doctorService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setEditingDoctor(null);
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Médicos</h1>
          <p className="text-sm text-zinc-400">{doctors.length} cadastrados</p>
        </div>
        {canCreateDoctor && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Novo Médico
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl bg-white border border-zinc-100 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
            <Stethoscope size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Nenhum médico cadastrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-[11px] font-semibold uppercase text-zinc-400">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">CRM</th>
                {canEditDoctor && <th className="px-4 py-3 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{doctor.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-zinc-500">{doctor.crm ?? "—"}</td>
                  {canEditDoctor && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setEditingDoctor(doctor)}
                          className="rounded p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isAdding && (
        <DoctorModal
          onClose={() => setIsAdding(false)}
          onSave={(data) => createMutation.mutate(data as Omit<Doctor, "id">)}
          isSaving={createMutation.isPending}
        />
      )}
      {editingDoctor && (
        <DoctorModal
          doctor={editingDoctor}
          onClose={() => setEditingDoctor(null)}
          onSave={(data) => updateMutation.mutate({ id: editingDoctor.id, data })}
          isSaving={updateMutation.isPending}
        />
      )}
    </div>
  );
}
