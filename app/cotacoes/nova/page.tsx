"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PerfilUsuario = {
  id: string;
  user_id: string;
  nome: string | null;
  email: string | null;
  role: string | null;
  corretora_id: string | null;
};

type Cliente = {
  id: string;
  corretora_id: string | null;
  usuario_id: string | null;
  tipo_pessoa: string | null;
  nome: string | null;
  documento: string | null;
  cpf_cnpj: string | null;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  estado: string | null;
  status: string | null;
  ativo: boolean | null;
  excluido: boolean | null;
};

type Corretora = {
  id: string;
  nome_fantasia: string | null;
  razao_social: string | null;
};

type FormState = {
  cliente_id: string;
  observacoes: string;
  status: string;
};

const STATUS_OPTIONS = [
  { value: "rascunho", label: "Rascunho" },
  { value: "em_analise", label: "Em análise" },
  { value: "aguardando_documentos", label: "Aguardando documentos" },
];

function normalizarTexto(valor: string | null | undefined) {
  return (valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function somenteDigitos(valor: string | null | undefined) {
  return (valor ?? "").replace(/\D/g, "");
}

function formatarDocumento(valor: string | null | undefined) {
  const digitos = somenteDigitos(valor);

  if (digitos.length === 11) {
    return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  if (digitos.length === 14) {
    return digitos.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }

  return valor ?? "";
}

export default function NovaCotacaoPage() {
  const router = useRouter();

  const [loadingInicial, setLoadingInicial] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [corretora, setCorretora] = useState<Corretora | null>(null);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  const [form, setForm] = useState<FormState>({
    cliente_id: "",
    observacoes: "",
    status: "rascunho",
  });

  useEffect(() => {
    void carregarPagina();
  }, []);

  async function carregarPagina() {
    try {
      setLoadingInicial(true);
      setErro(null);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: perfilData, error: perfilError } = await supabase
        .from("usuarios")
        .select("id, user_id, nome, email, role, corretora_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (perfilError) {
        throw perfilError;
      }

      if (!perfilData) {
        throw new Error(
          "Seu usuário não está vinculado à tabela usuarios. Cadastre ou vincule este login antes de criar cotações."
        );
      }

      setPerfil(perfilData);

      if (!perfilData.corretora_id) {
        throw new Error(
          "Este usuário ainda não está vinculado a nenhuma corretora."
        );
      }

      const { data: corretoraData, error: corretoraError } = await supabase
        .from("corretoras")
        .select("id, nome_fantasia, razao_social")
        .eq("id", perfilData.corretora_id)
        .maybeSingle();

      if (corretoraError) {
        throw corretoraError;
      }

      setCorretora(corretoraData ?? null);

      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes")
        .select(
          "id, corretora_id, usuario_id, tipo_pessoa, nome, documento, cpf_cnpj, telefone, email, cidade, estado, status, ativo, excluido"
        )
        .eq("corretora_id", perfilData.corretora_id)
        .eq("excluido", false)
        .order("nome", { ascending: true });

      if (clientesError) {
        throw clientesError;
      }

      const clientesAtivos = (clientesData ?? []).filter((item) => item.ativo !== false);
      setClientes(clientesAtivos);
    } catch (error: any) {
      setErro(error?.message ?? "Não foi possível carregar a tela de nova cotação.");
    } finally {
      setLoadingInicial(false);
    }
  }

  const clientesFiltrados = useMemo(() => {
    const termo = normalizarTexto(buscaCliente);
    const termoDigitos = somenteDigitos(buscaCliente);

    if (!termo && !termoDigitos) {
      return clientes.slice(0, 12);
    }

    return clientes
      .filter((cliente) => {
        const camposTexto = [
          cliente.nome,
          cliente.documento,
          cliente.cpf_cnpj,
          cliente.email,
          cliente.telefone,
          cliente.cidade,
          cliente.estado,
          cliente.status,
        ]
          .map((item) => normalizarTexto(item))
          .join(" ");

        const camposDigitos = [
          cliente.documento,
          cliente.cpf_cnpj,
          cliente.telefone,
        ]
          .map((item) => somenteDigitos(item))
          .join(" ");

        const bateTexto = termo ? camposTexto.includes(termo) : false;
        const bateDigito = termoDigitos ? camposDigitos.includes(termoDigitos) : false;

        return bateTexto || bateDigito;
      })
      .slice(0, 20);
  }, [buscaCliente, clientes]);

  function selecionarCliente(cliente: Cliente) {
    setClienteSelecionado(cliente);
    setForm((prev) => ({
      ...prev,
      cliente_id: cliente.id,
    }));
    setBuscaCliente(cliente.nome ?? "");
    setSucesso(null);
    setErro(null);
  }

  function limparCliente() {
    setClienteSelecionado(null);
    setBuscaCliente("");
    setForm((prev) => ({
      ...prev,
      cliente_id: "",
    }));
  }

  async function salvarCotacao(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSalvando(true);
      setErro(null);
      setSucesso(null);

      if (!perfil?.id) {
        throw new Error("Usuário responsável não encontrado.");
      }

      if (!perfil?.corretora_id) {
        throw new Error("Corretora do usuário não encontrada.");
      }

      if (!form.cliente_id || !clienteSelecionado) {
        throw new Error("Selecione um cliente antes de salvar a cotação.");
      }

      const payload = {
        corretora_id: perfil.corretora_id,
        cliente_id: form.cliente_id,
        usuario_id: perfil.id,
        status: form.status,
        observacoes: form.observacoes?.trim() || null,
      };

      const { data, error } = await supabase
        .from("cotacoes")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      setSucesso("Cotação criada com sucesso.");

      if (data?.id) {
        router.push(`/cotacoes/${data.id}`);
        return;
      }

      router.push("/cotacoes");
    } catch (error: any) {
      setErro(error?.message ?? "Não foi possível salvar a cotação.");
    } finally {
      setSalvando(false);
    }
  }

  if (loadingInicial) {
    return (
      <div className="min-h-screen bg-[#0b1020] text-white px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/70">Carregando nova cotação...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-white px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Nova cotação
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Selecione o cliente correto antes de iniciar a análise.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/cotacoes")}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Voltar
          </button>
        </div>

        {erro && (
          <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {sucesso}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 md:p-6">
              <div className="mb-5 flex flex-col gap-2">
                <h2 className="text-lg font-semibold">1. Buscar cliente</h2>
                <p className="text-sm text-white/65">
                  Busque por nome, CPF, CNPJ, documento, email ou telefone.
                </p>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Buscar cliente
                </label>
                <input
                  type="text"
                  value={buscaCliente}
                  onChange={(e) => {
                    setBuscaCliente(e.target.value);
                    if (clienteSelecionado && e.target.value !== (clienteSelecionado.nome ?? "")) {
                      setClienteSelecionado(null);
                      setForm((prev) => ({ ...prev, cliente_id: "" }));
                    }
                  }}
                  placeholder="Digite nome, CPF, CNPJ, telefone ou email"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/60"
                />
              </div>

              <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1327]">
                {clientesFiltrados.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-white/60">
                    Nenhum cliente encontrado com essa busca.
                  </div>
                ) : (
                  clientesFiltrados.map((cliente) => {
                    const selecionado = clienteSelecionado?.id === cliente.id;

                    return (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => selecionarCliente(cliente)}
                        className={`flex w-full flex-col gap-2 border-b border-white/5 px-4 py-4 text-left transition last:border-b-0 ${
                          selecionado
                            ? "bg-cyan-500/15"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {cliente.nome || "Cliente sem nome"}
                            </div>
                            <div className="mt-1 text-xs text-white/60">
                              {cliente.tipo_pessoa?.toUpperCase() || "N/D"}
                              {" • "}
                              {formatarDocumento(cliente.cpf_cnpj || cliente.documento) || "Sem documento"}
                            </div>
                          </div>

                          <div className="text-xs text-white/55">
                            {cliente.status || "sem status"}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/55">
                          <span>{cliente.email || "Sem email"}</span>
                          <span>{cliente.telefone || "Sem telefone"}</span>
                          <span>
                            {[cliente.cidade, cliente.estado].filter(Boolean).join(" / ") || "Sem localização"}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            <form
              onSubmit={salvarCotacao}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 md:p-6"
            >
              <div className="mb-5">
                <h2 className="text-lg font-semibold">2. Dados da cotação</h2>
                <p className="mt-1 text-sm text-white/65">
                  Revise o cliente escolhido e crie a cotação.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                    Corretora
                  </div>
                  <div className="mt-2 text-sm font-medium text-white">
                    {corretora?.nome_fantasia ||
                      corretora?.razao_social ||
                      "Corretora não encontrada"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                    Responsável
                  </div>
                  <div className="mt-2 text-sm font-medium text-white">
                    {perfil?.nome || perfil?.email || "Usuário sem nome"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                      Cliente selecionado
                    </div>

                    {clienteSelecionado && (
                      <button
                        type="button"
                        onClick={limparCliente}
                        className="text-xs font-medium text-red-300 transition hover:text-red-200"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  {clienteSelecionado ? (
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-white">
                        {clienteSelecionado.nome || "Cliente sem nome"}
                      </div>
                      <div className="text-xs text-white/60">
                        {clienteSelecionado.tipo_pessoa?.toUpperCase() || "N/D"}
                        {" • "}
                        {formatarDocumento(
                          clienteSelecionado.cpf_cnpj || clienteSelecionado.documento
                        ) || "Sem documento"}
                      </div>
                      <div className="text-xs text-white/55">
                        {clienteSelecionado.email || "Sem email"}
                      </div>
                      <div className="text-xs text-white/55">
                        {clienteSelecionado.telefone || "Sem telefone"}
                      </div>
                      <div className="text-xs text-white/55">
                        {[clienteSelecionado.cidade, clienteSelecionado.estado]
                          .filter(Boolean)
                          .join(" / ") || "Sem localização"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-white/55">
                      Nenhum cliente selecionado.
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Status inicial
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 text-sm text-white outline-none transition focus:border-cyan-400/60"
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Observações
                  </label>
                  <textarea
                    value={form.observacoes}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        observacoes: e.target.value,
                      }))
                    }
                    rows={5}
                    placeholder="Escreva aqui algum detalhe inicial desta cotação"
                    className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={salvando || !clienteSelecionado}
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {salvando ? "Salvando cotação..." : "Criar cotação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}