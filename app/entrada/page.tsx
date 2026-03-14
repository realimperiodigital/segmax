"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type TipoMaster = "master_financeiro" | "master_tecnico";

export default function PaginaEntradaMasters() {
  const router = useRouter();

  const [tipo, setTipo] = useState<TipoMaster>("master_financeiro");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const titulo = useMemo(() => {
    return tipo === "master_financeiro"
      ? "Acesso Master Financeiro"
      : "Acesso Master Técnico";
  }, [tipo]);

  const subtitulo = useMemo(() => {
    return tipo === "master_financeiro"
      ? "Entre com o usuário responsável pelo controle financeiro do sistema."
      : "Entre com o usuário responsável pela análise técnica e operação estratégica.";
  }, [tipo]);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    if (!email.trim() || !senha.trim()) {
      setErro("Preencha o e-mail e a senha.");
      return;
    }

    try {
      setCarregando(true);

      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha,
        });

      if (loginError) {
        setErro("E-mail ou senha inválidos.");
        return;
      }

      const userId = loginData.user?.id;

      if (!userId) {
        setErro("Não foi possível identificar o usuário.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, nome, role, ativo")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setErro("Perfil não encontrado. Verifique se este usuário está vinculado ao sistema.");
        return;
      }

      if (profile.ativo === false) {
        await supabase.auth.signOut();
        setErro("Este acesso está inativo. Fale com o administrador.");
        return;
      }

      if (profile.role !== tipo) {
        await supabase.auth.signOut();
        setErro(
          tipo === "master_financeiro"
            ? "Este usuário não tem permissão de Master Financeiro."
            : "Este usuário não tem permissão de Master Técnico."
        );
        return;
      }

      if (tipo === "master_financeiro") {
        router.push("/master/financeiro");
      } else {
        router.push("/master/tecnico");
      }
    } catch {
      setErro("Ocorreu um erro ao tentar entrar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
        <section className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2 lg:px-12">
          <div className="w-full max-w-xl">
            <div className="mb-8">
              <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1 text-sm font-medium text-cyan-300">
                SEGMAX CRM
              </span>

              <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
                Entrada dos
                <span className="block text-cyan-400">Masters do Sistema</span>
              </h1>

              <p className="mt-4 max-w-lg text-base text-slate-300 md:text-lg">
                Área exclusiva para os responsáveis centrais da operação.
                Escolha abaixo qual ambiente deseja acessar.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setTipo("master_financeiro");
                  setErro("");
                }}
                className={`rounded-2xl border p-5 text-left transition ${
                  tipo === "master_financeiro"
                    ? "border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-900/20"
                    : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
                }`}
              >
                <div className="mb-2 text-sm font-semibold text-emerald-300">
                  MASTER FINANCEIRO
                </div>
                <div className="text-lg font-bold text-white">
                  Controle financeiro total
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Receitas, custos, repasses, relatórios e visão estratégica do
                  caixa.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTipo("master_tecnico");
                  setErro("");
                }}
                className={`rounded-2xl border p-5 text-left transition ${
                  tipo === "master_tecnico"
                    ? "border-violet-400 bg-violet-500/10 shadow-lg shadow-violet-900/20"
                    : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
                }`}
              >
                <div className="mb-2 text-sm font-semibold text-violet-300">
                  MASTER TÉCNICO
                </div>
                <div className="text-lg font-bold text-white">
                  Gestão técnica e pareceres
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Operação técnica, análise de riscos, pareceres e inteligência
                  do sistema.
                </p>
              </button>
            </div>
          </div>
        </section>

        <section className="flex w-full items-center justify-center border-t border-slate-800 bg-slate-900/60 px-6 py-10 lg:w-1/2 lg:border-l lg:border-t-0 lg:px-12">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">{titulo}</h2>
              <p className="mt-2 text-sm text-slate-400">{subtitulo}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="master@segmax.com"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 pr-24 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
                  >
                    {mostrarSenha ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {erro && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
                  tipo === "master_financeiro"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-violet-600 hover:bg-violet-500"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {carregando ? "Entrando..." : "Entrar no painel"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-400">
              <p>
                Após o login, o sistema valida o perfil do usuário para garantir
                que ele entre apenas no ambiente correto.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}