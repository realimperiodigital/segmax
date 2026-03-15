"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Usuario = {
  id: string;
  nome: string | null;
  email: string | null;
  login: string | null;
  telefone: string | null;
  permissao: string | null;
  status: string | null;
  corretora: string | null;
  created_at?: string | null;
};

type FormState = {
  nome: string;
  login: string;
  email: string;
  senha: string;
  telefone: string;
  permissao: string;
  status: string;
  corretora: string;
};

const FORM_INICIAL: FormState = {
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

export default function UsuariosPage() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [usuarioLogadoNome, setUsuarioLogadoNome] = useState("Usuário");
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(FORM_INICIAL);

  async function carregarUsuarios() {
    try {
      setCarregando(true);
      setErro("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: usuarioAtual } = await supabase
        .from("usuarios")
        .select("nome")
        .eq("id", user.id)
        .maybeSingle();

      if (usuarioAtual?.nome) {
        setUsuarioLogadoNome(usuarioAtual.nome);
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nome, email, login, telefone, permissao, status, corretora, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setErro(error.message);
        return;
      }

      setUsuarios((data as Usuario[]) || []);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar os usuários.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return usuarios;

    return usuarios.filter((u) => {
      return (
        (u.nome || "").toLowerCase().includes(termo) ||
        (u.email || "").toLowerCase().includes(termo) ||
        (u.login || "").toLowerCase().includes(termo) ||
        (u.telefone || "").toLowerCase().includes(termo) ||
        (u.permissao || "").toLowerCase().includes(termo) ||
        (u.status || "").toLowerCase().includes(termo) ||
        (u.corretora || "").toLowerCase().includes(termo)
      );
    });
  }, [usuarios, busca]);

  const totalUsuarios = usuarios.length;
  const ativos = usuarios.filter((u) => (u.status || "").toLowerCase() === "ativo").length;
  const suspensos = usuarios.filter((u) => (u.status || "").toLowerCase() === "suspenso").length;
  const bloqueados = usuarios.filter((u) => (u.status || "").toLowerCase() === "bloqueado").length;

  function atualizarCampo<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function criarUsuario(e: React.FormEvent) {
    e.preventDefault();

    setMensagem("");
    setErro("");

    if (!form.nome.trim()) {
      setErro("Informe o nome do usuário.");
      return;
    }

    if (!form.login.trim()) {
      setErro("Informe o login de acesso.");
      return;
    }

    if (!form.email.trim()) {
      setErro("Informe o e-mail.");
      return;
    }

    if (!form.senha.trim() || form.senha.trim().length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setSalvando(true);

      const resposta = await fetch("/api/usuarios/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        setErro(resultado?.error || "Não foi possível criar o usuário.");
        return;
      }

      setMensagem("Usuário criado com sucesso.");
      setForm(FORM_INICIAL);
      await carregarUsuarios();
    } catch (e) {
      console.error(e);
      setErro("Erro inesperado ao criar usuário.");
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatusUsuario(usuarioId: string, novoStatus: "ativo" | "suspenso" | "bloqueado") {
    try {
      setProcessandoId(usuarioId);
      setErro("");
      setMensagem("");

      const { error } = await supabase
        .from("usuarios")
        .update({ status: novoStatus })
        .eq("id", usuarioId);

      if (error) {
        setErro(error.message);
        return;
      }

      setMensagem(`Status do usuário alterado para ${novoStatus}.`);
      await carregarUsuarios();
    } catch (e) {
      console.error(e);
      setErro("Não foi possível alterar o status do usuário.");
    } finally {
      setProcessandoId(null);
    }
  }

  async function excluirUsuario(usuarioId: string, nomeUsuario?: string | null) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o usuário ${nomeUsuario || ""}? Essa ação remove também o acesso dele ao sistema.`
    );

    if (!confirmar) return;

    try {
      setProcessandoId(usuarioId);
      setErro("");
      setMensagem("");

      const resposta = await fetch("/api/usuarios/excluir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: usuarioId }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        setErro(resultado?.error || "Não foi possível excluir o usuário.");
        return;
      }

      setMensagem("Usuário excluído com sucesso.");
      await carregarUsuarios();
    } catch (e) {
      console.error(e);
      setErro("Não foi possível excluir o usuário.");
    } finally {
      setProcessandoId(null);
    }
  }

  async function sairSistema() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-6 text-white md:px-8">
      <div className="mx-auto max-w-[1450px] space-y-5">
        <section className="rounded-[28px] border border-yellow-600/20 bg-[#0a0a0a]/95 px-6 py-7 shadow-[0_0_40px_rgba(0,0,0,0.35)] md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex rounded-full border border-yellow-600/20 bg-[#111111] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-yellow-500">
                Área master
              </div>

              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                Gestão de Usuários
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
                Cadastre, acompanhe, filtre e controle os usuários do sistema com login,
                senha de acesso, permissões por perfil e vínculo com a corretora.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={carregarUsuarios}
                className="rounded-xl border border-zinc-700 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:border-yellow-500/40 hover:bg-[#151515]"
              >
                Atualizar
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("form-novo-usuario");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400"
              >
                Novo usuário
              </button>

              <button
                type="button"
                onClick={sairSistema}
                className="rounded-xl border border-zinc-700 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:border-red-500/40 hover:bg-[#151515]"
              >
                Sair do sistema
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Total de usuários</p>
            <h3 className="mt-2 text-5xl font-bold">{totalUsuarios}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-yellow-500">Ativos</p>
            <h3 className="mt-2 text-5xl font-bold text-yellow-400">{ativos}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Suspensos</p>
            <h3 className="mt-2 text-5xl font-bold">{suspensos}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Bloqueados</p>
            <h3 className="mt-2 text-5xl font-bold">{bloqueados}</h3>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Usuário logado</p>
            <h3 className="mt-2 text-3xl font-bold">{usuarioLogadoNome}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <div className="flex h-full items-center">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar usuário, login, e-mail, telefone, permissão, status ou corretora..."
                className="w-full rounded-xl border border-yellow-600/20 bg-[#050505] px-4 py-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
          <form
            id="form-novo-usuario"
            onSubmit={criarUsuario}
            className="rounded-[28px] border border-yellow-600/20 bg-[#0a0a0a] p-6"
          >
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-500">
                Cadastro
              </p>
              <h2 className="mt-3 text-4xl font-bold">Novo usuário</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Crie o acesso completo do usuário com login, senha, perfil e vínculo com a corretora.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => atualizarCampo("nome", e.target.value)}
                  placeholder="Ex.: João Silva"
                  className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Login de acesso</label>
                <input
                  type="text"
                  value={form.login}
                  onChange={(e) => atualizarCampo("login", e.target.value)}
                  placeholder="Ex.: joao.silva"
                  className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => atualizarCampo("email", e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Senha de acesso</label>
                <input
                  type="password"
                  value={form.senha}
                  onChange={(e) => atualizarCampo("senha", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Telefone</label>
                <input
                  type="text"
                  value={form.telefone}
                  onChange={(e) => atualizarCampo("telefone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Corretora</label>
                <input
                  type="text"
                  value={form.corretora}
                  onChange={(e) => atualizarCampo("corretora", e.target.value)}
                  placeholder="Corretora SegMax"
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

              {mensagem ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {mensagem}
                </div>
              ) : null}

              {erro ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {erro}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={salvando}
                className="w-full rounded-xl bg-yellow-500 px-5 py-4 text-base font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {salvando ? "Criando usuário..." : "Criar usuário"}
              </button>
            </div>
          </form>

          <section className="rounded-[28px] border border-yellow-600/20 bg-[#0a0a0a] p-6">
            <div className="mb-6">
              <h2 className="text-4xl font-bold">Lista de usuários</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Visualize os usuários cadastrados, altere status, edite dados e remova totalmente o acesso quando necessário.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1300px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-yellow-600/10 text-left text-xs uppercase tracking-[0.25em] text-zinc-400">
                    <th className="px-4 py-4">Nome</th>
                    <th className="px-4 py-4">Login</th>
                    <th className="px-4 py-4">E-mail</th>
                    <th className="px-4 py-4">Telefone</th>
                    <th className="px-4 py-4">Permissão</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Corretora</th>
                    <th className="px-4 py-4">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {carregando ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-zinc-400">
                        Carregando usuários...
                      </td>
                    </tr>
                  ) : usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-zinc-400">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((usuario) => (
                      <tr
                        key={usuario.id}
                        className="border-b border-yellow-600/10 transition hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-5 font-semibold text-white">
                          {usuario.nome || "-"}
                        </td>

                        <td className="px-4 py-5 text-zinc-300">
                          {usuario.login || "-"}
                        </td>

                        <td className="px-4 py-5 text-zinc-300">
                          {usuario.email || "-"}
                        </td>

                        <td className="px-4 py-5 text-zinc-300">
                          {usuario.telefone || "-"}
                        </td>

                        <td className="px-4 py-5 text-zinc-300">
                          {formatarPermissao(usuario.permissao)}
                        </td>

                        <td className="px-4 py-5">
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                              (usuario.status || "").toLowerCase() === "ativo"
                                ? "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20"
                                : (usuario.status || "").toLowerCase() === "suspenso"
                                ? "bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/20"
                                : "bg-red-500/10 text-red-300 ring-1 ring-red-500/20",
                            ].join(" ")}
                          >
                            {usuario.status || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-5 text-zinc-300">
                          {usuario.corretora || "Sem corretora"}
                        </td>

                        <td className="px-4 py-5">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/usuarios/${usuario.id}/editar`}
                              className="rounded-lg border border-yellow-600/20 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-400 transition hover:bg-yellow-500/15"
                            >
                              Editar
                            </Link>

                            <button
                              type="button"
                              disabled={processandoId === usuario.id}
                              onClick={() => alterarStatusUsuario(usuario.id, "suspenso")}
                              className="rounded-lg border border-zinc-700 bg-[#111111] px-3 py-2 text-xs font-semibold text-white transition hover:border-orange-500/30 hover:bg-[#151515] disabled:opacity-60"
                            >
                              Suspender
                            </button>

                            <button
                              type="button"
                              disabled={processandoId === usuario.id}
                              onClick={() => alterarStatusUsuario(usuario.id, "bloqueado")}
                              className="rounded-lg border border-zinc-700 bg-[#111111] px-3 py-2 text-xs font-semibold text-white transition hover:border-red-500/30 hover:bg-[#151515] disabled:opacity-60"
                            >
                              Bloquear
                            </button>

                            <button
                              type="button"
                              disabled={processandoId === usuario.id}
                              onClick={() => alterarStatusUsuario(usuario.id, "ativo")}
                              className="rounded-lg border border-zinc-700 bg-[#111111] px-3 py-2 text-xs font-semibold text-white transition hover:border-emerald-500/30 hover:bg-[#151515] disabled:opacity-60"
                            >
                              Reativar
                            </button>

                            <button
                              type="button"
                              disabled={processandoId === usuario.id}
                              onClick={() => excluirUsuario(usuario.id, usuario.nome)}
                              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/15 disabled:opacity-60"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}