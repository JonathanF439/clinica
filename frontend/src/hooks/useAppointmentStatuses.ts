import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { statusCatalogService } from "@/services/api";
import { COLOR_OPTIONS, STATUS_COLORS, STATUS_TEXT_COLORS } from "@/lib/constants";

export function useAppointmentStatuses() {
  const query = useQuery({
    queryKey: ["appointment-statuses"],
    queryFn: () => statusCatalogService.findAll(),
    staleTime: 5 * 60 * 1000,
  });

  const statuses = query.data ?? [];

  const bgMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of statuses) {
      const opt = COLOR_OPTIONS.find((c) => c.key === s.color);
      map[s.name] = opt?.bg ?? STATUS_COLORS[s.name] ?? "bg-zinc-300";
    }
    return map;
  }, [statuses]);

  const badgeMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of statuses) {
      const opt = COLOR_OPTIONS.find((c) => c.key === s.color);
      map[s.name] = opt?.badge ?? STATUS_TEXT_COLORS[s.name] ?? "text-zinc-600 bg-zinc-100";
    }
    return map;
  }, [statuses]);

  const activeStatuses = useMemo(
    () => statuses.filter((s) => s.isActive).sort((a, b) => a.order - b.order),
    [statuses]
  );

  return { statuses, activeStatuses, bgMap, badgeMap, isLoading: query.isLoading };
}
