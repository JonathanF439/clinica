"use client";

import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import type { Appointment, Doctor, Procedure } from "@/types/clinic";
import { CATEGORIES, APPOINTMENT_TYPES } from "@/lib/constants";
import { ProcedureCombobox } from "@/components/shared/ProcedureCombobox";
import { useAppointmentStatuses } from "@/hooks/useAppointmentStatuses";

interface EditAppointmentModalProps {
  appointment: Appointment | null;
  doctors: Doctor[];
  procedures: Procedure[];
  onClose: () => void;
  onSave: (id: string, data: Partial<Appointment>) => void;
  isSaving?: boolean;
  canDelete?: boolean;
}

export function EditAppointmentModal({
  appointment,
  doctors,
  procedures,
  onClose,
  onSave,
  isSaving,
  canDelete = true,
}: EditAppointmentModalProps) {
  const [form, setForm] = useState<Partial<Appointment>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { activeStatuses, badgeMap } = useAppointmentStatuses();

  useEffect(() => {
    setConfirmDelete(false);
    if (appointment) {
      setForm({
        date: appointment.date,
        time: appointment.time,
        doctorId: appointment.doctorId,
        category: appointment.category,
        type: appointment.type,
        procedureCode: appointment.procedureCode,
        procedureName: appointment.procedureName,
        status: appointment.status,
        callOrder: appointment.callOrder,
        obsAgenda: appointment.obsAgenda ?? "",
        obsTratamento: appointment.obsTratamento ?? "",
        receptionist: appointment.receptionist ?? "",
        value: appointment.value,
      });
    }
  }, [appointment]);

  if (!appointment) return null;

  const set = (key: keyof typeof form, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(appointment.id, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-[95vw] flex-col rounded-xl bg-white shadow-xl max-h-[90vh] sm:max-w-3xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Editar Agendamento</h2>
            <p className="text-xs text-zinc-400">{appointment.patient?.name ?? ""}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100 text-zinc-500">
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const target = e.target as HTMLElement;
            if (target.tagName === "TEXTAREA") return;
            if (target.tagName === "INPUT" && (target as HTMLInputElement).type === "radio") return;
            if (target.tagName === "BUTTON" && (target as HTMLButtonElement).type === "submit") return;
            e.preventDefault();
            const focusable = Array.from(
              e.currentTarget.querySelectorAll<HTMLElement>(
                'input:not([type="radio"]), select, textarea, button[type="submit"]'
              )
            ).filter((el) => !(el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement).disabled);
            const index = focusable.indexOf(target);
            if (index >= 0 && index < focusable.length - 1) focusable[index + 1].focus();
          }}
          className="overflow-y-auto"
        >
          <div className="space-y-5 p-6">

            {/* Data, Horário, Chamada, Status */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="label">Data</label>
                <input type="date" className="input" value={form.date ?? ""} onChange={(e) => set("date", e.target.value)} />
              </div>
              <div>
                <label className="label">Horário</label>
                <input type="time" className="input" value={form.time ?? ""} onChange={(e) => set("time", e.target.value)} />
              </div>
              <div>
                <label className="label">Chamada</label>
                <input
                  type="number"
                  min={1}
                  className="input"
                  value={form.callOrder ?? ""}
                  onChange={(e) => set("callOrder", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 1"
                />
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-medium outline-none cursor-pointer w-full ${badgeMap[form.status ?? ""] ?? "text-zinc-600 bg-zinc-100"}`}
                  value={form.status ?? ""}
                  onChange={(e) => set("status", e.target.value)}
                >
                  {activeStatuses.map((s) => <option key={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Médico */}
            <div>
              <label className="label">Médico</label>
              <select className="input" value={form.doctorId ?? ""} onChange={(e) => set("doctorId", e.target.value)}>
                <option value="">Selecionar...</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Categoria, Tipo, Recepcionista */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Categoria</label>
                <select className="input" value={form.category ?? ""} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Tipo</label>
                <select className="input" value={form.type ?? ""} onChange={(e) => set("type", e.target.value)}>
                  {APPOINTMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Recepcionista</label>
                <input className="input" value={form.receptionist ?? ""} onChange={(e) => set("receptionist", e.target.value)} />
              </div>
            </div>

            {/* Procedimento */}
            <div>
              <label className="label">Procedimento</label>
              <ProcedureCombobox
                procedures={procedures}
                value={
                  form.procedureCode
                    ? form.procedureCode.split(",").map((code, i) => ({
                        code: code.trim(),
                        name: (form.procedureName?.split(",")[i] ?? "").trim(),
                      }))
                    : []
                }
                onChange={(list) => {
                  set("procedureCode", list.map((p) => p.code).join(","));
                  set("procedureName", list.map((p) => p.name).join(","));
                }}
              />
            </div>

            {/* Observações lado a lado */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Obs. Agenda</label>
                <textarea className="input min-h-20 resize-none" value={form.obsAgenda ?? ""} onChange={(e) => set("obsAgenda", e.target.value)} />
              </div>
              <div>
                <label className="label">Obs. Tratamento</label>
                <textarea className="input min-h-20 resize-none" value={form.obsTratamento ?? ""} onChange={(e) => set("obsTratamento", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4 shrink-0">
            {canDelete && (
              <div className="flex items-center gap-2">
                {confirmDelete ? (
                  <>
                    <span className="text-xs text-red-600 font-medium">Confirmar exclusão?</span>
                    <button
                      type="button"
                      onClick={() => { onSave(appointment.id, { isActive: false }); onClose(); }}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                    >
                      Sim, excluir
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
                    >
                      Não
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                    Excluir agendamento
                  </button>
                )}
              </div>
            )}
            <div className="flex gap-2 ml-auto">
              <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">
                Cancelar
              </button>
              <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
