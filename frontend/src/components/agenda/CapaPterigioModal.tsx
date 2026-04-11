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

const L = (v?: string, n = 30) => v || "_".repeat(n);
const CB = (v: boolean) => v ? "(X)" : "( )";

export function CapaPterigioModal({ appointment, onClose }: Props) {
  const p = appointment.patient;
  const age = calcAge(p?.birthDate);
  const addr = [p?.addrStreet, p?.addrNumber ? `nº ${p.addrNumber}` : "", p?.addrNeighborhood].filter(Boolean).join(", ");
  const isMasc = !!p?.sex?.toLowerCase().includes("masc");
  const isFem = !!p?.sex?.toLowerCase().includes("fem");

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=750");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Setor de Cirurgia — Pterígio</title>
<style>
  @page { size: A4 portrait; margin: 14mm 18mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #000;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .page {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 0;
  }
  h1 {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 2px;
    padding-bottom: 6px;
    border-bottom: 2px solid #000;
    margin-bottom: 10px;
  }
  .section-title {
    font-weight: bold;
    font-size: 12px;
    margin-bottom: 6px;
    margin-top: 2px;
  }
  .block {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 6px 0;
    border-bottom: 1px dashed #ccc;
  }
  .block:last-child { border-bottom: none; }
  .row {
    display: flex;
    gap: 16px;
    align-items: baseline;
    flex-wrap: wrap;
    line-height: 2;
  }
  .field-line {
    display: flex;
    align-items: baseline;
    gap: 4px;
    line-height: 2.2;
  }
  u {
    text-decoration: none;
    border-bottom: 1px solid #000;
    display: inline-block;
    min-width: 60px;
  }
  .u-full {
    text-decoration: none;
    border-bottom: 1px solid #000;
    display: block;
    width: 100%;
    margin-top: 2px;
    height: 18px;
  }
  .bold { font-weight: bold; }
</style>
</head><body>
<div class="page">

  <h1>SETOR DE CIRURGIA</h1>

  <!-- Bloco 1: Cabeçalho -->
  <div class="block">
    <div class="row">
      <span>Data: <u>${formatDate(appointment.date)}</u></span>
      <span>Procedência: <u style="min-width:180px">${L(p?.naturality ?? p?.addrCity, 25)}</u></span>
      <span>Idade: <u style="min-width:50px">${age}</u></span>
    </div>
  </div>

  <!-- Bloco 2: Identificação -->
  <div class="block">
    <div class="section-title">IDENTIFICAÇÃO:</div>
    <div class="field-line">Nome: <u style="flex:1;min-width:400px">${L(p?.name, 55)}</u></div>
    <div class="row">
      <span>Data de Nasc: <u>${formatDate(p?.birthDate)}</u></span>
      <span>Qual a cidade que mora?: <u style="min-width:160px">${L(p?.addrCity, 20)}</u></span>
    </div>
    <div class="row">
      <span>Diabético: ( )</span>
      <span>Hipertenso: ( )</span>
      <span>Outra Doença: ( )</span>
    </div>
    <div class="row">
      <span>Sexo: Masculino ${CB(isMasc)} &nbsp; Feminino ${CB(isFem)}</span>
      <span>Raça: Branca ${CB(p?.race === "Branca")} &nbsp; Amarela ${CB(p?.race === "Amarela")} &nbsp; Parda ${CB(p?.race === "Parda")} &nbsp; Preta ${CB(p?.race === "Preta")}</span>
    </div>
    <div class="field-line">Endereço: <u style="flex:1;min-width:350px">${L(addr || undefined, 55)}</u></div>
    <div class="row">
      <span>Fone/Res: <u style="min-width:110px">${L(p?.phoneResidencial, 13)}</u></span>
      <span>Fone/Rec: <u style="min-width:110px">${L(p?.phoneComercial, 13)}</u></span>
      <span>Celular: <u style="min-width:120px">${L(p?.phone, 14)}</u></span>
    </div>
  </div>

  <!-- Bloco 3: Diagnóstico -->
  <div class="block">
    <div class="row">
      <span class="bold">DIAGNÓSTICO:</span>
      <span>Pterígio (X) &nbsp; Calázio ( ) &nbsp; Sinal ( ) &nbsp; Outros: <u style="min-width:140px">_______________________</u></span>
    </div>
    <div class="row">
      <span><span class="bold">OLHO:</span> &nbsp; OE ( ) &nbsp; OD ( )</span>
      <span><span class="bold">LOCALIZAÇÃO:</span> &nbsp; Nasal ( ) &nbsp; Temporal ( ) &nbsp; Bilateral ( )</span>
    </div>
  </div>

  <!-- Bloco 4: Antecedentes Oftalmológicos -->
  <div class="block">
    <div class="section-title">ANTECEDENTES OFTALMOLÓGICOS: (Resumo Clínico / Cirúrgico – FICHA ANTIGA)</div>
    <div class="row">Glaucoma ( ) &nbsp; Retinopatia ( ) &nbsp; Uveite ( ) &nbsp; Costicóide Tópico ( )</div>
    <div class="row">Olho Seco ( ) &nbsp; C.H.Fuchs ( ) &nbsp; Trauma ( ) &nbsp; Cirurgia ( ) – Cirurgia Realizada / Olho / Data</div>
    <div class="field-line">Obs: <u style="flex:1;min-width:400px">&nbsp;</u></div>
    <div class="u-full"></div>
  </div>

  <!-- Bloco 5: Antecedentes Pessoais -->
  <div class="block">
    <div class="section-title">ANTECEDENTES PESSOAIS / SISTÊMATICOS:</div>
    <div class="row">Diabetes Mellitus ( ) &nbsp; Doença Metabólica ( ) &nbsp; Reumática ( ) &nbsp; Neurológica ( ) &nbsp; Dermatite ( )</div>
    <div class="row">Doença Nutricional ( ) &nbsp; Irradiação ( ) &nbsp; Corticoide ( ) &nbsp; Outros ( )</div>
    <div class="field-line">Obs: <u style="flex:1;min-width:400px">&nbsp;</u></div>
    <div class="u-full"></div>
  </div>

  <!-- Bloco 6: Assinaturas -->
  <div class="block">
    <div class="field-line"><span class="bold">ASSINATURA DO PACIENTE:</span> <u style="flex:1;min-width:300px">&nbsp;</u></div>
    <div class="field-line"><span class="bold">RG/CPF:</span> <u style="flex:1;min-width:350px">${L(p?.cpf, 50)}</u></div>
    <div class="field-line"><span class="bold">ASSINATURA DO ACOMPANHANTE:</span> <u style="flex:1;min-width:270px">&nbsp;</u></div>
    <div class="field-line"><span class="bold">RG/CPF:</span> <u style="flex:1;min-width:350px">&nbsp;</u></div>
  </div>

  <!-- Bloco 7: Observações Cirúrgicas -->
  <div class="block">
    <div class="field-line"><span class="bold">OBSERVAÇÕES CIRURGICAS:</span> <u style="flex:1;min-width:300px">&nbsp;</u></div>
    <div class="u-full"></div>
  </div>

  <!-- Bloco 8: Data da Cirurgia + Triagem -->
  <div class="block">
    <div class="field-line">
      <span class="bold">DATA DA CIRURGIA:</span> <u style="min-width:120px">${formatDate(appointment.date)}</u>
      &nbsp;&nbsp;&nbsp;
      <span class="bold">TRIAGEM:</span> <u style="flex:1;min-width:200px">&nbsp;</u>
    </div>
    <div class="u-full"></div>
  </div>

  <!-- Bloco 9: Procedimento -->
  <div class="block">
    <div class="field-line"><span class="bold">PROCEDIMENTO:</span> <u style="flex:1;min-width:350px">${L(appointment.procedureName, 55)}</u></div>
    <div class="u-full"></div>
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
            <button onClick={handlePrint} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700">
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
