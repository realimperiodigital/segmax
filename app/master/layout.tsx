"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  children: ReactNode;
};

type RoleType = "super_master" | "master_tecnico" | "master_financeiro";

type ProfileType = {
  nome: string | null;
  email: string | null;
  role: RoleType;
  status: string | null;
};

type MenuItem = {
  label: string;
  href: string;
  emoji: string;
};

function traduzirCargo(role: string) {
  if (role === "super_master") return "Super Master";
  if (role === "master_tecnico") return "Master Técnico";
  if (role === "master_financeiro") return "Master Financeiro";
  return "Usuário";
}

function montarMenu(role: RoleType): MenuItem[] {
  if (role === "super_master") {
    return [
      { label: "Dashboard Master", href: "/master", emoji: "👑" },
      { label: "Painel Técnico", href: "/master/tecnico", emoji: "🛡️" },
      { label: "Painel Financeiro", href: "/master/financeiro", emoji: "💰" },
      { label: "Corretoras", href: "/corretoras", emoji: "🏢" },
      { label: "Usuários", href: "/usuarios", emoji: "👥" },
      { label: "Clientes", href: "/clientes", emoji: "🧾" },
      { label: "Cotações", href: "/cotacoes", emoji: "📊" },
    ];
  }

  if (role === "master_tecnico") {
    return [
      { label: "Painel Técnico", href: "/master/tecnico", emoji: "🛡️" },
      { label: "Corretoras", href: "/corretoras", emoji: "🏢" },
      { label: "Usuários", href: "/usuarios", emoji: "👥" },
      { label: "Cotações", href: "/cotacoes", emoji: "📊" },
    ];
  }

  return [
    { label: "Painel Financeiro", href: "/master/financeiro", emoji: "💰" },
    { label: "Corretoras", href: "/corretoras", emoji: "🏢" },
    { label: "Usuários", href: "/usuarios", emoji: "👥" },
    { label: "Cotações", href: "/cotacoes", emoji: "📊" },
  ];
}

export default function MasterLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [saindo, setSaindo] = useState(false);
  const [profile, setProfile] = useState<ProfileType | null>(null);

  useEffect(() => {
    async function validarAcesso() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data: perfil, error: profileError } = await supabase
        .from("profiles")
        .select("nome, email, role, status")
        .eq("id", user.id)
        .single();

      if (profileError || !perfil) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      if (perfil.status !== "ativo") {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      const role = perfil.role as RoleType;

      const emMasterPrincipal = pathname === "/master";
      const emMasterTecnico = pathname.startsWith("/master/tecnico");
      const emMasterFinanceiro = pathname.startsWith("/master/financeiro");

      if (role === "super_master") {
        setProfile(perfil);
        setLoading(false);
        return;
      }

      if (role === "master_tecnico") {
        if (emMasterPrincipal || emMasterFinanceiro) {
          router.replace("/master/tecnico");
          return;
        }

        if (emMasterTecnico) {
          setProfile(perfil);
          setLoading(false);
          return;
        }
      }

      if (role === "master_financeiro") {
        if (emMasterPrincipal || emMasterTecnico) {
          router.replace("/master/financeiro");
          return;
        }

        if (emMasterFinanceiro) {
          setProfile(perfil);
          setLoading(false);
          return;
        }
      }

      await supabase.auth.signOut();
      router.replace("/login");
    }

    validarAcesso();
  }, [pathname, router]);

  const menu = useMemo(() => {
    if (!profile?.role) return [];
    return montarMenu(profile.role);
  }, [profile?.role]);

  async function handleLogout() {
    setSaindo(true);
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06070a] text-white">
        Validando acesso...
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 flex-col border-r border-[#242831] bg-[#0a0b0f] lg:flex">
          <div className="border-b border-[#242831] px-6 py-7">
            <div className="mb-5 flex justify-center">
              <Image
                src="/segmax-logo.png"
                alt="Logo SegMax"
                width={210}
                height={210}
                className="h-auto w-[170px] object-contain"
                priority
              />
            </div>

            <p className="text-center text-sm leading-6 text-[#9ca3af]">
              Painel interno com identidade premium e controle por perfil.
            </p>
          </div>

          <div className="px-5 py-6">
            <div className="rounded-[28px] border border-[#2b2f38] bg-[linear-gradient(135deg,rgba(212,166,58,0.14),rgba(255,255,255,0.03))] px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.20)]">
              <p className="text-lg font-bold text-white">
                {profile.nome || "Usuário"}
              </p>

              <p className="mt-2 text-sm font-semibold text-[#d4a63a]">
                {traduzirCargo(profile.role)}
              </p>

              <p className="mt-3 break-all text-sm leading-6 text-[#9aa2af]">
                {profile.email || "sem email"}
              </p>
            </div>
          </div>

          <nav className="flex-1 px-5 pb-5">
            <div className="space-y-3">
              {menu.map((item) => {
                const ativo =
                  pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex min-h-[58px] items-center gap-3 rounded-2xl px-5 py-4 text-[15px] font-semibold transition ${
                      ativo
                        ? "bg-gradient-to-r from-[#f3d36b] via-[#d4a63a] to-[#8f6a18] text-[#06070a] shadow-[0_8px_24px_rgba(212,166,58,0.28)]"
                        : "text-[#d1d5db] hover:bg-[#161922] hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-[#242831] p-5">
            <button
              onClick={handleLogout}
              disabled={saindo}
              className="w-full rounded-2xl border border-[#3a3f49] bg-[#151821] px-4 py-3 text-sm font-bold text-[#f5f7fa] transition hover:border-[#d4a63a] hover:text-[#d4a63a] disabled:opacity-60"
            >
              {saindo ? "Saindo..." : "Sair do sistema"}
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-[#242831] bg-[#0f1117]">
            <div className="flex flex-col gap-4 px-4 py-5 md:px-6 lg:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="pr-2">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#8e95a3]">
                    Ambiente interno
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-white">
                    {profile.role === "super_master"
                      ? "Controle Geral do SEGMAX"
                      : profile.role === "master_tecnico"
                      ? "Central Técnica do SEGMAX"
                      : "Central Financeira do SEGMAX"}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-[#2b2f38] bg-[#151821] px-5 py-3 text-sm text-[#d6dbe3]">
                    <span className="font-semibold">
                      {profile.nome || "Usuário"}
                    </span>
                    <span className="mx-2 text-[#5f6672]">•</span>
                    <span className="text-[#d4a63a]">
                      {traduzirCargo(profile.role)}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    disabled={saindo}
                    className="rounded-2xl bg-gradient-to-r from-[#f3d36b] via-[#d4a63a] to-[#8f6a18] px-4 py-2 text-sm font-bold text-[#06070a] transition hover:opacity-95 disabled:opacity-60 lg:hidden"
                  >
                    {saindo ? "Saindo..." : "Sair"}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                {menu.map((item) => {
                  const ativo =
                    pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                        ativo
                          ? "bg-gradient-to-r from-[#f3d36b] via-[#d4a63a] to-[#8f6a18] text-[#06070a]"
                          : "bg-[#151821] text-[#d6dbe3]"
                      }`}
                    >
                      {item.emoji} {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </header>

          <main className="flex-1 bg-[radial-gradient(circle_at_top,rgba(212,166,58,0.08),transparent_25%)] px-4 py-6 md:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}