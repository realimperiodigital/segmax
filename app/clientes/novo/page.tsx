"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type TipoPessoa = "pf" | "pj";

type UsuarioSistema = {
  id: string;
  auth_user_id?: string | null;
  corretora_id?: string | null;
  nome?: string | null;
  email?: string | null;
  perfil?: string | null;
};

type FormState = {
  nome: string;
  tipo_pessoa: TipoPessoa;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  observacoes: string;
  ativo: boolean;
};

const ESTADOS_BR = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const initialForm: FormState = {
  nome: "",
  tipo_pessoa: "pf",
  cpf_cnpj: "",
  email: "",
  telefone: "",
  cidade: "",
  estado: "SP",
  observacoes: "",
  ativo: true,
};

function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string) {
  const digits = onlyNumbers(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatCnpj(value: string) {
  const digits = onlyNumbers(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatCpfCnpj(value: string, tipo: TipoPessoa) {
  return tipo === "pf" ? formatCpf(value) : formatCnpj(value);
}

function formatTelefone(value: string) {
  const digits = onlyNumbers(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function validarEmail(email: string) {
  if (!email.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCpfCnpj(tipo: TipoPessoa, documento: string) {
  const digits = onlyNumbers(documento);
  return tipo === "pf" ? digits.length === 11 : digits.length === 14;
}

export default function NovoClientePage() {
  const router = useRouter();

  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSistema | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const documentoLabel = useMemo(
    () => (form.tipo_pessoa === "pf" ? "CPF" : "CNPJ"),
    [form.tipo_pessoa]
  );

  useEffect(() => {
    let ativo = true;

    async function carregarUsuario() {
      try {
        setLoadingPage(true);
        setErro("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        let usuarioSistema: UsuarioSistema | null = null;

        const buscaPorAuth = await supabase
          .from("usuarios")
          .select("id, auth_user_id, corretora_id, nome, email, perfil")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (!buscaPorAuth.error && buscaPorAuth.data) {
          usuarioSistema = buscaPorAuth.data as UsuarioSistema;
        }

        if (!usuarioSistema && user.email) {
          const buscaPorEmail = await supabase
            .from("usuarios")
            .select("id, auth_user_id, corretora_id, nome, email, perfil")
            .eq("email", user.email)
            .maybeSingle();

          if (!buscaPorEmail.error && buscaPorEmail.data) {
            usuarioSistema = buscaPorEmail.data as UsuarioSistema;
          }
        }

        if (!usuarioSistema) {
          setErro(
            "Não encontrei o seu usuário na tabela de usuários. Vincule este login a uma corretora antes de cadastrar clientes."
          );
          return;
        }

        if (!usuarioSistema.corretora_id) {
          setErro(
            "Seu usuário ainda não está vinculado a nenhuma corretora. Faça esse vínculo antes de cadastrar clientes."
          );
          return;
        }

        if (ativo) {
          setUsuario(usuarioSistema);
        }
      } catch (e: any) {
        setErro(e?.message || "Erro ao carregar usuário.");
      } finally {
        if (ativo) setLoadingPage(false);
      }
    }

    carregarUsuario();

    return () => {
      ativo = false;
    };
  }, [router]);

  function atualizarCampo<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function handleDocumentoChange(value: string) {
    atualizarCampo("cpf_cnpj", formatCpfCnpj(value, form.tipo_pessoa));
  }

  function handleTelefoneChange(value: string) {
    atualizarCampo("telefone", formatTelefone(value));
  }

  function validarFormulario() {
    if (!form.nome.trim()) {
      return "Informe o nome do cliente.";
    }

    if (!form.tipo_pessoa) {
      return "Selecione o tipo de pessoa.";
    }

    if (!form.cpf_cnpj.trim()) {
      return `Informe o ${documentoLabel}.`;
    }

    if (!validarCpfCnpj(form.tipo_pessoa, form.cpf_cnpj)) {
      return `${documentoLabel} inválido.`;
    }

    if (!validarEmail(form.email)) {
      return "Informe um e-mail válido.";
    }

    if (!usuario?.corretora_id) {
      return "Usuário sem corretora vinculada.";
    }

    return "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setErro("");
    setSucesso("");

    const validacao = validarFormulario();
    if (validacao) {
      setErro(validacao);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        corretora_id: usuario?.corretora_id ?? null,
        nome: form.nome.trim(),
        tipo_pessoa: form.tipo_pessoa,
        cpf_cnpj: onlyNumbers(form.cpf_cnpj),
        email: form.email.trim() || null,
        telefone: onlyNumbers(form.telefone) || null,
        cidade: form.cidade.trim() || null,
        estado: form.estado.trim() || null,
        observacoes: form.observacoes.trim() || null,
        ativo: form.ativo,
        excluido: false,
      };

      const { data: clienteExistente, error: erroBusca } = await supabase
        .from("clientes")
        .select("id")
        .eq("corretora_id", usuario?.corretora_id ?? "")
        .eq("cpf_cnpj", onlyNumbers(form.cpf_cnpj))
        .eq("excluido", false)
        .maybeSingle();

      if (erroBusca) {
        throw erroBusca;
      }

      if (clienteExistente) {
        setErro(`Já existe um cliente cadastrado com este ${documentoLabel}.`);
        setSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from("clientes")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      setSucesso("Cliente cadastrado com sucesso.");

      setTimeout(() => {
        router.push("/clientes");
      }, 900);
    } catch (e: any) {
      setErro(e?.message || "Erro ao salvar cliente.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-[#0B1020] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#D4AF37]" />
          <h1 className="text-2xl font-semibold">Carregando cadastro de cliente</h1>
          <p className="mt-2 text-sm text-white/70">
            Estamos validando seu acesso e o vínculo com a corretora.
          </p>
        </div>
      </div>
    );
  }

  if (erro && !usuario) {
    return (
      <div className="min-h-screen bg-[#0B1020] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-2xl rounded-3xl border border-red-400/20 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-2xl font-semibold text-red-300">Não foi possível abrir esta página</h1>
          <p className="mt-3 text-white/80">{erro}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-2xl bg-[#D4AF37] px-5 py-3 font-semibold text-[#0B1020] transition hover:brightness-110"
            >
              Ir para login
            </Link>

            <Link
              href="/clientes"
              className="rounded-2xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Voltar para clientes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37]">
                Módulo de Clientes
              </p>
              <h1 className="mt-2 text-3xl font-bold">Novo Cliente</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Cadastre o cliente e deixe o fluxo pronto para a próxima etapa da cotação.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
              <span className="block text-white/50">Corretora vinculada</span>
              <strong className="text-white">{usuario?.corretora_id}</strong>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/clientes"
              className="rounded-2xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Voltar para lista
            </Link>

            <Link
              href="/cotacoes/nova"
              className="rounded-2xl border border-[#D4AF37]/30 px-4 py-2.5 text-sm font-medium text-[#D4AF37] transition hover:bg-[#D4AF37]/10"
            >
              Ir para nova cotação
            </Link>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur md:p-6"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-white/80">
                Nome completo / Razão social *
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => atualizarCampo("nome", e.target.value)}
                placeholder="Digite o nome do cliente"
                className="w-full rounded-2xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Tipo de pessoa *
              </label>
              <select
                value={form.tipo_pessoa}
                onChange={(e) => {
                  const novoTipo = e.target.value as TipoPessoa;
                  setForm((prev) => ({
                    ...prev,
                    tipo_pessoa: novoTipo,
                    cpf_cnpj: formatCpfCnpj(prev.cpf_cnpj, novoTipo),
                  }));
                }}
                className="w-full rounded-2xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]"
              >
                <option value="pf">Pessoa Física</option>
                <option value="pj">Pessoa Jurídica</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                {documentoLabel} *
              </label>
              <input
                type="text"
                value={form.cpf_cnpj}
                onChange={(e) => handleDocumentoChange(e.target.value)}
                placeholder={`Digite o ${documentoLabel}`}
                className="w-full rounded-2xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                E-mail
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => atualizarCampo("email", e.target.value)}
                placeholder="cliente@email.com"
                className="w-full rounded-2xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Telefone
              </label>
              <input
                type="text"
                value={form.telefone}
                onChange={(e) => handleTelefoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full rounded-2xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Cidade
              </label>
              <input
                type="text"
                value={form.cidade}
                onChange={(e) => atualizarCampo("cidade", e.target.value)}
                placeholder="Cidade"
                className="w-full rounded-2xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Estado
              </label>
              <select
                value={form.estado}
                onChange={(e) => atualizarCampo("estado", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]"
              >
                {ESTADOS_BR.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-white/80">
                Observações
              </label>
              <textarea
                value={form.observacoes}
                onChange={(e) => atualizarCampo("observacoes", e.target.value)}
                placeholder="Anotações importantes sobre o cliente"
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#11182D] px-4 py-4">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) => atualizarCampo("ativo", e.target.checked)}
                  className="h-4 w-4 rounded border-white/20"
                />
                <span className="text-sm text-white/85">Cliente ativo</span>
              </label>
            </div>
          </div>

          {erro ? (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {erro}
            </div>
          ) : null}

          {sucesso ? (
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {sucesso}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-[#D4AF37] px-6 py-3 font-semibold text-[#0B1020] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar cliente"}
            </button>

            <Link
              href="/clientes"
              className="rounded-2xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}