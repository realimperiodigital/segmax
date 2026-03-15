"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UsuarioSistema = {
  id: string;
  nome: string | null;
  email: string | null;
  permissao: string | null;
  corretora: string | null;
  status: string | null;
};

type ClienteResumo = {
  id: string;
  nome: string | null;
  created_at?: string | null;
};

type CotacaoResumo = {
  id: string;
  status: string | null;
  created_at?: string | null;
};

type Movimento = {
  id: string;
  titulo: string;
  subtitulo: string;
  data: string;
  tipo: "cliente" | "cotacao";
};

function formatarPerfil(permissao?: string | null) {
  if (!permissao) return "Usuário";
  if (permissao === "master") return "Diretor Geral";
  if (permissao === "diretora_tecnica") return "Diretora Técnica";
  if (permissao === "diretora_financeira") return "Diretora Financeira";
  if (permissao === "admin_corretora") return "Admin da Corretora";
  if (permissao === "corretor") return "Corretor";
  return permissao;
}

function formatarData(data?: string | null) {
  if (!data) return "-";
  try {
    return new Date(data).toLocaleDateString("pt-BR");
  } catch {
    return "-";
  }
}

export default function DashboardPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioSistema | null>(null);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalCotacoes, setTotalCotacoes] = useState(0);
  const [cotacoesAndamento, setCotacoesAndamento] = useState(0);
  const [cotacoesFechadas, setCotacoesFechadas] = useState(0);
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarDashboard() {
    try {
      setCarregando(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: usuarioDb } = await supabase
        .from("usuarios")
        .select("id, nome, email, permissao, corretora, status")
        .eq("id", user.id)
        .maybeSingle();

      if (usuarioDb) {
        setUsuario(usuarioDb as UsuarioSistema);
      } else {
        setUsuario({
          id: user.id,
          nome: user.email || "Usuário",
          email: user.email || null,
          permissao: "corretor",
          corretora: "Sem corretora",
          status: "ativo",
        });
      }

      const { count: countClientes } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true });

      setTotalClientes(countClientes || 0);

      const { count: countCotacoes } = await supabase
        .from("cotacoes")
        .select("*", { count: "exact", head: true });

      setTotalCotacoes(countCotacoes || 0);

      let andamento = 0;
      let fechadas = 0;

      const { data: cotacoesStatus } = await supabase
        .from("cotacoes")
        .select("id, status, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      const listaCotacoes = (cotacoesStatus || []) as CotacaoResumo[];

      for (const item of listaCotacoes) {
        const status = (item.status || "").toLowerCase();

        if (
          status.includes("analise") ||
          status.includes("andamento") ||
          status.includes("pendente") ||
          status.includes("aberta") ||
          status.includes("negoci")
        ) {
          andamento += 1;
        }

        if (
          status.includes("fech") ||
          status.includes("aprov") ||
          status.includes("emitid") ||
          status.includes("ganha")
        ) {
          fechadas += 1;
        }
      }

      setCotacoesAndamento(andamento);
      setCotacoesFechadas(fechadas);

      const { data: clientesRecentes } = await supabase
        .from("clientes")
        .select("id, nome, created_at")
        .order("created_at", { ascending: false })
        .limit(4);

      const movimentosClientes: Movimento[] = ((clientesRecentes || []) as ClienteResumo[]).map(
        (item) => ({
          id: item.id,
          titulo: item.nome || "Cliente sem nome",
          subtitulo: "Novo cliente cadastrado",
          data: item.created_at || "",
          tipo: "cliente",
        })
      );

      const movimentosCotacoes: Movimento[] = listaCotacoes.slice(0, 4).map((item) => ({
        id: item.id,
        titulo: `Cotação ${item.id.slice(0, 8)}`,
        subtitulo: `Status: ${item.status || "Sem status"}`,
        data: item.created_at || "",
        tipo: "cotacao",
      }));

      const listaMovimentos = [...movimentosClientes, ...movimentosCotacoes]
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, 6);

      setMovimentos(listaMovimentos);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function sairSistema() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const nomeExibicao = useMemo(() => {
    if (!usuario?.nome) return "Usuário";
    return usuario.nome;
  }, [usuario]);

  const perfilExibicao = useMemo(() => {
    return formatarPerfil(usuario?.permissao);
  }, [usuario]);

  return (
    <div className="min-h-screen bg-[#050505] px-5 py-5 text-white md:px-8">
      <div className="mx-auto grid max-w-[1450px] grid-cols-1 gap-5 xl:grid-cols-[280px_1fr]">
        {/* SIDEBAR */}
        <aside className="rounded-[30px] border border-yellow-600/15 bg-[#080808] p-5 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
          <div className="flex h-full flex-col">
            <div className="mb-6 flex items-center justify-center rounded-[24px] border border-yellow-600/10 bg-[#0d0d0d] p-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-yellow-600/20 bg-black text-center text-sm font-semibold text-yellow-400">
                SEGMAX
              </div>
            </div>

            <div className="rounded-[26px] border border-yellow-600/15 bg-[#111111] p-5">
              <div className="mb-4 inline-flex rounded-full border border-yellow-600/20 bg-[#171717] px-4 py-2 text-sm font-semibold text-yellow-400">
                Acesso liberado
              </div>

              <h2 className="text-3xl font-bold leading-tight">{nomeExibicao}</h2>

              <p className="mt-3 text-sm uppercase tracking-[0.18em] text-zinc-400">
                {perfilExibicao}
              </p>

              <p className="mt-4 text-sm text-zinc-400">
                {usuario?.corretora || "Sem corretora"}
              </p>
            </div>

            <nav className="mt-5 space-y-3">
              <Link
                href="/dashboard"
                className="block rounded-2xl bg-yellow-500 px-5 py-4 text-base font-semibold text-black transition hover:bg-yellow-400"
              >
                Visão geral
              </Link>

              <Link
                href="/clientes/novo"
                className="block rounded-2xl border border-zinc-800 bg-[#111111] px-5 py-4 text-base font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
              >
                Cadastrar cliente
              </Link>

              <Link
                href="/clientes"
                className="block rounded-2xl border border-zinc-800 bg-[#111111] px-5 py-4 text-base font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
              >
                Lista de clientes
              </Link>

              <Link
                href="/cotacoes/nova"
                className="block rounded-2xl border border-zinc-800 bg-[#111111] px-5 py-4 text-base font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
              >
                Nova cotação
              </Link>

              <Link
                href="/relatorios/sintetico"
                className="block rounded-2xl border border-zinc-800 bg-[#111111] px-5 py-4 text-base font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
              >
                Relatório sintético
              </Link>

              <Link
                href="/relatorios/analitico"
                className="block rounded-2xl border border-zinc-800 bg-[#111111] px-5 py-4 text-base font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
              >
                Relatório analítico
              </Link>
            </nav>

            <button
              type="button"
              onClick={sairSistema}
              className="mt-5 rounded-2xl border border-red-500/20 bg-[#111111] px-5 py-4 text-left text-base font-semibold text-white transition hover:bg-[#151515]"
            >
              Sair do sistema
            </button>
          </div>
        </aside>

        {/* CONTEÚDO */}
        <main className="space-y-5">
          {/* HERO */}
          <section className="rounded-[30px] border border-yellow-600/15 bg-[#080808] px-6 py-7 shadow-[0_0_40px_rgba(0,0,0,0.35)] md:px-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-4xl">
                <div className="mb-4 inline-flex rounded-full border border-yellow-600/20 bg-[#111111] px-4 py-2 text-sm font-semibold text-yellow-400">
                  Dashboard
                </div>

                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
                  SegMax Control
                </p>

                <h1 className="mt-4 text-5xl font-bold leading-[0.95] md:text-7xl">
                  Visão geral da operação.
                </h1>

                <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
                  Ambiente central para acompanhar clientes, cotações e relatórios da corretora
                  com acesso rápido ao que realmente importa na operação.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/clientes/novo"
                  className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400"
                >
                  Cadastrar cliente
                </Link>

                <Link
                  href="/cotacoes/nova"
                  className="rounded-xl border border-zinc-700 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
                >
                  Nova cotação
                </Link>

                <button
                  type="button"
                  onClick={carregarDashboard}
                  className="rounded-xl border border-zinc-700 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
                >
                  Atualizar
                </button>
              </div>
            </div>
          </section>

          {/* CARDS */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <div className="rounded-[26px] border border-yellow-600/15 bg-[#0a0a0a] p-6">
              <p className="text-lg text-zinc-400">Clientes cadastrados</p>
              <h3 className="mt-4 text-5xl font-bold">{carregando ? "..." : totalClientes}</h3>
              <p className="mt-4 text-base text-zinc-500">Base pronta para relacionamento</p>
            </div>

            <div className="rounded-[26px] border border-yellow-600/15 bg-[#0a0a0a] p-6">
              <p className="text-lg text-zinc-400">Cotações registradas</p>
              <h3 className="mt-4 text-5xl font-bold">{carregando ? "..." : totalCotacoes}</h3>
              <p className="mt-4 text-base text-zinc-500">Volume total da operação</p>
            </div>

            <div className="rounded-[26px] border border-yellow-600/15 bg-[#0a0a0a] p-6">
              <p className="text-lg text-zinc-400">Em andamento</p>
              <h3 className="mt-4 text-5xl font-bold text-yellow-400">
                {carregando ? "..." : cotacoesAndamento}
              </h3>
              <p className="mt-4 text-base text-zinc-500">Cotações que pedem acompanhamento</p>
            </div>

            <div className="rounded-[26px] border border-yellow-600/15 bg-[#0a0a0a] p-6">
              <p className="text-lg text-zinc-400">Fechadas</p>
              <h3 className="mt-4 text-5xl font-bold">{carregando ? "..." : cotacoesFechadas}</h3>
              <p className="mt-4 text-base text-zinc-500">Negócios concluídos no sistema</p>
            </div>
          </section>

          {/* AÇÕES RÁPIDAS */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[30px] border border-yellow-600/15 bg-[#0a0a0a] p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-4xl font-bold">Ações rápidas</h2>
                  <p className="mt-3 text-base text-zinc-400">
                    Entre direto no ponto principal da operação.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Link
                  href="/clientes/novo"
                  className="rounded-[24px] border border-yellow-600/15 bg-[#111111] p-5 transition hover:border-yellow-500/30 hover:bg-[#151515]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-yellow-400">
                    Clientes
                  </p>
                  <h3 className="mt-3 text-2xl font-bold">Cadastrar cliente</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    Crie novos cadastros para alimentar a base comercial da corretora.
                  </p>
                </Link>

                <Link
                  href="/clientes"
                  className="rounded-[24px] border border-yellow-600/15 bg-[#111111] p-5 transition hover:border-yellow-500/30 hover:bg-[#151515]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-yellow-400">
                    Clientes
                  </p>
                  <h3 className="mt-3 text-2xl font-bold">Lista de clientes</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    Veja a carteira, encontre clientes rápido e entre para editar quando precisar.
                  </p>
                </Link>

                <Link
                  href="/cotacoes/nova"
                  className="rounded-[24px] border border-yellow-600/15 bg-[#111111] p-5 transition hover:border-yellow-500/30 hover:bg-[#151515]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-yellow-400">
                    Cotações
                  </p>
                  <h3 className="mt-3 text-2xl font-bold">Nova cotação</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    Abra uma nova cotação vinculada ao cliente e acompanhe cada avanço.
                  </p>
                </Link>

                <Link
                  href="/relatorios/sintetico"
                  className="rounded-[24px] border border-yellow-600/15 bg-[#111111] p-5 transition hover:border-yellow-500/30 hover:bg-[#151515]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-yellow-400">
                    Relatórios
                  </p>
                  <h3 className="mt-3 text-2xl font-bold">Relatório sintético</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    Tenha uma visão rápida de clientes, carteira e andamento das cotações.
                  </p>
                </Link>

                <Link
                  href="/relatorios/analitico"
                  className="rounded-[24px] border border-yellow-600/15 bg-[#111111] p-5 transition hover:border-yellow-500/30 hover:bg-[#151515] md:col-span-2"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-yellow-400">
                    Relatórios
                  </p>
                  <h3 className="mt-3 text-2xl font-bold">Relatório analítico</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    Entre no detalhe das cotações, acompanhe evolução por cliente e identifique o
                    que precisa de edição ou retorno comercial.
                  </p>
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-yellow-600/15 bg-[#0a0a0a] p-6">
              <div className="mb-6">
                <h2 className="text-4xl font-bold">Movimentações recentes</h2>
                <p className="mt-3 text-base text-zinc-400">
                  Últimos registros feitos no sistema.
                </p>
              </div>

              <div className="space-y-4">
                {movimentos.length === 0 ? (
                  <div className="rounded-[22px] border border-zinc-800 bg-[#111111] p-5 text-sm text-zinc-400">
                    Ainda não há movimentações recentes para mostrar.
                  </div>
                ) : (
                  movimentos.map((item) => (
                    <div
                      key={`${item.tipo}-${item.id}`}
                      className="rounded-[22px] border border-zinc-800 bg-[#111111] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold text-white">{item.titulo}</p>
                          <p className="mt-2 text-sm text-zinc-400">{item.subtitulo}</p>
                        </div>

                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            item.tipo === "cliente"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-white/10 text-zinc-300",
                          ].join(" ")}
                        >
                          {item.tipo === "cliente" ? "Cliente" : "Cotação"}
                        </span>
                      </div>

                      <p className="mt-4 text-sm text-zinc-500">{formatarData(item.data)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* PAINEL DE OPERAÇÃO */}
          <section className="rounded-[30px] border border-yellow-600/15 bg-[#0a0a0a] p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-4xl font-bold">Painel de operação</h2>
                <p className="mt-3 text-base text-zinc-400">
                  Caminhos principais do dia a dia da corretora.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/clientes"
                  className="rounded-xl border border-zinc-700 bg-[#111111] px-4 py-3 text-sm font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
                >
                  Abrir clientes
                </Link>

                <Link
                  href="/cotacoes"
                  className="rounded-xl border border-zinc-700 bg-[#111111] px-4 py-3 text-sm font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
                >
                  Abrir cotações
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-[24px] border border-zinc-800 bg-[#111111] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
                  Etapa 1
                </p>
                <h3 className="mt-3 text-2xl font-bold">Cadastrar cliente</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Crie a base com dados corretos para depois abrir cotações e acompanhar o
                  histórico.
                </p>
              </div>

              <div className="rounded-[24px] border border-zinc-800 bg-[#111111] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
                  Etapa 2
                </p>
                <h3 className="mt-3 text-2xl font-bold">Abrir cotação</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Inicie a tratativa comercial, registre o status e mantenha a carteira organizada.
                </p>
              </div>

              <div className="rounded-[24px] border border-zinc-800 bg-[#111111] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
                  Etapa 3
                </p>
                <h3 className="mt-3 text-2xl font-bold">Ler os relatórios</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Tenha visão sintética e analítica para decidir onde agir e o que ajustar.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}