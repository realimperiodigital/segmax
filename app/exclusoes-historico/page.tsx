"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Filter,
  Lock,
  RefreshCcw,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import SegmaxShell, { SegmaxMenuItem } from "@/components/segmaxshell";

type HistoricoItem = {
  id: string;
  cliente_id: string;
  corretora_id: string | null;
  solicitado_por: string | null;
  aprovado_por: string | null;
  cliente_nome: string | null;
  corretora_nome: string | null;
  solicitado_por_nome: string | null;
  aprovado_por_nome: string | null;
  motivo: string;
  observacao_aprovacao: string | null;
  tipo_exclusao: "logica" | "definitiva";
  status: "pendente" | "aprovado" | "reprovado" | "cancelado";
  solicitado_em: string;
  aprovado_em: string | null;
  criado_em: string;
  atualizado_em: string;
};

type UsuarioAtual = {
  id: string;
  nome: string;
  email: string | null;
  role: string;
  corretora_id: string | null;
};

type FiltroStatus = "todos" | "pendente" | "aprovado" | "reprovado" | "cancelado";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function montarMenu(role: string): SegmaxMenuItem[] {
  const itens: SegmaxMenuItem[] = [
    { label: "Centro de Controle", href: "/dashboard" },
    { label: "Corretoras", href: "/corretoras" },
    { label: "Usuários", href: "/usuarios" },
    { label: "Clientes", href: "/clientes" },
    { label: "Seguradoras", href: "/seguradoras" },
    { label: "Cotações", href: "/cotacoes" },
    { label: "Análise Técnica", href: "/analise-tecnica" },
    { label: "Financeiro", href: "/financeiro" },
  ];

  if (role === "super_master" || role === "master") {
    itens.push({ label: "Aprovações de Exclusão", href: "/aprovacoes-exclusao" });
    itens.push({ label: "Histórico de Exclusões", href: "/exclusoes-historico" });
  }

  return itens;
}

function formatarCargo(role: string) {
  if (role === "super_master") return "Super Master";
  if (role === "master") return "Master";
  if (role === "financeiro") return "Financeiro";
  if (role === "analista") return "Analista";
  return "Usuário";
}

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-[28px]",
        "border border-[#d4af37]/14",
        "bg-black/45",
        "p-6",
        "shadow-[0_0_30px_rgba(0,0,0,0.28)]",
        "backdrop-blur-sm",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

function ActionButton({
  href,
  label,
  primary = false,
  icon,
}: {
  href: string;
  label: string;
  primary?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200",
        primary
          ? "border-[#d4af37] bg-[#d4af37] text-black hover:brightness-110"
          : "border-[#d4af37]/25 bg-black/30 text-white hover:border-[#d4af37]/40 hover:bg-[#d4af37]/8",
      ].join(" ")}
    >
      {icon}
      {label}
    </Link>
  );
}

function formatarData(data?: string | null) {
  if (!data) return "—";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(data));
  } catch {
    return data;
  }
}

function BadgeStatus({ status }: { status: HistoricoItem["status"] }) {
  if (status === "aprovado") {
    return (
      <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        Aprovado
      </span>
    );
  }

  if (status === "reprovado") {
    return (
      <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
        Reprovado
      </span>
    );
  }

  if (status === "cancelado") {
    return (
      <span className="inline-flex rounded-full border border-zinc-500/30 bg-zinc-500/10 px-3 py-1 text-xs font-semibold text-zinc-300">
        Cancelado
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
      Pendente
    </span>
  );
}

export default function ExclusoesHistoricoPage() {
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioAtual | null>(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todos");

  const totalAprovados = useMemo(
    () => historico.filter((item) => item.status === "aprovado").length,
    [historico]
  );

  const totalReprovados = useMemo(
    () => historico.filter((item) => item.status === "reprovado").length,
    [historico]
  );

  const totalPendentes = useMemo(
    () => historico.filter((item) => item.status === "pendente").length,
    [historico]
  );

  async function carregarPerfil() {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("Sessão não encontrada. Faça login novamente.");
    }

    const response = await fetch("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();

    if (!response.ok || !result?.success) {
      throw new Error(result?.message || "Não foi possível carregar o perfil.");
    }

    return {
      sessionToken: session.access_token,
      user: result.user as UsuarioAtual,
    };
  }

  async function carregarHistorico(statusAtual: FiltroStatus) {
    try {
      setCarregando(true);
      setErro("");

      const { sessionToken, user } = await carregarPerfil();
      setUsuarioAtual(user);

      if (user.role !== "super_master" && user.role !== "master") {
        setHistorico([]);
        return;
      }

      const url = `/api/clientes/exclusoes-historico?status=${statusAtual}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Não foi possível carregar o histórico.");
      }

      setHistorico(Array.isArray(result?.historico) ? result.historico : []);
    } catch (error) {
      console.error(error);
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o histórico."
      );
    } finally {
      setCarregando(false);
      setCarregandoPerfil(false);
    }
  }

  useEffect(() => {
    carregarHistorico(filtroStatus);
  }, [filtroStatus]);

  const roleAtual = usuarioAtual?.role || "usuario";
  const nomeUsuario = usuarioAtual?.nome || "Usuário";
  const cargoUsuario = formatarCargo(roleAtual);
  const menuItems = montarMenu(roleAtual);
  const acessoLiberado = roleAtual === "super_master" || roleAtual === "master";

  return (
    <SegmaxShell
      title="Histórico de exclusões"
      subtitle="Audite solicitações, decisões e observações com rastreabilidade completa."
      badge="Auditoria SegMax"
      username={nomeUsuario}
      userrole={cargoUsuario}
      menuitems={menuItems}
      actions={
        <>
          <ActionButton
            href="/aprovacoes-exclusao"
            label="Voltar para aprovações"
            icon={<ArrowRight size={18} />}
          />
          {acessoLiberado ? (
            <button
              type="button"
              onClick={() => carregarHistorico(filtroStatus)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d4af37]/25 bg-black/30 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-[#d4af37]/40 hover:bg-[#d4af37]/8"
            >
              <RefreshCcw size={18} />
              Atualizar
            </button>
          ) : null}
        </>
      }
    >
      {carregandoPerfil ? (
        <SectionCard>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center">
            <p className="text-base font-medium text-white">Carregando permissões...</p>
            <p className="mt-2 text-sm text-zinc-500">Aguarde alguns segundos.</p>
          </div>
        </SectionCard>
      ) : !acessoLiberado ? (
        <SectionCard className="border-red-500/20 bg-red-500/10">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
              <Lock size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">Acesso restrito</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Essa tela é exclusiva para master da corretora e super master.
              </p>
            </div>
          </div>
        </SectionCard>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
            <SectionCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-300">Aprovados</p>
                  <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                    {totalAprovados}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">
                    Pedidos aprovados no histórico filtrado.
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  <CheckCircle2 size={24} />
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-300">Reprovados</p>
                  <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                    {totalReprovados}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">
                    Pedidos recusados no histórico filtrado.
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
                  <XCircle size={24} />
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-300">Pendentes</p>
                  <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                    {totalPendentes}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">
                    Solicitações ainda sem decisão.
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                  <Clock3 size={24} />
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-300">Auditoria</p>
                  <h3 className="mt-4 text-2xl font-semibold leading-none text-white">
                    Ativa
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">
                    Toda solicitação e decisão fica rastreável.
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-300">
                  <ShieldCheck size={24} />
                </div>
              </div>
            </SectionCard>
          </div>

          {erro ? (
            <SectionCard className="border-red-500/20 bg-red-500/10">
              <p className="text-sm font-semibold text-red-300">{erro}</p>
            </SectionCard>
          ) : null}

          <SectionCard>
            <div className="flex flex-col gap-4 border-b border-white/8 pb-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Histórico completo
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Filtre por status e acompanhe a trilha completa de decisão.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <Filter size={18} className="text-zinc-400" />
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
                  className="bg-transparent text-sm text-white outline-none"
                >
                  <option value="todos" className="bg-[#111]">
                    Todos
                  </option>
                  <option value="pendente" className="bg-[#111]">
                    Pendentes
                  </option>
                  <option value="aprovado" className="bg-[#111]">
                    Aprovados
                  </option>
                  <option value="reprovado" className="bg-[#111]">
                    Reprovados
                  </option>
                  <option value="cancelado" className="bg-[#111]">
                    Cancelados
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              {carregando ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center">
                  <p className="text-base font-medium text-white">
                    Carregando histórico...
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    Aguarde alguns segundos.
                  </p>
                </div>
              ) : historico.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center">
                  <p className="text-base font-medium text-white">
                    Nenhum registro encontrado
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    Não há itens para o filtro selecionado.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historico.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5"
                    >
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1fr_1fr]">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
                              <AlertTriangle size={20} />
                            </div>

                            <div>
                              <p className="text-lg font-semibold text-white">
                                {item.cliente_nome || "Cliente não identificado"}
                              </p>
                              <div className="mt-2">
                                <BadgeStatus status={item.status} />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-zinc-300">
                              <Building2 size={16} className="text-[#d4af37]" />
                              <span>
                                Corretora: {item.corretora_nome || "Não informada"}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-zinc-300">
                              <UserRound size={16} className="text-[#d4af37]" />
                              <span>
                                Solicitado por:{" "}
                                {item.solicitado_por_nome || "Usuário não identificado"}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-zinc-300">
                              <Clock3 size={16} className="text-[#d4af37]" />
                              <span>Solicitado em: {formatarData(item.solicitado_em)}</span>
                            </div>

                            <div className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                              {item.tipo_exclusao === "definitiva"
                                ? "Exclusão definitiva"
                                : "Exclusão lógica"}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                            Motivo da solicitação
                          </p>
                          <p className="mt-3 text-sm leading-6 text-zinc-300">
                            {item.motivo}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                            Decisão e observação
                          </p>

                          <div className="mt-3 space-y-3 text-sm text-zinc-300">
                            <p>
                              <span className="text-zinc-500">Decidido por:</span>{" "}
                              {item.aprovado_por_nome || "—"}
                            </p>
                            <p>
                              <span className="text-zinc-500">Decidido em:</span>{" "}
                              {formatarData(item.aprovado_em)}
                            </p>
                            <div>
                              <p className="text-zinc-500">Observação:</p>
                              <p className="mt-2 leading-6 text-zinc-300">
                                {item.observacao_aprovacao?.trim() || "Sem observação registrada."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </>
      )}
    </SegmaxShell>
  );
}