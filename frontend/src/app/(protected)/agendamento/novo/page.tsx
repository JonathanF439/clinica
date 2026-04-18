"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { doctorService, patientService, appointmentService, procedureService } from "@/services/api";
import { useAuth } from "@/context/auth-context";
import type { Appointment, Patient, Procedure } from "@/types/clinic";
import { CATEGORIES, APPOINTMENT_TYPES } from "@/lib/constants";
import { ProcedureCombobox } from "@/components/shared/ProcedureCombobox";

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [patientSearch, setPatientSearch] = useState("");
  const [debouncedPatientSearch, setDebouncedPatientSearch] = useState("");
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [quickPhone, setQuickPhone] = useState("");
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [selectedProcedures, setSelectedProcedures] = useState<Pick<Procedure, "code" | "name">[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<Omit<Appointment, "id" | "patient" | "doctor">>({
    patientId: "",
    doctorId: searchParams.get("doctorId") ?? "",
    date: searchParams.get("date") ?? toLocalDateString(new Date()),
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
    receptionist: "",
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedPatientSearch(patientSearch), 300);
    return () => clearTimeout(t);
  }, [patientSearch]);

  useEffect(() => {
    if (user?.login) set("receptionist", user.login.toUpperCase());
  }, [user]);

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: doctorService.findAll,
  });

  const { data: procedures = [] } = useQuery({
    queryKey: ["procedures"],
    queryFn: procedureService.findAll,
  });

  const { data: patientResults = [], isFetching: isSearching } = useQuery({
    queryKey: ["patients", debouncedPatientSearch],
    queryFn: () => patientService.findAll(debouncedPatientSearch),
    enabled: debouncedPatientSearch.length > 1,
  });

  // Atualiza noResultsFound apenas quando a query termina (evita piscar durante loading)
  useEffect(() => {
    if (!isSearching && debouncedPatientSearch.length > 1) {
      setNoResultsFound(patientResults.length === 0);
    }
  }, [isSearching, patientResults, debouncedPatientSearch]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowPatientResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showQuickPhone = noResultsFound && !selectedPatient;

  const createMutation = useMutation({
    mutationFn: appointmentService.create,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      router.push(`/agenda?date=${created.date}`);
    },
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
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      return newPatient;
    },
  });

  function maskPhone(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits.replace(/^(\d{0,2})/, "($1");
    if (digits.length <= 6) return digits.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
    if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") return;
    const target = e.target as HTMLElement;
    if (target.tagName === "TEXTAREA" && e.shiftKey) return;
    if (target.tagName === "INPUT" && (target as HTMLInputElement).type === "radio") return;
    if (target.tagName === "BUTTON" && (target as HTMLButtonElement).type === "submit") return;

    e.preventDefault();
    if (showPatientResults) setShowPatientResults(false);

    const focusable = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>(
        'input:not([type="radio"]), select, textarea, button[type="submit"]'
      )
    ).filter((el) => !(el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement).disabled);

    const index = focusable.indexOf(target);
    if (index >= 0 && index < focusable.length - 1) focusable[index + 1].focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (showQuickPhone) {
      if (!patientSearch.trim()) newErrors.patientId = "Digite o nome do paciente";
      if (!quickPhone.trim()) newErrors.quickPhone = "Celular é obrigatório";
    } else {
      if (!form.patientId) newErrors.patientId = "Selecione um paciente";
    }

    if (!form.doctorId) newErrors.doctorId = "Selecione um médico";
    if (!form.date) newErrors.date = "Data é obrigatória";
    if (!form.time) newErrors.time = "Horário é obrigatório";
    if (Object.keys(newErrors).length > 0) { setFormErrors(newErrors); return; }
    setFormErrors({});

    const procedurePayload = {
      procedureCode: selectedProcedures.map((p) => p.code).join(","),
      procedureName: selectedProcedures.map((p) => p.name).join(","),
    };

    if (showQuickPhone) {
      const newPatient = await patientCreateMutation.mutateAsync({
        name: patientSearch.trim().toUpperCase(),
        phone: quickPhone.trim(),
        cadastroIncompleto: true,
      } as Omit<Patient, "id">);
      createMutation.mutate({ ...form, ...procedurePayload, patientId: newPatient.id });
    } else {
      createMutation.mutate({ ...form, ...procedurePayload });
    }
  };

  return (
    <div className="flex min-h-full flex-col items-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-900">Novo Agendamento</h1>
          <p className="text-sm text-zinc-400">Preencha os dados do agendamento</p>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="rounded-xl bg-white border border-zinc-100 shadow-sm p-6 space-y-5">
          {/* Patient section */}
          <div className="space-y-3">
            <label className="label mb-0">Paciente *</label>

            <div className="relative" ref={searchContainerRef}>
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                className={`input pl-8 ${formErrors.patientId ? "border-red-400" : ""}`}
                placeholder="Buscar paciente por nome ou CPF..."
                value={patientSearch}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setPatientSearch(val);
                  setShowPatientResults(true);
                  setNoResultsFound(false);
                  setQuickPhone("");
                  setFormErrors((prev) => ({ ...prev, patientId: "" }));
                  if (!val) { setSelectedPatient(null); set("patientId", ""); }
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

            {formErrors.patientId && <p className="mt-0.5 text-xs text-red-500">{formErrors.patientId}</p>}

            {selectedPatient && (
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs text-blue-700">
                <span>Selecionado: {selectedPatient.name}{selectedPatient.cpf ? ` — ${selectedPatient.cpf}` : ""}</span>
                {selectedPatient.cadastroIncompleto && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                    Cadastro incompleto
                  </span>
                )}
              </div>
            )}

            {/* Paciente não encontrado: solicita celular para agendamento rápido */}
            {showQuickPhone && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
                <p className="text-xs font-medium text-amber-800">
                  Paciente não encontrado. Informe o celular para agendar e completar o cadastro depois.
                </p>
                <div>
                  <label className="label">Celular 1 *</label>
                  <input
                    className={`input bg-white ${formErrors.quickPhone ? "border-red-400" : ""}`}
                    placeholder="(00) 00000-0000"
                    value={quickPhone}
                    onChange={(e) => { setQuickPhone(maskPhone(e.target.value)); setFormErrors((prev) => ({ ...prev, quickPhone: "" })); }}
                  />
                  {formErrors.quickPhone && <p className="mt-0.5 text-xs text-red-500">{formErrors.quickPhone}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Doctor */}
          <div>
            <label className="label">Médico *</label>
            <select className={`input ${formErrors.doctorId ? "border-red-400" : ""}`} value={form.doctorId} onChange={(e) => { set("doctorId", e.target.value); setFormErrors((prev) => ({ ...prev, doctorId: "" })); }}>
              <option value="">Selecionar médico...</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {formErrors.doctorId && <p className="mt-0.5 text-xs text-red-500">{formErrors.doctorId}</p>}
          </div>

          {/* Date and time */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Data *</label>
              <input type="date" className={`input ${formErrors.date ? "border-red-400" : ""}`} value={form.date} onChange={(e) => { set("date", e.target.value); setFormErrors((prev) => ({ ...prev, date: "" })); }} />
              {formErrors.date && <p className="mt-0.5 text-xs text-red-500">{formErrors.date}</p>}
            </div>
            <div>
              <label className="label">Horário *</label>
              <input type="time" className={`input ${formErrors.time ? "border-red-400" : ""}`} value={form.time} onChange={(e) => { set("time", e.target.value); setFormErrors((prev) => ({ ...prev, time: "" })); }} />
              {formErrors.time && <p className="mt-0.5 text-xs text-red-500">{formErrors.time}</p>}
            </div>
          </div>

          {/* Category and type */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              value={selectedProcedures}
              onChange={setSelectedProcedures}
            />
          </div>

          {/* Receptionist */}
          <div>
            <label className="label">Recepcionista</label>
            <input className="input bg-zinc-50 text-zinc-500 cursor-not-allowed" value={form.receptionist ?? ""} readOnly />
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

          {createMutation.isError && (
            <p className="text-sm text-red-500">Erro ao criar agendamento. Tente novamente.</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push(`/agenda?date=${form.date}`)}
              className="rounded-lg border border-zinc-200 px-5 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Salvando..." : "Agendar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
