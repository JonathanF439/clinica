"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import type { Procedure } from "@/types/clinic";

interface ProcedureComboboxProps {
  procedures: Procedure[];
  value: Pick<Procedure, "code" | "name">[];
  onChange: (procedures: Pick<Procedure, "code" | "name">[]) => void;
  placeholder?: string;
}

export function ProcedureCombobox({
  procedures,
  value,
  onChange,
  placeholder = "Buscar procedimento...",
}: ProcedureComboboxProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedCodes = new Set(value.map((p) => p.code));

  const trimmed = search.trim();
  const isNumeric = /^\d+$/.test(trimmed);
  const filtered = procedures.filter((p) => {
    if (selectedCodes.has(p.code)) return false;
    if (!trimmed) return true;
    return isNumeric
      ? p.code === trimmed || p.name.toLowerCase().includes(trimmed.toLowerCase())
      : p.code.toLowerCase().includes(trimmed.toLowerCase()) ||
          p.name.toLowerCase().includes(trimmed.toLowerCase());
  });

  const handleSelect = (proc: Procedure) => {
    onChange([...value, { code: proc.code, name: proc.name }]);
    setSearch("");
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation(); // impede o form de avançar para o próximo campo
      handleSelect(filtered[highlightedIndex]);
    }
  };

  const handleRemove = (code: string) => {
    onChange(value.filter((p) => p.code !== code));
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Chips dos procedimentos selecionados */}
      {value.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {value.map((p) => (
            <span
              key={p.code}
              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700"
            >
              <span className="font-mono text-blue-400">{p.code}</span>
              <span>{p.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(p.code)}
                className="ml-0.5 text-blue-400 hover:text-blue-700"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input de busca */}
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); setHighlightedIndex(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length > 0 ? "Adicionar outro procedimento..." : placeholder}
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-8 pr-3 text-sm text-zinc-900 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {open && (
        <ul ref={listRef} className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-zinc-400">Nenhum resultado</li>
          ) : (
            filtered.map((proc, i) => (
              <li
                key={proc.code}
                onMouseDown={() => handleSelect(proc)}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${i === highlightedIndex ? "bg-blue-50" : "hover:bg-blue-50"}`}
              >
                <span className="w-10 font-mono text-xs text-zinc-400">{proc.code}</span>
                <span className="text-zinc-800">{proc.name}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
