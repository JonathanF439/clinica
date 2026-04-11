"use client";

import { useState } from "react";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { doctorService, appointmentService, procedureService, appointmentStatusService } from "@/services/api";
import { usePermissions } from "@/hooks/usePermissions";
import type { Appointment } from "@/types/clinic";
import { MiniCalendar } from "@/components/agenda/MiniCalendar";
import { Pagination } from "@/components/shared/Pagination";
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const queryClient = useQueryClient();
  const { canChangeStatus, canEditAppointment, canCreateAppointment, isMedico } = usePermissions();

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
      appointmentStatusService.update(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const paginatedAppointments = appointments.slice((page - 1) * pageSize, page * pageSize);
  const appointmentDates = [...new Set(appointments.map((a) => a.date))];

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="flex flex-col gap-4 p-4 lg:flex-row lg:gap-5 lg:p-6">
      {/* Left column — calendar */}
      <div className="flex gap-3 overflow-x-auto lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-x-visible lg:space-y-4">
        <MiniCalendar
          selectedDate={selectedDate}
          onDateSelect={(d) => { setSelectedDate(d); setPage(1); }}
          appointmentDates={appointmentDates}
        />

        {/* New appointment button */}
        {canCreateAppointment && (
          <Link
            href="/agendamento/novo"
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shrink-0 lg:shrink"
          >
            <Plus size={15} />
            <span>Novo Agendamento</span>
          </Link>
        )}

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
        {/* Doctor tabs — hidden for MÉDICO (backend already filters to their own) */}
        {!isMedico && (
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
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl bg-white border border-zinc-100 shadow-sm">
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
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAppointments.map((appt) => (
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
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">{appt.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      {canChangeStatus ? (
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
                      ) : (
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_TEXT_COLORS[appt.status] ?? "text-zinc-600 bg-zinc-100"}`}>
                          {appt.status}
                        </span>
                      )}
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
                        {canEditAppointment && (
                          <button
                            onClick={() => setEditingAppt(appt)}
                            className="rounded p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedApptId === appt.id && (
                    <tr className="bg-zinc-50/70">
                      <td colSpan={8} className="px-6 py-3 space-y-2">
                        {appt.procedureName && (
                          <div>
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Procedimentos</p>
                            <div className="flex flex-wrap gap-1.5">
                              {appt.procedureName.split(",").map((name, i) => (
                                <span key={i} className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700">
                                  {name.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Obs. Agenda</p>
                          <p className="text-sm text-zinc-700">{appt.obsAgenda || <span className="text-zinc-400 italic">Sem observações</span>}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
          {appointments.length > 0 && (
            <Pagination
              total={appointments.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
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
