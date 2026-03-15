"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ClienteDetalhe = {
  id: string;
  nome: string | null;
  tipo_pessoa: string | null;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean | null;
  observacoes: string | null;
  created_at: string | null;
  excluido?: boolean | null;
};

type CotacaoCliente = {
  id: string;
  cliente_id: string | null;
  status: string | null;
  seguradora: string | null;
  ramo: string | null;
  valor: number | string | null;
  created_at: string | null;
};

function formatarTipoPessoa(tipo?: string | null) {
  if (!tipo) return "-";
  if (tipo.toLowerCase() === "pf") return "Pessoa Física";
  if (tipo.toLowerCase() === "pj") return "Pessoa Jurídica";
  return tipo;
}

function formatarData(data?: string | null) {
  if (!data) return "-";
  try {
    return new Date(data).toLocaleDateString("pt-BR");
  } catch {
    return "-";
  }
}

function formatarMoeda(valor?: number | string | null) {
  if (valor === null || valor === undefined || valor === "") return "-";

  const numero =
    typeof valor === "number"
      ? valor
      : Number(String(valor).replace(/\./g, "").replace(",", "."));

  if (Number.isNaN(numero)) return String(valor);

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function corStatus(status?: string | null) {
  const s = (status || "").toLowerCase();

  if (
    s.includes("fech") ||
    s.includes("aprov") ||
    s.includes("emitid") ||
    s.includes("ganha")
  ) {
    return "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20";
  }

  if (
    s.includes("analise") ||
    s.includes("andamento") ||
    s.includes("pendente") ||
    s.includes("aberta") ||
    s.includes("negoci")
  ) {
    return "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20";
  }

  if (
    s.includes("recus") ||
    s.includes("perd") ||
    s.includes("cancel")
  ) {
    return "bg-red-500/10 text-red-300 ring-1 ring-red-500/20";
  }

  return "bg-zinc-500/10 text-zinc-300 ring-1 ring-zinc-500/20";
}

export default function ClienteDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const clienteId = String(params?.id || "");

  const [cliente, setCliente] = useState<ClienteDetalhe | null>(null);
  const [cotacoes, setCotacoes] = useState<CotacaoCliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarTela() {
    try {
      setCarregando(true);
      setErro("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes")
        .select(
          "id, nome, tipo_pessoa, cpf_cnpj, email, telefone, cidade, estado, ativo, observacoes, created_at, excluido"
        )
        .eq("id", clienteId)
        .maybeSingle();

      if (clienteError) {
        setErro(clienteError.message);
        return;
      }

      if (!clienteData) {
        setErro("Cliente não encontrado.");
        return;
      }

      if (clienteData.excluido) {
        setErro("Este cliente está marcado como excluído.");
        return;
      }

      setCliente(clienteData as ClienteDetalhe);

      const { data: cotacoesData, error: cotacoesError } = await supabase
        .from("cotacoes")
        .select("id, cliente_id, status, seguradora, ramo, valor, created_at")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });

      if (cotacoesError) {
        console.error(cotacoesError);
        setCotacoes([]);
      } else {
        setCotacoes((cotacoesData || []) as CotacaoCliente[]);
      }
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar a visão do cliente.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (clienteId) {
      carregarTela();
    }
  }, [clienteId]);

  const resumo = useMemo(() => {
    let abertas = 0;
    let fechadas = 0;
    let recusadas = 0;

    for (const item of cotacoes) {
      const s = (item.status || "").toLowerCase();

      if (
        s.includes("fech") ||
        s.includes("aprov") ||
        s.includes("emitid") ||
        s.includes("ganha")
      ) {
        fechadas += 1;
      } else if (
        s.includes("recus") ||
        s.includes("perd") ||
        s.includes("cancel")
      ) {
        recusadas += 1;
      } else {
        abertas += 1;
      }
    }

    return {
      total: cotacoes.length,
      abertas,
      fechadas,
      recusadas,
    };
  }, [cotacoes]);

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#050505] px-5 py-5 text-white md:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="rounded-[30px] border border-yellow-600/15 bg-[#0a0a0a] p-10 text-center text-zinc-400">
            Carregando visão do cliente...
          </div>
        </div>
      </div>
    );
  }

  if (erro || !cliente) {
    return (
      <div className="min-h-screen bg-[#050505] px-5 py-5 text-white md:px-8">
        <div className="mx-auto max-w-[1450px] space-y-5">
          <div className="rounded-[30px] border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {erro || "Cliente não encontrado."}
          </div>

          <Link
            href="/clientes"
            className="inline-flex rounded-xl border border-zinc-700 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
          >
            Voltar para clientes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] px-5 py-5 text-white md:px-8">
      <div className="mx-auto max-w-[1450px] space-y-5">
        {/* HERO */}
        <section className="rounded-[30px] border border-yellow-600/15 bg-[#080808] px-6 py-7 shadow-[0_0_40px_rgba(0,0,0,0.35)] md:px-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-4xl">
              <div className="mb-4 inline-flex rounded-full border border-yellow-600/20 bg-[#111111] px-4 py-2 text-sm font-semibold text-yellow-400">
                Cliente 360°
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
                SegMax Control
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-[1] md:text-6xl">
                {cliente.nome || "Cliente"}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
                Visão completa do cliente com dados cadastrais, andamento operacional e histórico
                de cotações para acompanhar a carteira de forma clara e intuitiva.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/clientes"
                className="rounded-xl border border-zinc-700 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
              >
                Voltar
              </Link>

              <Link
                href={`/clientes/${clienteId}/editar`}
                className="rounded-xl border border-zinc-700 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
              >
                Editar cliente
              </Link>

              <Link
                href={`/cotacoes/nova?cliente=${clienteId}`}
                className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400"
              >
                Nova cotação
              </Link>

              <Link
                href={`/relatorios/analitico?cliente=${clienteId}`}
                className="rounded-xl border border-zinc-700 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
              >
                Relatório analítico
              </Link>
            </div>
          </div>
        </section>

        {/* CARDS */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Tipo</p>
            <h3 className="mt-2 text-3xl font-bold">{formatarTipoPessoa(cliente.tipo_pessoa)}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Status do cliente</p>
            <h3 className="mt-2 text-3xl font-bold">{cliente.ativo ? "Ativo" : "Inativo"}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Total de cotações</p>
            <h3 className="mt-2 text-3xl font-bold">{resumo.total}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-yellow-500">Em andamento</p>
            <h3 className="mt-2 text-3xl font-bold text-yellow-400">{resumo.abertas}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Fechadas</p>
            <h3 className="mt-2 text-3xl font-bold">{resumo.fechadas}</h3>
          </div>
        </section>

        {/* DADOS + OBSERVAÇÕES */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[30px] border border-yellow-600/15 bg-[#0a0a0a] p-6">
            <div className="mb-6">
              <h2 className="text-4xl font-bold">Dados do cliente</h2>
              <p className="mt-3 text-base text-zinc-400">
                Informações principais para consulta rápida da operação.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-[22px] border border-zinc-800 bg-[#111111] p-5">
                <p className="text-sm text-zinc-500">Nome</p>
                <h3 className="mt-2 text-xl font-semibold">{cliente.nome || "-"}</h3>
              </div>

              <div className="rounded-[22px] border border-zinc-800 bg-[#111111] p-5">
                <p className="text-sm text-zinc-500">CPF / CNPJ</p>
                <h3 className="mt-2 text-xl font-semibold break-all">{cliente.cpf_cnpj || "-"}</h3>
              </div>

              <div className="rounded-[22px] border border-zinc-800 bg-[#111111] p-5">
                <p className="text-sm text-zinc-500">E-mail</p>
                <h3 className="mt-2 text-xl font-semibold break-all">{cliente.email || "-"}</h3>
              </div>

              <div className="rounded-[22px] border border-zinc-800 bg-[#111111] p-5">
                <p className="text-sm text-zinc-500">Telefone</p>
                <h3 className="mt-2 text-xl font-semibold">{cliente.telefone || "-"}</h3>
              </div>

              <div className="rounded-[22px] border border-zinc-800 bg-[#111111] p-5">
                <p className="text-sm text-zinc-500">Cidade</p>
                <h3 className="mt-2 text-xl font-semibold">{cliente.cidade || "-"}</h3>
              </div>

              <div className="rounded-[22px] border border-zinc-800 bg-[#111111] p-5">
                <p className="text-sm text-zinc-500">Estado</p>
                <h3 className="mt-2 text-xl font-semibold">{cliente.estado || "-"}</h3>
              </div>

              <div className="rounded-[22px] border border-zinc-800 bg-[#111111] p-5 md:col-span-2">
                <p className="text-sm text-zinc-500">Cadastro no sistema</p>
                <h3 className="mt-2 text-xl font-semibold">{formatarData(cliente.created_at)}</h3>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-yellow-600/15 bg-[#0a0a0a] p-6">
            <div className="mb-6">
              <h2 className="text-4xl font-bold">Observações</h2>
              <p className="mt-3 text-base text-zinc-400">
                Informações úteis para acompanhar o contexto do cliente.
              </p>
            </div>

            <div className="rounded-[22px] border border-zinc-800 bg-[#111111] p-5 min-h-[260px]">
              <p className="whitespace-pre-wrap text-base leading-8 text-zinc-300">
                {cliente.observacoes?.trim() || "Nenhuma observação cadastrada para este cliente."}
              </p>
            </div>
          </div>
        </section>

        {/* HISTÓRICO DE COTAÇÕES */}
        <section className="rounded-[30px] border border-yellow-600/15 bg-[#0a0a0a] p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-4xl font-bold">Histórico de cotações</h2>
              <p className="mt-3 text-base text-zinc-400">
                Acompanhe o que já foi movimentado para este cliente.
              </p>
            </div>

            <Link
              href={`/cotacoes/nova?cliente=${clienteId}`}
              className="inline-flex rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400"
            >
              Abrir nova cotação
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full border-collapse">
              <thead>
                <tr className="border-b border-yellow-600/10 text-left text-xs uppercase tracking-[0.25em] text-zinc-400">
                  <th className="px-4 py-4">Cotação</th>
                  <th className="px-4 py-4">Ramo</th>
                  <th className="px-4 py-4">Seguradora</th>
                  <th className="px-4 py-4">Valor</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Data</th>
                  <th className="px-4 py-4">Ações</th>
                </tr>
              </thead>

              <tbody>
                {cotacoes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                      Este cliente ainda não possui cotações cadastradas.
                    </td>
                  </tr>
                ) : (
                  cotacoes.map((cotacao) => (
                    <tr
                      key={cotacao.id}
                      className="border-b border-yellow-600/10 transition hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-5 font-semibold text-white">
                        {cotacao.id.slice(0, 8)}
                      </td>

                      <td className="px-4 py-5 text-zinc-300">
                        {cotacao.ramo || "-"}
                      </td>

                      <td className="px-4 py-5 text-zinc-300">
                        {cotacao.seguradora || "-"}
                      </td>

                      <td className="px-4 py-5 text-zinc-300">
                        {formatarMoeda(cotacao.valor)}
                      </td>

                      <td className="px-4 py-5">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${corStatus(cotacao.status)}`}>
                          {cotacao.status || "Sem status"}
                        </span>
                      </td>

                      <td className="px-4 py-5 text-zinc-300">
                        {formatarData(cotacao.created_at)}
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/cotacoes/${cotacao.id}`}
                            className="rounded-lg border border-zinc-700 bg-[#111111] px-3 py-2 text-xs font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
                          >
                            Ver
                          </Link>

                          <Link
                            href={`/cotacoes/${cotacao.id}/editar`}
                            className="rounded-lg border border-yellow-600/20 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-400 transition hover:bg-yellow-500/15"
                          >
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}