"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Users,
  Stethoscope,
  Plus,
  CheckCircle2,
  Clock,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { appointmentService, patientService } from "@/services/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppointmentStatusBadge } from "@/components/agenda/AppointmentStatusBadge";

function toLocalDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getGreeting(firstName: string) {
  const h = new Date().getHours();
  const salute = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  return `${salute}, ${firstName}`;
}

function formatTodayLong() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const today = toLocalDateString(new Date());

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  const { data: appointments = [], isLoading: apptLoading } = useQuery({
    queryKey: ["appointments", today],
    queryFn: () => appointmentService.findByDate(today),
    enabled: !!user,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientService.findAll(),
    enabled: !!user,
  });

  const stats = useMemo(
    () => ({
      total: appointments.length,
      confirmed: appointments.filter((a) => a.status === "Confirmado").length,
      attended: appointments.filter((a) => a.status === "Atendido").length,
      waiting: appointments.filter((a) => a.status === "Aguardando").length,
    }),
    [appointments]
  );

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f7]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d4ed8] border-t-transparent" />
      </div>
    );
  }

  const firstName = user.name.split(" ")[0];
  const preview = appointments.slice(0, 8);

  return (
    <div className="flex min-h-screen bg-[#f8f8f7] font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">

          {/* Page header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">
                {getGreeting(firstName)}!
              </h1>
              <p className="mt-0.5 text-sm capitalize text-zinc-500">
                {formatTodayLong()}
              </p>
            </div>
            <Link
              href="/agendamento/novo"
              className="flex items-center gap-2 rounded-lg bg-[#1d4ed8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1e40af]"
            >
              <Plus size={15} />
              Novo Agendamento
            </Link>
          </div>

          {/* Stat cards */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {(
              [
                {
                  label: "Hoje",
                  value: stats.total,
                  icon: Calendar,
                  iconColor: "text-zinc-500",
                  iconBg: "bg-zinc-100",
                },
                {
                  label: "Confirmados",
                  value: stats.confirmed,
                  icon: CheckCircle2,
                  iconColor: "text-emerald-600",
                  iconBg: "bg-emerald-50",
                },
                {
                  label: "Atendidos",
                  value: stats.attended,
                  icon: UserCheck,
                  iconColor: "text-violet-600",
                  iconBg: "bg-violet-50",
                },
                {
                  label: "Aguardando",
                  value: stats.waiting,
                  icon: Clock,
                  iconColor: "text-amber-600",
                  iconBg: "bg-amber-50",
                },
              ] as const
            ).map(({ label, value, icon: Icon, iconColor, iconBg }) => (
              <div
                key={label}
                className="rounded-xl border border-[#e4e4e4] bg-white p-5"
              >
                <div
                  className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}
                >
                  <Icon size={18} className={iconColor} />
                </div>
                <p className="text-2xl font-bold text-zinc-900">{value}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Today's schedule */}
          <div className="mb-6 overflow-x-auto rounded-xl border border-[#e4e4e4] bg-white">
            <div className="flex items-center justify-between border-b border-[#e4e4e4] px-5 py-4">
              <h2 className="text-sm font-semibold text-zinc-900">
                Agenda de Hoje
              </h2>
              <Link
                href="/agenda"
                className="text-xs font-medium text-[#1d4ed8] hover:underline"
              >
                Ver completa →
              </Link>
            </div>

            {apptLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1d4ed8] border-t-transparent" />
              </div>
            ) : preview.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <Calendar size={28} className="mb-2 opacity-30" />
                <p className="text-sm">Nenhum agendamento para hoje</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                    <th className="px-5 py-3">Hora</th>
                    <th className="px-5 py-3">Paciente</th>
                    <th className="px-5 py-3">Médico</th>
                    <th className="px-5 py-3">Tipo</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((appt) => (
                    <tr
                      key={appt.id}
                      className="border-t border-zinc-50 transition-colors hover:bg-zinc-50/60"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-zinc-600">
                        {appt.time}
                      </td>
                      <td className="px-5 py-3 font-medium text-zinc-900">
                        {appt.patient?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-zinc-500">
                        {appt.doctor?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-zinc-500">
                        {appt.type}
                      </td>
                      <td className="px-5 py-3">
                        <AppointmentStatusBadge status={appt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <Link
              href="/pacientes"
              className="group rounded-xl border border-[#e4e4e4] bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <Users
                  size={17}
                  className="text-zinc-400 transition-colors group-hover:text-[#1d4ed8]"
                />
                <span className="text-sm font-medium text-zinc-900">
                  Pacientes
                </span>
              </div>
              <p className="text-2xl font-bold text-zinc-900">
                {patients.length}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">cadastrados</p>
            </Link>

            <Link
              href="/medicos"
              className="group rounded-xl border border-[#e4e4e4] bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <Stethoscope
                  size={17}
                  className="text-zinc-400 transition-colors group-hover:text-[#1d4ed8]"
                />
                <span className="text-sm font-medium text-zinc-900">
                  Médicos
                </span>
              </div>
              <p className="text-xs text-zinc-500">Ver equipe médica</p>
            </Link>

            <Link
              href="/agenda"
              className="group rounded-xl border border-[#e4e4e4] bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <Calendar
                  size={17}
                  className="text-zinc-400 transition-colors group-hover:text-[#1d4ed8]"
                />
                <span className="text-sm font-medium text-zinc-900">
                  Agenda
                </span>
              </div>
              <p className="text-xs text-zinc-500">Calendário completo</p>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
