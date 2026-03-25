"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SegmaxShell from "@/components/segmaxshell";
import { Plus, Search, Users } from "lucide-react";

type StatusUsuario = "Ativo" | "Suspenso";

type Usuario = {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  perfil?: string | null;
  status?: StatusUsuario | null;
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const response = await fetch("/api/usuarios", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar usuários");
        }

        const data = await response.json();
        setUsuarios(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        setUsuarios([]);
      }
    }

    carregarUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termo = busca.toLowerCase();

    return (
      usuario.nome?.toLowerCase().includes(termo) ||
      usuario.email?.toLowerCase().includes(termo) ||
      usuario.telefone?.toLowerCase().includes(termo) ||
      usuario.perfil?.toLowerCase().includes(termo) ||
      usuario.status?.toLowerCase().includes(termo)
    );
  });

  return (
    <SegmaxShell role="master">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-semibold text-white">Usuários</h1>
          </div>

          <Link
            href="/usuarios/novo"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuário..."
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
                <th className="px-4 py-3 text-left">Perfil</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-t border-zinc-800 transition hover:bg-zinc-800"
                >
                  <td className="px-4 py-3 text-white">{usuario.nome}</td>

                  <td className="px-4 py-3 text-gray-400">
                    {usuario.email || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-400">
                    {usuario.telefone || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-300">
                    {usuario.perfil || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded bg-amber-600 px-2 py-1 text-xs text-white">
                      {usuario.status || "Ativo"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/usuarios/${usuario.id}/editar`}
                      className="text-sm text-amber-500 hover:text-amber-400"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}

              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    Nenhum usuário encontrado
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