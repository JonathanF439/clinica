"use client";

import { useRef } from "react";
import { X, Printer } from "lucide-react";
import type { Appointment } from "@/types/clinic";

interface Props {
  appointment: Appointment;
  onClose: () => void;
}

function calcAge(birthDate?: string): string {
  if (!birthDate) return "___";
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? String(age) : "___";
}

function formatDate(d?: string): string {
  if (!d) return "___/___/______";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

const LINE = (n = 30) => "_".repeat(n);
const CB = () => "( )";

export function CapaCatarataModal({ appointment, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const p = appointment.patient;

  const sexLabel = p?.sex?.toLowerCase().includes("masc") ? "M" : p?.sex?.toLowerCase().includes("fem") ? "F" : "___";

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const win = window.open("", "_blank", "width=900,height=750");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Boletim de Triagem Pré Operatória — Catarata</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; color: #000; }
  h2 { text-align: center; font-size: 13px; font-weight: bold; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; }
  td, th { border: 1px solid #000; padding: 4px 6px; font-size: 11px; }
  .no-border td { border: none; }
  .section { font-weight: bold; text-align: center; background: #f0f0f0; }
  .bold { font-weight: bold; }
  .row { display: flex; gap: 20px; margin-bottom: 4px; flex-wrap: wrap; align-items: baseline; }
  u { text-decoration: none; border-bottom: 1px solid #000; display: inline-block; min-width: 60px; }
  @media print { body { padding: 8px; } button { display: none; } }
</style>
</head><body>
${el.innerHTML}
</body></html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl max-h-[90vh]">

        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 shrink-0">
          <h2 className="text-base font-semibold text-zinc-900">Capa Catarata — Boletim de Triagem</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700">
              <Printer size={13} /> Imprimir
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100 text-zinc-500">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6">
          <div ref={printRef} className="font-mono text-[11px] bg-white border border-zinc-200 rounded-lg p-4 leading-relaxed space-y-1">

            <h2 style={{ textAlign: "center", fontWeight: "bold", fontSize: "13px", marginBottom: "8px", fontFamily: "Arial" }}>
              BOLETIM DE TRIAGEM PRÉ OPERATÓRIA
            </h2>

            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span><strong>DATA:</strong> {formatDate(appointment.date)}</span>
              <span><strong>{appointment.category}</strong></span>
              <span><strong>OLHO:</strong> <u>&nbsp;&nbsp;&nbsp;&nbsp;</u></span>
            </div>

            {/* FACO + Categoria */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontWeight: "bold", fontSize: "16px" }}>FACO</span>
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>{appointment.category}</span>
            </div>

            {/* Informações pessoais */}
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginBottom: "8px" }}>
              <tbody>
                <tr>
                  <td colSpan={3} style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "center", fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                    INFORMAÇÕES PESSOAIS DO PACIENTE
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                    <strong>NOME:</strong> {p?.name ?? LINE(50)}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}><strong>SEXO:</strong> {sexLabel}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}><strong>DATA DO NASCIMENTO:</strong> {formatDate(p?.birthDate)}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}><strong>IDADE:</strong> {calcAge(p?.birthDate)} Anos</td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                    <strong>TEL.:</strong> {p?.phone ?? LINE(20)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                    <strong>NOME DO ACOMPANHANTE:</strong> {LINE(45)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Anamnese */}
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
              <tbody>
                <tr>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "center", fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                    ANAMNESE
                  </td>
                </tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  {CB()} 1ª &nbsp;&nbsp; ou &nbsp;&nbsp; {CB()} 2ª cirurgia de Catarata
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  <strong>Olho que vai operar:</strong> {CB()} Direito &nbsp;&nbsp; {CB()} Esquerdo
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  <strong>É Diabético?</strong> {CB()} Sim &nbsp;&nbsp; {CB()} Não
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  <strong>Encontra-se em jejum?</strong> {CB()} Sim &nbsp;&nbsp; {CB()} Não, me alimentei às <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> Horas.
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  <strong>É Hipertenso (Pressão alta)?</strong> {CB()} Sim &nbsp;&nbsp; {CB()} Não
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  <strong>Faz uso de AAS?</strong> {CB()} Sim. Última vez que tomou: <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> {CB()} Não
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  <strong>Faz uso de DIAMOX?</strong> {CB()} Sim. Última vez que tomou: <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> {CB()} Não
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  <strong>É Fumante?</strong> {CB()} Sim &nbsp;&nbsp; {CB()} Não
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  <strong>Ingere bebida alcoólica?</strong> {CB()} Sim. Com que frequência? <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> {CB()} Não
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  <strong>Encontra-se Gripado ou com tosse?</strong> {CB()} Sim &nbsp;&nbsp; {CB()} Não
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  <strong>Possui alguma Deficiência Física ou Mental?</strong> {CB()} Sim. Qual? <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> {CB()} Não
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  <strong>Tem dificuldade para Ouvir?</strong> {CB()} Sim &nbsp;&nbsp; {CB()} Não
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  <strong>Tem dificuldade para Falar?</strong> {CB()} Sim &nbsp;&nbsp; {CB()} Não
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  <strong>Tem alergia a algum medicamento?</strong> {CB()} Sim. Qual? <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> {CB()} Não
                </td></tr>

                {/* Sinais vitais */}
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "center", fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                  SINAIS VITAIS (Espaço destinado à Equipe de Enfermagem)
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  1. Pressão Arterial <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> X <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> mmhg &nbsp;&nbsp; Horário: <u>&nbsp;&nbsp;&nbsp;&nbsp;</u> : <u>&nbsp;&nbsp;&nbsp;&nbsp;</u> &nbsp;&nbsp; P.: <u>&nbsp;&nbsp;&nbsp;&nbsp;</u>
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  Administrado Frontal? {CB()} Sim &nbsp;&nbsp; Horário: <u>&nbsp;&nbsp;&nbsp;&nbsp;</u> : <u>&nbsp;&nbsp;&nbsp;&nbsp;</u> &nbsp;&nbsp; {CB()} Não
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  Administrado Diamox? {CB()} Sim &nbsp;&nbsp; Horário: <u>&nbsp;&nbsp;&nbsp;&nbsp;</u> : <u>&nbsp;&nbsp;&nbsp;&nbsp;</u> &nbsp;&nbsp; {CB()} Não
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  2. DEXTRO: <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> mg/dl &nbsp; {CB()} Em Jejum &nbsp; {CB()} Pós-Jejum &nbsp; Temp.: <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>
                </td></tr>
                <tr><td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>
                  <strong>Observações:</strong> <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>
                </td></tr>
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </div>
  );
}
