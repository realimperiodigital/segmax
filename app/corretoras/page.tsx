"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SegmaxShell from "@/components/segmaxshell";
import { Plus, Search } from "lucide-react";

type Corretora = {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  status?: "Ativa" | "Suspensa" | "Bloqueada" | null;
};

export default function CorretorasPage() {
  const [corretoras, setCorretoras] = useState<Corretora[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function carregarCorretoras() {
      try {
        const response = await fetch("/api/corretoras", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar corretoras");
        }

        const data = await response.json();
        setCorretoras(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar corretoras:", error);
        setCorretoras([]);
      }
    }

    carregarCorretoras();
  }, []);

  const corretorasFiltradas = corretoras.filter((corretora) => {
    const termo = busca.toLowerCase();

    return (
      corretora.nome?.toLowerCase().includes(termo) ||
      corretora.email?.toLowerCase().includes(termo) ||
      corretora.telefone?.toLowerCase().includes(termo)
    );
  });

  return (
    <SegmaxShell role="master">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Corretoras</h1>

          <Link
            href="/corretoras/nova"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            Nova Corretora
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar corretora..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800 text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Telefone</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {corretorasFiltradas.map((corretora) => (
                <tr
                  key={corretora.id}
                  className="border-t border-zinc-800 transition hover:bg-zinc-800"
                >
                  <td className="px-4 py-3 text-white">{corretora.nome}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {corretora.email || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {corretora.telefone || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-amber-600 px-2 py-1 text-xs text-white">
                      {corretora.status || "Ativa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/corretoras/${corretora.id}/editar`}
                      className="text-sm text-amber-500 hover:text-amber-400"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}

              {corretorasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    Nenhuma corretora encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SegmaxShell>
  );
}