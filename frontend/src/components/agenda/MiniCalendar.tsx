"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  appointmentDates?: string[];
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function MiniCalendar({ selectedDate, onDateSelect, appointmentDates = [] }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const [y, m] = selectedDate.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });

  const today = toLocalDateString(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={prevMonth} className="rounded p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-slate-800">
          {MONTHS[month]} {year}
        </span>
        <button onClick={nextMonth} className="rounded p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-500">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;
          const hasAppt = appointmentDates.includes(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg py-1 text-xs transition-colors",
                isSelected
                  ? "bg-blue-600 text-white font-semibold"
                  : isToday
                  ? "border border-blue-500 text-blue-600 font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {day}
              {hasAppt && !isSelected && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
