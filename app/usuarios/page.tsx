"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Plus,
  Search,
  Shield,
  User,
  Users,
} from "lucide-react";

import SegmaxShell, { SegmaxMenuItem } from "@/components/segmaxshell";

type StatusUsuario = "Ativo" | "Suspenso";

type Permissao = "Master" | "Técnico" | "Financeiro" | "Operacional";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  corretora: string;
  permissao: Permissao;
  status: StatusUsuario;
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

const usuariosBase: Usuario[] = [
  {
    id: "1",
    nome: "Renato",
    email: "segmaxconsultoria10@gmail.com",
    telefone: "(11) 98888-9999",
    corretora: "SegMax Master",
    permissao: "Master",
    status: "Ativo",
  },
  {
    id: "2",
    nome: "Ana Paula",
    email: "tecmastersegmax@gmail.com",
    telefone: "(11) 97777-8888",
    corretora: "SegMax Master",
    permissao: "Técnico",
    status: "Ativo",
  },
  {
    id: "3",
    nome: "Alessandra Mendes",
    email: "alessandra.myryam26@gmail.com",
    telefone: "(11) 96666-7777",
    corretora: "SegMax Master",
    permissao: "Financeiro",
    status: "Ativo",
  },
  {
    id: "4",
    nome: "Carlos Mendes",
    email: "carlos@primebroker.com",
    telefone: "(11) 95555-6666",
    corretora: "Prime Broker Seguros",
    permissao: "Operacional",
    status: "Ativo",
  },
  {
    id: "5",
    nome: "Fernanda Lima",
    email: "fernanda@atlascorretora.com",
    telefone: "(11) 94444-5555",
    corretora: "Atlas Corretora",
    permissao: "Operacional",
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

function StatusBadge({ status }: { status: StatusUsuario }) {
  if (status === "Ativo") {
    return (
      <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        Ativo
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
      Suspenso
    </span>
  );
}

function PermissaoBadge({ permissao }: { permissao: Permissao }) {
  const estilos: Record<Permissao, string> = {
    Master: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    Técnico: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    Financeiro: "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#f3d77a]",
    Operacional: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        estilos[permissao],
      ].join(" ")}
    >
      {permissao}
    </span>
  );
}

export default function UsuariosPage() {
  const [busca, setBusca] = useState("");

  const usuariosFiltrados = useMemo(() => {
    return usuariosBase.filter((u) => {
      const termo = busca.toLowerCase();
      return (
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        u.corretora.toLowerCase().includes(termo)
      );
    });
  }, [busca]);

  const totalUsuarios = usuariosBase.length;
  const ativos = usuariosBase.filter((u) => u.status === "Ativo").length;

  return (
    <SegmaxShell
      title="Gestão de usuários"
      subtitle="Controle acessos, permissões e vínculos operacionais das corretoras."
      badge="Controle de acesso SegMax"
      username="Renato"
      userrole="Super Master"
      menuitems={menuItems}
      actions={
        <>
          <Link
            href="/usuarios/novo"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#d4af37] bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black"
          >
            <Plus size={18} />
            Novo usuário
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
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <SectionCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total de usuários</p>
              <h3 className="mt-3 text-5xl font-semibold text-white">
                {totalUsuarios}
              </h3>
            </div>

            <Users className="text-[#d4af37]" size={30} />
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-400">Usuários ativos</p>
              <h3 className="mt-3 text-5xl font-semibold text-white">
                {ativos}
              </h3>
            </div>

            <CheckCircle2 className="text-emerald-400" size={30} />
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-400">Controle de segurança</p>
              <h3 className="mt-3 text-5xl font-semibold text-white">100%</h3>
            </div>

            <Shield className="text-red-400" size={30} />
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <h2 className="text-xl font-semibold text-white">
            Usuários da plataforma
          </h2>

          <div className="flex items-center gap-2 border border-white/10 rounded-xl px-3 py-2">
            <Search size={16} className="text-zinc-400" />

            <input
              placeholder="Buscar usuário"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="bg-transparent text-sm text-white outline-none"
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3">
            <thead>
              <tr>
                <th className="text-left text-xs text-zinc-500 uppercase">
                  Usuário
                </th>
                <th className="text-left text-xs text-zinc-500 uppercase">
                  Corretora
                </th>
                <th className="text-left text-xs text-zinc-500 uppercase">
                  Permissão
                </th>
                <th className="text-left text-xs text-zinc-500 uppercase">
                  Status
                </th>
                <th className="text-right text-xs text-zinc-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="bg-white/[0.03] px-4 py-4 rounded-l-xl border border-white/5">
                    <div className="flex gap-3">
                      <User size={18} className="text-[#d4af37]" />

                      <div>
                        <p className="text-sm text-white font-medium">
                          {usuario.nome}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {usuario.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="bg-white/[0.03] px-4 py-4 border border-white/5">
                    {usuario.corretora}
                  </td>

                  <td className="bg-white/[0.03] px-4 py-4 border border-white/5">
                    <PermissaoBadge permissao={usuario.permissao} />
                  </td>

                  <td className="bg-white/[0.03] px-4 py-4 border border-white/5">
                    <StatusBadge status={usuario.status} />
                  </td>

                  <td className="bg-white/[0.03] px-4 py-4 rounded-r-xl border border-white/5 text-right">
                    <Link
                      href={`/usuarios/${usuario.id}/editar`}
                      className="text-sm text-[#d4af37]"
                    >
                      Editar
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