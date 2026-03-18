"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function normalizarPermissao(valor?: string | null) {
  const v = String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (
    v === "master" ||
    v === "super master" ||
    v === "super_master" ||
    v === "supermaster"
  ) {
    return "master";
  }

  if (
    v === "tecnico" ||
    v === "tecnica" ||
    v === "diretora tecnica" ||
    v === "diretor tecnico" ||
    v === "diretora_tecnica" ||
    v === "analise tecnica" ||
    v === "analista tecnico"
  ) {
    return "diretora_tecnica";
  }

  if (
    v === "financeiro" ||
    v === "diretora financeira" ||
    v === "diretor financeiro" ||
    v === "diretora_financeira"
  ) {
    return "diretora_financeira";
  }

  if (
    v === "operacional" ||
    v === "usuario" ||
    v === "usuário" ||
    v === "corretor" ||
    v === "corretora" ||
    v === "admin_corretora"
  ) {
    return "corretor";
  }

  return "";
}

function rotaInicialPorPermissao(permissao: string) {
  if (permissao === "master") return "/dashboard";
  if (permissao === "diretora_tecnica") return "/analise-tecnica";
  if (permissao === "diretora_financeira") return "/financeiro";
  if (permissao === "corretor") return "/cotacoes";
  return "/login";
}

export default function LoginPage() {
  const router = useRouter();

  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      // mata qualquer sessão antiga antes de entrar
      await supabase.auth.signOut();

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (authError) {
        setErro(authError.message || "Não foi possível entrar.");
        setCarregando(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        setErro("Usuário autenticado, mas sem e-mail disponível.");
        setCarregando(false);
        return;
      }

      const { data: usuario, error: usuarioError } = await supabase
        .from("usuarios")
        .select("email, permissao")
        .eq("email", user.email)
        .maybeSingle();

      if (usuarioError) {
        setErro("Entrou, mas não foi possível localizar a permissão do usuário.");
        setCarregando(false);
        return;
      }

      const permissao = normalizarPermissao(usuario?.permissao);
      const destino = rotaInicialPorPermissao(permissao);

      if (!permissao || destino === "/login") {
        setErro("Permissão do usuário não encontrada ou inválida.");
        setCarregando(false);
        return;
      }

      router.replace(destino);
      router.refresh();
    } catch {
      setErro("Ocorreu um erro inesperado ao entrar.");
      setCarregando(false);
    }
  }

  async function handleSairTudo() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-yellow-700/30 bg-zinc-950 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">SegMax CRM</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Acesse sua área com segurança.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-600"
              placeholder="seuemail@segmax.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-600"
              placeholder="Digite sua senha"
              required
            />
          </div>

          {erro ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {erro}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-2xl bg-yellow-500 px-4 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>

          <button
            type="button"
            onClick={handleSairTudo}
            className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 font-semibold text-white transition hover:border-yellow-700 hover:text-yellow-400"
          >
            Limpar sessão atual
          </button>
        </form>
      </div>
    </main>
  );
}