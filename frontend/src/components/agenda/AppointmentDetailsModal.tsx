"use client";

import { useState, useEffect } from "react";
import { X, Printer } from "lucide-react";
import { CapaPterigioModal } from "./CapaPterigioModal";
import { CapaCatarataModal } from "./CapaCatarataModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Appointment, Patient } from "@/types/clinic";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { patientService } from "@/services/api";
import { validateCPF, formatCPF } from "@/lib/validation";
import { MARITAL_STATUS, SEX_OPTIONS, RACE_OPTIONS } from "@/lib/constants";

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.replace(/^(\d{3})(\d{0,3})/, "$1.$2");
  if (digits.length <= 9) return digits.replace(/^(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.replace(/^(\d{0,2})/, "($1");
  if (digits.length <= 6) return digits.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
  if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

const emptyPatientForm = () => ({
  name: "", cpf: "", susCard: "", birthDate: "", maritalStatus: "",
  sex: "", race: "", naturality: "", phone: "", phone2: "",
  phoneResidencial: "", phoneComercial: "", email: "",
  addrStreet: "", addrNumber: "", addrComplement: "", addrNeighborhood: "",
  addrCep: "", addrCity: "MANAUS", addrUf: "AM", reference: "",
  stars: 0, personType: "Física",
});

export function AppointmentDetailsModal({ appointment, onClose }: AppointmentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"agendamento" | "paciente">("agendamento");
  const [patientForm, setPatientForm] = useState(emptyPatientForm());
  const [cpfError, setCpfError] = useState("");
  const [showPterigio, setShowPterigio] = useState(false);
  const [showCatarata, setShowCatarata] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (appointment?.patient) {
      const p = appointment.patient;
      const base = emptyPatientForm();
      const allowed = Object.keys(base) as (keyof typeof base)[];
      const picked = allowed.reduce((acc, key) => {
        if (key in p) acc[key] = (p as never)[key] ?? (base as never)[key];
        return acc;
      }, {} as typeof base);
      setPatientForm({ ...base, ...picked });
    }
    setActiveTab("agendamento");
    setCpfError("");
  }, [appointment]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) =>
      patientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  if (!appointment) return null;

  const p = appointment.patient;
  const d = appointment.doctor;

  const procedureCodes = (appointment.procedureCode ?? "").split(",").map((c) => parseInt(c.trim()));
  const hasPterigio = procedureCodes.some((c) => c === 4);
  const hasCatarata = procedureCodes.some((c) => c === 37);

  const setP = (key: keyof typeof patientForm, val: unknown) =>
    setPatientForm((f) => ({ ...f, [key]: val }));

  const handleCPFBlur = () => {
    if (patientForm.cpf && !validateCPF(patientForm.cpf)) {
      setCpfError("CPF inválido");
    } else {
      setCpfError("");
      if (patientForm.cpf) setP("cpf", formatCPF(patientForm.cpf));
    }
  };

  const handlePatientSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientForm.cpf && !validateCPF(patientForm.cpf)) {
      setCpfError("CPF inválido");
      return;
    }
    if (!p?.id) return;
    const isIncomplete = !patientForm.cpf || patientForm.cpf.trim() === "";
    const str = (v: unknown) => (v === "" || v === null ? undefined : (v as string));
    const payload = {
      name:             patientForm.name,
      cpf:              str(patientForm.cpf),
      susCard:          str(patientForm.susCard),
      birthDate:        str(patientForm.birthDate),
      maritalStatus:    str(patientForm.maritalStatus),
      sex:              str(patientForm.sex),
      race:             str(patientForm.race),
      naturality:       str(patientForm.naturality),
      phone:            str(patientForm.phone),
      phone2:           str(patientForm.phone2),
      phoneResidencial: str(patientForm.phoneResidencial),
      phoneComercial:   str(patientForm.phoneComercial),
      email:            str(patientForm.email),
      addrStreet:       str(patientForm.addrStreet),
      addrNumber:       str(patientForm.addrNumber),
      addrComplement:   str(patientForm.addrComplement),
      addrNeighborhood: str(patientForm.addrNeighborhood),
      addrCep:          str(patientForm.addrCep),
      addrCity:         str(patientForm.addrCity),
      addrUf:           str(patientForm.addrUf),
      reference:        str(patientForm.reference),
      personType:       str(patientForm.personType),
      stars:            patientForm.stars,
      cadastroIncompleto: isIncomplete,
    };
    updateMutation.mutate({ id: p.id, data: payload });
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-[95vw] flex-col rounded-xl bg-white shadow-xl max-h-[90vh] lg:max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Detalhes do Agendamento</h2>
            <p className="text-xs text-zinc-400">{p?.name ?? ""}</p>
          </div>
          <div className="flex gap-2">
            {hasPterigio && (
              <button
                onClick={() => setShowPterigio(true)}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-100"
              >
                <Printer size={13} /> Capa Pterígio
              </button>
            )}
            {hasCatarata && (
              <button
                onClick={() => setShowCatarata(true)}
                className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-100"
              >
                <Printer size={13} /> Capa Catarata
              </button>
            )}
            {!hasPterigio && !hasCatarata && (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
              >
                <Printer size={13} /> Imprimir
              </button>
            )}
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100 text-zinc-500">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-zinc-100 px-6 shrink-0">
          {(["agendamento", "paciente"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {tab === "agendamento" ? "Agendamento" : "Cadastro do Paciente"}
            </button>
          ))}
        </div>

        {/* Tab: Agendamento */}
        {activeTab === "agendamento" && (
          <div className="overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <AppointmentStatusBadge status={appointment.status} />
              <span className="text-xs text-zinc-400">#{appointment.id.slice(-6).toUpperCase()}</span>
            </div>

            <div className="rounded-lg bg-zinc-50 p-3 space-y-1">
              <p className="text-[11px] font-medium uppercase text-zinc-400">Paciente</p>
              <p className="font-semibold text-zinc-900">{p?.name ?? "—"}</p>
              <div className="flex gap-4 text-xs text-zinc-500">
                <span>CPF: {p?.cpf ?? "—"}</span>
                {p?.susCard && <span>CNS: {p.susCard}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Data" value={formatDate(appointment.date)} />
              <Field label="Horário" value={appointment.time} />
              <Field label="Médico" value={d?.name ?? "—"} />
              <Field label="Tipo" value={appointment.type} />
              <Field label="Categoria" value={appointment.category} />
              {appointment.procedureName && (
                <Field label="Procedimento" value={`${appointment.procedureCode} - ${appointment.procedureName}`} />
              )}
              {appointment.receptionist && (
                <Field label="Recepcionista" value={appointment.receptionist} />
              )}
              {appointment.value > 0 && (
                <Field label="Valor" value={`R$ ${appointment.value.toFixed(2)}`} />
              )}
            </div>

            {appointment.obsAgenda && (
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase text-zinc-400">Obs. Agenda</p>
                <p className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700">{appointment.obsAgenda}</p>
              </div>
            )}
            {appointment.obsTratamento && (
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase text-zinc-400">Obs. Tratamento</p>
                <p className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700">{appointment.obsTratamento}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Paciente */}
        {activeTab === "paciente" && (
          <form onSubmit={handlePatientSave} className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto p-6 space-y-6">

              {/* Dados Principais */}
              <section>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Dados Principais</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="col-span-4">
                    <label className="label">Nome Completo *</label>
                    <input className="input" required value={patientForm.name} onChange={(e) => setP("name", e.target.value.toUpperCase())} />
                  </div>
                  <div>
                    <label className="label">CPF</label>
                    <input
                      className={`input ${cpfError ? "border-red-400" : ""}`}
                      value={patientForm.cpf ?? ""}
                      onChange={(e) => { setP("cpf", maskCPF(e.target.value)); setCpfError(""); }}
                      onBlur={handleCPFBlur}
                      placeholder="000.000.000-00"
                    />
                    {cpfError && <p className="mt-0.5 text-xs text-red-500">{cpfError}</p>}
                  </div>
                  <div>
                    <label className="label">Cartão SUS</label>
                    <input className="input" value={patientForm.susCard ?? ""} onChange={(e) => setP("susCard", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Data de Nascimento</label>
                    <input type="date" className="input" value={patientForm.birthDate ?? ""} onChange={(e) => setP("birthDate", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Sexo</label>
                    <select className="input" value={patientForm.sex ?? ""} onChange={(e) => setP("sex", e.target.value)}>
                      <option value="">Selecionar</option>
                      {SEX_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Estado Civil</label>
                    <select className="input" value={patientForm.maritalStatus ?? ""} onChange={(e) => setP("maritalStatus", e.target.value)}>
                      <option value="">Selecionar</option>
                      {MARITAL_STATUS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Raça/Cor</label>
                    <select className="input" value={patientForm.race ?? ""} onChange={(e) => setP("race", e.target.value)}>
                      <option value="">Selecionar</option>
                      {RACE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Naturalidade</label>
                    <input className="input" value={patientForm.naturality ?? ""} onChange={(e) => setP("naturality", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Tipo de Pessoa</label>
                    <input className="input" value={patientForm.personType ?? ""} onChange={(e) => setP("personType", e.target.value)} />
                  </div>
                </div>
              </section>

              {/* Contato */}
              <section>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Contato</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="label">Celular 1</label>
                    <input className="input" value={patientForm.phone ?? ""} onChange={(e) => setP("phone", maskPhone(e.target.value))} placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <label className="label">Celular 2</label>
                    <input className="input" value={patientForm.phone2 ?? ""} onChange={(e) => setP("phone2", maskPhone(e.target.value))} placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <label className="label">Residencial</label>
                    <input className="input" value={patientForm.phoneResidencial ?? ""} onChange={(e) => setP("phoneResidencial", maskPhone(e.target.value))} placeholder="(00) 0000-0000" />
                  </div>
                  <div>
                    <label className="label">Comercial</label>
                    <input className="input" value={patientForm.phoneComercial ?? ""} onChange={(e) => setP("phoneComercial", maskPhone(e.target.value))} placeholder="(00) 0000-0000" />
                  </div>
                  <div className="col-span-2">
                    <label className="label">E-mail</label>
                    <input type="email" className="input" value={patientForm.email ?? ""} onChange={(e) => setP("email", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Referência</label>
                    <input className="input" value={patientForm.reference ?? ""} onChange={(e) => setP("reference", e.target.value)} />
                  </div>
                </div>
              </section>

              {/* Endereço */}
              <section>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Endereço</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                  <div className="col-span-4">
                    <label className="label">Rua/Avenida</label>
                    <input className="input" value={patientForm.addrStreet ?? ""} onChange={(e) => setP("addrStreet", e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <label className="label">Número</label>
                    <input className="input" value={patientForm.addrNumber ?? ""} onChange={(e) => setP("addrNumber", e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <label className="label">Complemento</label>
                    <input className="input" value={patientForm.addrComplement ?? ""} onChange={(e) => setP("addrComplement", e.target.value)} />
                  </div>
                  <div className="col-span-3">
                    <label className="label">Bairro</label>
                    <input className="input" value={patientForm.addrNeighborhood ?? ""} onChange={(e) => setP("addrNeighborhood", e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <label className="label">CEP</label>
                    <input className="input" value={patientForm.addrCep ?? ""} onChange={(e) => setP("addrCep", e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <label className="label">UF</label>
                    <input className="input" maxLength={2} value={patientForm.addrUf ?? ""} onChange={(e) => setP("addrUf", e.target.value.toUpperCase())} />
                  </div>
                  <div className="col-span-1">
                    <label className="label">Cidade</label>
                    <input className="input" value={patientForm.addrCity ?? ""} onChange={(e) => setP("addrCity", e.target.value)} />
                  </div>
                </div>
              </section>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4 shrink-0">
              {updateMutation.isSuccess && (
                <p className="text-xs text-emerald-600 font-medium">Cadastro atualizado com sucesso.</p>
              )}
              {updateMutation.isError && (
                <p className="text-xs text-red-500">Erro ao salvar. Tente novamente.</p>
              )}
              {!updateMutation.isSuccess && !updateMutation.isError && <span />}
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">
                  Fechar
                </button>
                <button type="submit" disabled={updateMutation.isPending} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {updateMutation.isPending ? "Salvando..." : "Salvar Cadastro"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>

    {showPterigio && (
      <CapaPterigioModal appointment={appointment} onClose={() => setShowPterigio(false)} />
    )}
    {showCatarata && (
      <CapaCatarataModal appointment={appointment} onClose={() => setShowCatarata(false)} />
    )}
  </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase text-zinc-400">{label}</p>
      <p className="text-sm text-zinc-800">{value}</p>
    </div>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}
