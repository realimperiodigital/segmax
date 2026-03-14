"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

type PlanoCorretora = "Prime" | "Elite" | "Executive" | "Full";
type StatusCorretora = "ativo" | "suspenso" | "bloqueado";

export default function NovaCorretoraPage() {
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [usuario, setUsuario] = useState<UsuarioSistema | null>(null);

  const [form, setForm] = useState({
    nomeFantasia: "",
    razaoSocial: "",
    cnpj: "",
    email: "",
    telefone: "",
    responsavel: "",
    plano: "Prime" as PlanoCorretora,
    status: "ativo" as StatusCorretora,
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    observacoes: "",
  });

  useEffect(() => {
    async function verificarAcesso() {
      try {
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
          console.error("Erro ao buscar usuário no sistema:", usuarioError);
          setErro("Erro ao buscar seu usuário no sistema.");
          setCarregando(false);
          return;
        }

        if (!usuarioSistema) {
          setErro("Não encontrei seu usuário no sistema.");
          setCarregando(false);
          return;
        }

        if (usuarioSistema.excluido === true) {
          setErro("Seu usuário está excluído.");
          setCarregando(false);
          return;
        }

        if (usuarioSistema.ativo === false) {
          setErro("Seu usuário está inativo.");
          setCarregando(false);
          return;
        }

        if (usuarioSistema.status !== "ativo") {
          setErro("Seu usuário não está com status ativo.");
          setCarregando(false);
          return;
        }

        if (usuarioSistema.role !== "master") {
          setErro("Acesso não liberado.");
          setCarregando(false);
          return;
        }

        setUsuario(usuarioSistema);
        setCarregando(false);
      } catch (error) {
        console.error("Erro inesperado ao verificar acesso:", error);
        setErro("Erro inesperado ao verificar acesso.");
        setCarregando(false);
      }
    }

    verificarAcesso();
  }, [router]);

  function atualizarCampo(
    campo: keyof typeof form,
    valor: string
  ) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function salvarCorretora(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!form.nomeFantasia.trim()) {
      setErro("Preencha o nome fantasia.");
      return;
    }

    if (!form.razaoSocial.trim()) {
      setErro("Preencha a razão social.");
      return;
    }

    if (!form.cnpj.trim()) {
      setErro("Preencha o CNPJ.");
      return;
    }

    if (!form.email.trim()) {
      setErro("Preencha o email da corretora.");
      return;
    }

    if (!form.responsavel.trim()) {
      setErro("Preencha o responsável.");
      return;
    }

    try {
      setSalvando(true);

      const payload = {
        nome_fantasia: form.nomeFantasia.trim(),
        razao_social: form.razaoSocial.trim(),
        cnpj: form.cnpj.trim(),
        email: form.email.trim().toLowerCase(),
        telefone: form.telefone.trim(),
        responsavel: form.responsavel.trim(),
        plano: form.plano,
        status: form.status,
        cep: form.cep.trim(),
        endereco: form.endereco.trim(),
        numero: form.numero.trim(),
        complemento: form.complemento.trim(),
        bairro: form.bairro.trim(),
        cidade: form.cidade.trim(),
        estado: form.estado.trim(),
        observacoes: form.observacoes.trim(),
        ativo: form.status === "ativo",
        excluido: false,
      };

      const { error: insertError } = await supabase
        .from("corretoras")
        .insert(payload);

      if (insertError) {
        console.error("Erro ao cadastrar corretora:", insertError);
        setErro(
          insertError.message || "Não foi possível cadastrar a corretora."
        );
        setSalvando(false);
        return;
      }

      setSucesso("Corretora cadastrada com sucesso.");

      setForm({
        nomeFantasia: "",
        razaoSocial: "",
        cnpj: "",
        email: "",
        telefone: "",
        responsavel: "",
        plano: "Prime",
        status: "ativo",
        cep: "",
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        observacoes: "",
      });

      setSalvando(false);
    } catch (error) {
      console.error("Erro inesperado ao salvar corretora:", error);
      setErro("Erro inesperado ao salvar corretora.");
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817] px-6 text-white">
        <div className="rounded-2xl border border-amber-500/20 bg-[#071224] px-8 py-6 text-center">
          <p className="text-lg font-semibold">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (erro && !usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817] px-6 text-white">
        <div className="w-full max-w-5xl rounded-[36px] border border-red-500/30 bg-[#071224] px-8 py-12 text-center shadow-2xl">
          <h1 className="mb-4 text-4xl font-bold text-red-300">
            Acesso não liberado
          </h1>

          <p className="mb-8 text-2xl text-slate-200">{erro}</p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => router.push("/login")}
              className="rounded-2xl bg-amber-400 px-8 py-4 text-xl font-semibold text-black transition hover:opacity-90"
            >
              Ir para login
            </button>

            <button
              onClick={() => router.back()}
              className="rounded-2xl border border-slate-600 px-8 py-4 text-xl font-semibold text-white transition hover:bg-slate-800"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] p-8 text-white">
      <div className="mx-auto max-w-7xl rounded-3xl border border-amber-500/20 bg-[#071224] p-8 shadow-2xl">
        <div className="mb-8 flex flex-col gap-3 border-b border-slate-800 pb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
            SegMax CRM
          </p>

          <h1 className="text-3xl font-bold text-white">
            Cadastrar nova corretora
          </h1>

          <p className="text-slate-300">
            Acesso validado para {usuario?.nome || "Super Admin"}.
          </p>
        </div>

        {erro && usuario && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-200">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-emerald-200">
            {sucesso}
          </div>
        )}

        <form onSubmit={salvarCorretora} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Nome fantasia</label>
              <input
                value={form.nomeFantasia}
                onChange={(e) => atualizarCampo("nomeFantasia", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="Ex: SegMax Corretora"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Razão social</label>
              <input
                value={form.razaoSocial}
                onChange={(e) => atualizarCampo("razaoSocial", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="Ex: SegMax Corretora de Seguros Ltda"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">CNPJ</label>
              <input
                value={form.cnpj}
                onChange={(e) => atualizarCampo("cnpj", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => atualizarCampo("email", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="contato@corretora.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Telefone</label>
              <input
                value={form.telefone}
                onChange={(e) => atualizarCampo("telefone", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Responsável</label>
              <input
                value={form.responsavel}
                onChange={(e) => atualizarCampo("responsavel", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="Nome do responsável"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Plano</label>
              <select
                value={form.plano}
                onChange={(e) =>
                  atualizarCampo("plano", e.target.value as PlanoCorretora)
                }
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
              >
                <option value="Prime">Prime</option>
                <option value="Elite">Elite</option>
                <option value="Executive">Executive</option>
                <option value="Full">Full</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  atualizarCampo("status", e.target.value as StatusCorretora)
                }
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
              >
                <option value="ativo">Ativo</option>
                <option value="suspenso">Suspenso</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">CEP</label>
              <input
                value={form.cep}
                onChange={(e) => atualizarCampo("cep", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="00000-000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Endereço</label>
              <input
                value={form.endereco}
                onChange={(e) => atualizarCampo("endereco", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="Rua, avenida, etc."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Número</label>
              <input
                value={form.numero}
                onChange={(e) => atualizarCampo("numero", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="123"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Complemento</label>
              <input
                value={form.complemento}
                onChange={(e) => atualizarCampo("complemento", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="Sala, andar, bloco"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Bairro</label>
              <input
                value={form.bairro}
                onChange={(e) => atualizarCampo("bairro", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="Bairro"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Cidade</label>
              <input
                value={form.cidade}
                onChange={(e) => atualizarCampo("cidade", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="Cidade"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Estado</label>
              <input
                value={form.estado}
                onChange={(e) => atualizarCampo("estado", e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 text-white outline-none transition focus:border-amber-400"
                placeholder="UF"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => atualizarCampo("observacoes", e.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-4 text-white outline-none transition focus:border-amber-400"
              placeholder="Anotações internas sobre a corretora"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-2xl bg-amber-400 px-8 py-4 text-lg font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar corretora"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/corretoras")}
              className="rounded-2xl border border-slate-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-slate-800"
            >
              Ver corretoras
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}