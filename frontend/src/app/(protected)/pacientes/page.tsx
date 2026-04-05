"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, ChevronDown, ChevronUp, Pencil, Users } from "lucide-react";
import { patientService, appointmentService } from "@/services/api";
import { usePermissions } from "@/hooks/usePermissions";
import type { Patient } from "@/types/clinic";
import { PatientFormModal } from "@/components/patients/PatientFormModal";
import { AppointmentStatusBadge } from "@/components/agenda/AppointmentStatusBadge";

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
  const [filterIncomplete, setFilterIncomplete] = useState(false);

  const queryClient = useQueryClient();
  const { canCreatePatient, canEditPatient } = usePermissions();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients", debouncedSearch],
    queryFn: () => patientService.findAll(debouncedSearch || undefined),
  });

  const { data: patientAppointments = [] } = useQuery({
    queryKey: ["appointments", "patient", expandedPatientId],
    queryFn: () => appointmentService.findByPatient(expandedPatientId!),
    enabled: !!expandedPatientId,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Patient, "id">) => patientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setIsAddingPatient(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) =>
      patientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setEditingPatient(null);
    },
  });

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedPatientId((prev) => (prev === id ? null : id));
  }, []);

  const formatDate = (d: string) => {
    if (!d) return "—";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  const filtered = filterIncomplete ? patients.filter((p) => p.cadastroIncompleto) : patients;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Pacientes</h1>
          <p className="text-sm text-zinc-400">{filtered.length} cadastrados</p>
        </div>
        {canCreatePatient && (
          <button
            onClick={() => setIsAddingPatient(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Novo Paciente
          </button>
        )}
      </div>

      {/* Search + Filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou CPF..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setFilterIncomplete((v) => !v)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
            filterIncomplete
              ? "border-amber-400 bg-amber-50 text-amber-700"
              : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${filterIncomplete ? "bg-amber-400" : "bg-zinc-300"}`} />
          Cadastro incompleto
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-white border border-zinc-100 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
            <Users size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Nenhum paciente encontrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-[11px] font-semibold uppercase text-zinc-400">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">Cartão SUS</th>
                <th className="px-4 py-3">Telefone</th>
                {canEditPatient && <th className="px-4 py-3 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient) => (
                <React.Fragment key={patient.id}>
                  <tr
                    className="border-b border-zinc-50 hover:bg-zinc-50/50 cursor-pointer"
                    onClick={() => handleToggleExpand(patient.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {expandedPatientId === patient.id ? (
                          <ChevronUp size={14} className="text-zinc-400" />
                        ) : (
                          <ChevronDown size={14} className="text-zinc-400" />
                        )}
                        <span className="font-medium text-zinc-900">{patient.name}</span>
                        {patient.cadastroIncompleto && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            Incompleto
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{patient.cpf ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{patient.susCard ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{patient.phone ?? "—"}</td>
                    {canEditPatient && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingPatient(patient); }}
                            className="rounded p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* Expanded appointment history */}
                  {expandedPatientId === patient.id && (
                    <tr key={`${patient.id}-history`} className="bg-blue-50/50">
                      <td colSpan={5} className="px-6 py-3">
                        <p className="mb-2 text-[11px] font-semibold uppercase text-zinc-400">
                          Histórico de Agendamentos
                        </p>
                        {patientAppointments.length === 0 ? (
                          <p className="text-xs text-zinc-400">Nenhum agendamento encontrado</p>
                        ) : (
                          <div className="space-y-1.5">
                            {patientAppointments.map((appt) => (
                              <div
                                key={appt.id}
                                className="flex items-center gap-4 rounded-lg bg-white px-3 py-2 text-xs border border-zinc-100"
                              >
                                <span className="font-mono text-zinc-500">{formatDate(appt.date)} {appt.time}</span>
                                <span className="text-zinc-700">{appt.doctor?.name}</span>
                                <span className="text-zinc-500">{appt.procedureName ?? appt.type}</span>
                                <AppointmentStatusBadge status={appt.status} />
                                {appt.obsAgenda && (
                                  <span className="text-zinc-400 truncate max-w-48">{appt.obsAgenda}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {isAddingPatient && (
        <PatientFormModal
          onClose={() => setIsAddingPatient(false)}
          onSave={(data) => createMutation.mutate(data as Omit<Patient, "id">)}
          isSaving={createMutation.isPending}
        />
      )}
      {editingPatient && (
        <PatientFormModal
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSave={(data) => updateMutation.mutate({ id: editingPatient.id, data })}
          isSaving={updateMutation.isPending}
        />
      )}
    </div>
  );
}
