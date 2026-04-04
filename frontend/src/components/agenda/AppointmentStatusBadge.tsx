import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_TEXT_COLORS } from "@/lib/constants";

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
  if (variant === "dot") {
    return (
      <span
        className={cn(
          "inline-block h-2.5 w-2.5 rounded-full",
          STATUS_COLORS[status] ?? "bg-zinc-300",
          className
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
        STATUS_TEXT_COLORS[status] ?? "text-zinc-600 bg-zinc-100",
        className
      )}
    >
      {status}
    </span>
  );
}
