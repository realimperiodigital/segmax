"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SegmaxShell from "@/components/segmaxshell";
import { ArrowLeft, Save } from "lucide-react";

type Cliente = {
  id: string;
  nome: string;
};

type Corretora = {
  id: string;
  nome: string;
};

export default function NovaCotacaoPage() {
  const router = useRouter();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [corretoras, setCorretoras] = useState<Corretora[]>([]);

  const [titulo, setTitulo] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [corretoraId, setCorretoraId] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function carregarDadosBase() {
      try {
        const [clientesResponse, corretorasResponse] = await Promise.all([
          fetch("/api/clientes", { cache: "no-store" }),
          fetch("/api/corretoras", { cache: "no-store" }),
        ]);

        const clientesData = clientesResponse.ok
          ? await clientesResponse.json()
          : [];

        const corretorasData = corretorasResponse.ok
          ? await corretorasResponse.json()
          : [];

        setClientes(Array.isArray(clientesData) ? clientesData : []);
        setCorretoras(Array.isArray(corretorasData) ? corretorasData : []);
      } catch (error) {
        console.error("Erro ao carregar dados da nova cotação:", error);
        setClientes([]);
        setCorretoras([]);
      }
    }

    carregarDadosBase();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setCarregando(true);

      const response = await fetch("/api/cotacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          cliente_id: clienteId || null,
          corretora_id: corretoraId || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar cotação");
      }

      const data = await response.json();

      if (data?.id) {
        router.push(`/cotacoes/${data.id}`);
        return;
      }

      router.push("/cotacoes");
    } catch (error) {
      console.error(error);
      alert("Não foi possível criar a cotação.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SegmaxShell role="master">
      <div className="p-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="max-w-3xl rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="mb-6 text-2xl font-semibold text-white">
            Nova Cotação
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Título da cotação
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Seguro patrimonial empresa XPTO"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Cliente
              </label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-amber-500"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Corretora
              </label>
              <select
                value={corretoraId}
                onChange={(e) => setCorretoraId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-amber-500"
              >
                <option value="">Selecione uma corretora</option>
                {corretoras.map((corretora) => (
                  <option key={corretora.id} value={corretora.id}>
                    {corretora.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={carregando}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-3 font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {carregando ? "Salvando..." : "Criar cotação"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/cotacoes")}
                className="rounded-lg border border-zinc-700 px-5 py-3 font-medium text-gray-300 transition hover:bg-zinc-800 hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </SegmaxShell>
  );
}