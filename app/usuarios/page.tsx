"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Permissao =
  | "master"
  | "diretora_tecnica"
  | "diretora_financeira"
  | "admin_corretora"
  | "corretor"
  | "operacional";

type StatusUsuario = "ativo" | "suspenso" | "bloqueado";

type Corretora = {
  id: string;
  nome_fantasia: string | null;
  razao_social: string | null;
};

type Usuario = {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  permissao: Permissao | string | null;
  status: StatusUsuario | string | null;
  ativo: boolean | null;
  created_at?: string | null;
  corretora_id?: string | null;
};

const permissoesOptions: { value: Permissao; label: string }[] = [
  { value: "master", label: "Master" },
  { value: "diretora_tecnica", label: "Diretora Técnica" },
  { value: "diretora_financeira", label: "Diretora Financeira" },
  { value: "admin_corretora", label: "Admin da Corretora" },
  { value: "corretor", label: "Corretor" },
  { value: "operacional", label: "Operacional" },
];

const statusOptions: { value: StatusUsuario; label: string }[] = [
  { value: "ativo", label: "Ativo" },
  { value: "suspenso", label: "Suspenso" },
  { value: "bloqueado", label: "Bloqueado" },
];

function BadgeStatus({ status }: { status: string | null | undefined }) {
  if (status === "ativo") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        Ativo
      </span>
    );
  }

  if (status === "suspenso") {
    return (
      <span className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300">
        Suspenso
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
      Bloqueado
    </span>
  );
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [corretoras, setCorretoras] = useState<Corretora[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    permissao: "corretor" as Permissao,
    status: "ativo" as StatusUsuario,
    corretora_id: "",
  });

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    const [usuariosResp, corretorasResp] = await Promise.all([
      supabase
        .from("usuarios")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("corretoras")
        .select("id, nome_fantasia, razao_social")
        .order("nome_fantasia", { ascending: true }),
    ]);

    if (usuariosResp.error) {
      setErro(usuariosResp.error.message);
    } else {
      setUsuarios((usuariosResp.data as Usuario[]) || []);
    }

    if (corretorasResp.error) {
      setErro(corretorasResp.error.message);
    } else {
      setCorretoras((corretorasResp.data as Corretora[]) || []);
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return usuarios;

    return usuarios.filter((u) => {
      const nome = (u.nome || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const telefone = (u.telefone || "").toLowerCase();
      const permissao = (u.permissao || "").toLowerCase();
      const status = (u.status || "").toLowerCase();

      return (
        nome.includes(termo) ||
        email.includes(termo) ||
        telefone.includes(termo) ||
        permissao.includes(termo) ||
        status.includes(termo)
      );
    });
  }, [usuarios, busca]);

  function atualizarCampo<K extends keyof typeof form>(
    campo: K,
    valor: (typeof form)[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function nomeCorretoraPorId(id?: string | null) {
    if (!id) return "Sem corretora";

    const corretora = corretoras.find((c) => c.id === id);

    return (
      corretora?.nome_fantasia ||
      corretora?.razao_social ||
      "Corretora não encontrada"
    );
  }

  async function criarUsuario(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!form.nome.trim()) {
      setErro("Preencha o nome.");
      return;
    }

    if (!form.email.trim()) {
      setErro("Preencha o e-mail.");
      return;
    }

    if (!form.senha.trim()) {
      setErro("Preencha a senha.");
      return;
    }

    if (form.senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setErro("A confirmação da senha não confere.");
      return;
    }

    setSalvando(true);

    try {
      const resp = await fetch("/api/usuarios/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          telefone: form.telefone,
          senha: form.senha,
          permissao: form.permissao,
          status: form.status,
          corretora_id: form.corretora_id || null,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setErro(data.error || "Erro ao criar usuário.");
        setSalvando(false);
        return;
      }

      setSucesso("Usuário criado com login e senha com sucesso.");

      setForm({
        nome: "",
        email: "",
        telefone: "",
        senha: "",
        confirmarSenha: "",
        permissao: "corretor",
        status: "ativo",
        corretora_id: "",
      });

      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6 md:py-8 xl:px-8">
        <section className="relative overflow-hidden rounded-[30px] border border-yellow-500/20 bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#111111] shadow-[0_0_45px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.09),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_18%)]" />

          <div className="absolute right-0 top-0 hidden h-full w-[32%] items-center justify-center xl:flex">
            <img
              src="/segmax-logo.png"
              alt="SegMax"
              className="w-[360px] max-w-full opacity-[0.05]"
            />
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-end">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-400/90">
                SegMax CRM
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
                Gestão de Usuários
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 md:text-base">
                Cadastre usuários com login e senha para acesso ao sistema.
                Cada perfil poderá entrar na plataforma, cadastrar clientes e
                criar cotações conforme as permissões definidas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                  Usuários
                </p>
                <p className="mt-3 text-4xl font-bold text-white">
                  {usuarios.length}
                </p>
              </div>

              <div className="rounded-[26px] border border-yellow-500/20 bg-yellow-500/[0.06] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-yellow-300/80">
                  Identidade visual
                </p>
                <p className="mt-3 text-lg font-semibold leading-6 text-yellow-100">
                  Preto, branco e dourado
                </p>
              </div>
            </div>
          </div>
        </section>

        {erro ? (
          <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-950/20 px-4 py-3 text-sm text-red-200">
            {erro}
          </div>
        ) : null}

        {sucesso ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
            {sucesso}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
          <section className="rounded-[30px] border border-yellow-500/15 bg-[#0a0a0a]/95 p-6 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.30em] text-yellow-400/90">
                Cadastro
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Novo usuário
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Defina os dados de acesso, o perfil e a corretora vinculada.
              </p>
            </div>

            <form onSubmit={criarUsuario} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-200">
                  Nome
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => atualizarCampo("nome", e.target.value)}
                  placeholder="Ex.: João Silva"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#111111]/95 px-4 text-white placeholder:text-zinc-500 outline-none transition focus:border-yellow-500/60 focus:bg-[#151515]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-200">
                  E-mail de acesso
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => atualizarCampo("email", e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#111111]/95 px-4 text-white placeholder:text-zinc-500 outline-none transition focus:border-yellow-500/60 focus:bg-[#151515]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-200">
                  Telefone
                </label>
                <input
                  type="text"
                  value={form.telefone}
                  onChange={(e) => atualizarCampo("telefone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#111111]/95 px-4 text-white placeholder:text-zinc-500 outline-none transition focus:border-yellow-500/60 focus:bg-[#151515]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-200">
                  Corretora
                </label>
                <select
                  value={form.corretora_id}
                  onChange={(e) => atualizarCampo("corretora_id", e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#111111]/95 px-4 text-white outline-none transition focus:border-yellow-500/60 focus:bg-[#151515]"
                >
                  <option value="">Sem corretora</option>
                  {corretoras.map((corretora) => (
                    <option key={corretora.id} value={corretora.id}>
                      {corretora.nome_fantasia ||
                        corretora.razao_social ||
                        "Sem nome"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-200">
                    Permissão
                  </label>
                  <select
                    value={form.permissao}
                    onChange={(e) =>
                      atualizarCampo("permissao", e.target.value as Permissao)
                    }
                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#111111]/95 px-4 text-white outline-none transition focus:border-yellow-500/60 focus:bg-[#151515]"
                  >
                    {permissoesOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-200">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      atualizarCampo("status", e.target.value as StatusUsuario)
                    }
                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#111111]/95 px-4 text-white outline-none transition focus:border-yellow-500/60 focus:bg-[#151515]"
                  >
                    {statusOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-200">
                    Senha inicial
                  </label>
                  <input
                    type="password"
                    value={form.senha}
                    onChange={(e) => atualizarCampo("senha", e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#111111]/95 px-4 text-white placeholder:text-zinc-500 outline-none transition focus:border-yellow-500/60 focus:bg-[#151515]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-200">
                    Confirmar senha
                  </label>
                  <input
                    type="password"
                    value={form.confirmarSenha}
                    onChange={(e) =>
                      atualizarCampo("confirmarSenha", e.target.value)
                    }
                    placeholder="Repita a senha"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#111111]/95 px-4 text-white placeholder:text-zinc-500 outline-none transition focus:border-yellow-500/60 focus:bg-[#151515]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={salvando}
                className="flex h-12 w-full items-center justify-center rounded-2xl border border-yellow-500/40 bg-gradient-to-r from-yellow-500 to-yellow-400 px-4 text-sm font-bold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {salvando ? "Criando usuário..." : "Criar usuário com acesso"}
              </button>
            </form>
          </section>

          <section className="rounded-[30px] border border-yellow-500/15 bg-[#0a0a0a]/95 p-6 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.30em] text-yellow-400/90">
                  Controle
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Usuários cadastrados
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Visualize os acessos criados e filtre rapidamente por nome,
                  e-mail, status ou permissão.
                </p>
              </div>

              <div className="w-full lg:w-[320px]">
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Buscar usuário
                </label>
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Nome, e-mail, status..."
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#111111]/95 px-4 text-white placeholder:text-zinc-500 outline-none transition focus:border-yellow-500/60 focus:bg-[#151515]"
                />
              </div>
            </div>

            {carregando ? (
              <div className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-10 text-center text-zinc-400">
                Carregando usuários...
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-10 text-center text-zinc-400">
                Nenhum usuário encontrado.
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-[24px] border border-white/10 2xl:block">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-[#121212]">
                        <tr className="border-b border-white/10">
                          <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400">
                            Nome
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400">
                            E-mail
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400">
                            Telefone
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400">
                            Permissão
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400">
                            Status
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400">
                            Corretora
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {usuariosFiltrados.map((usuario, index) => (
                          <tr
                            key={usuario.id}
                            className={`border-b border-white/5 transition hover:bg-white/[0.03] ${
                              index % 2 === 0 ? "bg-[#0d0d0d]" : "bg-[#090909]"
                            }`}
                          >
                            <td className="px-5 py-4 text-sm font-medium text-white">
                              {usuario.nome || "-"}
                            </td>
                            <td className="px-5 py-4 text-sm text-zinc-300">
                              {usuario.email || "-"}
                            </td>
                            <td className="px-5 py-4 text-sm text-zinc-300">
                              {usuario.telefone || "-"}
                            </td>
                            <td className="px-5 py-4 text-sm text-zinc-300">
                              {usuario.permissao || "-"}
                            </td>
                            <td className="px-5 py-4 text-sm text-zinc-300">
                              <BadgeStatus status={usuario.status} />
                            </td>
                            <td className="px-5 py-4 text-sm text-zinc-300">
                              {nomeCorretoraPorId(usuario.corretora_id)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:hidden">
                  {usuariosFiltrados.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="rounded-[24px] border border-white/10 bg-[#111111] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-bold text-white">
                            {usuario.nome || "-"}
                          </h3>
                          <p className="mt-1 text-sm text-zinc-400">
                            {usuario.email || "-"}
                          </p>
                        </div>

                        <BadgeStatus status={usuario.status} />
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-yellow-400">
                            Telefone
                          </p>
                          <p className="mt-1 text-sm text-zinc-300">
                            {usuario.telefone || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-yellow-400">
                            Permissão
                          </p>
                          <p className="mt-1 text-sm text-zinc-300">
                            {usuario.permissao || "-"}
                          </p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-yellow-400">
                            Corretora
                          </p>
                          <p className="mt-1 text-sm text-zinc-300">
                            {nomeCorretoraPorId(usuario.corretora_id)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}