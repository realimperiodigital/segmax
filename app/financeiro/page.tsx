"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  BanknoteArrowDown,
  BanknoteArrowUp,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Eye,
  Search,
  Wallet,
} from "lucide-react";

import SegmaxShell, { SegmaxMenuItem } from "@/components/segmaxshell";

type StatusComissao = "Pendente" | "A receber" | "Recebido" | "Atrasado";
type StatusAssinatura = "Ativo" | "Atrasado" | "Suspenso" | "Cancelado";

type Comissao = {
  id: string;
  cliente: string;
  corretora: string;
  seguradora: string;
  premio: string;
  comissaoPercentual: string;
  comissaoValor: string;
  status: StatusComissao;
  data: string;
};

type Assinatura = {
  id: string;
  corretora: string;
  plano: "Prime" | "Elite" | "Executive" | "Full";
  valorMensal: string;
  vencimento: string;
  ultimoPagamento: string;
  status: StatusAssinatura;
};

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

const comissoesBase: Comissao[] = [
  {
    id: "1",
    cliente: "Grupo Alpha Logística",
    corretora: "Prime Broker Seguros",
    seguradora: "Porto Seguro",
    premio: "R$ 48.000,00",
    comissaoPercentual: "18%",
    comissaoValor: "R$ 8.640,00",
    status: "Recebido",
    data: "14/03/2026",
  },
  {
    id: "2",
    cliente: "Metalúrgica Horizonte",
    corretora: "Atlas Corretora",
    seguradora: "Tokio Marine",
    premio: "R$ 72.500,00",
    comissaoPercentual: "16%",
    comissaoValor: "R$ 11.600,00",
    status: "A receber",
    data: "15/03/2026",
  },
  {
    id: "3",
    cliente: "Rede Nova Visão",
    corretora: "Alpha Consult",
    seguradora: "Allianz",
    premio: "R$ 31.200,00",
    comissaoPercentual: "15%",
    comissaoValor: "R$ 4.680,00",
    status: "Pendente",
    data: "15/03/2026",
  },
  {
    id: "4",
    cliente: "Construtora Vale Forte",
    corretora: "Prime Broker Seguros",
    seguradora: "Mapfre",
    premio: "R$ 94.000,00",
    comissaoPercentual: "17%",
    comissaoValor: "R$ 15.980,00",
    status: "Atrasado",
    data: "12/03/2026",
  },
];

const assinaturasBase: Assinatura[] = [
  {
    id: "1",
    corretora: "Prime Broker Seguros",
    plano: "Executive",
    valorMensal: "R$ 6.997,00",
    vencimento: "20/03/2026",
    ultimoPagamento: "20/02/2026",
    status: "Ativo",
  },
  {
    id: "2",
    corretora: "Atlas Corretora",
    plano: "Elite",
    valorMensal: "R$ 4.997,00",
    vencimento: "18/03/2026",
    ultimoPagamento: "18/02/2026",
    status: "Ativo",
  },
  {
    id: "3",
    corretora: "Alpha Consult",
    plano: "Full",
    valorMensal: "R$ 9.997,00",
    vencimento: "10/03/2026",
    ultimoPagamento: "10/02/2026",
    status: "Atrasado",
  },
  {
    id: "4",
    corretora: "Fortis Risk",
    plano: "Prime",
    valorMensal: "R$ 2.997,00",
    vencimento: "08/03/2026",
    ultimoPagamento: "08/02/2026",
    status: "Suspenso",
  },
];

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

function StatusComissaoBadge({ status }: { status: StatusComissao }) {
  const styles: Record<StatusComissao, string> = {
    Pendente: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
    "A receber": "border-sky-500/30 bg-sky-500/10 text-sky-300",
    Recebido: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    Atrasado: "border-red-500/30 bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        styles[status],
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function StatusAssinaturaBadge({ status }: { status: StatusAssinatura }) {
  const styles: Record<StatusAssinatura, string> = {
    Ativo: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    Atrasado: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    Suspenso: "border-red-500/30 bg-red-500/10 text-red-300",
    Cancelado: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        styles[status],
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function PlanoBadge({
  plano,
}: {
  plano: Assinatura["plano"];
}) {
  const estilo =
    plano === "Full"
      ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
      : plano === "Executive"
        ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
        : plano === "Elite"
          ? "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#f3d77a]"
          : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300";

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        estilo,
      ].join(" ")}
    >
      {plano}
    </span>
  );
}

export default function FinanceiroPage() {
  const [buscaComissao, setBuscaComissao] = useState("");
  const [buscaAssinatura, setBuscaAssinatura] = useState("");

  const comissoesFiltradas = useMemo(() => {
    const termo = buscaComissao.trim().toLowerCase();

    return comissoesBase.filter((item) => {
      if (!termo) return true;

      return (
        item.cliente.toLowerCase().includes(termo) ||
        item.corretora.toLowerCase().includes(termo) ||
        item.seguradora.toLowerCase().includes(termo) ||
        item.status.toLowerCase().includes(termo)
      );
    });
  }, [buscaComissao]);

  const assinaturasFiltradas = useMemo(() => {
    const termo = buscaAssinatura.trim().toLowerCase();

    return assinaturasBase.filter((item) => {
      if (!termo) return true;

      return (
        item.corretora.toLowerCase().includes(termo) ||
        item.plano.toLowerCase().includes(termo) ||
        item.status.toLowerCase().includes(termo)
      );
    });
  }, [buscaAssinatura]);

  return (
    <SegmaxShell
      title="Financeiro"
      subtitle="Controle receitas, comissões, assinaturas e saúde financeira da operação com visão executiva e acompanhamento prático."
      badge="Núcleo financeiro SegMax"
      username="Alessandra Mendes"
      userrole="Diretora Financeira"
      menuitems={menuItems}
      actions={
        <>
          <ActionButton href="/dashboard" label="Voltar ao painel" />
          <ActionButton href="/financeiro/relatorios" label="Ver relatórios" primary />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Receita do mês</p>
              <h3 className="mt-4 text-4xl font-semibold leading-none text-white">
                R$ 24.988
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Soma das assinaturas ativas do período.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
              <DollarSign size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Comissões recebidas</p>
              <h3 className="mt-4 text-4xl font-semibold leading-none text-white">
                R$ 8.640
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Valores já confirmados na operação.
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
              <p className="text-sm text-zinc-300">A receber</p>
              <h3 className="mt-4 text-4xl font-semibold leading-none text-white">
                R$ 11.600
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Receita prevista em fase de cobrança.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-300">
              <BanknoteArrowUp size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Pendências financeiras</p>
              <h3 className="mt-4 text-4xl font-semibold leading-none text-white">
                2
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Assinaturas e comissões com atenção imediata.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
              <BanknoteArrowDown size={24} />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <SectionCard>
          <div className="flex flex-col gap-5 border-b border-white/8 pb-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Comissões da operação
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Controle o que entrou, o que está pendente e o que ainda precisa ser recebido.
              </p>
            </div>

            <label className="flex w-full max-w-[380px] items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
              <Search size={18} className="text-zinc-500" />
              <input
                value={buscaComissao}
                onChange={(e) => setBuscaComissao(e.target.value)}
                placeholder="Buscar cliente, corretora, seguradora ou status"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              />
            </label>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[1120px] border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Cliente
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Corretora
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Seguradora
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Prêmio
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Comissão
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Status
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Data
                  </th>
                </tr>
              </thead>

              <tbody>
                {comissoesFiltradas.map((item) => (
                  <tr key={item.id}>
                    <td className="rounded-l-2xl border-y border-l border-white/6 bg-white/[0.03] px-4 py-4">
                      <p className="text-sm font-semibold text-white">{item.cliente}</p>
                    </td>
                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4 text-sm text-white">
                      {item.corretora}
                    </td>
                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4 text-sm text-white">
                      {item.seguradora}
                    </td>
                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4 text-sm text-white">
                      {item.premio}
                    </td>
                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">{item.comissaoValor}</p>
                        <p className="mt-1 text-xs text-zinc-500">{item.comissaoPercentual}</p>
                      </div>
                    </td>
                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                      <StatusComissaoBadge status={item.status} />
                    </td>
                    <td className="rounded-r-2xl border-y border-r border-white/6 bg-white/[0.03] px-4 py-4 text-sm text-zinc-300">
                      {item.data}
                    </td>
                  </tr>
                ))}

                {comissoesFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center"
                    >
                      <p className="text-base font-medium text-white">
                        Nenhuma comissão encontrada
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">
                        Ajuste a busca para localizar os registros.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
                <Wallet size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Resumo executivo
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  A operação está financeiramente saudável, mas há cobranças e
                  assinaturas que precisam de acompanhamento mais próximo para não
                  impactar a previsibilidade de caixa.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
                <CreditCard size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Atenção imediata
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-medium text-white">
                      Alpha Consult
                    </p>
                    <p className="mt-1 text-xs leading-6 text-zinc-400">
                      Assinatura Full em atraso com necessidade de ação.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-medium text-white">
                      Construtora Vale Forte
                    </p>
                    <p className="mt-1 text-xs leading-6 text-zinc-400">
                      Comissão em atraso precisa ser acompanhada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                <BadgeDollarSign size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Fluxo resumido
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Entradas
                    </p>
                    <p className="mt-2 text-lg font-semibold text-emerald-300">
                      R$ 33.628,00
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Saídas previstas
                    </p>
                    <p className="mt-2 text-lg font-semibold text-red-300">
                      R$ 8.900,00
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Saldo projetado
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      R$ 24.728,00
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard>
        <div className="flex flex-col gap-5 border-b border-white/8 pb-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Assinaturas da plataforma
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Acompanhe o financeiro recorrente das corretoras, vencimentos e status dos planos.
            </p>
          </div>

          <label className="flex w-full max-w-[380px] items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
            <Search size={18} className="text-zinc-500" />
            <input
              value={buscaAssinatura}
              onChange={(e) => setBuscaAssinatura(e.target.value)}
              placeholder="Buscar corretora, plano ou status"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
          </label>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1120px] border-separate border-spacing-y-3">
            <thead>
              <tr>
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Corretora
                </th>
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Plano
                </th>
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Valor mensal
                </th>
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Vencimento
                </th>
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Último pagamento
                </th>
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Status
                </th>
                <th className="px-4 text-right text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {assinaturasFiltradas.map((item) => (
                <tr key={item.id}>
                  <td className="rounded-l-2xl border-y border-l border-white/6 bg-white/[0.03] px-4 py-4">
                    <p className="text-sm font-semibold text-white">{item.corretora}</p>
                  </td>
                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                    <PlanoBadge plano={item.plano} />
                  </td>
                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4 text-sm text-white">
                    {item.valorMensal}
                  </td>
                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4 text-sm text-white">
                    {item.vencimento}
                  </td>
                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4 text-sm text-zinc-300">
                    {item.ultimoPagamento}
                  </td>
                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                    <StatusAssinaturaBadge status={item.status} />
                  </td>
                  <td className="rounded-r-2xl border-y border-r border-white/6 bg-white/[0.03] px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/financeiro/assinaturas/${item.id}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs font-semibold text-white transition hover:border-[#d4af37]/30 hover:bg-[#d4af37]/8"
                      >
                        <Eye size={15} />
                        Abrir
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {assinaturasFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center"
                  >
                    <p className="text-base font-medium text-white">
                      Nenhuma assinatura encontrada
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                      Ajuste a busca para localizar os registros.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </SegmaxShell>
  );
}