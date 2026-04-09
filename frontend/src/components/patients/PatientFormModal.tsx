"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Patient } from "@/types/clinic";
import { validateCPF, formatCPF } from "@/lib/validation";
import { MARITAL_STATUS, SEX_OPTIONS, RACE_OPTIONS } from "@/lib/constants";

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

export function PatientFormModal({ patient, onClose, onSave, isSaving }: PatientFormModalProps) {
  const [form, setForm] = useState<Omit<Patient, "id">>(emptyForm());
  const [cpfError, setCpfError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (form.cpf && !validateCPF(form.cpf)) {
      setCpfError("CPF inválido");
      newErrors.cpf = "CPF inválido";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-[95vw] flex-col rounded-xl bg-white shadow-xl max-h-[90vh] lg:max-w-5xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 shrink-0">
          <h2 className="text-base font-semibold text-zinc-900">
            {patient ? "Editar Paciente" : "Novo Paciente"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100 text-zinc-500">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="space-y-6 p-6">

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
                  <label className="label">CPF</label>
                  <input
                    className={`input ${cpfError ? "border-red-400" : ""}`}
                    value={form.cpf ?? ""}
                    onChange={(e) => { set("cpf", maskCPF(e.target.value)); setCpfError(""); }}
                    onBlur={handleCPFBlur}
                    placeholder="000.000.000-00"
                  />
                  {cpfError && <p className="mt-0.5 text-xs text-red-500">{cpfError}</p>}
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
            <button type="submit" disabled={isSaving || Object.values(errors).some((v) => v !== "") || !!cpfError} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isSaving ? "Salvando..." : patient ? "Salvar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
