"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type CotacaoRow = {
  id: string;
  produto?: string | null;
  tipo_seguro?: string | null;
  proposta_numero?: string | null;
  proposta?: string | null;
  renovacao?: boolean | null;
  moeda?: string | null;
  status?: string | null;
  created_at?: string | null;
  vigencia_inicio?: string | null;
  vigencia_fim?: string | null;
  corretora_id?: string | null;
  cliente_id?: string | null;
  usuario_id?: string | null;

  corretora_nome?: string | null;
  cliente_nome?: string | null;
  usuario_nome?: string | null;
};

function formatarData(data?: string | null) {
  if (!data) return "-";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR");
}

function formatarStatus(status?: string | null) {
  if (!status) return "Sem status";
  return status;
}

function classeStatus(status?: string | null) {
  const valor = (status || "").toLowerCase();

  if (valor.includes("aprov")) {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (valor.includes("anal")) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  if (valor.includes("recus") || valor.includes("cancel")) {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
}

export default function PaginaCotacoes() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [cotacoes, setCotacoes] = useState<CotacaoRow[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");

  async function carregarCotacoes() {
    try {
      setLoading(true);
      setErro("");

      const { data, error } = await supabase
        .from("cotacoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setCotacoes((data as CotacaoRow[]) || []);
    } catch (error: any) {
      setErro(error?.message || "Erro ao carregar cotações.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarCotacoes();
  }, []);

  const cotacoesFiltradas = useMemo(() => {
    let lista = [...cotacoes];

    if (statusFiltro !== "todos") {
      lista = lista.filter(
        (item) => (item.status || "").toLowerCase() === statusFiltro.toLowerCase()
      );
    }

    if (busca.trim()) {
      const termo = busca.toLowerCase();

      lista = lista.filter((item) => {
        return [
          item.produto,
          item.tipo_seguro,
          item.proposta_numero,
          item.proposta,
          item.cliente_nome,
          item.corretora_nome,
          item.usuario_nome,
          item.status,
          item.moeda,
          item.id,
        ]
          .filter(Boolean)
          .some((valor) => String(valor).toLowerCase().includes(termo));
      });
    }

    return lista;
  }, [cotacoes, busca, statusFiltro]);

  const totalCotacoes = cotacoes.length;
  const totalEmAnalise = cotacoes.filter((item) =>
    (item.status || "").toLowerCase().includes("anal")
  ).length;
  const totalAprovadas = cotacoes.filter((item) =>
    (item.status || "").toLowerCase().includes("aprov")
  ).length;
  const totalCanceladas = cotacoes.filter((item) => {
    const s = (item.status || "").toLowerCase();
    return s.includes("cancel") || s.includes("recus");
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cotações</h1>
          <p className="mt-1 text-sm text-gray-500">
            Clique no nome da cotação para abrir tudo o que foi preenchido.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totalCotacoes}</p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Em análise</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{totalEmAnalise}</p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Aprovadas</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{totalAprovadas}</p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Canceladas / recusadas</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{totalCanceladas}</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              type="text"
              placeholder="Buscar por produto, proposta, cliente, usuário ou corretora"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            >
              <option value="todos">Todos os status</option>
              <option value="em análise">Em análise</option>
              <option value="aprovada">Aprovada</option>
              <option value="cancelada">Cancelada</option>
              <option value="recusada">Recusada</option>
            </select>

            <button
              onClick={carregarCotacoes}
              className="rounded-xl bg-black px-4 py-3 font-medium text-white hover:opacity-90"
            >
              Atualizar lista
            </button>
          </div>
        </div>

        {erro && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="rounded-2xl border bg-white shadow-sm">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Carregando cotações...</div>
          ) : cotacoesFiltradas.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">Nenhuma cotação encontrada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Cotação
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Corretora
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Usuário
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Vigência
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Cadastro
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {cotacoesFiltradas.map((cotacao) => {
                    const titulo =
                      cotacao.produto ||
                      cotacao.tipo_seguro ||
                      "Cotação sem título";

                    const proposta =
                      cotacao.proposta_numero || cotacao.proposta || "-";

                    return (
                      <tr key={cotacao.id} className="border-b last:border-b-0">
                        <td className="px-6 py-5 align-top">
                          <div className="space-y-2">
                            <Link
                              href={`/cotacoes/${cotacao.id}`}
                              className="block text-lg font-bold text-blue-700 hover:underline"
                            >
                              {titulo}
                            </Link>

                            <div className="text-sm text-gray-600">
                              <p>
                                <span className="font-medium">Proposta:</span>{" "}
                                {proposta}
                              </p>
                              <p>
                                <span className="font-medium">Renovação:</span>{" "}
                                {cotacao.renovacao ? "Sim" : "Não"}
                              </p>
                              <p>
                                <span className="font-medium">Moeda:</span>{" "}
                                {cotacao.moeda || "BRL"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 align-top text-base font-semibold text-gray-900">
                          {cotacao.cliente_nome || "-"}
                        </td>

                        <td className="px-6 py-5 align-top text-base font-semibold text-gray-900">
                          {cotacao.corretora_nome || "-"}
                        </td>

                        <td className="px-6 py-5 align-top text-base font-semibold text-gray-900">
                          {cotacao.usuario_nome || "-"}
                        </td>

                        <td className="px-6 py-5 align-top text-sm text-gray-700">
                          <p>
                            <span className="font-semibold">Início:</span>{" "}
                            {formatarData(cotacao.vigencia_inicio)}
                          </p>
                          <p className="mt-1">
                            <span className="font-semibold">Fim:</span>{" "}
                            {formatarData(cotacao.vigencia_fim)}
                          </p>
                        </td>

                        <td className="px-6 py-5 align-top">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${classeStatus(
                              cotacao.status
                            )}`}
                          >
                            {formatarStatus(cotacao.status)}
                          </span>
                        </td>

                        <td className="px-6 py-5 align-top text-sm font-medium text-gray-700">
                          {formatarData(cotacao.created_at)}
                        </td>

                        <td className="px-6 py-5 align-top">
                          <div className="flex flex-col gap-2">
                            <Link
                              href={`/cotacoes/${cotacao.id}`}
                              className="rounded-xl border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Abrir
                            </Link>

                            <Link
                              href={`/cotacoes/${cotacao.id}/ctr`}
                              className="rounded-xl border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              CTR
                            </Link>

                            <Link
                              href={`/cotacoes/${cotacao.id}/resultado`}
                              className="rounded-xl bg-black px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90"
                            >
                              Resultado
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}