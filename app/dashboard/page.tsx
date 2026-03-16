"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  ClipboardList,
  ShieldCheck,
  Users,
} from "lucide-react";
import SegmaxShell, { SegmaxMenuItem } from "@/components/segmaxshell";

const menuItems: SegmaxMenuItem[] = [
  { label: "Centro de Controle", href: "/dashboard", exact: true },
  { label: "Corretoras", href: "/corretoras" },
  { label: "Usuários", href: "/usuarios" },
  { label: "Clientes", href: "/clientes" },
  { label: "Seguradoras", href: "/seguradoras" },
  { label: "Cotações", href: "/cotacoes" },
  { label: "Análise Técnica", href: "/analise-tecnica" },
  { label: "Financeiro", href: "/financeiro" },
];

const indicadores = [
  {
    titulo: "Corretoras ativas",
    valor: "14",
    descricao: "Base principal em operação",
    icone: Building2,
  },
  {
    titulo: "Usuários ativos",
    valor: "39",
    descricao: "Entre master e corretoras",
    icone: Users,
  },
  {
    titulo: "Cotações em andamento",
    valor: "27",
    descricao: "Operação comercial ativa",
    icone: ClipboardList,
  },
  {
    titulo: "Alertas operacionais",
    valor: "3",
    descricao: "Pontos sob monitoramento",
    icone: Bell,
  },
];

const corretoras = [
  {
    nome: "Prime Broker Seguros",
    plano: "Executive",
    status: "Ativa",
    usuarios: 8,
    clientes: 41,
  },
  {
    nome: "Atlas Corretora",
    plano: "Elite",
    status: "Ativa",
    usuarios: 4,
    clientes: 23,
  },
  {
    nome: "Fortis Risk",
    plano: "Prime",
    status: "Suspensa",
    usuarios: 2,
    clientes: 9,
  },
  {
    nome: "Alpha Consult",
    plano: "Full",
    status: "Ativa",
    usuarios: 11,
    clientes: 58,
  },
];

const atalhos = [
  { label: "Gerenciar corretoras", href: "/corretoras" },
  { label: "Gerenciar usuários", href: "/usuarios" },
  { label: "Ver clientes", href: "/clientes" },
  { label: "Abrir área técnica", href: "/analise-tecnica" },
];

function StatusBadge({ status }: { status: string }) {
  const ativo = status.toLowerCase() === "ativa";

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        ativo
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-amber-500/30 bg-amber-500/10 text-amber-300",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function ActionButton({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200",
        primary
          ? "border-[#d4af37] bg-[#d4af37] text-black hover:brightness-110"
          : "border-[#d4af37]/25 bg-black/30 text-white hover:border-[#d4af37]/40 hover:bg-[#d4af37]/8",
      ].join(" ")}
    >
      {label}
    </Link>
  );
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
        "rounded-[28px] border border-[#d4af37]/14 bg-black/45 p-6 shadow-[0_0_30px_rgba(0,0,0,0.28)] backdrop-blur-sm",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

export default function DashboardPage() {
  return (
    <SegmaxShell
      title="Visão estratégica da operação"
      subtitle="Monitore corretoras, usuários, clientes e cotações em tempo real. Acesse rapidamente os módulos críticos da plataforma e mantenha controle total da operação."
      badge="Centro de controle SegMax"
      username="Renato"
      userrole="Super Master"
      menuitems={menuItems}
      actions={
        <>
          <ActionButton
            href="/corretoras/nova"
            label="Cadastrar corretora"
            primary
          />
          <ActionButton
            href="/usuarios/novo"
            label="Criar usuário operacional"
          />
          <ActionButton href="/cotacoes" label="Abrir módulo de cotações" />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        {indicadores.map((item) => {
          const Icon = item.icone;

          return (
            <SectionCard key={item.titulo}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-300">{item.titulo}</p>
                  <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                    {item.valor}
                  </h3>
                  <p className="mt-4 max-w-[180px] text-sm leading-6 text-zinc-400">
                    {item.descricao}
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
                  <Icon size={24} />
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.55fr_1fr]">
        <SectionCard>
          <div className="flex flex-col gap-4 border-b border-white/8 pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Corretoras em destaque
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Visão rápida das principais contas da operação.
              </p>
            </div>

            <Link
              href="/corretoras"
              className="inline-flex items-center gap-2 self-start rounded-2xl border border-[#d4af37]/20 bg-black/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#d4af37]/40 hover:bg-[#d4af37]/8"
            >
              Ver tudo
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Corretora
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Plano
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Status
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Usuários
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Clientes
                  </th>
                </tr>
              </thead>

              <tbody>
                {corretoras.map((corretora) => (
                  <tr key={corretora.nome} className="rounded-2xl">
                    <td className="rounded-l-2xl border-y border-l border-white/6 bg-white/[0.03] px-4 py-4 text-base text-white">
                      {corretora.nome}
                    </td>
                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4 text-base text-zinc-200">
                      {corretora.plano}
                    </td>
                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                      <StatusBadge status={corretora.status} />
                    </td>
                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4 text-base text-white">
                      {corretora.usuarios}
                    </td>
                    <td className="rounded-r-2xl border-y border-r border-white/6 bg-white/[0.03] px-4 py-4 text-base text-white">
                      {corretora.clientes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Atalhos rápidos
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Acesso direto aos blocos principais.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {atalhos.map((atalho) => (
                <Link
                  key={atalho.label}
                  href={atalho.href}
                  className="flex items-center justify-between rounded-2xl border border-[#d4af37]/14 bg-black/35 px-5 py-4 text-white transition hover:border-[#d4af37]/30 hover:bg-[#d4af37]/8"
                >
                  <span className="text-base font-medium">{atalho.label}</span>
                  <ArrowRight size={18} className="text-[#d4af37]" />
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-300">
                <AlertTriangle size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Direção sugerida
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Fechar primeiro as pendências críticas da área técnica,
                  validar corretoras com status sensível e manter o núcleo de
                  usuários, clientes e cotação totalmente blindado antes do
                  avanço comercial mais pesado.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
                <Briefcase size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Prioridade do dia
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Padronizar layout de todos os módulos, revisar fluxos de
                  cadastro e fechar o bloco operacional para o pré-lançamento.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </SegmaxShell>
  );
}