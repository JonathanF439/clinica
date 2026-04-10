"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Appointment, Doctor, Procedure } from "@/types/clinic";
import { CATEGORIES, APPOINTMENT_TYPES, APPOINTMENT_STATUSES } from "@/lib/constants";
import { ProcedureCombobox } from "@/components/shared/ProcedureCombobox";

interface EditAppointmentModalProps {
  appointment: Appointment | null;
  doctors: Doctor[];
  procedures: Procedure[];
  onClose: () => void;
  onSave: (id: string, data: Partial<Appointment>) => void;
  isSaving?: boolean;
}

export function EditAppointmentModal({
  appointment,
  doctors,
  procedures,
  onClose,
  onSave,
  isSaving,
}: EditAppointmentModalProps) {
  const [form, setForm] = useState<Partial<Appointment>>({});

  useEffect(() => {
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

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="space-y-5 p-6">

            {/* Data, Horário, Status */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Data</label>
                <input type="date" className="input" value={form.date ?? ""} onChange={(e) => set("date", e.target.value)} />
              </div>
              <div>
                <label className="label">Horário</label>
                <input type="time" className="input" value={form.time ?? ""} onChange={(e) => set("time", e.target.value)} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status ?? ""} onChange={(e) => set("status", e.target.value)}>
                  {APPOINTMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
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

          <div className="flex justify-end gap-2 border-t border-zinc-100 px-6 py-4 shrink-0">
            <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
