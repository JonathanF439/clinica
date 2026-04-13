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

// Valor: se preenchido mostra texto sem linha; se vazio mostra linha CSS
const V = (v?: string, minWidth?: string) => {
  const s = v?.trim() ?? "";
  const style = minWidth ? ` style="min-width:${minWidth}"` : "";
  return s
    ? `<span class="val filled">${s}</span>`
    : `<span class="val"${style}>&nbsp;</span>`;
};

// Data: se preenchida sem linha; se vazia com linha
const VD = (d?: string, minWidth = "95px") =>
  d
    ? `<span class="val filled">${formatDate(d)}</span>`
    : `<span class="val" style="min-width:${minWidth}">&nbsp;</span>`;

// Checkbox quadrado — usa ✓ dentro do box para garantir render na impressão
const CB = (checked: boolean) =>
  checked
    ? `<span class="cb cb-checked">✓</span>`
    : `<span class="cb"></span>`;

export function CapaPterigioModal({ appointment, onClose }: Props) {
  const p = appointment.patient;
  const age = calcAge(p?.birthDate);
  const hasAge = !!p?.birthDate;
  const addr = [p?.addrStreet, p?.addrNumber ? `nº ${p.addrNumber}` : "", p?.addrNeighborhood]
    .filter(Boolean)
    .join(", ");

  // Sexo — case-insensitive
  const sex = p?.sex?.toLowerCase() ?? "";
  const isMasc = sex.includes("masc");
  const isFem  = sex.includes("fem");

  // Raça — case-insensitive
  const race = p?.race?.toLowerCase() ?? "";
  const isBranca  = race === "branca";
  const isAmarela = race === "amarela";
  const isParda   = race === "parda";
  const isPreta   = race === "preta";

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=750");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Setor de Cirurgia — Pterígio</title>
<style>
  @page { size: A4 portrait; margin: 7mm 15mm 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Arial, sans-serif;
    font-size: 13px;
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

  h1 {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 2px;
    padding-bottom: 5px;
    border-bottom: 2.5px solid #000;
    margin-bottom: 6px;
    flex-shrink: 0;
  }

  /* Blocos: os 4 primeiros têm altura natural; os 3 últimos expandem para preencher a página */
  .block {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 6px 0;
  }
  .block.grow {
    flex: 1;
  }

  .section-title {
    font-weight: bold;
    font-size: 13px;
    margin-bottom: 4px;
  }

  /* Linha label + valor: linha começa logo após o label */
  .fl {
    display: flex;
    align-items: baseline;
    margin-bottom: 8px;
  }
  .fl:last-child { margin-bottom: 0; }

  .fl .lbl {
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Valor com linha (campo vazio) */
  .fl .val {
    flex: 1;
    border-bottom: 1px solid #000;
    padding-bottom: 1px;
  }
  /* Valor sem linha (campo preenchido) */
  .fl .val.filled {
    border-bottom: none;
    padding-left: 3px;
  }

  /* Linha extra de escrita contínua */
  .wl {
    border-bottom: 1px solid #000;
    height: 26px;
    margin-top: 6px;
  }

  /* Linha de campos na mesma row */
  .row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .row:last-child { margin-bottom: 0; }

  /* Campo inline: linha começa logo após o label */
  .ifl {
    display: inline-flex;
    align-items: baseline;
    white-space: nowrap;
  }
  .ifl .lbl { flex-shrink: 0; }
  .ifl .val {
    border-bottom: 1px solid #000;
    padding-bottom: 1px;
    min-width: 60px;
  }
  .ifl .val.filled {
    border-bottom: none;
    padding-left: 3px;
  }

  .bold { font-weight: bold; }

  /* Checkboxes quadrados */
  .cb {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 2px solid #000;
    vertical-align: middle;
    margin: 0 4px 3px 4px;
    flex-shrink: 0;
    font-size: 14px;
    font-weight: bold;
    line-height: 1;
  }
  .cb-checked {
    background: #000;
    color: #fff;
  }
</style>
</head><body>
<div class="page">

  <h1>SETOR DE CIRURGIA</h1>

  <!-- Bloco 1: Cabeçalho -->
  <div class="block" style="padding-top:2px">
    <div class="row">
      <div class="ifl"><span class="lbl">Data:</span>${VD(appointment.date, "90px")}</div>
      <div class="ifl" style="flex:1"><span class="lbl">Procedência:</span>${V(appointment.category, "180px")}</div>
      <div class="ifl"><span class="lbl">Idade:</span>${hasAge ? `<span class="val filled">${age}</span>` : `<span class="val" style="min-width:50px">&nbsp;</span>`}</div>
    </div>
  </div>

  <!-- Bloco 2: Identificação -->
  <div class="block">
    <div class="section-title">IDENTIFICAÇÃO:</div>
    <div class="fl"><span class="lbl">Nome:</span>${V(p?.name)}</div>
    <div class="row">
      <div class="ifl"><span class="lbl">Data de Nasc:</span>${VD(p?.birthDate)}</div>
      <div class="ifl" style="flex:1"><span class="lbl">Qual a cidade que mora?:</span>${V(p?.addrCity, "140px")}</div>
    </div>
    <div class="row">
      <span>Diabético:${CB(false)}</span>
      <span>Hipertenso:${CB(false)}</span>
      <div class="ifl" style="flex:1"><span class="lbl">Outros:</span>${V(undefined)}</div>
    </div>
    <div class="row">
      <div class="ifl"><span class="lbl">DEXTRO:</span>${V(undefined, "90px")}</div>
      <span>Pré&nbsp;–&nbsp;prandial${CB(false)}</span>
      <span>Pós&nbsp;–&nbsp;prandial${CB(false)}</span>
      <div class="ifl"><span class="lbl">às</span>${V(undefined, "55px")}</div>
    </div>
    <div class="row">
      <span>Sexo&nbsp; Masculino${CB(isMasc)} Feminino${CB(isFem)}</span>
      <span>&nbsp;Raça: Branca${CB(isBranca)} Amarela${CB(isAmarela)} Parda${CB(isParda)} Preta${CB(isPreta)}</span>
    </div>
    <div class="fl"><span class="lbl">Endereço:</span>${V(addr || undefined)}</div>
    <div class="row">
      <div class="ifl"><span class="lbl">Fone/Res:</span>${V(p?.phoneResidencial, "100px")}</div>
      <div class="ifl"><span class="lbl">Fone/Rec:</span>${V(p?.phoneComercial, "100px")}</div>
      <div class="ifl"><span class="lbl">Celular:</span>${V(p?.phone, "110px")}</div>
    </div>
  </div>

  <!-- Bloco 3: Diagnóstico + Olho + Localização + Obs -->
  <div class="block">
    <div class="row">
      <span class="bold">DIAGNÓSTICO:</span>
      <span>Pterígio${CB(false)}</span>
      <span>Calázio${CB(false)}</span>
      <span>Sinal${CB(false)}</span>
      <div class="ifl" style="flex:1"><span class="lbl">Outros:</span>${V(undefined)}</div>
    </div>
    <div class="row">
      <span><span class="bold">OLHO:</span> OE${CB(false)} OD${CB(false)}</span>
    </div>
    <div class="row">
      <span><span class="bold">LOCALIZAÇÃO:</span> Nasal${CB(false)} Temporal${CB(false)} Bilateral${CB(false)}</span>
    </div>
    <div class="fl"><span class="lbl">Obs:</span>${V(undefined)}</div>
  </div>

  <!-- Bloco 4: Assinaturas -->
  <div class="block">
    <div class="fl"><span class="lbl bold">ASSINATURA DO PACIENTE:</span>${V(undefined)}</div>
    <div class="fl"><span class="lbl bold">RG/CPF:</span>${V(p?.cpf)}</div>
    <div class="fl"><span class="lbl bold">ASSINATURA DO ACOMPANHANTE:</span>${V(undefined)}</div>
    <div class="fl"><span class="lbl bold">RG/CPF:</span>${V(undefined)}</div>
  </div>

  <!-- Bloco 5: Data da Cirurgia + Triagem -->
  <div class="block grow">
    <div class="row">
      <div class="ifl"><span class="lbl bold">DATA DA CIRURGIA:</span>${VD(appointment.date, "110px")}</div>
    </div>
    <div class="fl"><span class="lbl bold">TRIAGEM:</span>${V(undefined)}</div>
    <div class="wl"></div>
    <div class="wl"></div>
  </div>

  <!-- Bloco 6: Procedimento -->
  <div class="block grow">
    <div class="fl"><span class="lbl bold">PROCEDIMENTO:</span>${V(appointment.procedureName)}</div>
    <div class="wl"></div>
    <div class="wl"></div>
  </div>

  <!-- Bloco 7: Observações Cirúrgicas -->
  <div class="block grow">
    <div class="fl"><span class="lbl bold">OBSERVAÇÕES CIRÚRGICAS:</span>${V(undefined)}</div>
    <div class="wl"></div>
    <div class="wl"></div>
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
          <h2 className="text-base font-semibold text-zinc-900">Capa Pterígio — Setor de Cirurgia</h2>
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
            <p><strong>Sexo:</strong> {p?.sex ?? "—"} &nbsp;|&nbsp; <strong>Raça:</strong> {p?.race ?? "—"}</p>
            <p><strong>Celular:</strong> {p?.phone ?? "—"}</p>
            <p><strong>Endereço:</strong> {addr || "—"}</p>
            <p><strong>CPF:</strong> {p?.cpf ?? "—"}</p>
            <p className="pt-2 text-zinc-400">Clique em "Imprimir" para abrir o formulário completo em uma nova janela.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
