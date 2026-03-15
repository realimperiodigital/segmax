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
  email: string | null;
  responsavel: string | null;
  plano: string | null;
  status: string | null;
  ativo: boolean | null;
  excluido: boolean | null;
};

type UsuarioCorretora = {
  id: string;
  nome: string | null;
  email: string | null;
  login: string | null;
  role: string | null;
  permissao: string | null;
  status: string | null;
  ativo: boolean | null;
  excluido: boolean | null;
  created_at: string | null;
};

function formatarRole(role: string | null) {
  if (!role) return "-";
  if (role === "master") return "Master";
  if (role === "admin_corretora") return "Admin da Corretora";
  if (role === "corretor") return "Corretor";
  if (role === "assistente") return "Assistente";
  if (role === "analista") return "Analista";
  return role;
}

function formatarData(data: string | null) {
  if (!data) return "-";

  const dt = new Date(data);

  if (Number.isNaN(dt.getTime())) return "-";

  return dt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function UsuariosDaCorretoraPage() {
  const router = useRouter();
  const params = useParams();

  const corretoraId = useMemo(() => {
    const id = params?.id;
    if (Array.isArray(id)) return id[0] ?? "";
    return id ?? "";
  }, [params]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioSistema | null>(null);
  const [corretora, setCorretora] = useState<Corretora | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioCorretora[]>([]);

  useEffect(() => {
    async function carregarTela() {
      try {
        setCarregando(true);
        setErro("");

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

        const { data: usuarioSistema, error: usuarioSistemaError } = await supabase
          .from("usuarios")
          .select("id, nome, email, role, corretora_id, status, ativo, excluido")
          .eq("id", user.id)
          .maybeSingle<UsuarioSistema>();

        if (usuarioSistemaError) {
          console.error("Erro ao buscar usuário logado:", usuarioSistemaError);
          setErro("Não foi possível validar seu acesso.");
          setCarregando(false);
          return;
        }

        if (!usuarioSistema) {
          setErro("Seu usuário não foi encontrado no sistema.");
          setCarregando(false);
          return;
        }

        if (usuarioSistema.excluido === true) {
          setErro("Seu usuário está excluído.");
          setCarregando(false);
          return;
        }

        if (usuarioSistema.ativo === false || usuarioSistema.status !== "ativo") {
          setErro("Seu usuário não está ativo.");
          setCarregando(false);
          return;
        }

        const isMaster = usuarioSistema.role === "master";
        const isAdminCorretora = usuarioSistema.role === "admin_corretora";

        if (!isMaster && !isAdminCorretora) {
          setErro("Acesso não liberado para esta área.");
          setCarregando(false);
          return;
        }

        if (!corretoraId) {
          setErro("Corretora não identificada.");
          setCarregando(false);
          return;
        }

        if (
          isAdminCorretora &&
          usuarioSistema.corretora_id &&
          usuarioSistema.corretora_id !== corretoraId
        ) {
          setErro("Você não pode acessar usuários de outra corretora.");
          setCarregando(false);
          return;
        }

        const { data: corretoraData, error: corretoraError } = await supabase
          .from("corretoras")
          .select("id, nome_fantasia, razao_social, email, responsavel, plano, status, ativo, excluido")
          .eq("id", corretoraId)
          .maybeSingle<Corretora>();

        if (corretoraError) {
          console.error("Erro ao buscar corretora:", corretoraError);
          setErro("Não foi possível carregar a corretora.");
          setCarregando(false);
          return;
        }

        if (!corretoraData) {
          setErro("Corretora não encontrada.");
          setCarregando(false);
          return;
        }

        const { data: usuariosData, error: usuariosError } = await supabase
          .from("usuarios")
          .select("id, nome, email, login, role, permissao, status, ativo, excluido, created_at")
          .eq("corretora_id", corretoraId)
          .order("created_at", { ascending: true });

        if (usuariosError) {
          console.error("Erro ao buscar usuários da corretora:", usuariosError);
          setErro("Não foi possível carregar os usuários da corretora.");
          setCarregando(false);
          return;
        }

        setUsuarioLogado(usuarioSistema);
        setCorretora(corretoraData);
        setUsuarios((usuariosData as UsuarioCorretora[]) || []);
        setCarregando(false);
      } catch (error) {
        console.error("Erro inesperado ao carregar tela de usuários:", error);
        setErro("Erro inesperado ao carregar a tela.");
        setCarregando(false);
      }
    }

    carregarTela();
  }, [corretoraId, router]);

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817] px-6 text-white">
        <div className="rounded-2xl border border-amber-500/20 bg-[#071224] px-8 py-6 text-center">
          <p className="text-lg font-semibold">Carregando usuários da corretora...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817] px-6 text-white">
        <div className="w-full max-w-5xl rounded-[36px] border border-red-500/30 bg-[#071224] px-8 py-12 text-center shadow-2xl">
          <h1 className="mb-4 text-4xl font-bold text-red-300">
            Erro ao carregar usuários
          </h1>

          <p className="mb-8 text-2xl text-slate-200">{erro}</p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => router.push("/corretoras")}
              className="rounded-2xl bg-amber-400 px-8 py-4 text-xl font-semibold text-black transition hover:opacity-90"
            >
              Voltar para corretoras
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

  const totalAtivos = usuarios.filter((u) => u.status === "ativo" && u.excluido !== true).length;
  const totalBloqueados = usuarios.filter((u) => u.status === "bloqueado").length;
  const totalSuspensos = usuarios.filter((u) => u.status === "suspenso").length;

  return (
    <div className="min-h-screen bg-[#020817] p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-amber-500/20 bg-[#071224] p-8 shadow-2xl">
          <div className="flex flex-col gap-6 border-b border-slate-800 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
                SegMax CRM
              </p>

              <h1 className="mt-2 text-3xl font-bold text-white">
                Usuários da corretora
              </h1>

              <p className="mt-3 text-slate-300">
                Gerencie os acessos internos da corretora no sistema.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/corretoras")}
                className="rounded-2xl border border-slate-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                Voltar
              </button>

              <button
                onClick={() => router.push(`/corretoras/${corretoraId}/usuarios/novo`)}
                className="rounded-2xl bg-amber-400 px-6 py-3 text-base font-semibold text-black transition hover:opacity-90"
              >
                Novo usuário
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
              <p className="text-sm text-slate-400">Corretora</p>
              <p className="mt-2 text-xl font-bold text-white">
                {corretora?.nome_fantasia || "Sem nome fantasia"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {corretora?.razao_social || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
              <p className="text-sm text-slate-400">Plano</p>
              <p className="mt-2 text-xl font-bold text-white">
                {corretora?.plano || "-"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Status: {corretora?.status || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
              <p className="text-sm text-slate-400">Usuários ativos</p>
              <p className="mt-2 text-3xl font-bold text-white">{totalAtivos}</p>
              <p className="mt-1 text-sm text-slate-400">
                Bloqueados: {totalBloqueados} • Suspensos: {totalSuspensos}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
              <p className="text-sm text-slate-400">Usuário logado</p>
              <p className="mt-2 text-xl font-bold text-white">
                {usuarioLogado?.nome || "-"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {formatarRole(usuarioLogado?.role || null)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-500/20 bg-[#071224] p-8 shadow-2xl">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white">Equipe da corretora</h2>
            <p className="text-slate-400">
              Aqui ficam os usuários que poderão entrar no SegMax pela rota /login.
            </p>
          </div>

          {usuarios.length === 0 ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-8 text-center">
              <p className="text-lg text-slate-300">
                Ainda não existe nenhum usuário cadastrado para esta corretora.
              </p>

              <button
                onClick={() => router.push(`/corretoras/${corretoraId}/usuarios/novo`)}
                className="mt-6 rounded-2xl bg-amber-400 px-6 py-3 text-base font-semibold text-black transition hover:opacity-90"
              >
                Cadastrar primeiro usuário
              </button>
            </div>
          ) : (
            <div className="grid gap-5">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {usuario.nome || "Usuário sem nome"}
                      </h3>

                      <p className="mt-2 text-slate-300">
                        Email: {usuario.email || "-"}
                      </p>

                      <p className="mt-1 text-slate-400">
                        Login: {usuario.login || usuario.email || "-"}
                      </p>

                      <p className="mt-1 text-slate-400">
                        Perfil: {formatarRole(usuario.role)}
                      </p>

                      <p className="mt-1 text-slate-400">
                        Permissão complementar: {usuario.permissao || "-"}
                      </p>

                      <p className="mt-1 text-slate-400">
                        Criado em: {formatarData(usuario.created_at)}
                      </p>
                    </div>

                    <div className="flex min-w-[180px] flex-col items-start gap-2 lg:items-end">
                      <div className="rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-left lg:text-right">
                        <p className="text-sm text-slate-400">Status</p>
                        <p className="text-2xl font-bold text-white">
                          {usuario.status || "-"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-left lg:text-right">
                        <p className="text-sm text-slate-400">Ativo</p>
                        <p className="text-lg font-semibold text-white">
                          {usuario.ativo ? "sim" : "não"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white transition hover:opacity-90"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="rounded-xl bg-amber-500 px-5 py-3 text-base font-semibold text-white transition hover:opacity-90"
                    >
                      Suspender
                    </button>

                    <button
                      type="button"
                      className="rounded-xl bg-red-600 px-5 py-3 text-base font-semibold text-white transition hover:opacity-90"
                    >
                      Bloquear
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}