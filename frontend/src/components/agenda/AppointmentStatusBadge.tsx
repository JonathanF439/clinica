"use client";

import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_TEXT_COLORS } from "@/lib/constants";
import { useAppointmentStatuses } from "@/hooks/useAppointmentStatuses";

interface AppointmentStatusBadgeProps {
  status: string;
  variant?: "dot" | "badge";
  className?: string;
}

export function AppointmentStatusBadge({
  status,
  variant = "badge",
  className,
}: AppointmentStatusBadgeProps) {
  const { bgMap, badgeMap } = useAppointmentStatuses();

  if (variant === "dot") {
    return (
      <span
        className={cn(
          "inline-block h-2.5 w-2.5 rounded-full",
          bgMap[status] ?? STATUS_COLORS[status] ?? "bg-zinc-300",
          className
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
        badgeMap[status] ?? STATUS_TEXT_COLORS[status] ?? "text-zinc-600 bg-zinc-100",
        className
      )}
    >
      {status}
    </span>
  );
}
