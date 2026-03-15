"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UsuarioForm = {
  id: string;
  nome: string;
  login: string;
  email: string;
  senha: string;
  telefone: string;
  permissao: string;
  status: string;
  corretora: string;
};

const FORM_INICIAL: UsuarioForm = {
  id: "",
  nome: "",
  login: "",
  email: "",
  senha: "",
  telefone: "",
  permissao: "corretor",
  status: "ativo",
  corretora: "Corretora SegMax",
};

function formatarPermissao(permissao?: string | null) {
  if (!permissao) return "-";
  if (permissao === "master") return "Diretor Geral / Master";
  if (permissao === "diretora_tecnica") return "Diretora Técnica";
  if (permissao === "diretora_financeira") return "Diretora Financeira";
  if (permissao === "admin_corretora") return "Admin da Corretora";
  if (permissao === "corretor") return "Corretor";
  return permissao;
}

export default function EditarUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const usuarioId = String(params?.id || "");

  const [form, setForm] = useState<UsuarioForm>(FORM_INICIAL);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  function atualizarCampo<K extends keyof UsuarioForm>(campo: K, valor: UsuarioForm[K]) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function carregarUsuario() {
    try {
      setCarregando(true);
      setErro("");
      setMensagem("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nome, login, email, telefone, permissao, status, corretora")
        .eq("id", usuarioId)
        .maybeSingle();

      if (error) {
        setErro(error.message);
        return;
      }

      if (!data) {
        setErro("Usuário não encontrado.");
        return;
      }

      setForm({
        id: data.id || "",
        nome: data.nome || "",
        login: data.login || "",
        email: data.email || "",
        senha: "",
        telefone: data.telefone || "",
        permissao: data.permissao || "corretor",
        status: data.status || "ativo",
        corretora: data.corretora || "Corretora SegMax",
      });
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar o usuário.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (usuarioId) {
      carregarUsuario();
    }
  }, [usuarioId]);

  async function salvarUsuario(e: React.FormEvent) {
    e.preventDefault();

    setErro("");
    setMensagem("");

    if (!form.nome.trim()) {
      setErro("Informe o nome.");
      return;
    }

    if (!form.login.trim()) {
      setErro("Informe o login.");
      return;
    }

    if (!form.email.trim()) {
      setErro("Informe o e-mail.");
      return;
    }

    if (form.senha.trim() && form.senha.trim().length < 6) {
      setErro("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setSalvando(true);

      const resposta = await fetch("/api/usuarios/atualizar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: form.id,
          nome: form.nome,
          login: form.login,
          email: form.email,
          senha: form.senha,
          telefone: form.telefone,
          permissao: form.permissao,
          status: form.status,
          corretora: form.corretora,
        }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        setErro(resultado?.error || "Não foi possível atualizar o usuário.");
        return;
      }

      setMensagem("Usuário atualizado com sucesso.");
      setForm((prev) => ({
        ...prev,
        senha: "",
      }));
    } catch (e) {
      console.error(e);
      setErro("Erro inesperado ao atualizar o usuário.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 py-6 text-white md:px-8">
        <div className="mx-auto max-w-[1200px] rounded-[28px] border border-yellow-600/20 bg-[#0a0a0a] p-10 text-center text-zinc-400">
          Carregando usuário...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-6 text-white md:px-8">
      <div className="mx-auto max-w-[1200px] space-y-5">
        <section className="rounded-[28px] border border-yellow-600/20 bg-[#0a0a0a] px-6 py-7 shadow-[0_0_40px_rgba(0,0,0,0.35)] md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex rounded-full border border-yellow-600/20 bg-[#111111] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-yellow-500">
                Edição
              </div>

              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                Editar usuário
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
                Ajuste dados de acesso, vínculo com corretora, permissão e status do usuário.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/usuarios"
                className="rounded-xl border border-zinc-700 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:border-yellow-500/40 hover:bg-[#151515]"
              >
                Voltar para usuários
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Nome</p>
            <h3 className="mt-2 text-3xl font-bold">{form.nome || "-"}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Permissão atual</p>
            <h3 className="mt-2 text-2xl font-bold">{formatarPermissao(form.permissao)}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Status atual</p>
            <h3 className="mt-2 text-3xl font-bold">{form.status || "-"}</h3>
          </div>
        </section>

        <form
          onSubmit={salvarUsuario}
          className="rounded-[28px] border border-yellow-600/20 bg-[#0a0a0a] p-6"
        >
          <div className="mb-6">
            <h2 className="text-4xl font-bold">Dados do usuário</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Altere as informações e salve para atualizar tanto a tabela quanto o acesso no Auth.
            </p>
          </div>

          {mensagem ? (
            <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {mensagem}
            </div>
          ) : null}

          {erro ? (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {erro}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Nome</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => atualizarCampo("nome", e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Login</label>
              <input
                type="text"
                value={form.login}
                onChange={(e) => atualizarCampo("login", e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => atualizarCampo("email", e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Nova senha</label>
              <input
                type="password"
                value={form.senha}
                onChange={(e) => atualizarCampo("senha", e.target.value)}
                placeholder="Deixe em branco para não alterar"
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Telefone</label>
              <input
                type="text"
                value={form.telefone}
                onChange={(e) => atualizarCampo("telefone", e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Corretora</label>
              <input
                type="text"
                value={form.corretora}
                onChange={(e) => atualizarCampo("corretora", e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Permissão</label>
              <select
                value={form.permissao}
                onChange={(e) => atualizarCampo("permissao", e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none focus:border-yellow-500/40"
              >
                <option value="master">Diretor Geral / Master</option>
                <option value="diretora_tecnica">Diretora Técnica</option>
                <option value="diretora_financeira">Diretora Financeira</option>
                <option value="admin_corretora">Admin da Corretora</option>
                <option value="corretor">Corretor</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Status</label>
              <select
                value={form.status}
                onChange={(e) => atualizarCampo("status", e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none focus:border-yellow-500/40"
              >
                <option value="ativo">Ativo</option>
                <option value="suspenso">Suspenso</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-yellow-500 px-6 py-4 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {salvando ? "Salvando alterações..." : "Salvar alterações"}
            </button>

            <Link
              href="/usuarios"
              className="rounded-xl border border-zinc-700 bg-[#111111] px-6 py-4 text-sm font-semibold text-white transition hover:border-yellow-500/40 hover:bg-[#151515]"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}