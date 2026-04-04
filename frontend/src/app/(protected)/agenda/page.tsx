"use client";

import { useState } from "react";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Calendar } from "lucide-react";
import { doctorService, appointmentService, procedureService } from "@/services/api";
import type { Appointment } from "@/types/clinic";
import { MiniCalendar } from "@/components/agenda/MiniCalendar";
import { AppointmentDetailsModal } from "@/components/agenda/AppointmentDetailsModal";
import { EditAppointmentModal } from "@/components/agenda/EditAppointmentModal";
import { APPOINTMENT_STATUSES, STATUS_TEXT_COLORS } from "@/lib/constants";

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()));
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | "all">("all");
  const [detailsAppt, setDetailsAppt] = useState<Appointment | null>(null);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [expandedApptId, setExpandedApptId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: doctorService.findAll,
  });

  const { data: procedures = [] } = useQuery({
    queryKey: ["procedures"],
    queryFn: procedureService.findAll,
  });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", selectedDate, selectedDoctorId],
    queryFn: () =>
      appointmentService.findByDate(
        selectedDate,
        selectedDoctorId === "all" ? undefined : selectedDoctorId
      ),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) =>
      appointmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setEditingAppt(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      appointmentService.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const appointmentDates = [...new Set(appointments.map((a) => a.date))];

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="flex gap-5 p-6 h-full">
      {/* Left column — calendar */}
      <div className="w-56 shrink-0 space-y-4">
        <MiniCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          appointmentDates={appointmentDates}
        />

        {/* Stats */}
        <div className="rounded-xl bg-white border border-zinc-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={15} className="text-blue-600" />
            <span className="text-xs font-semibold text-zinc-700">
              {formatDate(selectedDate)}
            </span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{appointments.length}</p>
          <p className="text-xs text-zinc-400">agendamentos</p>
        </div>
      </div>

      {/* Right column — appointments */}
      <div className="flex-1 min-w-0">
        {/* Doctor tabs */}
        <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedDoctorId("all")}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedDoctorId === "all"
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Todos
          </button>
          {doctors.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDoctorId(d.id)}
              className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedDoctorId === d.id
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {d.name.replace(/^DR[A]?\. /, "")}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl bg-white border border-zinc-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <Calendar size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Nenhum agendamento para esta data</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-[11px] font-semibold uppercase text-zinc-400">
                  <th className="px-4 py-3">Horário</th>
                  <th className="px-4 py-3">Paciente</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Médico</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Procedimento</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <React.Fragment key={appt.id}>
                  <tr
                    className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600">{appt.time}</td>
                    <td
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => setExpandedApptId(expandedApptId === appt.id ? null : appt.id)}
                    >
                      <p
                        title={appt.patient?.name}
                        className={`font-medium truncate max-w-40 ${appt.patient?.cadastroIncompleto ? "text-red-500" : "text-zinc-900"}`}
                      >
                        {appt.patient?.name ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {appt.patient?.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600 truncate max-w-32">
                      {appt.doctor?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{appt.category}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500 truncate max-w-32">
                      {appt.procedureName ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={appt.status}
                        onChange={(e) => statusMutation.mutate({ id: appt.id, status: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-medium outline-none cursor-pointer ${STATUS_TEXT_COLORS[appt.status] ?? "text-zinc-600 bg-zinc-100"}`}
                      >
                        {APPOINTMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setDetailsAppt(appt)}
                          className="rounded p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
                          title="Ver detalhes"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setEditingAppt(appt)}
                          className="rounded p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedApptId === appt.id && (
                    <tr className="bg-zinc-50/70">
                      <td colSpan={8} className="px-6 py-3">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Obs. Agenda</p>
                        <p className="text-sm text-zinc-700">{appt.obsAgenda || <span className="text-zinc-400 italic">Sem observações</span>}</p>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Status legend */}
        <div className="mt-3 flex flex-wrap gap-3">
          {[
            { label: "Confirmado", color: "bg-emerald-500" },
            { label: "Aguardando", color: "bg-blue-500" },
            { label: "Atendido", color: "bg-purple-500" },
            { label: "Não compareceu", color: "bg-red-500" },
            { label: "Paciente cancelou", color: "bg-orange-500" },
            { label: "Horário bloqueado", color: "bg-zinc-900" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${color}`} />
              <span className="text-[11px] text-zinc-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AppointmentDetailsModal
        appointment={detailsAppt}
        onClose={() => setDetailsAppt(null)}
      />
      <EditAppointmentModal
        appointment={editingAppt}
        doctors={doctors}
        procedures={procedures}
        onClose={() => setEditingAppt(null)}
        onSave={(id, data) => updateMutation.mutate({ id, data })}
        isSaving={updateMutation.isPending}
      />
    </div>
  );
}
