"use client"

import Link from "next/link"
import {
  Shield,
  Building2,
  Users,
  FileText,
  Landmark,
  Activity,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  BarChart3,
} from "lucide-react"

const indicadores = [
  {
    titulo: "Corretoras ativas",
    valor: "12",
    descricao: "Estrutura comercial em operação dentro da base.",
    icon: Building2,
  },
  {
    titulo: "Usuários cadastrados",
    valor: "48",
    descricao: "Perfis com acesso distribuído por função e operação.",
    icon: Users,
  },
  {
    titulo: "Cotações na base",
    valor: "156",
    descricao: "Pipeline comercial e técnico em acompanhamento.",
    icon: FileText,
  },
  {
    titulo: "Seguradoras disponíveis",
    valor: "8",
    descricao: "Parceiros com atuação no foco patrimonial.",
    icon: Shield,
  },
]

const operacao = [
  {
    cliente: "Grupo Alpha Logística",
    corretora: "Prime Broker Seguros",
    seguro: "Patrimonial Empresarial",
    status: "Em análise",
    statusClass:
      "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    responsavel: "Ana Paula",
    atualizacao: "16/03/2026 08:10",
  },
  {
    cliente: "Metalúrgica Horizonte",
    corretora: "Atlas Corretora",
    seguro: "Patrimonial Industrial",
    status: "Nova demanda",
    statusClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    responsavel: "Equipe comercial",
    atualizacao: "16/03/2026 07:42",
  },
  {
    cliente: "Rede Nova Visão",
    corretora: "Alpha Consult",
    seguro: "Patrimonial Comercial",
    status: "Parecer emitido",
    statusClass:
      "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    responsavel: "Ana Paula",
    atualizacao: "15/03/2026 18:25",
  },
  {
    cliente: "Construtora Vale Forte",
    corretora: "Prime Broker Seguros",
    seguro: "Risco operacional",
    status: "Atenção imediata",
    statusClass: "bg-red-500/10 text-red-400 border border-red-500/20",
    responsavel: "Alessandra",
    atualizacao: "15/03/2026 15:12",
  },
]

const atalhos = [
  {
    titulo: "Corretoras",
    descricao: "Gestão completa das corretoras da operação.",
    href: "/corretoras",
    icon: Building2,
  },
  {
    titulo: "Usuários",
    descricao: "Controle de acessos, perfis e permissões.",
    href: "/usuarios",
    icon: Users,
  },
  {
    titulo: "Cotações",
    descricao: "Acompanhar entrada, andamento e histórico.",
    href: "/cotacoes",
    icon: FileText,
  },
  {
    titulo: "Seguradoras",
    descricao: "Base estratégica para sustentação comercial.",
    href: "/seguradoras",
    icon: Shield,
  },
  {
    titulo: "Financeiro",
    descricao: "Comissões, recebíveis e atenção de caixa.",
    href: "/financeiro",
    icon: Landmark,
  },
  {
    titulo: "Análise técnica",
    descricao: "Núcleo técnico e pareceres da operação.",
    href: "/analise-tecnica",
    icon: Briefcase,
  },
]

export default function MasterPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-7 text-white md:px-8">
      <section className="rounded-[28px] border border-[#3a2a00] bg-gradient-to-b from-[#050505] to-[#020202] p-7 shadow-[0_0_0_1px_rgba(212,165,40,0.05)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex items-center rounded-full border border-[#4a3500] bg-[#1a1303] px-4 py-1 text-[12px] font-semibold uppercase tracking-[0.35em] text-[#d4a828]">
              núcleo master segmax
            </div>

            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
              Controle central da operação
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400 md:text-lg">
              Visão global do ecossistema SegMax com foco em corretoras,
              usuários, cotações, análise técnica, seguradoras e financeiro.
              Estrutura pensada para controle total, leitura rápida da operação
              e decisão com padrão executivo.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
            <Link
              href="/corretoras"
              className="inline-flex items-center justify-center rounded-2xl bg-[#d4a828] px-6 py-4 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Nova corretora
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-[#4a3500] bg-black px-6 py-4 text-sm font-semibold text-white transition hover:border-[#d4a828]"
            >
              Voltar ao painel
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-4">
        {indicadores.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.titulo}
              className="rounded-[24px] border border-zinc-800 bg-[#07090f] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-400">{item.titulo}</p>
                  <h2 className="mt-3 text-5xl font-bold tracking-tight text-white">
                    {item.valor}
                  </h2>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#4a3500] bg-[#1a1303] text-[#d4a828]">
                  <Icon size={24} />
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-zinc-500">
                {item.descricao}
              </p>
            </div>
          )
        })}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_0.7fr]">
        <div className="rounded-[28px] border border-[#2a2a2a] bg-[#040404] p-6">
          <div className="flex flex-col gap-4 border-b border-zinc-900 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">
                Comando da operação
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Leitura rápida das frentes críticas para manter a SegMax pronta
                para pré-lançamento, vendas, expansão e controle estratégico.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <MiniTag
                icon={<Activity size={14} />}
                texto="Operação ativa"
                classe="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              />
              <MiniTag
                icon={<AlertTriangle size={14} />}
                texto="2 pontos sensíveis"
                classe="border-red-500/20 bg-red-500/10 text-red-400"
              />
              <MiniTag
                icon={<CheckCircle2 size={14} />}
                texto="Base sólida"
                classe="border-[#4a3500] bg-[#1a1303] text-[#d4a828]"
              />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[920px] border-separate border-spacing-0 overflow-hidden rounded-2xl">
              <thead>
                <tr className="bg-[#070707] text-left">
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                    Cliente
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                    Corretora
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                    Frente
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                    Status
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                    Responsável
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                    Atualização
                  </th>
                </tr>
              </thead>

              <tbody>
                {operacao.map((item, index) => (
                  <tr
                    key={`${item.cliente}-${index}`}
                    className="border-t border-zinc-900 bg-[#050505] transition hover:bg-[#080808]"
                  >
                    <td className="px-4 py-5 text-sm font-semibold text-white">
                      {item.cliente}
                    </td>
                    <td className="px-4 py-5 text-sm text-zinc-300">
                      {item.corretora}
                    </td>
                    <td className="px-4 py-5 text-sm text-zinc-300">
                      {item.seguro}
                    </td>
                    <td className="px-4 py-5 text-sm">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.statusClass}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-sm text-zinc-300">
                      {item.responsavel}
                    </td>
                    <td className="px-4 py-5 text-sm text-zinc-400">
                      {item.atualizacao}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <PainelLateral
            icon={<BarChart3 size={20} />}
            titulo="Resumo executivo"
            cor="gold"
          >
            <p className="text-sm leading-8 text-zinc-300">
              A SegMax já tem base visual forte, núcleo técnico, módulo
              financeiro e estrutura de operação multiárea. O foco agora é
              padronizar acessos, consolidar o master e fechar a experiência
              para apresentação comercial.
            </p>
          </PainelLateral>

          <PainelLateral
            icon={<AlertTriangle size={20} />}
            titulo="Atenção imediata"
            cor="red"
          >
            <div className="space-y-4">
              <ItemAlerta
                titulo="Permissão e identidade"
                texto="O shell ainda mostra perfil de usuário/corretor em rota master. O visual foi padronizado, mas a trava real de acesso precisa ser ligada na regra do login."
              />
              <ItemAlerta
                titulo="Padronização final"
                texto="Conectar dados reais, permissões reais e menus por papel para deixar pronto para venda e onboarding."
              />
            </div>
          </PainelLateral>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-[#2a2a2a] bg-[#050505] p-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-bold text-white">
            Acesso rápido da liderança
          </h3>
          <p className="text-sm leading-6 text-zinc-400">
            Estrutura central padronizada para você controlar tudo abaixo do
            master com a mesma linguagem visual das outras áreas da plataforma.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {atalhos.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.titulo}
                href={item.href}
                className="group rounded-[24px] border border-zinc-800 bg-[#06080d] p-5 transition hover:border-[#d4a828] hover:bg-[#0a0d14]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#4a3500] bg-[#1a1303] text-[#d4a828]">
                    <Icon size={20} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="mt-1 text-zinc-500 transition group-hover:text-[#d4a828]"
                  />
                </div>

                <h4 className="mt-5 text-lg font-semibold text-white">
                  {item.titulo}
                </h4>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {item.descricao}
                </p>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function MiniTag({
  icon,
  texto,
  classe,
}: {
  icon: React.ReactNode
  texto: string
  classe: string
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${classe}`}
    >
      {icon}
      <span>{texto}</span>
    </div>
  )
}

function PainelLateral({
  icon,
  titulo,
  children,
  cor,
}: {
  icon: React.ReactNode
  titulo: string
  children: React.ReactNode
  cor: "gold" | "red"
}) {
  const tema =
    cor === "gold"
      ? "border-[#4a3500] bg-[#070707]"
      : "border-[#3a1313] bg-[#070707]"

  const icone =
    cor === "gold"
      ? "border-[#4a3500] bg-[#1a1303] text-[#d4a828]"
      : "border-red-500/20 bg-red-500/10 text-red-400"

  return (
    <div className={`rounded-[28px] border p-6 ${tema}`}>
      <div className="mb-5 flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${icone}`}
        >
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white">{titulo}</h3>
      </div>

      {children}
    </div>
  )
}

function ItemAlerta({
  titulo,
  texto,
}: {
  titulo: string
  texto: string
}) {
  return (
    <div className="rounded-[22px] border border-zinc-800 bg-black p-4">
      <h4 className="text-base font-semibold text-white">{titulo}</h4>
      <p className="mt-2 text-sm leading-7 text-zinc-400">{texto}</p>
    </div>
  )
}