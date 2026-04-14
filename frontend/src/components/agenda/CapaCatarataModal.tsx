"use client";

import { X, Printer } from "lucide-react";
import type { Appointment } from "@/types/clinic";

interface Props {
  appointment: Appointment;
  onClose: () => void;
}

function calcAge(birthDate?: string): string {
  if (!birthDate) return "______";
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? String(age) : "______";
}

function formatDate(d?: string): string {
  if (!d) return "___/___/______";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

// Valor inline: preenchido sem linha, vazio com linha
const V = (v?: string, minWidth?: string) => {
  const s = v?.trim() ?? "";
  const style = minWidth ? ` style="min-width:${minWidth}"` : "";
  return s
    ? `<span class="val filled">${s}</span>`
    : `<span class="val"${style}>&nbsp;</span>`;
};

// Data inline
const VD = (d?: string, minWidth = "95px") =>
  d
    ? `<span class="val filled">${formatDate(d)}</span>`
    : `<span class="val" style="min-width:${minWidth}">&nbsp;</span>`;

// Checkbox quadrado vazio — igual ao Pterígio
const CB = () => `<span class="cb"></span>`;

export function CapaCatarataModal({ appointment, onClose }: Props) {
  const p = appointment.patient;
  const age = calcAge(p?.birthDate);
  const hasAge = !!p?.birthDate;

  const sex = p?.sex?.toLowerCase() ?? "";
  const sexLabel = sex.includes("masc") ? "M" : sex.includes("fem") ? "F" : "___";

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=750");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Boletim de Triagem Pré Operatória — Catarata</title>
<style>
  @page { size: A4 portrait; margin: 10mm 15mm 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Arial, sans-serif;
    font-size: 11.5px;
    color: #000;
    min-height: 277mm;
    display: flex;
    flex-direction: column;
  }

  .page {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .title {
    text-align: center;
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 5px;
    flex-shrink: 0;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4px;
    flex-shrink: 0;
  }

  .section-title {
    font-weight: bold;
    font-size: 11.5px;
    text-align: center;
    margin-bottom: 4px;
    flex-shrink: 0;
  }

  /* Caixas com borda */
  .box {
    border: 1.5px solid #000;
    margin-bottom: 4px;
    flex-shrink: 0;
  }

  /* A caixa de anamnese cresce para preencher o espaço restante */
  .box.grow {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-bottom: 0;
  }

  .box-row {
    padding: 5px 8px;
    border-bottom: 1px solid #000;
    line-height: 1.6;
    flex: 1;
  }
  .box-row:last-child {
    border-bottom: none;
  }

  .box-row.center {
    text-align: center;
    font-weight: bold;
    font-size: 12px;
  }

  .box-row.sinais {
    text-align: center;
    font-weight: bold;
    text-decoration: underline;
    font-size: 11.5px;
  }

  .box-row.flex-spaced {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Campos com linha (vazio) ou sem linha (preenchido) */
  .val {
    display: inline-block;
    border-bottom: 1px solid #000;
    min-width: 60px;
    padding-bottom: 1px;
    vertical-align: baseline;
  }
  .val.filled {
    border-bottom: none;
    padding-left: 3px;
  }

  .bold { font-weight: bold; }

  /* Checkboxes quadrados — igual ao Pterígio */
  .cb {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 13px;
    height: 13px;
    border: 1.5px solid #000;
    vertical-align: middle;
    margin: 0 2px 2px 2px;
    flex-shrink: 0;
    font-size: 10px;
    font-weight: bold;
    line-height: 1;
  }
  .cb-checked {
    background: #000;
    color: #fff;
  }

  /* Linha de observações */
  .obs-row {
    display: flex;
    align-items: baseline;
    margin-top: 4px;
    flex-shrink: 0;
  }
  .obs-line {
    flex: 1;
    border-bottom: 1px solid #000;
    height: 14px;
    margin-left: 4px;
  }
</style>
</head><body>
<div class="page">

<div class="title">BOLETIM DE TRIAGEM PRÉ OPERATÓRIA</div>

<!-- Cabeçalho -->
<div class="header-row">
  <span><span class="bold">DATA:</span> ${VD(appointment.date, "90px")}</span>
  <span style="font-size:17px; font-weight:bold;">${appointment.category ?? "SUS"}</span>
  <span style="font-size:15px;"><span class="bold">OLHO:</span> <span class="val" style="min-width:30px; font-size:24px; font-weight:bold; border-bottom:none;">&nbsp;</span></span>
</div>

<!-- Título da seção -->
<div class="section-title">INFORMAÇÕES PESSOAIS DO PACIENTE</div>

<!-- Dados do paciente -->
<div class="box">
  <div class="box-row">
    <span class="bold">NOME:</span>
    <span style="font-size:12px; font-weight:bold; padding-left:4px;">${p?.name ?? ""}</span>
  </div>
  <div class="box-row">
    <span class="bold">SEXO:</span> ${sexLabel}
    &nbsp;&nbsp;&nbsp;
    <span class="bold">DATA DO NASCIMENTO:</span> ${hasAge ? `<span class="val filled">${formatDate(p?.birthDate)}</span>` : `<span class="val" style="min-width:100px">&nbsp;</span>`}
    &nbsp;&nbsp;&nbsp;
    <span class="bold">IDADE:</span> ${hasAge ? `<span class="val filled">${age}</span>` : `<span class="val" style="min-width:45px">&nbsp;</span>`} Anos
  </div>
  <div class="box-row">
    <span class="bold">TEL.:</span> ${V(p?.phone, "150px")}
  </div>
  <div class="box-row">
    <span class="bold">NOME DO ACOMPANHANTE:</span>
  </div>
</div>

<!-- Anamnese (cresce para preencher a página) -->
<div class="box grow">
  <div class="box-row center">ANAMNESE</div>

  <div class="box-row">${CB()} 1ª &nbsp; ou &nbsp; ${CB()} 2ª cirurgia de Catarata</div>
  <div class="box-row"><span class="bold">Olho que vai operar:</span> ${CB()} Direito &nbsp; ${CB()} Esquerdo</div>
  <div class="box-row"><span class="bold">É Diabético</span> ${CB()} Sim &nbsp; ${CB()} Não</div>
  <div class="box-row"><span class="bold">Encontra-se em jejum</span> ${CB()} Sim &nbsp; ${CB()} Não, me alimentei às <span class="val" style="min-width:90px">&nbsp;</span> Horas.</div>
  <div class="box-row"><span class="bold">É Hipertenso</span> ${CB()} Sim &nbsp; ${CB()} Não</div>
  <div class="box-row"><span class="bold">Faz uso de AAS?</span> ${CB()} Sim. Última vez que tomou: <span class="val" style="min-width:160px">&nbsp;</span> ${CB()} Não</div>
  <div class="box-row"><span class="bold">Faz uso de DIAMOX?</span> ${CB()} Sim. Última vez que tomou: <span class="val" style="min-width:150px">&nbsp;</span> ${CB()} Não</div>
  <div class="box-row"><span class="bold">É Fumante?</span> ${CB()} Sim &nbsp; ${CB()} Não</div>
  <div class="box-row"><span class="bold">Ingere bebida alcoólica?</span> ${CB()} Sim. Com que frequência? <span class="val" style="min-width:120px">&nbsp;</span> ${CB()} Não</div>
  <div class="box-row"><span class="bold">Encontra-se Gripado ou com tosse?</span> ${CB()} Sim &nbsp; ${CB()} Não</div>
  <div class="box-row"><span class="bold">Possui alguma Deficiência Física ou Mental?</span> ${CB()} Sim. Qual? <span class="val" style="min-width:100px">&nbsp;</span> ${CB()} Não</div>
  <div class="box-row"><span class="bold">Tem dificuldade para Ouvir?</span> ${CB()} Sim &nbsp; ${CB()} Não</div>
  <div class="box-row"><span class="bold">Tem dificuldade para Falar?</span> ${CB()} Sim &nbsp; ${CB()} Não</div>
  <div class="box-row"><span class="bold">Tem alergia a algum medicamento?</span> ${CB()} Sim. Qual? <span class="val" style="min-width:110px">&nbsp;</span> ${CB()} Não</div>

  <div class="box-row sinais">SINAIS VITAIS</div>

  <div class="box-row">
    <span class="bold">Pressão Arterial</span>
    <span class="val" style="min-width:45px">&nbsp;</span> X <span class="val" style="min-width:45px">&nbsp;</span> mmhg
    &nbsp; Horário: <span class="val" style="min-width:35px">&nbsp;</span> : <span class="val" style="min-width:35px">&nbsp;</span>
    &nbsp; FC.: <span class="val" style="min-width:35px">&nbsp;</span>
  </div>
  <div class="box-row flex-spaced">
    <span><span class="bold">Administrado Frontal?</span> ${CB()} Sim</span>
    <span>Horário: <span class="val" style="min-width:35px">&nbsp;</span> : <span class="val" style="min-width:35px">&nbsp;</span></span>
    <span>${CB()} Não</span>
  </div>
  <div class="box-row flex-spaced">
    <span><span class="bold">Administrado Diamox?</span> ${CB()} Sim</span>
    <span>Horário: <span class="val" style="min-width:35px">&nbsp;</span> : <span class="val" style="min-width:35px">&nbsp;</span></span>
    <span>${CB()} Não</span>
  </div>
  <div class="box-row">
    <span class="bold">DEXTRO:</span>
    <span class="val" style="min-width:70px">&nbsp;</span> mg/dl
    &nbsp; ${CB()} Em Jejum &nbsp; ${CB()} Pós-Jejum
    &nbsp; às <span class="val" style="min-width:80px">&nbsp;</span>
  </div>
  <div class="box-row">
    <span class="bold">DEXTRO:</span>
    <span class="val" style="min-width:70px">&nbsp;</span> mg/dl
    &nbsp; ${CB()} Em Jejum &nbsp; ${CB()} Pós-Jejum
    &nbsp; às <span class="val" style="min-width:80px">&nbsp;</span>
  </div>
</div>

<!-- Observações (fora da caixa) -->
<div style="flex-shrink:0; margin-top:10px;">
  <div style="display:flex; align-items:baseline;">
    <span class="bold">Observações:</span>
    <span style="flex:1; border-bottom:1px solid #000; margin-left:4px;"></span>
  </div>
  <div style="border-bottom:1px solid #000; height:22px;"></div>
  <div style="border-bottom:1px solid #000; height:22px;"></div>
</div>

</div>
</body></html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 shrink-0">
          <h2 className="text-base font-semibold text-zinc-900">Capa Catarata — Boletim de Triagem</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
            >
              <Printer size={13} /> Imprimir
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100 text-zinc-500">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-500 space-y-1">
            <p className="font-medium text-zinc-700">Pré-visualização dos dados preenchidos:</p>
            <p><strong>Paciente:</strong> {p?.name ?? "—"}</p>
            <p><strong>Data do agendamento:</strong> {formatDate(appointment.date)}</p>
            <p><strong>Nascimento:</strong> {formatDate(p?.birthDate)} &nbsp;|&nbsp; <strong>Idade:</strong> {age}</p>
            <p><strong>Sexo:</strong> {p?.sex ?? "—"}</p>
            <p><strong>Celular:</strong> {p?.phone ?? "—"}</p>
            <p><strong>Procedência:</strong> {appointment.category ?? "—"}</p>
            <p className="pt-2 text-zinc-400">Clique em "Imprimir" para abrir o formulário completo em uma nova janela.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
