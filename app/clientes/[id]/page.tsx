"use client";

import React, { useEffect, useState } from "react";
import SegmaxShell from "@/components/segmaxshell";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

type Cliente = {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  status?: "Ativo" | "Em análise" | "Inativo";
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");

  async function carregarClientes() {
    try {
      const response = await fetch("/api/clientes");

      if (!response.ok) {
        throw new Error("Erro ao carregar clientes");
      }

      const data = await response.json();
      setClientes(data || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <SegmaxShell role="master">
      <div className="p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white">
            Clientes
          </h1>

          <Link
            href="/clientes/novo"
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Link>
        </div>

        {/* BUSCA */}
        <div className="flex items-center gap-2 mb-6 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />

          <input
            type="text"
            placeholder="Buscar cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-transparent outline-none text-sm text-white w-full"
          />
        </div>

        {/* LISTA */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

          <table className="w-full text-sm">

            <thead className="bg-zinc-800 text-gray-300">
              <tr>
                <th className="text-left px-4 py-3">Nome</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Telefone</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Ações</th>
              </tr>
            </thead>

            <tbody>

              {clientesFiltrados.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-t border-zinc-800 hover:bg-zinc-800 transition"
                >
                  <td className="px-4 py-3 text-white">
                    {cliente.nome}
                  </td>

                  <td className="px-4 py-3 text-gray-400">
                    {cliente.email || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-400">
                    {cliente.telefone || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded bg-amber-600 text-white">
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
                  <td
                    colSpan={5}
                    className="text-center py-10 text-gray-500"
                  >
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