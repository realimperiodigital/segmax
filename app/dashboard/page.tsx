"use client";

import Link from "next/link";
import SegmaxShell from "@/components/segmaxshell";
import type { SegmaxMenuItem } from "@/components/segmaxsidebar";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  FileSearch,
  LayoutDashboard,
  ShieldCheck,
  Users,
  UserCog,
  Wallet,
  Activity,
  Settings,
  ChevronRight,
} from "lucide-react";

type StatusCorretora = "Ativa" | "Suspensa" | "Bloqueada";
type StatusCotacao = "Em análise" | "Aguardando documentos" | "Parecer emitido" | "Crítico";

type CorretoraResumo = {
  id: number;
  nome: string;
  plano: string;
  status: StatusCorretora;
  usuarios: number;
  clientes: number;
};

type CotacaoResumo = {
  id: number;
  cliente: string;
  corretora: string;
  ramo: string;
  status: StatusCotacao;
  prioridade: "Alta" | "Média" | "Baixa";
};

type AlertaResumo = {
  id: number;
  titulo: string;
  descricao: string;
  tipo: "critico" | "atencao" | "ok";
};

const menuitems: SegmaxMenuItem[] = [
  { label: "Dashboard Master", href: "/dashboard", icon: LayoutDashboard },
  { label: "Corretoras", href: "/corretoras", icon: Building2 },
  { label: "Usuários", href: "/usuarios", icon: UserCog },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Cotações", href: "/cotacoes", icon: ClipboardList },
  { label: "Análise Técnica", href: "/analise-tecnica", icon: FileSearch },
  { label: "Financeiro", href: "/financeiro", icon: Wallet },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { label: "Monitoramento", href: "/monitoramento", icon: Activity },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

const corretorasResumo: CorretoraResumo[] = [
  {
    id: 1,
    nome: "Prime Broker Seguros",
    plano: "Executive",
    status: "Ativa",
    usuarios: 8,
    clientes: 41,
  },
  {
    id: 2,
    nome: "Atlas Corretora",
    plano: "Elite",
    status: "Ativa",
    usuarios: 4,
    clientes: 23,
  },
  {
    id: 3,
    nome: "Fortis Risk",
    plano: "Prime",
    status: "Suspensa",
    usuarios: 2,
    clientes: 9,
  },
  {
    id: 4,
    nome: "Alpha Consult",
    plano: "Full",
    status: "Ativa",
    usuarios: 11,
    clientes: 58,
  },
];

const cotacoesResumo: CotacaoResumo[] = [
  {
    id: 1,
    cliente: "Metalúrgica Horizonte",
    corretora: "Prime Broker Seguros",
    ramo: "Patrimonial",
    status: "Em análise",
    prioridade: "Alta",
  },
  {
    id: 2,
    cliente: "Logística Delta",
    corretora: "Atlas Corretora",
    ramo: "Empresarial",
    status: "Aguardando documentos",
    prioridade: "Média",
  },
  {
    id: 3,
    cliente: "Rede Nova Sul",
    corretora: "Alpha Consult",
    ramo: "Patrimonial",
    status: "Parecer emitido",
    prioridade: "Baixa",
  },
  {
    id: 4,
    cliente: "Indústria Vale Forte",
    corretora: "Prime Broker Seguros",
    ramo: "Riscos Operacionais",
    status: "Crítico",
    prioridade: "Alta",
  },
];

const alertasResumo: AlertaResumo[] = [
  {
    id: 1,
    titulo: "Corretora com status suspenso",
    descricao: "Existe 1 corretora com acesso suspenso aguardando revisão master.",
    tipo: "atencao",
  },
  {
    id: 2,
    titulo: "Cotação crítica em andamento",
    descricao: "1 operação técnica exige priorização imediata do núcleo de análise.",
    tipo: "critico",
  },
  {
    id: 3,
    titulo: "Base operacional estável",
    descricao: "Cadastros, usuários e fluxo principal operando normalmente.",
    tipo: "ok",
  },
];

function statusCorretoraClass(status: StatusCorretora) {
  switch (status) {
    case "Ativa":
      return "border-emerald-500/30 bg-emerald-500/12 text-emerald-300";
    case "Suspensa":
      return "border-yellow-500/30 bg-yellow-500/12 text-yellow-300";
    case "Bloqueada":
      return "border-red-500/30 bg-red-500/12 text-red-300";
    default:
      return "border-white/10 bg-white/5 text-white";
  }
}

function statusCotacaoClass(status: StatusCotacao) {
  switch (status) {
    case "Em análise":
      return "border-blue-500/30 bg-blue-500/12 text-blue-300";
    case "Aguardando documentos":
      return "border-yellow-500/30 bg-yellow-500/12 text-yellow-300";
    case "Parecer emitido":
      return "border-emerald-500/30 bg-emerald-500/12 text-emerald-300";
    case "Crítico":
      return "border-red-500/30 bg-red-500/12 text-red-300";
    default:
      return "border-white/10 bg-white/5 text-white";
  }
}

function prioridadeClass(prioridade: CotacaoResumo["prioridade"]) {
  switch (prioridade) {
    case "Alta":
      return "border-red-500/30 bg-red-500/12 text-red-300";
    case "Média":
      return "border-yellow-500/30 bg-yellow-500/12 text-yellow-300";
    case "Baixa":
      return "border-emerald-500/30 bg-emerald-500/12 text-emerald-300";
    default:
      return "border-white/10 bg-white/5 text-white";
  }
}

function alertaClass(tipo: AlertaResumo["tipo"]) {
  switch (tipo) {
    case "critico":
      return "border-red-500/30 bg-red-500/10";
    case "atencao":
      return "border-yellow-500/30 bg-yellow-500/10";
    case "ok":
      return "border-emerald-500/30 bg-emerald-500/10";
    default:
      return "border-white/10 bg-white/5";
  }
}

export default function DashboardMasterPage() {
  return (
    <SegmaxShell
      title="Dashboard Master"
      subtitle="Controle total da operação SegMax, com visão estratégica sobre corretoras, usuários, clientes, cotações, área técnica e financeiro."
      badge="SEGMAX MASTER CONTROL"
      username="Renato"
      userrole="SUPER MASTER"
      arealabel="ÁREA MASTER"
      menuitems={menuitems}
      actions={
        <>
          <Link
            href="/corretoras/nova"
            className="rounded-2xl border border-[#d4af37]/40 bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Nova corretora
          </Link>

          <Link
            href="/usuarios/novo"
            className="rounded-2xl border border-[#d4af37]/20 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-[#f6dc8a] transition hover:bg-[#d4af37]/10"
          >
            Novo usuário
          </Link>

          <Link
            href="/cotacoes"
            className="rounded-2xl border border-[#d4af37]/20 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-[#f6dc8a] transition hover:bg-[#d4af37]/10"
          >
            Ver cotações
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-[#d4af37]/15 bg-black/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Corretoras ativas</p>
              <p className="mt-3 text-4xl font-bold text-white">14</p>
              <p className="mt-2 text-sm text-zinc-500">Base principal em operação</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#e8c768]">
              <Building2 size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#d4af37]/15 bg-black/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Usuários ativos</p>
              <p className="mt-3 text-4xl font-bold text-white">39</p>
              <p className="mt-2 text-sm text-zinc-500">Entre master e corretoras</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#e8c768]">
              <Users size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#d4af37]/15 bg-black/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Cotações em andamento</p>
              <p className="mt-3 text-4xl font-bold text-white">27</p>
              <p className="mt-2 text-sm text-zinc-500">Operação comercial ativa</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#e8c768]">
              <ClipboardList size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#d4af37]/15 bg-black/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Alertas operacionais</p>
              <p className="mt-3 text-4xl font-bold text-white">3</p>
              <p className="mt-2 text-sm text-zinc-500">Pontos sob monitoramento</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#e8c768]">
              <Bell size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-[#d4af37]/15 bg-black/60 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Corretoras em destaque</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Visão rápida das principais contas da operação.
              </p>
            </div>

            <Link
              href="/corretoras"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d4af37]/20 px-3 py-2 text-sm text-[#f6dc8a] transition hover:bg-[#d4af37]/10"
            >
              Ver tudo
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-zinc-500">
                  <th className="px-3">Corretora</th>
                  <th className="px-3">Plano</th>
                  <th className="px-3">Status</th>
                  <th className="px-3">Usuários</th>
                  <th className="px-3">Clientes</th>
                </tr>
              </thead>

              <tbody>
                {corretorasResumo.map((item) => (
                  <tr key={item.id} className="bg-white/[0.03] text-sm text-zinc-200">
                    <td className="rounded-l-2xl px-3 py-4 font-medium">{item.nome}</td>
                    <td className="px-3 py-4 text-zinc-300">{item.plano}</td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusCorretoraClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-4">{item.usuarios}</td>
                    <td className="rounded-r-2xl px-3 py-4">{item.clientes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[#d4af37]/15 bg-black/60 p-5">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="text-[#e8c768]" size={20} />
              <div>
                <h2 className="text-xl font-semibold text-white">Atalhos rápidos</h2>
                <p className="text-sm text-zinc-400">Acesso direto aos blocos principais.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/corretoras"
                className="rounded-2xl border border-[#d4af37]/20 bg-white/[0.03] px-4 py-4 text-sm font-medium text-white transition hover:bg-[#d4af37]/10"
              >
                Gerenciar corretoras
              </Link>

              <Link
                href="/usuarios"
                className="rounded-2xl border border-[#d4af37]/20 bg-white/[0.03] px-4 py-4 text-sm font-medium text-white transition hover:bg-[#d4af37]/10"
              >
                Gerenciar usuários
              </Link>

              <Link
                href="/clientes"
                className="rounded-2xl border border-[#d4af37]/20 bg-white/[0.03] px-4 py-4 text-sm font-medium text-white transition hover:bg-[#d4af37]/10"
              >
                Ver clientes
              </Link>

              <Link
                href="/analise-tecnica"
                className="rounded-2xl border border-[#d4af37]/20 bg-white/[0.03] px-4 py-4 text-sm font-medium text-white transition hover:bg-[#d4af37]/10"
              >
                Abrir área técnica
              </Link>

              <Link
                href="/financeiro"
                className="rounded-2xl border border-[#d4af37]/20 bg-white/[0.03] px-4 py-4 text-sm font-medium text-white transition hover:bg-[#d4af37]/10"
              >
                Abrir financeiro
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d4af37]/15 bg-black/60 p-5">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">Indicadores rápidos</h2>
              <p className="text-sm text-zinc-400">Pulso imediato da operação master.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-sm text-zinc-400">Conversão técnica</p>
                <p className="mt-2 text-2xl font-bold text-white">74%</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-sm text-zinc-400">Clientes ativos</p>
                <p className="mt-2 text-2xl font-bold text-white">131</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-sm text-zinc-400">Pendências</p>
                <p className="mt-2 text-2xl font-bold text-white">7</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-sm text-zinc-400">Fluxo estável</p>
                <p className="mt-2 text-2xl font-bold text-white">92%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-3xl border border-[#d4af37]/15 bg-black/60 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Cotações estratégicas</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Processos que merecem visão do master.
              </p>
            </div>

            <Link
              href="/cotacoes"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d4af37]/20 px-3 py-2 text-sm text-[#f6dc8a] transition hover:bg-[#d4af37]/10"
            >
              Abrir módulo
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="space-y-3">
            {cotacoesResumo.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-white">{item.cliente}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {item.corretora} • {item.ramo}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusCotacaoClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${prioridadeClass(
                        item.prioridade
                      )}`}
                    >
                      Prioridade {item.prioridade}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#d4af37]/15 bg-black/60 p-5">
          <div className="mb-4 flex items-center gap-3">
            <AlertTriangle className="text-[#e8c768]" size={20} />
            <div>
              <h2 className="text-xl font-semibold text-white">Alertas do sistema</h2>
              <p className="text-sm text-zinc-400">Pontos de atenção do dia.</p>
            </div>
          </div>

          <div className="space-y-3">
            {alertasResumo.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 ${alertaClass(item.tipo)}`}
              >
                <p className="font-medium text-white">{item.titulo}</p>
                <p className="mt-1 text-sm text-zinc-300">{item.descricao}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-[#d4af37]/20 bg-gradient-to-r from-[#d4af37]/10 to-transparent p-4">
            <p className="text-sm font-medium text-[#f6dc8a]">Direção sugerida</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Fechar primeiro as pendências críticas da área técnica, validar as
              corretoras com status sensível e manter o núcleo de usuários, clientes
              e cotação totalmente blindado antes do avanço comercial mais pesado.
            </p>
          </div>
        </div>
      </div>
    </SegmaxShell>
  );
}