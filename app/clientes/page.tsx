"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import SegmaxShell, { SegmaxMenuItem } from "@/components/segmaxshell";

type StatusCliente = "Ativo" | "Em análise" | "Inativo";

type Cliente = {
  id: string;
  nome: string;
  documento: string;
  tipo: "Pessoa Jurídica" | "Pessoa Física";
  corretora: string;
  responsavel: string;
  segmento: string;
  status: StatusCliente;
  cidade: string;
  estado: string;
};

type UsuarioAtual = {
  id: string;
  nome: string;
  email: string | null;
  role: string;
  corretora_id: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const clientesBase: Cliente[] = [
  {
    id: "1",
    nome: "Grupo Alpha Logística",
    documento: "12.345.678/0001-10",
    tipo: "Pessoa Jurídica",
    corretora: "Prime Broker Seguros",
    responsavel: "Carlos Mendes",
    segmento: "Logística",
    status: "Ativo",
    cidade: "São Paulo",
    estado: "SP",
  },
  {
    id: "2",
    nome: "Metalúrgica Horizonte",
    documento: "44.888.222/0001-03",
    tipo: "Pessoa Jurídica",
    corretora: "Atlas Corretora",
    responsavel: "Fernanda Lima",
    segmento: "Indústria",
    status: "Em análise",
    cidade: "Guarulhos",
    estado: "SP",
  },
  {
    id: "3",
    nome: "Marcelo Rodrigues",
    documento: "324.654.998-10",
    tipo: "Pessoa Física",
    corretora: "Fortis Risk",
    responsavel: "Roberto Salgado",
    segmento: "Patrimonial",
    status: "Inativo",
    cidade: "Osasco",
    estado: "SP",
  },
  {
    id: "4",
    nome: "Rede Nova Visão",
    documento: "55.222.111/0001-90",
    tipo: "Pessoa Jurídica",
    corretora: "Alpha Consult",
    responsavel: "Juliana Prado",
    segmento: "Varejo",
    status: "Ativo",
    cidade: "Campinas",
    estado: "SP",
  },
  {
    id: "5",
    nome: "Construtora Vale Forte",
    documento: "77.999.444/0001-20",
    tipo: "Pessoa Jurídica",
    corretora: "Prime Broker Seguros",
    responsavel: "Carlos Mendes",
    segmento: "Construção",
    status: "Em análise",
    cidade: "Santo André",
    estado: "SP",
  },
];

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

function StatusBadge({ status }: { status: StatusCliente }) {
  if (status === "Ativo") {
    return (
      <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        Ativo
      </span>
    );
  }

  if (status === "Em análise") {
    return (
      <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
        Em análise
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-zinc-500/30 bg-zinc-500/10 px-3 py-1 text-xs font-semibold text-zinc-300">
      Inativo
    </span>
  );
}

function TipoBadge({ tipo }: { tipo: Cliente["tipo"] }) {
  const estilo =
    tipo === "Pessoa Jurídica"
      ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
      : "border-purple-500/30 bg-purple-500/10 text-purple-300";

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        estilo,
      ].join(" ")}
    >
      {tipo}
    </span>
  );
}

export default function ClientesPage() {
  const [busca, setBusca] = useState("");
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [erroPerfil, setErroPerfil] = useState("");
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioAtual | null>(null);

  useEffect(() => {
    async function carregarPerfil() {
      try {
        setCarregandoPerfil(true);
        setErroPerfil("");

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

        setUsuarioAtual(result.user);
      } catch (error) {
        console.error(error);
        setErroPerfil(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o perfil do usuário."
        );
      } finally {
        setCarregandoPerfil(false);
      }
    }

    carregarPerfil();
  }, []);

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return clientesBase.filter((cliente) => {
      if (!termo) return true;

      return (
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.documento.toLowerCase().includes(termo) ||
        cliente.corretora.toLowerCase().includes(termo) ||
        cliente.responsavel.toLowerCase().includes(termo) ||
        cliente.segmento.toLowerCase().includes(termo) ||
        cliente.cidade.toLowerCase().includes(termo)
      );
    });
  }, [busca]);

  const totalClientes = clientesBase.length;
  const totalAtivos = clientesBase.filter((c) => c.status === "Ativo").length;
  const totalAnalise = clientesBase.filter((c) => c.status === "Em análise").length;
  const totalPj = clientesBase.filter((c) => c.tipo === "Pessoa Jurídica").length;

  const nomeUsuario = usuarioAtual?.nome || "Usuário";
  const cargoUsuario = formatarCargo(usuarioAtual?.role || "usuario");
  const menuItems = montarMenu(usuarioAtual?.role || "usuario");

  return (
    <SegmaxShell
      title="Gestão de clientes"
      subtitle="Centralize a carteira, acompanhe status operacionais e mantenha a base pronta para análise técnica e cotação."
      badge="Base comercial SegMax"
      username={nomeUsuario}
      userrole={cargoUsuario}
      menuitems={menuItems}
      actions={
        <>
          <ActionButton
            href="/clientes/novo"
            label="Novo cliente"
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
      {erroPerfil ? (
        <SectionCard className="border-red-500/20 bg-red-500/10">
          <p className="text-sm font-semibold text-red-300">{erroPerfil}</p>
        </SectionCard>
      ) : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Clientes cadastrados</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {totalClientes}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Base total disponível na operação.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
              <Users size={24} />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-300">Clientes ativos</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {totalAtivos}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Registros liberados para operação.
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
              <p className="text-sm text-zinc-300">Em análise</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {totalAnalise}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Demandas em validação técnica.
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
              <p className="text-sm text-zinc-300">Pessoas jurídicas</p>
              <h3 className="mt-4 text-5xl font-semibold leading-none text-white">
                {totalPj}
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Carteira empresarial cadastrada.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-300">
              <Briefcase size={24} />
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <div className="flex flex-col gap-5 border-b border-white/8 pb-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Carteira de clientes
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Localize rapidamente registros para editar, analisar ou avançar para cotação.
            </p>
          </div>

          <label className="flex w-full max-w-[420px] items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
            <Search size={18} className="text-zinc-500" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, documento, corretora ou segmento"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
          </label>
        </div>

        {carregandoPerfil ? (
          <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center">
            <p className="text-base font-medium text-white">Carregando permissões...</p>
            <p className="mt-2 text-sm text-zinc-500">
              Aguarde alguns segundos.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[1340px] border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Cliente
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Tipo
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Corretora
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Responsável
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Segmento
                  </th>
                  <th className="px-4 text-left text-[12px] uppercase tracking-[0.22em] text-zinc-500">
                    Status
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
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="rounded-l-2xl border-y border-l border-white/6 bg-white/[0.03] px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/8 text-[#d4af37]">
                          <UserRound size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-white">
                            {cliente.nome}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {cliente.documento}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                      <TipoBadge tipo={cliente.tipo} />
                    </td>

                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-zinc-500" />
                        <span className="text-sm text-white">{cliente.corretora}</span>
                      </div>
                    </td>

                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                      <p className="text-sm text-white">{cliente.responsavel}</p>
                    </td>

                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                      <p className="text-sm text-white">{cliente.segmento}</p>
                    </td>

                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                      <StatusBadge status={cliente.status} />
                    </td>

                    <td className="border-y border-white/6 bg-white/[0.03] px-4 py-4">
                      <p className="text-sm text-white">{cliente.cidade}</p>
                      <p className="mt-1 text-xs text-zinc-500">{cliente.estado}</p>
                    </td>

                    <td className="rounded-r-2xl border-y border-r border-white/6 bg-white/[0.03] px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/clientes/${cliente.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs font-semibold text-white transition hover:border-[#d4af37]/30 hover:bg-[#d4af37]/8"
                        >
                          <Eye size={15} />
                          Abrir
                        </Link>

                        <Link
                          href={`/clientes/${cliente.id}/editar`}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/8 px-3 py-2 text-xs font-semibold text-[#f3d77a] transition hover:border-[#d4af37]/35 hover:bg-[#d4af37]/12"
                        >
                          Editar
                        </Link>

                        <Link
                          href={`/clientes/${cliente.id}/solicitar-exclusao?cliente=${encodeURIComponent(
                            cliente.nome
                          )}&corretora=${encodeURIComponent(cliente.corretora)}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:border-red-500/35 hover:bg-red-500/15"
                        >
                          <AlertTriangle size={15} />
                          Solicitar exclusão
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}

                {clientesFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center"
                    >
                      <p className="text-base font-medium text-white">
                        Nenhum cliente encontrado
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">
                        Ajuste a busca ou cadastre um novo cliente.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </SegmaxShell>
  );
}