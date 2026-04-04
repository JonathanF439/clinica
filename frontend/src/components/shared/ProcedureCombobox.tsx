"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import type { Procedure } from "@/types/clinic";

interface ProcedureComboboxProps {
  procedures: Procedure[];
  value: Pick<Procedure, "code" | "name"> | null;
  onChange: (procedure: Pick<Procedure, "code" | "name"> | null) => void;
  placeholder?: string;
}

export function ProcedureCombobox({
  procedures,
  value,
  onChange,
  placeholder = "Buscar procedimento...",
}: ProcedureComboboxProps) {
  const [search, setSearch] = useState(value ? `${value.code} - ${value.name}` : "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) setSearch(`${value.code} - ${value.name}`);
    else setSearch("");
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = procedures.filter(
    (p) =>
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (proc: Procedure) => {
    onChange({ code: proc.code, name: proc.name });
    setSearch(`${proc.code} - ${proc.name}`);
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setSearch("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-8 pr-8 text-sm text-zinc-900 focus:border-blue-400 focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <ul className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-zinc-400">Nenhum resultado</li>
          ) : (
            filtered.map((proc) => (
              <li
                key={proc.code}
                onMouseDown={() => handleSelect(proc)}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50"
              >
                <span className="text-xs font-mono text-zinc-400 w-10">{proc.code}</span>
                <span className="text-zinc-800">{proc.name}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
