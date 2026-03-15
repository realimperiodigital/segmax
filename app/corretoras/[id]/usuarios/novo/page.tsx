"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type UsuarioSistema = {
  id: string;
  nome: string | null;
  email: string | null;
  role: string | null;
  corretora_id: string | null;
  status: string | null;
  ativo: boolean | null;
  excluido: boolean | null;
};

type Corretora = {
  id: string;
  nome_fantasia: string | null;
  razao_social: string | null;
  status: string | null;
  ativo: boolean | null;
  excluido: boolean | null;
};

type RoleUsuario =
  | "admin_corretora"
  | "corretor"
  | "assistente"
  | "analista";

export default function NovoUsuarioCorretoraPage() {
  const router = useRouter();
  const params = useParams();

  const corretoraId = useMemo(() => {
    const id = params?.id;
    if (Array.isArray(id)) return id[0] ?? "";
    return id ?? "";
  }, [params]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioSistema | null>(null);
  const [corretora, setCorretora] = useState<Corretora | null>(null);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    role: "admin_corretora" as RoleUsuario,
  });

  useEffect(() => {
    async function carregarTela() {
      try {
        setCarregando(true);
        setErro("");
        setSucesso("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Erro ao obter usuário autenticado:", authError);
          setErro("Erro ao validar login.");
          setCarregando(false);
          return;
        }

        if (!user) {
          router.push("/login");
          return;
        }

        const { data: usuarioSistema, error: usuarioError } = await supabase
          .from("usuarios")
          .select("id, nome, email, role, corretora_id, status, ativo, excluido")
          .eq("id", user.id)
          .maybeSingle<UsuarioSistema>();

        if (usuarioError || !usuarioSistema) {
          setErro("Não foi possível validar seu usuário no sistema.");
          setCarregando(false);
          return;
        }

        if (
          usuarioSistema.excluido === true ||
          usuarioSistema.ativo === false ||
          usuarioSistema.status !== "ativo"
        ) {
          setErro("Seu usuário está inativo ou sem acesso.");
          setCarregando(false);
          return;
        }

        const rolesPermitidas = [
          "master",
          "tech_master",
          "financeiro_master",
          "admin_corretora",
        ];

        if (!usuarioSistema.role || !rolesPermitidas.includes(usuarioSistema.role)) {
          setErro("Acesso não liberado para criar usuários.");
          setCarregando(false);
          return;
        }

        if (!corretoraId) {
          setErro("Corretora não identificada.");
          setCarregando(false);
          return;
        }

        if (
          usuarioSistema.role === "admin_corretora" &&
          usuarioSistema.corretora_id !== corretoraId
        ) {
          setErro("Você só pode criar usuários para sua própria corretora.");
          setCarregando(false);
          return;
        }

        const { data: corretoraData, error: corretoraError } = await supabase
          .from("corretoras")
          .select("id, nome_fantasia, razao_social, status, ativo, excluido")
          .eq("id", corretoraId)
          .maybeSingle<Corretora>();

        if (corretoraError || !corretoraData) {
          setErro("Não foi possível carregar a corretora.");
          setCarregando(false);
          return;
        }

        if (
          corretoraData.excluido === true ||
          corretoraData.ativo === false ||
          corretoraData.status !== "ativo"
        ) {
          setErro("A corretora está inativa, bloqueada ou excluída.");
          setCarregando(false);
          return;
        }

        setUsuarioLogado(usuarioSistema);
        setCorretora(corretoraData);
        setCarregando(false);
      } catch (error) {
        console.error("Erro inesperado ao carregar tela:", error);
        setErro("Erro inesperado ao carregar a tela.");
        setCarregando(false);
      }
    }

    carregarTela();
  }, [corretoraId, router]);

  function atualizarCampo(campo: keyof typeof form, valor: string) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function criarUsuario(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!form.nome.trim()) {
      setErro("Preencha o nome do usuário.");
      return;
    }

    if (!form.email.trim()) {
      setErro("Preencha o email do usuário.");
      return;
    }

    if (!form.senha.trim()) {
      setErro("Preencha a senha.");
      return;
    }

    if (form.senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setErro("A confirmação de senha não confere.");
      return;
    }

    try {
      setSalvando(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setErro("Sessão não encontrada. Faça login novamente.");
        setSalvando(false);
        return;
      }

      const response = await fetch("/api/usuarios/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim().toLowerCase(),
          senha: form.senha.trim(),
          role: form.role,
          corretora_id: corretoraId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErro(result.error || "Não foi possível criar o usuário.");
        setSalvando(false);
        return;
      }

      setSucesso("Usuário criado com sucesso.");

      setForm({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        role: "admin_corretora",
      });

      setSalvando(false);

      setTimeout(() => {
        router.push(`/corretoras/${corretoraId}/usuarios`);
      }, 900);
    } catch (error) {
      console.error("Erro inesperado ao criar usuário:", error);
      setErro("Erro inesperado ao criar o usuário.");
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817] px-6 text-white">
        <div className="rounded-2xl border border-amber-500/20 bg-[#071224] px-8 py-6 text-center">
          <p className="text-lg font-semibold">Carregando tela de usuário...</p>
        </div>
      </div>
    );
  }

  if (erro && !usuarioLogado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817] px-6 text-white">
        <div className="w-full max-w-5xl rounded-[36px] border border-red-500/30 bg-[#071224] px-8 py-12 text-center shadow-2xl">
          <h1 className="mb-4 text-4xl font-bold text-red-300">
            Erro ao carregar tela
          </h1>

          <p className="mb-8 text-2xl text-slate-200">{erro}</p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => router.push(`/corretoras/${corretoraId}/usuarios`)}
              className="rounded-2xl bg-amber-400 px-8 py-4 text-xl font-semibold text-black transition hover:opacity-90"
            >
              Voltar para usuários
            </button>

            <button
              onClick={() => router.refresh()}
              className="rounded-2xl border border-slate-600 px-8 py-4 text-xl font-semibold text-white transition hover:bg-slate-800"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] p-8 text-white">
      <div className="mx-auto max-w-5xl rounded-3xl border border-amber-500/20 bg-[#071224] p-8 shadow-2xl">
        <div className="mb-8 flex flex-col gap-3 border-b border-slate-800 pb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
            SegMax CRM
          </p>

          <h1 className="text-3xl font-bold text-white">
            Criar usuário da corretora
          </h1>

          <p className="text-slate-300">
            Corretora: {corretora?.nome_fantasia || corretora?.razao_social || "-"}
          </p>

          <p className="text-slate-500">
            Usuário logado: {usuarioLogado?.nome || "-"}
          </p>
        </div>

        {erro && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-200">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-emerald-200">
            {sucesso}
          </div>
        )}

        <form onSubmit={criarUsuario} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Nome</label>
              <input
                value={form.nome}
                onChange={(e) => atualizarCampo("nome", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="Nome completo do usuário"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Email de login</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => atualizarCampo("email", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="usuario@corretora.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Senha</label>
              <input
                type="password"
                value={form.senha}
                onChange={(e) => atualizarCampo("senha", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Confirmar senha</label>
              <input
                type="password"
                value={form.confirmarSenha}
                onChange={(e) => atualizarCampo("confirmarSenha", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="Repita a senha"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-slate-300">Perfil do usuário</label>
              <select
                value={form.role}
                onChange={(e) =>
                  atualizarCampo("role", e.target.value as RoleUsuario)
                }
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
              >
                <option value="admin_corretora">Admin da corretora</option>
                <option value="corretor">Corretor</option>
                <option value="assistente">Assistente</option>
                <option value="analista">Analista</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-2xl bg-amber-400 px-8 py-4 text-lg font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? "Criando usuário..." : "Criar usuário"}
            </button>

            <button
              type="button"
              onClick={() => router.push(`/corretoras/${corretoraId}/usuarios`)}
              className="rounded-2xl border border-slate-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-slate-800"
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}