"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  FileText,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import SegmaxShell, { SegmaxMenuItem } from "@/components/segmaxshell";

type StatusCotacao =
  | "Nova"
  | "Em análise"
  | "Aguardando seguradora"
  | "Proposta enviada"
  | "Fechada"
  | "Recusada";

type NivelRisco = "Baixo" | "Médio" | "Alto" | "Crítico";

type CotacaoDetalhe = {
  id: string;
  cliente: string;
  documento: string;
  corretora: string;
  seguradora: string;
  ramo: string;
  responsavel: string;
  status: StatusCotacao;
  risco: NivelRisco;
  valorEmRisco: string;
  premioEstimado: string;
  cobertura: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  atualizadoEm: string;
  atividadePrincipal: string;
  observacoesTecnicas: string;
  observacoesComerciais: string;
  parecerResumido: string;
  proximoPasso: string;
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

const cotacoesMock: CotacaoDetalhe[] = [
  {
    id: "1",
    cliente: "Grupo Alpha Logística",
    documento: "12.345.678/0001-10",
    corretora: "Prime Broker Seguros",
    seguradora: "Porto Seguro",
    ramo: "Patrimonial Empresarial",
    responsavel: "Carlos Mendes",
    status: "Em análise",
    risco: "Médio",
    valorEmRisco: "R$ 3.200.000,00",
    premioEstimado: "R$ 48.000,00",
    cobertura: "Incêndio, danos elétricos, vendaval, roubo, RC operacional",
    vigenciaInicio: "20/03/2026",
    vigenciaFim: "20/03/2027",
    atualizadoEm: "16/03/2026 08:30",
    atividadePrincipal: "Logística e armazenagem",
    observacoesTecnicas:
      "Operação com movimentação contínua de mercadorias, concentração de estoque relevante e necessidade de validação mais profunda dos sistemas preventivos e combate a incêndio.",
    observacoesComerciais:
      "Cliente com urgência moderada, buscando proposta competitiva com boa amplitude de cobertura. Existe concorrência em andamento com pelo menos duas corretoras.",
    parecerResumido:
      "Risco tecnicamente aceitável, porém exige confirmação documental de proteção, controle de estoque e laudos atualizados para melhorar condição de negociação com seguradora.",
    proximoPasso:
      "Validar documentação complementar e seguir para consolidação de proposta final com a seguradora.",
  },
  {
    id: "2",
    cliente: "Metalúrgica Horizonte",
    documento: "44.888.222/0001-03",
    corretora: "Atlas Corretora",
    seguradora: "Tokio Marine",
    ramo: "Patrimonial Industrial",
    responsavel: "Fernanda Lima",
    status: "Aguardando seguradora",
    risco: "Alto",
    valorEmRisco: "R$ 5.800.000,00",
    premioEstimado: "R$ 72.500,00",
    cobertura: "Incêndio, explosão, equipamentos, lucros cessantes",
    vigenciaInicio: "18/03/2026",
    vigenciaFim: "18/03/2027",
    atualizadoEm: "16/03/2026 07:40",
    atividadePrincipal: "Metalurgia industrial",
    observacoesTecnicas:
      "Ambiente com maior sensibilidade operacional, concentração de máquinas e dependência de controle rígido de segurança e manutenção preventiva.",
    observacoesComerciais:
      "Cliente valoriza velocidade e estabilidade da seguradora. Há forte pressão por prazo curto de retorno.",
    parecerResumido:
      "Risco com sensibilidade elevada, exigindo abordagem técnica mais rígida e cuidado na apresentação do perfil para seguradora.",
    proximoPasso:
      "Aguardar retorno técnico-comercial da seguradora e preparar plano alternativo caso haja restrição de aceitação.",
  },
  {
    id: "3",
    cliente: "Rede Nova Visão",
    documento: "55.222.111/0001-90",
    corretora: "Alpha Consult",
    seguradora: "Allianz",
    ramo: "Patrimonial Comercial",
    responsavel: "Juliana Prado",
    status: "Proposta enviada",
    risco: "Baixo",
    valorEmRisco: "R$ 2.100.000,00",
    premioEstimado: "R$ 31.200,00",
    cobertura: "Incêndio, danos elétricos, subtração, quebra de vidros",
    vigenciaInicio: "10/03/2026",
    vigenciaFim: "10/03/2027",
    atualizadoEm: "15/03/2026 18:20",
    atividadePrincipal: "Rede varejista",
    observacoesTecnicas:
      "Perfil com boa organização operacional e risco controlado para o tipo de ocupação.",
    observacoesComerciais:
      "Cliente já recebeu a proposta e está em fase de avaliação final.",
    parecerResumido:
      "Risco bem enquadrado, com boa condição de aceitação e baixa complexidade técnica.",
    proximoPasso:
      "Acompanhar retorno do cliente e conduzir fechamento comercial.",
  },
  {
    id: "4",
    cliente: "Construtora Vale Forte",
    documento: "77.999.444/0001-20",
    corretora: "Prime Broker Seguros",
    seguradora: "Mapfre",
    ramo: "Patrimonial Construção",
    responsavel: "Carlos Mendes",
    status: "Nova",
    risco: "Crítico",
    valorEmRisco: "R$ 7.500.000,00",
    premioEstimado: "R$ 94.000,00",
    cobertura: "Incêndio, obras civis, RC, equipamentos móveis",
    vigenciaInicio: "22/03/2026",
    vigenciaFim: "22/03/2027",
    atualizadoEm: "15/03/2026 16:50",
    atividadePrincipal: "Construção civil",
    observacoesTecnicas:
      "Exposição elevada, necessidade de detalhamento completo da operação, proteções, canteiro, histórico e controle de terceiros.",
    observacoesComerciais:
      "Cliente importante, mas com risco alto e necessidade de condução técnica muito cuidadosa.",
    parecerResumido:
      "Não avançar sem documentação complementar completa e revisão técnica detalhada.",
    proximoPasso:
      "Abrir análise técnica aprofundada antes de qualquer envio comercial definitivo.",
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

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: StatusCotacao }) {
  const styles: Record<StatusCotacao, string> = {
    Nova: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    "Em análise": "border-amber-500/30 bg-amber-500/10 text-amber-300",
    "Aguardando seguradora": "border-purple-500/30 bg-purple-500/10 text-purple-300",
    "Proposta enviada": "border-blue-500/30 bg-blue-500/10 text-blue-300",
    Fechada: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    Recusada: "border-red-500/30 bg-red-500/10 text-red-300",
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

function RiskBadge({ risk }: { risk: NivelRisco }) {
  const styles: Record<NivelRisco, string> = {
    Baixo: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    Médio: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    Alto: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    Crítico: "border-red-500/30 bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        styles[risk],
      ].join(" ")}
    >
      {risk}
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

export default function CotacaoDetalhePage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const cotacao = cotacoesMock.find((item) => item.id === id);

  if (!cotacao) {
    return (
      <SegmaxShell
        title="Cotação não encontrada"
        subtitle="O registro solicitado não existe na base demonstrativa atual."
        badge="Módulo de cotações"
        username="Renato"
        userrole="Super Master"
        menuitems={menuItems}
        actions={<ActionButton href="/cotacoes" label="Voltar para cotações" />}
      >
        <SectionCard>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
              <TriangleAlert size={20} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Registro indisponível
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Verifique o identificador acessado ou retorne para a listagem de
                cotações para continuar a navegação.
              </p>
            </div>
          </div>
        </SectionCard>
      </SegmaxShell>
    );
  }

  return (
    <SegmaxShell
      title={`Detalhe da cotação`}
      subtitle="Visão executiva e técnica da proposta, com contexto comercial, leitura de risco e direcionamento operacional."
      badge="Cotação estratégica"
      username="Renato"
      userrole="Super Master"
      menuitems={menuItems}
      actions={
        <>
          <ActionButton href="/cotacoes" label="Voltar para cotações" />
          <ActionButton href={`/cotacoes/${cotacao.id}/editar`} label="Editar cotação" primary />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Status atual</p>
              <div className="mt-4">
                <StatusBadge status={cotacao.status} />
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Situação operacional atual da proposta.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
              <ClipboardList size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Nível de risco</p>
              <div className="mt-4">
                <RiskBadge risk={cotacao.risco} />
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Leitura técnica resumida da exposição.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
              <ShieldCheck size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Prêmio estimado</p>
              <h3 className="mt-4 text-3xl font-semibold leading-none text-white">
                {cotacao.premioEstimado}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Valor financeiro atual estimado.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
              <CircleDollarSign size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Atualização</p>
              <h3 className="mt-4 text-lg font-semibold leading-none text-white">
                {cotacao.atualizadoEm}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Última movimentação registrada.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-300">
              <CalendarDays size={24} />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <SectionCard>
          <div className="flex items-center gap-3 border-b border-white/8 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Estrutura da cotação
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Dados centrais da proposta comercial e técnica.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoBlock label="Cliente" value={cotacao.cliente} />
            <InfoBlock label="Documento" value={cotacao.documento} />
            <InfoBlock label="Corretora" value={cotacao.corretora} />
            <InfoBlock label="Seguradora" value={cotacao.seguradora} />
            <InfoBlock label="Ramo" value={cotacao.ramo} />
            <InfoBlock label="Responsável" value={cotacao.responsavel} />
            <InfoBlock label="Valor em risco" value={cotacao.valorEmRisco} />
            <InfoBlock label="Prêmio estimado" value={cotacao.premioEstimado} />
            <InfoBlock label="Vigência inicial" value={cotacao.vigenciaInicio} />
            <InfoBlock label="Vigência final" value={cotacao.vigenciaFim} />
            <div className="md:col-span-2">
              <InfoBlock label="Cobertura oferecida" value={cotacao.cobertura} />
            </div>
            <div className="md:col-span-2">
              <InfoBlock label="Atividade principal" value={cotacao.atividadePrincipal} />
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-300">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Parecer resumido
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {cotacao.parecerResumido}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                <TriangleAlert size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Próximo passo
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {cotacao.proximoPasso}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-300">
                <UserRound size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Leitura executiva
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Cotação com base organizada para apresentação, defesa técnica
                  e condução comercial. O objetivo aqui é mostrar domínio da
                  operação e capacidade de leitura do risco.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard>
          <div className="flex items-center gap-3 border-b border-white/8 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Observações técnicas
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Contexto técnico registrado para análise.
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-7 text-zinc-300">
            {cotacao.observacoesTecnicas}
          </p>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center gap-3 border-b border-white/8 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
              <Building2 size={20} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Observações comerciais
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Contexto de negociação e condução de proposta.
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-7 text-zinc-300">
            {cotacao.observacoesComerciais}
          </p>
        </SectionCard>
      </div>

      <SectionCard>
        <div className="flex flex-col gap-4 border-b border-white/8 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Ações rápidas
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Atalhos para continuidade da operação.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ActionButton href="/cotacoes" label="Voltar à lista" />
            <ActionButton href={`/cotacoes/${cotacao.id}/editar`} label="Editar cotação" />
            <ActionButton href={`/analise-tecnica/${cotacao.id}`} label="Abrir análise técnica" primary />
          </div>
        </div>
      </SectionCard>
    </SegmaxShell>
  );
}