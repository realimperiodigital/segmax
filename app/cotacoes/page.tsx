"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Eye,
  FileText,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";

import SegmaxShell, { SegmaxMenuItem } from "@/components/segmaxshell";

type StatusCotacao =
  | "Nova"
  | "Em análise"
  | "Aguardando seguradora"
  | "Proposta enviada"
  | "Fechada"
  | "Recusada";

type Cotacao = {
  id: string;
  cliente: string;
  corretora: string;
  ramo: string;
  seguradora: string;
  responsavel: string;
  valor: string;
  status: StatusCotacao;
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

const cotacoesBase: Cotacao[] = [
  {
    id: "1",
    cliente: "Grupo Alpha Logística",
    corretora: "Prime Broker",
    ramo: "Patrimonial Empresarial",
    seguradora: "Porto Seguro",
    responsavel: "Carlos Mendes",
    valor: "R$ 3.200.000",
    status: "Em análise",
  },
  {
    id: "2",
    cliente: "Metalúrgica Horizonte",
    corretora: "Atlas Corretora",
    ramo: "Patrimonial Industrial",
    seguradora: "Tokio Marine",
    responsavel: "Fernanda Lima",
    valor: "R$ 5.800.000",
    status: "Aguardando seguradora",
  },
  {
    id: "3",
    cliente: "Rede Nova Visão",
    corretora: "Alpha Consult",
    ramo: "Patrimonial Comercial",
    seguradora: "Allianz",
    responsavel: "Juliana Prado",
    valor: "R$ 2.100.000",
    status: "Proposta enviada",
  },
  {
    id: "4",
    cliente: "Construtora Vale Forte",
    corretora: "Prime Broker",
    ramo: "Patrimonial Construção",
    seguradora: "Mapfre",
    responsavel: "Carlos Mendes",
    valor: "R$ 7.500.000",
    status: "Nova",
  },
];

function SectionCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#d4af37]/14 bg-black/45 p-6 backdrop-blur-sm">
      {children}
    </section>
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
    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function CotacoesPage() {
  const [busca, setBusca] = useState("");

  const cotacoes = useMemo(() => {
    const termo = busca.toLowerCase();

    return cotacoesBase.filter((c) =>
      c.cliente.toLowerCase().includes(termo) ||
      c.corretora.toLowerCase().includes(termo) ||
      c.ramo.toLowerCase().includes(termo)
    );
  }, [busca]);

  return (
    <SegmaxShell
      title="Gestão de Cotações"
      subtitle="Controle técnico e comercial das propostas de seguros."
      username="Renato"
      userrole="Super Master"
      menuitems={menuItems}
      actions={
        <>
          <Link
            href="/cotacoes/nova"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#d4af37] bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black"
          >
            <Plus size={18} />
            Nova cotação
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#d4af37]/25 px-5 py-3 text-sm text-white"
          >
            <ArrowRight size={18} />
            Voltar
          </Link>
        </>
      }
    >

      <SectionCard>

        <div className="flex items-center justify-between border-b border-white/10 pb-6">

          <h2 className="text-xl font-semibold text-white">
            Cotações registradas
          </h2>

          <div className="flex items-center gap-2 border border-white/10 rounded-xl px-3 py-2">
            <Search size={16} className="text-zinc-400"/>
            <input
              placeholder="Buscar cotação"
              value={busca}
              onChange={(e)=>setBusca(e.target.value)}
              className="bg-transparent outline-none text-sm text-white"
            />
          </div>

        </div>

        <div className="mt-6 overflow-x-auto">

          <table className="w-full border-separate border-spacing-y-3">

            <thead>

              <tr>
                <th className="text-left text-xs text-zinc-500 uppercase">Cliente</th>
                <th className="text-left text-xs text-zinc-500 uppercase">Corretora</th>
                <th className="text-left text-xs text-zinc-500 uppercase">Ramo</th>
                <th className="text-left text-xs text-zinc-500 uppercase">Seguradora</th>
                <th className="text-left text-xs text-zinc-500 uppercase">Responsável</th>
                <th className="text-left text-xs text-zinc-500 uppercase">Valor</th>
                <th className="text-left text-xs text-zinc-500 uppercase">Status</th>
                <th className="text-right text-xs text-zinc-500 uppercase">Ações</th>
              </tr>

            </thead>

            <tbody>

              {cotacoes.map((cotacao)=>(
                <tr key={cotacao.id}>

                  <td className="px-4 py-4 bg-white/[0.03] border border-white/5 rounded-l-xl">
                    {cotacao.cliente}
                  </td>

                  <td className="px-4 py-4 bg-white/[0.03] border border-white/5">
                    {cotacao.corretora}
                  </td>

                  <td className="px-4 py-4 bg-white/[0.03] border border-white/5">
                    {cotacao.ramo}
                  </td>

                  <td className="px-4 py-4 bg-white/[0.03] border border-white/5">
                    {cotacao.seguradora}
                  </td>

                  <td className="px-4 py-4 bg-white/[0.03] border border-white/5">
                    {cotacao.responsavel}
                  </td>

                  <td className="px-4 py-4 bg-white/[0.03] border border-white/5">
                    {cotacao.valor}
                  </td>

                  <td className="px-4 py-4 bg-white/[0.03] border border-white/5">
                    <StatusBadge status={cotacao.status}/>
                  </td>

                  <td className="px-4 py-4 bg-white/[0.03] border border-white/5 rounded-r-xl text-right">
                    <Link
                      href={`/cotacoes/${cotacao.id}`}
                      className="text-sm text-[#d4af37] inline-flex items-center gap-1"
                    >
                      <Eye size={16}/>
                      Abrir
                    </Link>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </SectionCard>

    </SegmaxShell>
  );
}