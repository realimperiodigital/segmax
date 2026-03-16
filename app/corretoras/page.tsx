"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  Filter,
  PauseCircle,
  Plus,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";
import SegmaxShell, { SegmaxMenuItem } from "@/components/segmaxshell";

type StatusCorretora = "Ativa" | "Suspensa" | "Bloqueada";

type Corretora = {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  responsavel: string;
  email: string;
  telefone: string;
  plano: "Prime" | "Elite" | "Executive" | "Full";
  status: StatusCorretora;
  usuarios: number;
  clientes: number;
  cidade: string;
  estado: string;
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

const corretorasBase: Corretora[] = [
  {
    id: "1",
    nomeFantasia: "Prime Broker Seguros",
    razaoSocial: "Prime Broker Consultoria e Seguros Ltda",
    cnpj: "12.345.678/0001-90",
    responsavel: "Carlos Mendes",
    email: "contato@primebroker.com",
    telefone: "(11) 98888-1101",
    plano: "Executive",
    status: "Ativa",
    usuarios: 8,
    clientes: 41,
    cidade: "São Paulo",
    estado: "SP",
  },
  {
    id: "2",
    nomeFantasia: "Atlas Corretora",
    razaoSocial: "Atlas Intermediações e Seguros Ltda",
    cnpj: "23.456.789/0001-12",
    responsavel: "Fernanda Lima",
    email: "atendimento@atlascorretora.com",
    telefone: "(11) 97777-2040",
    plano: "Elite",
    status: "Ativa",
    usuarios: 4,
    clientes: 23,
    cidade: "Guarulhos",
    estado: "SP",
  },
  {
    id: "3",
    nomeFantasia: "Fortis Risk",
    razaoSocial: "Fortis Risk Soluções em Seguros Ltda",
    cnpj: "34.567.891/0001-44",
    responsavel: "Roberto Salgado",
    email: "comercial@fortisrisk.com",
    telefone: "(11) 96666-3040",
    plano: "Prime",
    status: "Suspensa",
    usuarios: 2,
    clientes: 9,
    cidade: "Osasco",
    estado: "SP",
  },
  {
    id: "4",
    nomeFantasia: "Alpha Consult",
    razaoSocial: "Alpha Consult Assessoria em Seguros Ltda",
    cnpj: "45.678.912/0001-77",
    responsavel: "Juliana Prado",
    email: "contato@alphaconsult.com",
    telefone: "(11) 95555-4088",
    plano: "Full",
    status: "Ativa",
    usuarios: 11,
    clientes: 58,
    cidade: "Campinas",
    estado: "SP",
  },
  {
    id: "5",
    nomeFantasia: "Nova Horizonte",
    razaoSocial: "Nova Horizonte Proteção Empresarial Ltda",
    cnpj: "56.789.123/0001-55",
    responsavel: "Marcelo Vieira",
    email: "suporte@novahorizonte.com",
    telefone: "(11) 94444-5009",
    plano: "Prime",
    status: "Bloqueada",
    usuarios: 1,
    clientes: 5,
    cidade: "Santo André",
    estado: "SP",
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

function StatusBadge({ status }: { status: StatusCorretora }) {
  if (status === "Ativa") {
    return (
      <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        Ativa
      </span>
    );
  }

  if (status === "Suspensa") {
    return (
      <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
        Suspensa
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
      Bloqueada
    </span>
  );
}

function PlanoBadge({
  plano,
}: {
  plano: Corretora["plano"];
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

export default function CorretorasPage() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | StatusCorretora>(
    "Todos",
  );

  const corretorasFiltradas = useMemo(() => {
    return corretorasBase.filter((corretora) => {
      const termo = busca.trim().toLowerCase();

      const bateBusca =
        termo.length === 0 ||
        corretora.nomeFantasia.toLowerCase().includes(termo) ||
        corretora.razaoSocial.toLowerCase().includes(termo) ||
        corretora.cnpj.toLowerCase().includes(termo) ||
        corretora.responsavel.toLowerCase().includes(termo) ||
        corretora.cidade.toLowerCase().includes(termo);

      const bateStatus =
        filtroStatus === "Todos" || corretora.status === filtroStatus;

      return bateBusca && bateStatus;
    });
  }, [busca, filtroStatus]);

  const totalAtivas = corretorasBase.filter((item) => item.status === "Ativa").length;
  const totalSuspensas = corretorasBase.filter((item) => item.status === "Suspensa").length;
  const totalBloqueadas = corretorasBase.filter((item) => item.status === "Bloqueada").length;
  const totalClientes = corretorasBase.reduce((acc, item) => acc + item.clientes, 0);

  return (
    <SegmaxShell
      title="Gestão de corretoras"
      subtitle="Controle a base operacional da plataforma, acompanhe status sensíveis e mantenha a carteira organizada com visão rápida de plano, usuários e clientes."
      badge="Base estrutural SegMax"
      username="Renato"
      userrole="Super Master"
      menuitems={menuItems}
      actions={
        <>
          <ActionButton
            href="/corretoras/nova"
            label="Nova corretora"
            primary
            icon={<Plus size={18} />}
          />
          <ActionButton
            href="/dashboard"
            label="Voltar ao painel"
            icon={<ArrowRight size={18} />}
          />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Corretoras ativas</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {totalAtivas}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Operação liberada e saudável.
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
              <p className="text-sm text-zinc-300">Suspensas</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {totalSuspensas}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Requerem validação comercial.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
              <PauseCircle size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Bloqueadas</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {totalBloqueadas}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Status travado para operação.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
              <ShieldAlert size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Clientes na base</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {totalClientes}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Volume total sob gestão.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
              <Users size={24} />
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <div className="flex flex-col gap-5 border-b border-white/8 pb-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Carteira de corretoras
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Filtre, revise e abra rapidamente os registros principais da operação.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_220px]">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
              <Search size={18} className="text-zinc-500" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, CNPJ, responsável ou cidade"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
              <Filter size={18} className="text-zinc-500" />
              <select
                value={filtroStatus}
                onChange={(e) =>
                  setFiltroStatus(e.target.value as "Todos" | StatusCorretora)
                }
                className="w-full bg-transparent text-sm text-white outline-none"
              >
                <option value="Todos" className="bg-black text-white">
                  Todos os status
                </option>
                <option value="Ativa" className="bg-black text-white">
                  Ativas
                </option>
                <option value="Suspensa" className="bg-black text-white">
                  Suspensas
                </option>
                <option value="Bloqueada" className="bg-black text-white">
                  Bloqueadas
                </option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1220px] border-separate border-spacing-y-3">
            <thead>
              <tr>
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Corretora
                </th>
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Responsável
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
                <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Cidade
                </th>
                <th className="px-4 text-right text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {corretorasFiltradas.map((corretora) => (
                <tr key={corretora.id}>
                  <td className="rounded-l-2xl border-y border-l border-white/6 bg-white/[0.03] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
                        <Building2 size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-white">
                          {corretora.nomeFantasia}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {corretora.razaoSocial}
                        </p>
                        <p className="mt-2 text-xs text-zinc-400">
                          {corretora.cnpj}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                    <p className="text-sm text-white">{corretora.responsavel}</p>
                    <p className="mt-1 text-xs text-zinc-500">{corretora.email}</p>
                    <p className="mt-1 text-xs text-zinc-500">{corretora.telefone}</p>
                  </td>

                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                    <PlanoBadge plano={corretora.plano} />
                  </td>

                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                    <StatusBadge status={corretora.status} />
                  </td>

                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4 text-sm font-medium text-white">
                    {corretora.usuarios}
                  </td>

                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4 text-sm font-medium text-white">
                    {corretora.clientes}
                  </td>

                  <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                    <p className="text-sm text-white">{corretora.cidade}</p>
                    <p className="mt-1 text-xs text-zinc-500">{corretora.estado}</p>
                  </td>

                  <td className="rounded-r-2xl border-y border-r border-white/6 bg-white/[0.03] px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/corretoras/${corretora.id}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs font-semibold text-white transition hover:border-[#d4af37]/30 hover:bg-[#d4af37]/8"
                      >
                        <Eye size={15} />
                        Abrir
                      </Link>

                      <Link
                        href={`/corretoras/${corretora.id}/editar`}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/8 px-3 py-2 text-xs font-semibold text-[#f3d77a] transition hover:border-[#d4af37]/35 hover:bg-[#d4af37]/12"
                      >
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {corretorasFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center"
                  >
                    <p className="text-base font-medium text-white">
                      Nenhuma corretora encontrada
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                      Ajuste os filtros ou cadastre uma nova corretora.
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