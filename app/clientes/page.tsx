"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SegmaxShell from "@/components/segmaxshell";
import { Plus, Search } from "lucide-react";

type Cliente = {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  status?: "Ativo" | "Em análise" | "Inativo" | null;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function carregarClientes() {
      try {
        const response = await fetch("/api/clientes", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar clientes");
        }

        const data = await response.json();
        setClientes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        setClientes([]);
      }
    }

    carregarClientes();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = busca.toLowerCase();

    return (
      cliente.nome?.toLowerCase().includes(termo) ||
      cliente.email?.toLowerCase().includes(termo) ||
      cliente.telefone?.toLowerCase().includes(termo)
    );
  });

  return (
    <SegmaxShell role="master">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Clientes</h1>

          <Link
            href="/clientes/novo"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente..."
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
              {clientesFiltrados.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-t border-zinc-800 transition hover:bg-zinc-800"
                >
                  <td className="px-4 py-3 text-white">{cliente.nome}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {cliente.email || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {cliente.telefone || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-amber-600 px-2 py-1 text-xs text-white">
                      {cliente.status || "Ativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/clientes/${cliente.id}/editar`}
                      className="text-sm text-amber-500 hover:text-amber-400"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}

              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    Nenhum cliente encontrado
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