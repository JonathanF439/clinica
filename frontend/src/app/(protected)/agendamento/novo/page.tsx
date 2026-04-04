"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Search, UserPlus } from "lucide-react";
import { doctorService, patientService, appointmentService, procedureService } from "@/services/api";
import type { Appointment, Patient } from "@/types/clinic";
import { CATEGORIES, APPOINTMENT_TYPES, APPOINTMENT_STATUSES } from "@/lib/constants";
import { ProcedureCombobox } from "@/components/shared/ProcedureCombobox";
import { PatientFormModal } from "@/components/patients/PatientFormModal";

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const [patientSearch, setPatientSearch] = useState("");
  const [debouncedPatientSearch, setDebouncedPatientSearch] = useState("");
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const queryClient = useQueryClient();

  const [form, setForm] = useState<Omit<Appointment, "id" | "patient" | "doctor">>({
    patientId: "",
    doctorId: "",
    date: toLocalDateString(new Date()),
    time: "08:00",
    category: "SUS",
    type: "CONSULTA",
    procedureCode: "",
    procedureName: "",
    value: 0,
    status: "Aguardando",
    obsAgenda: "",
    obsTratamento: "",
    isRegistered: true,
    receptionist: "LOURIVANIA",
  });

  // Debounce patient search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedPatientSearch(patientSearch), 300);
    return () => clearTimeout(t);
  }, [patientSearch]);

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: doctorService.findAll,
  });

  const { data: procedures = [] } = useQuery({
    queryKey: ["procedures"],
    queryFn: procedureService.findAll,
  });

  const { data: patientResults = [] } = useQuery({
    queryKey: ["patients", debouncedPatientSearch],
    queryFn: () => patientService.findAll(debouncedPatientSearch),
    enabled: debouncedPatientSearch.length > 1,
  });

  const createMutation = useMutation({
    mutationFn: appointmentService.create,
    onSuccess: () => router.push("/agenda"),
  });

  const set = (key: keyof typeof form, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    set("patientId", p.id);
    setPatientSearch(p.name);
    setShowPatientResults(false);
  };

  const patientCreateMutation = useMutation({
    mutationFn: (data: Omit<Patient, "id">) => patientService.create(data),
    onSuccess: (newPatient) => {
      handleSelectPatient(newPatient);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setShowPatientModal(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId) return;
    createMutation.mutate(form);
  };

  return (
    <div className="flex min-h-full flex-col items-center p-6">
      <div className="w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900">Novo Agendamento</h1>
        <p className="text-sm text-zinc-400">Preencha os dados do agendamento</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl bg-white border border-zinc-100 shadow-sm p-6 space-y-5">
        {/* Patient search */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Paciente *</label>
            <button
              type="button"
              onClick={() => setShowPatientModal(true)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              <UserPlus size={13} /> Cadastrar Paciente
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              className="input pl-8"
              placeholder="Buscar paciente por nome ou CPF..."
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setShowPatientResults(true);
                if (!e.target.value) { setSelectedPatient(null); set("patientId", ""); }
              }}
              onFocus={() => setShowPatientResults(true)}
            />
            {showPatientResults && patientResults.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg">
                {patientResults.map((p) => (
                  <li
                    key={p.id}
                    onMouseDown={() => handleSelectPatient(p)}
                    className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-blue-50"
                  >
                    <span className="text-sm text-zinc-800">{p.name}</span>
                    <span className="text-xs text-zinc-400">{p.cpf}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedPatient && (
            <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs text-blue-700">
              <span>Selecionado: {selectedPatient.name}{selectedPatient.cpf ? ` — ${selectedPatient.cpf}` : ""}</span>
              {selectedPatient.cadastroIncompleto && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                  Cadastro incompleto
                </span>
              )}
            </div>
          )}
        </div>

        {/* Doctor */}
        <div>
          <label className="label">Médico *</label>
          <select className="input" required value={form.doctorId} onChange={(e) => set("doctorId", e.target.value)}>
            <option value="">Selecionar médico...</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Date and time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Data *</label>
            <input type="date" className="input" required value={form.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div>
            <label className="label">Horário *</label>
            <input type="time" className="input" required value={form.time} onChange={(e) => set("time", e.target.value)} />
          </div>
        </div>

        {/* Category and type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Categoria *</label>
            <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tipo *</label>
            <select className="input" value={form.type} onChange={(e) => set("type", e.target.value)}>
              {APPOINTMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Procedure */}
        <div>
          <label className="label">Procedimento</label>
          <ProcedureCombobox
            procedures={procedures}
            value={form.procedureCode ? { code: form.procedureCode, name: form.procedureName ?? "" } : null}
            onChange={(p) => { set("procedureCode", p?.code ?? ""); set("procedureName", p?.name ?? ""); }}
          />
        </div>

        {/* Receptionist */}
        <div>
          <label className="label">Recepcionista</label>
          <input className="input" value={form.receptionist ?? ""} onChange={(e) => set("receptionist", e.target.value)} />
        </div>

        {/* Observations */}
        <div>
          <label className="label">Obs. Agenda</label>
          <textarea
            className="input min-h-20 resize-none"
            value={form.obsAgenda ?? ""}
            onChange={(e) => set("obsAgenda", e.target.value)}
          />
        </div>

        {/* Error */}
        {createMutation.isError && (
          <p className="text-sm text-red-500">Erro ao criar agendamento. Tente novamente.</p>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/agenda")}
            className="rounded-lg border border-zinc-200 px-5 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || !form.patientId || !form.doctorId}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? "Salvando..." : "Agendar"}
          </button>
        </div>
      </form>

      </div>

      {showPatientModal && (
        <PatientFormModal
          onClose={() => setShowPatientModal(false)}
          onSave={(data) => patientCreateMutation.mutate(data as Omit<Patient, "id">)}
          isSaving={patientCreateMutation.isPending}
        />
      )}
    </div>
  );
}
