"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: string;
  nome: string | null;
  tipo_pessoa: string | null;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean | null;
  excluido: boolean | null;
  created_at: string | null;
};

function formatarDocumento(valor?: string | null) {
  if (!valor) return "-";
  return valor;
}

function formatarData(valor?: string | null) {
  if (!valor) return "-";
  try {
    return new Date(valor).toLocaleDateString("pt-BR");
  } catch {
    return "-";
  }
}

function formatarTipoPessoa(tipo?: string | null) {
  if (!tipo) return "-";
  if (tipo.toLowerCase() === "pf") return "PF";
  if (tipo.toLowerCase() === "pj") return "PJ";
  return tipo.toUpperCase();
}

export default function ClientesPage() {
  const router = useRouter();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarClientes() {
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

      const { data, error } = await supabase
        .from("clientes")
        .select(
          "id, nome, tipo_pessoa, cpf_cnpj, email, telefone, cidade, estado, ativo, excluido, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setErro(error.message);
        setClientes([]);
        return;
      }

      const lista = ((data || []) as Cliente[]).filter((item) => !item.excluido);
      setClientes(lista);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar os clientes.");
      setClientes([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return clientes;

    return clientes.filter((cliente) => {
      return (
        (cliente.nome || "").toLowerCase().includes(termo) ||
        (cliente.email || "").toLowerCase().includes(termo) ||
        (cliente.telefone || "").toLowerCase().includes(termo) ||
        (cliente.cpf_cnpj || "").toLowerCase().includes(termo) ||
        (cliente.cidade || "").toLowerCase().includes(termo) ||
        (cliente.estado || "").toLowerCase().includes(termo) ||
        (cliente.tipo_pessoa || "").toLowerCase().includes(termo)
      );
    });
  }, [clientes, busca]);

  const totalClientes = clientes.length;
  const ativos = clientes.filter((c) => c.ativo === true).length;
  const inativos = clientes.filter((c) => c.ativo === false).length;
  const pf = clientes.filter((c) => (c.tipo_pessoa || "").toLowerCase() === "pf").length;
  const pj = clientes.filter((c) => (c.tipo_pessoa || "").toLowerCase() === "pj").length;

  async function sairSistema() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#050505] px-5 py-5 text-white md:px-8">
      <div className="mx-auto max-w-[1450px] space-y-5">
        {/* HERO */}
        <section className="rounded-[30px] border border-yellow-600/15 bg-[#080808] px-6 py-7 shadow-[0_0_40px_rgba(0,0,0,0.35)] md:px-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-4xl">
              <div className="mb-4 inline-flex rounded-full border border-yellow-600/20 bg-[#111111] px-4 py-2 text-sm font-semibold text-yellow-400">
                Clientes
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
                SegMax Control
              </p>

              <h1 className="mt-4 text-5xl font-bold leading-[0.95] md:text-7xl">
                Lista de clientes.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
                Encontre, acompanhe e edite os clientes da corretora com acesso rápido para abrir
                nova cotação e consultar relatórios.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/clientes/novo"
                className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400"
              >
                Cadastrar cliente
              </Link>

              <button
                type="button"
                onClick={carregarClientes}
                className="rounded-xl border border-zinc-700 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
              >
                Atualizar
              </button>

              <Link
                href="/dashboard"
                className="rounded-xl border border-zinc-700 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
              >
                Voltar ao dashboard
              </Link>

              <button
                type="button"
                onClick={sairSistema}
                className="rounded-xl border border-red-500/20 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#151515]"
              >
                Sair do sistema
              </button>
            </div>
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Total de clientes</p>
            <h3 className="mt-2 text-5xl font-bold">{totalClientes}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-yellow-500">Ativos</p>
            <h3 className="mt-2 text-5xl font-bold text-yellow-400">{ativos}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Inativos</p>
            <h3 className="mt-2 text-5xl font-bold">{inativos}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Pessoa Física</p>
            <h3 className="mt-2 text-5xl font-bold">{pf}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Pessoa Jurídica</p>
            <h3 className="mt-2 text-5xl font-bold">{pj}</h3>
          </div>
        </section>

        {/* BUSCA */}
        <section className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Busca e controle</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Procure por nome, documento, e-mail, telefone, cidade, estado ou tipo.
              </p>
            </div>

            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente, documento, e-mail, telefone, cidade..."
              className="w-full max-w-[520px] rounded-xl border border-yellow-600/20 bg-[#050505] px-4 py-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
            />
          </div>
        </section>

        {/* TABELA */}
        <section className="rounded-[30px] border border-yellow-600/15 bg-[#0a0a0a] p-6">
          <div className="mb-6">
            <h2 className="text-4xl font-bold">Carteira de clientes</h2>
            <p className="mt-3 text-base text-zinc-400">
              Visualize a base, entre para editar, abra nova cotação e consulte os relatórios do
              cliente.
            </p>
          </div>

          {erro ? (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {erro}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="min-w-[1350px] w-full border-collapse">
              <thead>
                <tr className="border-b border-yellow-600/10 text-left text-xs uppercase tracking-[0.25em] text-zinc-400">
                  <th className="px-4 py-4">Cliente</th>
                  <th className="px-4 py-4">Tipo</th>
                  <th className="px-4 py-4">Documento</th>
                  <th className="px-4 py-4">Contato</th>
                  <th className="px-4 py-4">Localização</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Cadastro</th>
                  <th className="px-4 py-4">Ações</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-zinc-400">
                      Carregando clientes...
                    </td>
                  </tr>
                ) : clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-zinc-400">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="border-b border-yellow-600/10 transition hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-5">
                        <div>
                          <p className="font-semibold text-white">{cliente.nome || "-"}</p>
                          <p className="mt-1 text-sm text-zinc-500">{cliente.email || "-"}</p>
                        </div>
                      </td>

                      <td className="px-4 py-5 text-zinc-300">
                        {formatarTipoPessoa(cliente.tipo_pessoa)}
                      </td>

                      <td className="px-4 py-5 text-zinc-300">
                        {formatarDocumento(cliente.cpf_cnpj)}
                      </td>

                      <td className="px-4 py-5 text-zinc-300">
                        {cliente.telefone || "-"}
                      </td>

                      <td className="px-4 py-5 text-zinc-300">
                        {cliente.cidade || "-"}
                        {cliente.estado ? ` / ${cliente.estado}` : ""}
                      </td>

                      <td className="px-4 py-5">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                            cliente.ativo
                              ? "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20"
                              : "bg-zinc-500/10 text-zinc-300 ring-1 ring-zinc-500/20",
                          ].join(" ")}
                        >
                          {cliente.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      <td className="px-4 py-5 text-zinc-300">
                        {formatarData(cliente.created_at)}
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/clientes/${cliente.id}`}
                            className="rounded-lg border border-zinc-700 bg-[#111111] px-3 py-2 text-xs font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
                          >
                            Ver
                          </Link>

                          <Link
                            href={`/clientes/${cliente.id}/editar`}
                            className="rounded-lg border border-yellow-600/20 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-400 transition hover:bg-yellow-500/15"
                          >
                            Editar
                          </Link>

                          <Link
                            href={`/cotacoes/nova?cliente=${cliente.id}`}
                            className="rounded-lg border border-zinc-700 bg-[#111111] px-3 py-2 text-xs font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
                          >
                            Nova cotação
                          </Link>

                          <Link
                            href={`/relatorios/analitico?cliente=${cliente.id}`}
                            className="rounded-lg border border-zinc-700 bg-[#111111] px-3 py-2 text-xs font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
                          >
                            Relatórios
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