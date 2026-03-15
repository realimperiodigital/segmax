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
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  responsavel: string | null;
  plano: string | null;
  status: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  observacoes: string | null;
  ativo: boolean | null;
  excluido: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type RpcRetorno = {
  id: string;
  status: string;
  ativo: boolean;
  excluido: boolean;
  updated_at: string;
};

function formatarData(data: string | null) {
  if (!data) return "-";

  const dt = new Date(data);

  if (Number.isNaN(dt.getTime())) return "-";

  return dt.toLocaleString("pt-BR");
}

function valorOuTraco(valor: string | null | undefined) {
  if (!valor || !valor.trim()) return "-";
  return valor;
}

export default function DetalheCorretoraPage() {
  const router = useRouter();
  const params = useParams();

  const corretoraId = useMemo(() => {
    const id = params?.id;
    if (Array.isArray(id)) return id[0] ?? "";
    return id ?? "";
  }, [params]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioSistema | null>(null);
  const [corretora, setCorretora] = useState<Corretora | null>(null);
  const [processandoAcao, setProcessandoAcao] = useState("");

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

        if (usuarioError) {
          console.error("Erro ao buscar usuário logado:", usuarioError);
          setErro("Não foi possível validar seu acesso.");
          setCarregando(false);
          return;
        }

        if (!usuarioSistema) {
          setErro("Seu usuário não foi encontrado no sistema.");
          setCarregando(false);
          return;
        }

        const rolesPermitidas = ["master", "tech_master", "financeiro_master"];

        if (!usuarioSistema.role || !rolesPermitidas.includes(usuarioSistema.role)) {
          setErro("Acesso não liberado para esta área.");
          setCarregando(false);
          return;
        }

        if (!corretoraId) {
          setErro("Corretora não identificada.");
          setCarregando(false);
          return;
        }

        const { data: corretoraData, error: corretoraError } = await supabase
          .from("corretoras")
          .select("*")
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

        setUsuarioLogado(usuarioSistema);
        setCorretora(corretoraData);
        setCarregando(false);
      } catch (error) {
        console.error("Erro inesperado ao carregar corretora:", error);
        setErro("Erro inesperado ao carregar a corretora.");
        setCarregando(false);
      }
    }

    carregarTela();
  }, [corretoraId, router]);

  async function atualizarStatus(
    novoStatus: "ativo" | "suspenso" | "bloqueado",
    ativo: boolean,
    excluido: boolean = false
  ) {
    if (!corretora) return;

    try {
      setProcessandoAcao(novoStatus);
      setErro("");
      setSucesso("");

      const { data, error } = await supabase.rpc("master_update_corretora_status", {
        p_corretora_id: corretora.id,
        p_status: novoStatus,
        p_ativo: ativo,
        p_excluido: excluido,
      });

      if (error) {
        console.error("Erro ao atualizar status via RPC:", error);
        setErro(error.message || "Não foi possível atualizar o status.");
        setProcessandoAcao("");
        return;
      }

      const retorno = Array.isArray(data) ? (data[0] as RpcRetorno | undefined) : undefined;

      if (!retorno) {
        setErro("Nenhum retorno veio da atualização da corretora.");
        setProcessandoAcao("");
        return;
      }

      setCorretora((prev) =>
        prev
          ? {
              ...prev,
              status: retorno.status,
              ativo: retorno.ativo,
              excluido: retorno.excluido,
              updated_at: retorno.updated_at,
            }
          : prev
      );

      if (excluido) {
        setSucesso("Corretora excluída logicamente com sucesso.");
      } else if (novoStatus === "ativo") {
        setSucesso("Corretora ativada com sucesso.");
      } else if (novoStatus === "suspenso") {
        setSucesso("Corretora suspensa com sucesso.");
      } else {
        setSucesso("Corretora bloqueada com sucesso.");
      }

      setProcessandoAcao("");
    } catch (error) {
      console.error("Erro inesperado ao atualizar status:", error);
      setErro("Erro inesperado ao atualizar status.");
      setProcessandoAcao("");
    }
  }

  function excluirCorretoraLogicamente() {
    if (!corretora) return;

    const confirmar = window.confirm(
      `Deseja realmente excluir logicamente a corretora "${corretora.nome_fantasia || corretora.razao_social || "sem nome"}"?`
    );

    if (!confirmar) return;

    atualizarStatus("bloqueado", false, true);
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817] px-6 text-white">
        <div className="rounded-2xl border border-amber-500/20 bg-[#071224] px-8 py-6 text-center">
          <p className="text-lg font-semibold">Carregando corretora...</p>
        </div>
      </div>
    );
  }

  if (erro && !corretora) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817] px-6 text-white">
        <div className="w-full max-w-5xl rounded-[36px] border border-red-500/30 bg-[#071224] px-8 py-12 text-center shadow-2xl">
          <h1 className="mb-4 text-4xl font-bold text-red-300">
            Erro ao carregar corretora
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

  return (
    <div className="min-h-screen bg-[#020817] p-8 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border border-amber-500/20 bg-[#071224] p-8 shadow-2xl">
          <div className="flex flex-col gap-6 border-b border-slate-800 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
                SegMax CRM
              </p>

              <h1 className="mt-2 text-3xl font-bold text-white">
                Detalhes da corretora
              </h1>

              <p className="mt-3 text-slate-300">
                Visualização completa da corretora cadastrada no sistema.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Usuário logado: {usuarioLogado?.nome || "-"}
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
                onClick={() => router.push(`/corretoras/${corretoraId}/editar`)}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
              >
                Editar corretora
              </button>

              <button
                onClick={() => router.push(`/corretoras/${corretoraId}/usuarios`)}
                className="rounded-2xl bg-amber-400 px-6 py-3 text-base font-semibold text-black transition hover:opacity-90"
              >
                Usuários
              </button>
            </div>
          </div>

          {erro && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-200">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-emerald-200">
              {sucesso}
            </div>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
              <p className="text-sm text-slate-400">Nome fantasia</p>
              <p className="mt-2 text-xl font-bold text-white">
                {valorOuTraco(corretora?.nome_fantasia)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
              <p className="text-sm text-slate-400">Plano</p>
              <p className="mt-2 text-xl font-bold text-white">
                {valorOuTraco(corretora?.plano)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
              <p className="text-sm text-slate-400">Status</p>
              <p className="mt-2 text-xl font-bold text-white">
                {valorOuTraco(corretora?.status)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
              <p className="text-sm text-slate-400">Ativa</p>
              <p className="mt-2 text-xl font-bold text-white">
                {corretora?.ativo ? "sim" : "não"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-3xl border border-amber-500/20 bg-[#071224] p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white">Dados principais</h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
                <p className="text-sm text-slate-400">Razão social</p>
                <p className="mt-2 text-lg text-white">
                  {valorOuTraco(corretora?.razao_social)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
                <p className="text-sm text-slate-400">CNPJ</p>
                <p className="mt-2 text-lg text-white">
                  {valorOuTraco(corretora?.cnpj)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
                <p className="text-sm text-slate-400">Email</p>
                <p className="mt-2 text-lg text-white">
                  {valorOuTraco(corretora?.email)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
                <p className="text-sm text-slate-400">Telefone</p>
                <p className="mt-2 text-lg text-white">
                  {valorOuTraco(corretora?.telefone)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 md:col-span-2">
                <p className="text-sm text-slate-400">Responsável</p>
                <p className="mt-2 text-lg text-white">
                  {valorOuTraco(corretora?.responsavel)}
                </p>
              </div>
            </div>

            <h2 className="mt-10 text-2xl font-bold text-white">Endereço</h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
                <p className="text-sm text-slate-400">CEP</p>
                <p className="mt-2 text-lg text-white">
                  {valorOuTraco(corretora?.cep)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
                <p className="text-sm text-slate-400">Endereço</p>
                <p className="mt-2 text-lg text-white">
                  {valorOuTraco(corretora?.endereco)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
                <p className="text-sm text-slate-400">Número</p>
                <p className="mt-2 text-lg text-white">
                  {valorOuTraco(corretora?.numero)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
                <p className="text-sm text-slate-400">Complemento</p>
                <p className="mt-2 text-lg text-white">
                  {valorOuTraco(corretora?.complemento)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
                <p className="text-sm text-slate-400">Bairro</p>
                <p className="mt-2 text-lg text-white">
                  {valorOuTraco(corretora?.bairro)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
                <p className="text-sm text-slate-400">Cidade</p>
                <p className="mt-2 text-lg text-white">
                  {valorOuTraco(corretora?.cidade)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 md:col-span-2">
                <p className="text-sm text-slate-400">Estado</p>
                <p className="mt-2 text-lg text-white">
                  {valorOuTraco(corretora?.estado)}
                </p>
              </div>
            </div>

            <h2 className="mt-10 text-2xl font-bold text-white">Observações</h2>

            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
              <p className="text-lg text-white">
                {valorOuTraco(corretora?.observacoes)}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-500/20 bg-[#071224] p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white">Ações da corretora</h2>

            <div className="mt-6 space-y-4">
              <button
                onClick={() => atualizarStatus("ativo", true, false)}
                disabled={processandoAcao !== ""}
                className="w-full rounded-2xl bg-emerald-600 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processandoAcao === "ativo" ? "Ativando..." : "Ativar"}
              </button>

              <button
                onClick={() => atualizarStatus("suspenso", false, false)}
                disabled={processandoAcao !== ""}
                className="w-full rounded-2xl bg-amber-500 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processandoAcao === "suspenso" ? "Suspendendo..." : "Suspender"}
              </button>

              <button
                onClick={() => atualizarStatus("bloqueado", false, false)}
                disabled={processandoAcao !== ""}
                className="w-full rounded-2xl bg-red-600 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processandoAcao === "bloqueado" ? "Bloqueando..." : "Bloquear"}
              </button>

              <button
                onClick={excluirCorretoraLogicamente}
                disabled={processandoAcao !== ""}
                className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processandoAcao === "bloqueado" ? "Excluindo..." : "Excluir logicamente"}
              </button>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
              <p className="text-sm text-slate-400">Excluída</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {corretora?.excluido ? "sim" : "não"}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
              <p className="text-sm text-slate-400">Criada em</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatarData(corretora?.created_at || null)}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
              <p className="text-sm text-slate-400">Última atualização</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatarData(corretora?.updated_at || null)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}