"use client";

import { useState } from "react";
import { X, FileDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { appointmentService } from "@/services/api";
import type { Appointment, Doctor } from "@/types/clinic";

interface ReportModalProps {
  doctors: Doctor[];
  initialDoctorId?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  onClose: () => void;
}

function formatDate(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function formatCallOrder(n?: number) {
  if (!n) return "—";
  return String(n).padStart(3, "0");
}

function toLocalDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildHtml(
  appointments: Appointment[],
  startDate: string,
  endDate: string,
  selectedDoctor: Doctor | undefined,
  today: string,
): string {
  const grouped = appointments.reduce<Record<string, Appointment[]>>((acc, a) => {
    (acc[a.date] = acc[a.date] || []).push(a);
    return acc;
  }, {});

  const totalAtivos = appointments.filter((a) => a.isActive !== false).length;
  const totalCancelados = appointments.filter((a) => a.isActive === false).length;

  const showDoctor = !selectedDoctor;

  const tableRows = (list: Appointment[]) =>
    list.map((a, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#f9f9f9"};${a.isActive === false ? "opacity:0.5;" : ""}">
        <td>${formatCallOrder(a.callOrder)}</td>
        <td>${a.time}</td>
        <td>${a.patient?.name ?? "—"}${a.isActive === false ? " (cancelado)" : ""}</td>
        <td>${a.patient?.cpf ?? "—"}</td>
        <td>${a.patient?.phone ?? "—"}</td>
        ${showDoctor ? `<td>${a.doctor?.name ?? "—"}</td>` : ""}
        <td>${a.category}</td>
        <td>${a.type}</td>
        <td>${a.procedureName ?? "—"}</td>
        <td>${a.status}</td>
      </tr>
    `).join("");

  const dayBlocks = Object.keys(grouped).sort().map((date) => `
    <div class="day-block">
      <p class="day-title">${formatDate(date)}</p>
      <table>
        <thead>
          <tr>
            <th style="width:42px">Chamada</th>
            <th style="width:52px">Horário</th>
            <th>Paciente</th>
            <th style="width:90px">CPF</th>
            <th style="width:100px">Telefone</th>
            ${showDoctor ? "<th>Médico</th>" : ""}
            <th style="width:70px">Categoria</th>
            <th style="width:70px">Tipo</th>
            <th>Procedimento</th>
            <th style="width:90px">Status</th>
          </tr>
        </thead>
        <tbody>${tableRows(grouped[date])}</tbody>
      </table>
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Relatório de Agendamentos</title>
  <style>
    @page { size: landscape; margin: 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 10px; color: #18181b; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #18181b; padding-bottom: 10px; margin-bottom: 14px; }
    .header h1 { font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
    .header p, .header-right p { font-size: 9px; color: #71717a; margin-top: 2px; }
    .header-right { text-align: right; }
    .day-block { margin-bottom: 16px; break-inside: avoid; }
    .day-title { font-weight: bold; font-size: 10px; color: #3f3f46; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 9px; }
    th { background: #f4f4f5; color: #71717a; text-align: left; padding: 3px 6px; border: 1px solid #e4e4e7; font-size: 8px; text-transform: uppercase; }
    td { padding: 3px 6px; border: 1px solid #e4e4e7; }
    .empty { text-align: center; color: #a1a1aa; padding: 24px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Clínica Olhos David Tayah</h1>
      <p>Relatório de Agendamentos</p>
    </div>
    <div class="header-right">
      <p>Período: ${formatDate(startDate)} a ${formatDate(endDate)}</p>
      ${selectedDoctor ? `<p>Médico: ${selectedDoctor.name}</p>` : ""}
      <p>Emitido em: ${formatDate(today)}</p>
      <p>Total: ${totalAtivos} ativo(s)${totalCancelados > 0 ? ` · ${totalCancelados} cancelado(s)` : ""}</p>
    </div>
  </div>

  ${appointments.length === 0
    ? '<p class="empty">Nenhum agendamento no período.</p>'
    : dayBlocks
  }
</body>
</html>`;
}

export function ReportModal({ doctors, initialDoctorId = "", initialStartDate, initialEndDate, onClose }: ReportModalProps) {
  const today = toLocalDateString(new Date());
  const [startDate, setStartDate] = useState(initialStartDate ?? today);
  const [endDate, setEndDate] = useState(initialEndDate ?? today);
  const [doctorId, setDoctorId] = useState(initialDoctorId);
  const [ready, setReady] = useState(false);

  const { data: appointments = [], isFetching } = useQuery({
    queryKey: ["report", startDate, endDate, doctorId],
    queryFn: () => appointmentService.findByRange(startDate, endDate, doctorId),
    enabled: ready && !!doctorId,
  });

  const selectedDoctor = doctors.find((d) => d.id === doctorId);
  const totalAtivos = appointments.filter((a) => a.isActive !== false).length;
  const totalCancelados = appointments.filter((a) => a.isActive === false).length;

  const handleGenerate = () => setReady(true);

  const handlePrint = () => {
    const html = buildHtml(appointments, startDate, endDate, selectedDoctor, today);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-lg flex-col rounded-xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Relatório de Agendamentos</h2>
            <p className="text-xs text-zinc-400">Selecione o período e o médico</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100 text-zinc-500">
            <X size={16} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Data inicial</label>
              <input
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setReady(false); }}
              />
            </div>
            <div>
              <label className="label">Data final</label>
              <input
                type="date"
                className="input"
                value={endDate}
                min={startDate}
                onChange={(e) => { setEndDate(e.target.value); setReady(false); }}
              />
            </div>
          </div>

          <div>
            <label className="label">Médico</label>
            <select
              className="input"
              value={doctorId}
              onChange={(e) => { setDoctorId(e.target.value); setReady(false); }}
            >
              <option value="" disabled>Selecionar médico...</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {ready && !isFetching && (
            <div className="rounded-lg bg-zinc-50 border border-zinc-100 px-4 py-3 text-sm text-zinc-700">
              <span className="font-semibold">{appointments.length}</span> agendamento(s) encontrado(s)
              {totalCancelados > 0 && (
                <span className="text-zinc-400"> · {totalCancelados} cancelado(s)</span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-zinc-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            Cancelar
          </button>
          {!ready ? (
            <button
              onClick={handleGenerate}
              disabled={!doctorId}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Gerar relatório
            </button>
          ) : isFetching ? (
            <button disabled className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-70">
              <Loader2 size={14} className="animate-spin" /> Carregando...
            </button>
          ) : (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <FileDown size={14} /> Imprimir / Salvar PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
