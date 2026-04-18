"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, FileDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { appointmentService } from "@/services/api";
import type { Appointment, Doctor } from "@/types/clinic";

interface ReportModalProps {
  doctors: Doctor[];
  initialDoctorId?: string;
  initialStartDate?: string;
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

export function ReportModal({ doctors, initialDoctorId = "", initialStartDate, onClose }: ReportModalProps) {
  const today = toLocalDateString(new Date());
  const [startDate, setStartDate] = useState(initialStartDate ?? today);
  const [endDate, setEndDate] = useState(today);
  const [doctorId, setDoctorId] = useState(initialDoctorId);
  const [ready, setReady] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { data: appointments = [], isFetching } = useQuery({
    queryKey: ["report", startDate, endDate, doctorId],
    queryFn: () => appointmentService.findByRange(startDate, endDate, doctorId),
    enabled: ready && !!doctorId,
  });

  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  // Group by date
  const grouped = appointments.reduce<Record<string, Appointment[]>>((acc, a) => {
    (acc[a.date] = acc[a.date] || []).push(a);
    return acc;
  }, {});

  const handleGenerate = () => setReady(true);

  const handlePrint = () => {
    const el = document.getElementById("print-report");
    if (el) el.style.display = "block";

    const style = document.createElement("style");
    style.id = "__report-print-style";
    style.innerHTML = `
      @page { size: landscape; margin: 12mm; }
      @media print {
        body > * { display: none !important; }
        #print-report { display: block !important; visibility: visible !important; }
        #print-report * { visibility: visible !important; }
      }
    `;
    document.head.appendChild(style);
    window.print();

    setTimeout(() => {
      if (el) el.style.display = "none";
      document.getElementById("__report-print-style")?.remove();
    }, 500);
  };

  const totalAtivos = appointments.filter((a) => a.isActive !== false).length;
  const totalCancelados = appointments.filter((a) => a.isActive === false).length;

  const printDocument = (
    <div id="print-report" style={{ display: "none" }} className="font-sans text-zinc-900 p-6 text-xs">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-zinc-800 pb-3 mb-4">
          <div>
            <h1 className="text-base font-bold uppercase tracking-wide">Clínica Olhos David Tayah</h1>
            <p className="text-zinc-500">Relatório de Agendamentos</p>
          </div>
          <div className="text-right text-zinc-500">
            <p>Período: {formatDate(startDate)} a {formatDate(endDate)}</p>
            {selectedDoctor && <p>Médico: {selectedDoctor.name}</p>}
            <p>Emitido em: {formatDate(today)}</p>
            <p>Total: {totalAtivos} ativo(s) · {totalCancelados} cancelado(s)</p>
          </div>
        </div>

        {/* Tables per day */}
        {Object.keys(grouped).sort().map((date) => (
          <div key={date} className="mb-5 break-inside-avoid">
            <p className="font-bold text-zinc-700 mb-1">{formatDate(date)}</p>
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-zinc-100 text-zinc-500 text-left">
                  <th className="border border-zinc-200 px-2 py-1 w-10">Chamada</th>
                  <th className="border border-zinc-200 px-2 py-1 w-14">Horário</th>
                  <th className="border border-zinc-200 px-2 py-1">Paciente</th>
                  <th className="border border-zinc-200 px-2 py-1 w-20">CPF</th>
                  <th className="border border-zinc-200 px-2 py-1 w-24">Telefone</th>
                  {!selectedDoctor && <th className="border border-zinc-200 px-2 py-1">Médico</th>}
                  <th className="border border-zinc-200 px-2 py-1 w-16">Categoria</th>
                  <th className="border border-zinc-200 px-2 py-1 w-16">Tipo</th>
                  <th className="border border-zinc-200 px-2 py-1">Procedimento</th>
                  <th className="border border-zinc-200 px-2 py-1 w-20">Status</th>
                </tr>
              </thead>
              <tbody>
                {grouped[date].map((a, i) => (
                  <tr key={a.id} className={`${i % 2 === 0 ? "bg-white" : "bg-zinc-50"} ${a.isActive === false ? "opacity-50" : ""}`}>
                    <td className="border border-zinc-200 px-2 py-1 font-mono text-center">{formatCallOrder(a.callOrder)}</td>
                    <td className="border border-zinc-200 px-2 py-1 font-mono">{a.time}</td>
                    <td className="border border-zinc-200 px-2 py-1 font-medium">{a.patient?.name ?? "—"}{a.isActive === false ? " (cancelado)" : ""}</td>
                    <td className="border border-zinc-200 px-2 py-1">{a.patient?.cpf ?? "—"}</td>
                    <td className="border border-zinc-200 px-2 py-1">{a.patient?.phone ?? "—"}</td>
                    {!selectedDoctor && <td className="border border-zinc-200 px-2 py-1">{a.doctor?.name ?? "—"}</td>}
                    <td className="border border-zinc-200 px-2 py-1">{a.category}</td>
                    <td className="border border-zinc-200 px-2 py-1">{a.type}</td>
                    <td className="border border-zinc-200 px-2 py-1">{a.procedureName ?? "—"}</td>
                    <td className="border border-zinc-200 px-2 py-1">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {appointments.length === 0 && (
          <p className="text-zinc-400 text-center py-8">Nenhum agendamento no período.</p>
        )}
    </div>
  );

  return (
    <>
      {/* Portal: print document renderizado direto no body */}
      {mounted && createPortal(printDocument, document.body)}

      {/* ── Screen modal ────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden">
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

            {/* Preview count */}
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
    </>
  );
}
