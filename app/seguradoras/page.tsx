"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SegmaxShell from "@/components/segmaxshell";
import { Building2, Plus, Search } from "lucide-react";

type StatusSeguradora = "Ativa" | "Suspensa" | "Restrita";

type Seguradora = {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  status?: StatusSeguradora | null;
};

export default function SeguradorasPage() {
  const [seguradoras, setSeguradoras] = useState<Seguradora[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function carregarSeguradoras() {
      try {
        const response = await fetch("/api/seguradoras", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar seguradoras");
        }

        const data = await response.json();
        setSeguradoras(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar seguradoras:", error);
        setSeguradoras([]);
      }
    }

    carregarSeguradoras();
  }, []);

  const seguradorasFiltradas = seguradoras.filter((seguradora) => {
    const termo = busca.toLowerCase();

    return (
      seguradora.nome?.toLowerCase().includes(termo) ||
      seguradora.email?.toLowerCase().includes(termo) ||
      seguradora.telefone?.toLowerCase().includes(termo) ||
      seguradora.status?.toLowerCase().includes(termo)
    );
  });

  return (
    <SegmaxShell role="master">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-semibold text-white">Seguradoras</h1>
          </div>

          <Link
            href="/seguradoras/nova"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            Nova Seguradora
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar seguradora..."
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
              {seguradorasFiltradas.map((seguradora) => (
                <tr
                  key={seguradora.id}
                  className="border-t border-zinc-800 transition hover:bg-zinc-800"
                >
                  <td className="px-4 py-3 text-white">{seguradora.nome}</td>

                  <td className="px-4 py-3 text-gray-400">
                    {seguradora.email || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-400">
                    {seguradora.telefone || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded bg-amber-600 px-2 py-1 text-xs text-white">
                      {seguradora.status || "Ativa"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/seguradoras/${seguradora.id}/editar`}
                      className="text-sm text-amber-500 hover:text-amber-400"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}

              {seguradorasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    Nenhuma seguradora encontrada
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