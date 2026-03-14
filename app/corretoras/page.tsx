"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Corretora = {
  id: string;
  nome_fantasia: string | null;
  razao_social: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  responsavel: string | null;
  plano: string | null;
  status: string | null;
  usuarios_count: number | null;
  clientes_count: number | null;
  cotacoes_count: number | null;
};

export default function CorretorasPage() {
  const [corretoras, setCorretoras] = useState<Corretora[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarCorretoras() {
    setLoading(true);

    const { data, error } = await supabase
      .from("corretoras")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCorretoras(data);
    }

    setLoading(false);
  }

  async function alterarStatus(id: string, status: string) {
    await supabase
      .from("corretoras")
      .update({ status })
      .eq("id", id);

    carregarCorretoras();
  }

  async function excluir(id: string) {
    if (!confirm("Deseja realmente excluir esta corretora?")) return;

    await supabase
      .from("corretoras")
      .delete()
      .eq("id", id);

    carregarCorretoras();
  }

  useEffect(() => {
    carregarCorretoras();
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0d12] p-10">

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Corretoras
          </h1>

          <p className="text-gray-400 mt-2">
            Gestão completa das corretoras cadastradas no SegMax
          </p>
        </div>

        <Link
          href="/corretoras/nova"
          className="bg-[#d4a63a] text-black px-6 py-3 rounded-xl font-bold"
        >
          Nova Corretora
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-400">Carregando...</div>
      ) : (
        <div className="grid gap-6">

          {corretoras.map((c) => (
            <div
              key={c.id}
              className="bg-[#11141b] border border-[#2a2e37] p-6 rounded-2xl"
            >

              <div className="flex justify-between">

                <div>

                  <h2 className="text-xl font-bold text-white">
                    {c.nome_fantasia}
                  </h2>

                  <p className="text-gray-400 text-sm">
                    {c.razao_social}
                  </p>

                  <p className="text-gray-500 text-sm mt-2">
                    Responsável: {c.responsavel}
                  </p>

                  <p className="text-gray-500 text-sm">
                    Email: {c.email}
                  </p>

                </div>

                <div className="text-right">

                  <div className="text-sm text-gray-400">
                    Plano
                  </div>

                  <div className="text-white font-bold">
                    {c.plano}
                  </div>

                  <div className="mt-3 text-sm text-gray-400">
                    Status
                  </div>

                  <div className="text-white font-bold">
                    {c.status}
                  </div>

                </div>

              </div>

              <div className="flex gap-6 mt-6 text-sm text-gray-400">

                <div>
                  Usuários: {c.usuarios_count ?? 0}
                </div>

                <div>
                  Clientes: {c.clientes_count ?? 0}
                </div>

                <div>
                  Cotações: {c.cotacoes_count ?? 0}
                </div>

              </div>

              <div className="flex gap-3 mt-6">

                <Link
                  href={`/corretoras/nova?id=${c.id}`}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                >
                  Editar
                </Link>

                <button
                  onClick={() => alterarStatus(c.id, "suspenso")}
                  className="px-4 py-2 rounded-lg bg-yellow-600 text-white"
                >
                  Suspender
                </button>

                <button
                  onClick={() => alterarStatus(c.id, "bloqueado")}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white"
                >
                  Bloquear
                </button>

                <button
                  onClick={() => excluir(c.id)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white"
                >
                  Excluir
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </main>
  );
}