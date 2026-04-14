"use client";

import { useState, useEffect } from "react";
import { X, Printer, ClipboardList, UserCog } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Patient, Appointment } from "@/types/clinic";
import { appointmentService } from "@/services/api";
import { validateCPF, formatCPF } from "@/lib/validation";
import { MARITAL_STATUS, SEX_OPTIONS, RACE_OPTIONS } from "@/lib/constants";
import { AppointmentStatusBadge } from "@/components/agenda/AppointmentStatusBadge";
import { CapaPterigioModal } from "@/components/agenda/CapaPterigioModal";
import { CapaCatarataModal } from "@/components/agenda/CapaCatarataModal";

function calcAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

function formatDate(d?: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
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

interface PatientFormModalProps {
  patient?: Patient;
  onClose: () => void;
  onSave: (data: Omit<Patient, "id"> | Partial<Patient>) => void;
  isSaving?: boolean;
  saveError?: string;
}

const emptyForm = (): Omit<Patient, "id"> => ({
  name: "",
  cpf: "",
  susCard: "",
  birthDate: "",
  maritalStatus: "",
  sex: "",
  race: "",
  naturality: "",
  phone: "",
  phone2: "",
  phoneResidencial: "",
  phoneComercial: "",
  email: "",
  addrStreet: "",
  addrNumber: "",
  addrComplement: "",
  addrNeighborhood: "",
  addrCep: "",
  addrCity: "MANAUS",
  addrUf: "AM",
  reference: "",
  stars: 0,
  personType: "Física",
});

export function PatientFormModal({ patient, onClose, onSave, isSaving, saveError }: PatientFormModalProps) {
  const [activeTab, setActiveTab] = useState<"cadastro" | "historico">("cadastro");
  const [form, setForm] = useState<Omit<Patient, "id">>(emptyForm());
  const [cpfError, setCpfError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [noCpf, setNoCpf] = useState(false);
  const [printAppt, setPrintAppt] = useState<Appointment | null>(null);
  const [printType, setPrintType] = useState<"pterigio" | "catarata" | null>(null);

  // Busca histórico apenas na aba correta e quando editando
  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ["appointments", "patient", patient?.id],
    queryFn: () => appointmentService.findByPatient(patient!.id),
    enabled: !!patient?.id && activeTab === "historico",
    staleTime: 30_000,
  });

  useEffect(() => {
    if (patient) {
      const base = emptyForm();
      const allowed = Object.keys(base) as (keyof typeof base)[];
      const picked = allowed.reduce((acc, key) => {
        if (key in patient) acc[key] = (patient as never)[key];
        return acc;
      }, {} as Partial<typeof base>);
      setForm({ ...base, ...picked });
    } else {
      setForm(emptyForm());
    }
  }, [patient]);

  const set = (key: keyof typeof form, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleCPFBlur = () => {
    if (form.cpf && !validateCPF(form.cpf)) {
      setCpfError("CPF inválido");
    } else {
      setCpfError("");
      if (form.cpf) set("cpf", formatCPF(form.cpf));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.phone?.trim()) newErrors.phone = "Celular é obrigatório";
    if (!noCpf) {
      if (!form.cpf?.trim()) {
        setCpfError("CPF é obrigatório");
        newErrors.cpf = "CPF é obrigatório";
      } else if (!validateCPF(form.cpf)) {
        setCpfError("CPF inválido");
        newErrors.cpf = "CPF inválido";
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    const isIncomplete = !form.cpf || form.cpf.trim() === "";
    const str = (v: unknown) => (v === "" || v === null ? undefined : (v as string));
    const payload = {
      name:             form.name,
      cpf:              str(form.cpf),
      susCard:          str(form.susCard),
      birthDate:        str(form.birthDate),
      maritalStatus:    str(form.maritalStatus),
      sex:              str(form.sex),
      race:             str(form.race),
      naturality:       str(form.naturality),
      phone:            str(form.phone),
      phone2:           str(form.phone2),
      phoneResidencial: str(form.phoneResidencial),
      phoneComercial:   str(form.phoneComercial),
      email:            str(form.email),
      addrStreet:       str(form.addrStreet),
      addrNumber:       str(form.addrNumber),
      addrComplement:   str(form.addrComplement),
      addrNeighborhood: str(form.addrNeighborhood),
      addrCep:          str(form.addrCep),
      addrCity:         str(form.addrCity),
      addrUf:           str(form.addrUf),
      reference:        str(form.reference),
      personType:       str(form.personType),
      stars:            form.stars,
      cadastroIncompleto: isIncomplete,
    };
    onSave(payload as Omit<Patient, "id"> | Partial<Patient>);
  };

  // Injeta dados completos do paciente no agendamento para impressão
  const enrichForPrint = (appt: Appointment): Appointment => ({
    ...appt,
    patient: patient ?? appt.patient,
  });

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="flex w-full max-w-[95vw] flex-col rounded-xl bg-white shadow-xl max-h-[90vh] lg:max-w-5xl">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 shrink-0">
            <h2 className="text-base font-semibold text-zinc-900">
              {patient ? "Editar Paciente" : "Novo Paciente"}
            </h2>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100 text-zinc-500">
              <X size={16} />
            </button>
          </div>

          {/* Tabs — apenas no modo edição */}
          {patient && (
            <div className="flex shrink-0 border-b border-zinc-100 px-6">
              <button
                type="button"
                onClick={() => setActiveTab("cadastro")}
                className={`flex items-center gap-1.5 border-b-2 px-1 py-3 text-sm font-medium transition-colors mr-6 ${
                  activeTab === "cadastro"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <UserCog size={14} />
                Cadastro
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("historico")}
                className={`flex items-center gap-1.5 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "historico"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <ClipboardList size={14} />
                Histórico
                {history.length > 0 && (
                  <span className="ml-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
                    {history.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* ── Aba Cadastro ── */}
          {activeTab === "cadastro" && (
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                const target = e.target as HTMLElement;
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
              className="flex flex-col min-h-0 flex-1"
            >
              <div className="space-y-6 p-6 overflow-y-auto flex-1">

                {/* Dados principais */}
                <section>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Dados Principais</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="col-span-4">
                      <label className="label">Nome Completo *</label>
                      <input
                        className={`input ${errors.name ? "border-red-400" : ""}`}
                        value={form.name}
                        onChange={(e) => { set("name", e.target.value.toUpperCase()); setErrors((prev) => ({ ...prev, name: "" })); }}
                      />
                      {errors.name && <p className="mt-0.5 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="label mb-0">CPF *</label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-zinc-500 select-none">
                          <input
                            type="checkbox"
                            checked={noCpf}
                            onChange={(e) => {
                              setNoCpf(e.target.checked);
                              if (e.target.checked) { set("cpf", ""); setCpfError(""); }
                            }}
                            className="accent-blue-600"
                          />
                          Não possui CPF
                        </label>
                      </div>
                      <input
                        className={`input ${(cpfError || saveError) ? "border-red-400" : ""} ${noCpf ? "bg-zinc-50 text-zinc-400 cursor-not-allowed" : ""}`}
                        value={form.cpf ?? ""}
                        onChange={(e) => { set("cpf", maskCPF(e.target.value)); setCpfError(""); }}
                        onBlur={handleCPFBlur}
                        placeholder={noCpf ? "Não possui CPF" : "000.000.000-00"}
                        disabled={noCpf}
                      />
                      {(cpfError || saveError) && (
                        <p className="mt-0.5 text-xs text-red-500">{cpfError || saveError}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Cartão SUS</label>
                      <input className="input" value={form.susCard ?? ""} onChange={(e) => set("susCard", e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Data de Nascimento</label>
                      <input type="date" className="input" value={form.birthDate ?? ""} onChange={(e) => set("birthDate", e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Idade</label>
                      <input
                        className="input bg-zinc-50 text-zinc-500 cursor-not-allowed"
                        value={form.birthDate ? `${calcAge(form.birthDate) ?? "—"} anos` : ""}
                        readOnly
                        placeholder="—"
                      />
                    </div>
                    <div>
                      <label className="label">Sexo</label>
                      <select className="input" value={form.sex ?? ""} onChange={(e) => set("sex", e.target.value)}>
                        <option value="">Selecionar</option>
                        {SEX_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Estado Civil</label>
                      <select className="input" value={form.maritalStatus ?? ""} onChange={(e) => set("maritalStatus", e.target.value)}>
                        <option value="">Selecionar</option>
                        {MARITAL_STATUS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Raça/Cor</label>
                      <select className="input" value={form.race ?? ""} onChange={(e) => set("race", e.target.value)}>
                        <option value="">Selecionar</option>
                        {RACE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Naturalidade</label>
                      <input className="input" value={form.naturality ?? ""} onChange={(e) => set("naturality", e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Tipo de Pessoa</label>
                      <input className="input" value={form.personType ?? ""} onChange={(e) => set("personType", e.target.value)} />
                    </div>
                  </div>
                </section>

                {/* Contato */}
                <section>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Contato</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="label">Celular 1 *</label>
                      <input
                        className={`input ${errors.phone ? "border-red-400" : ""}`}
                        value={form.phone ?? ""}
                        onChange={(e) => { set("phone", maskPhone(e.target.value)); setErrors((prev) => ({ ...prev, phone: "" })); }}
                        placeholder="(00) 00000-0000"
                      />
                      {errors.phone && <p className="mt-0.5 text-xs text-red-500">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="label">Celular 2</label>
                      <input className="input" value={form.phone2 ?? ""} onChange={(e) => set("phone2", maskPhone(e.target.value))} placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <label className="label">Residencial</label>
                      <input className="input" value={form.phoneResidencial ?? ""} onChange={(e) => set("phoneResidencial", maskPhone(e.target.value))} placeholder="(00) 0000-0000" />
                    </div>
                    <div>
                      <label className="label">Comercial</label>
                      <input className="input" value={form.phoneComercial ?? ""} onChange={(e) => set("phoneComercial", maskPhone(e.target.value))} placeholder="(00) 0000-0000" />
                    </div>
                    <div className="col-span-2">
                      <label className="label">E-mail</label>
                      <input type="email" className="input" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className="label">Referência</label>
                      <input className="input" value={form.reference ?? ""} onChange={(e) => set("reference", e.target.value)} placeholder="Como nos conheceu..." />
                    </div>
                  </div>
                </section>

                {/* Endereço */}
                <section>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Endereço</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="col-span-4">
                      <label className="label">Rua/Avenida</label>
                      <input className="input" value={form.addrStreet ?? ""} onChange={(e) => set("addrStreet", e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <label className="label">Número</label>
                      <input className="input" value={form.addrNumber ?? ""} onChange={(e) => set("addrNumber", e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <label className="label">Complemento</label>
                      <input className="input" value={form.addrComplement ?? ""} onChange={(e) => set("addrComplement", e.target.value)} />
                    </div>
                    <div className="col-span-3">
                      <label className="label">Bairro</label>
                      <input className="input" value={form.addrNeighborhood ?? ""} onChange={(e) => set("addrNeighborhood", e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <label className="label">CEP</label>
                      <input className="input" value={form.addrCep ?? ""} onChange={(e) => set("addrCep", e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <label className="label">UF</label>
                      <input className="input" maxLength={2} value={form.addrUf ?? ""} onChange={(e) => set("addrUf", e.target.value.toUpperCase())} />
                    </div>
                    <div className="col-span-1">
                      <label className="label">Cidade</label>
                      <input className="input" value={form.addrCity ?? ""} onChange={(e) => set("addrCity", e.target.value)} />
                    </div>
                  </div>
                </section>
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-100 px-6 py-4 shrink-0">
                <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || Object.values(errors).some((v) => v !== "") || !!cpfError}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? "Salvando..." : patient ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </form>
          )}

          {/* ── Aba Histórico ── */}
          {activeTab === "historico" && (
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {historyLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                  <ClipboardList size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">Nenhum agendamento encontrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((appt) => (
                    <div
                      key={appt.id}
                      className="rounded-xl border border-zinc-100 bg-white px-4 py-3 shadow-sm"
                    >
                      {/* Linha principal */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="font-mono text-sm font-semibold text-zinc-700">
                          {formatDate(appt.date)}
                        </span>
                        <span className="text-xs text-zinc-400">{appt.time}</span>
                        <span className="text-sm text-zinc-700">{appt.doctor?.name ?? "—"}</span>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                          {appt.type}
                        </span>
                        {appt.category && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                            {appt.category}
                          </span>
                        )}
                        <AppointmentStatusBadge status={appt.status} />
                      </div>

                      {/* Procedimento / Obs */}
                      {(appt.procedureName || appt.obsAgenda) && (
                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-zinc-400">
                          {appt.procedureName && (
                            <span>
                              <span className="font-medium text-zinc-500">Proc.: </span>
                              {appt.procedureName}
                            </span>
                          )}
                          {appt.obsAgenda && (
                            <span>
                              <span className="font-medium text-zinc-500">Obs.: </span>
                              {appt.obsAgenda}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Botões de impressão — filtrados pelo procedimento */}
                      {(() => {
                        const proc = appt.procedureName?.toLowerCase() ?? "";
                        const showPterigio = !proc || proc.includes("pter");
                        const showCatarata = !proc || proc.includes("catar");
                        return (
                          <div className="mt-2.5 flex gap-2 border-t border-zinc-50 pt-2.5">
                            {showPterigio && (
                              <button
                                type="button"
                                onClick={() => { setPrintAppt(enrichForPrint(appt)); setPrintType("pterigio"); }}
                                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                              >
                                <Printer size={12} />
                                Capa Pterígio
                              </button>
                            )}
                            {showCatarata && (
                              <button
                                type="button"
                                onClick={() => { setPrintAppt(enrichForPrint(appt)); setPrintType("catarata"); }}
                                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                              >
                                <Printer size={12} />
                                Capa Catarata
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modais de impressão */}
      {printAppt && printType === "pterigio" && (
        <CapaPterigioModal
          appointment={printAppt}
          onClose={() => { setPrintAppt(null); setPrintType(null); }}
        />
      )}
      {printAppt && printType === "catarata" && (
        <CapaCatarataModal
          appointment={printAppt}
          onClose={() => { setPrintAppt(null); setPrintType(null); }}
        />
      )}
    </>
  );
}
