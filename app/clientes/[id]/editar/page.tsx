"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ClienteForm = {
  nome: string;
  tipo_pessoa: "pf" | "pj";
  cpf_cnpj: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  ativo: boolean;
  observacoes: string;
};

const FORM_INICIAL: ClienteForm = {
  nome: "",
  tipo_pessoa: "pf",
  cpf_cnpj: "",
  email: "",
  telefone: "",
  cidade: "",
  estado: "",
  ativo: true,
  observacoes: "",
};

function formatarTipoPessoa(tipo?: string | null) {
  if (!tipo) return "Cliente";
  if (tipo.toLowerCase() === "pf") return "Pessoa Física";
  if (tipo.toLowerCase() === "pj") return "Pessoa Jurídica";
  return "Cliente";
}

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const clienteId = String(params?.id || "");

  const [form, setForm] = useState<ClienteForm>(FORM_INICIAL);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  function atualizarCampo<K extends keyof ClienteForm>(
    campo: K,
    valor: ClienteForm[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function carregarCliente() {
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
        .from("clientes")
        .select(
          "id, nome, tipo_pessoa, cpf_cnpj, email, telefone, cidade, estado, ativo, observacoes, excluido"
        )
        .eq("id", clienteId)
        .maybeSingle();

      if (error) {
        setErro(error.message);
        return;
      }

      if (!data) {
        setErro("Cliente não encontrado.");
        return;
      }

      if (data.excluido) {
        setErro("Este cliente está marcado como excluído.");
        return;
      }

      setForm({
        nome: data.nome || "",
        tipo_pessoa:
          data.tipo_pessoa?.toLowerCase() === "pj" ? "pj" : "pf",
        cpf_cnpj: data.cpf_cnpj || "",
        email: data.email || "",
        telefone: data.telefone || "",
        cidade: data.cidade || "",
        estado: data.estado || "",
        ativo: data.ativo ?? true,
        observacoes: data.observacoes || "",
      });
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar o cliente.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (clienteId) {
      carregarCliente();
    }
  }, [clienteId]);

  async function salvarAlteracoes(e: React.FormEvent) {
    e.preventDefault();

    setErro("");
    setMensagem("");

    if (!form.nome.trim()) {
      setErro("Informe o nome do cliente.");
      return;
    }

    if (!form.tipo_pessoa) {
      setErro("Selecione o tipo de pessoa.");
      return;
    }

    try {
      setSalvando(true);

      const { error } = await supabase
        .from("clientes")
        .update({
          nome: form.nome.trim(),
          tipo_pessoa: form.tipo_pessoa,
          cpf_cnpj: form.cpf_cnpj.trim() || null,
          email: form.email.trim() || null,
          telefone: form.telefone.trim() || null,
          cidade: form.cidade.trim() || null,
          estado: form.estado.trim() || null,
          ativo: form.ativo,
          observacoes: form.observacoes.trim() || null,
        })
        .eq("id", clienteId);

      if (error) {
        setErro(error.message);
        return;
      }

      setMensagem("Cliente atualizado com sucesso.");
    } catch (e) {
      console.error(e);
      setErro("Erro inesperado ao salvar as alterações.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirCliente() {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este cliente? Ele será removido da listagem principal."
    );

    if (!confirmar) return;

    try {
      setExcluindo(true);
      setErro("");
      setMensagem("");

      const { error } = await supabase
        .from("clientes")
        .update({
          excluido: true,
          ativo: false,
        })
        .eq("id", clienteId);

      if (error) {
        setErro(error.message);
        return;
      }

      router.push("/clientes");
    } catch (e) {
      console.error(e);
      setErro("Não foi possível excluir o cliente.");
    } finally {
      setExcluindo(false);
    }
  }

  const tituloSecundario = useMemo(() => {
    return formatarTipoPessoa(form.tipo_pessoa);
  }, [form.tipo_pessoa]);

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#050505] px-5 py-5 text-white md:px-8">
        <div className="mx-auto max-w-[1450px]">
          <div className="rounded-[30px] border border-yellow-600/15 bg-[#0a0a0a] p-10 text-center text-zinc-400">
            Carregando cliente...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] px-5 py-5 text-white md:px-8">
      <div className="mx-auto max-w-[1450px] space-y-5">
        {/* HERO */}
        <section className="rounded-[30px] border border-yellow-600/15 bg-[#080808] px-6 py-7 shadow-[0_0_40px_rgba(0,0,0,0.35)] md:px-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-4xl">
              <div className="mb-4 inline-flex rounded-full border border-yellow-600/20 bg-[#111111] px-4 py-2 text-sm font-semibold text-yellow-400">
                Editar cliente
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
                SegMax Control
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-[1] md:text-6xl">
                {form.nome || "Cliente"}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
                Atualize os dados do cliente, ajuste informações operacionais e mantenha a base da
                corretora organizada para as próximas cotações.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/clientes"
                className="rounded-xl border border-zinc-700 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
              >
                Voltar para clientes
              </Link>

              <Link
                href={`/cotacoes/nova?cliente=${clienteId}`}
                className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400"
              >
                Nova cotação
              </Link>

              <Link
                href={`/relatorios/analitico?cliente=${clienteId}`}
                className="rounded-xl border border-zinc-700 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
              >
                Relatórios
              </Link>
            </div>
          </div>
        </section>

        {/* RESUMO */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Tipo de cliente</p>
            <h3 className="mt-2 text-3xl font-bold">{tituloSecundario}</h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Status</p>
            <h3 className="mt-2 text-3xl font-bold">
              {form.ativo ? "Ativo" : "Inativo"}
            </h3>
          </div>

          <div className="rounded-[24px] border border-yellow-600/20 bg-[#0a0a0a] p-5">
            <p className="text-sm text-zinc-400">Documento</p>
            <h3 className="mt-2 text-3xl font-bold break-all">
              {form.cpf_cnpj || "-"}
            </h3>
          </div>
        </section>

        {/* FORMULÁRIO */}
        <form
          onSubmit={salvarAlteracoes}
          className="rounded-[30px] border border-yellow-600/15 bg-[#0a0a0a] p-6"
        >
          <div className="mb-6">
            <h2 className="text-4xl font-bold">Dados do cliente</h2>
            <p className="mt-3 text-base text-zinc-400">
              Faça as alterações necessárias e salve para atualizar a base.
            </p>
          </div>

          {erro ? (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {erro}
            </div>
          ) : null}

          {mensagem ? (
            <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {mensagem}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-zinc-300">Nome do cliente</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => atualizarCampo("nome", e.target.value)}
                placeholder="Ex.: Empresa Exemplo LTDA"
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Tipo de pessoa</label>
              <select
                value={form.tipo_pessoa}
                onChange={(e) =>
                  atualizarCampo("tipo_pessoa", e.target.value === "pj" ? "pj" : "pf")
                }
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none focus:border-yellow-500/40"
              >
                <option value="pf">Pessoa Física</option>
                <option value="pj">Pessoa Jurídica</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">CPF / CNPJ</label>
              <input
                type="text"
                value={form.cpf_cnpj}
                onChange={(e) => atualizarCampo("cpf_cnpj", e.target.value)}
                placeholder="Informe o documento"
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => atualizarCampo("email", e.target.value)}
                placeholder="cliente@empresa.com"
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
              <label className="mb-2 block text-sm text-zinc-300">Cidade</label>
              <input
                type="text"
                value={form.cidade}
                onChange={(e) => atualizarCampo("cidade", e.target.value)}
                placeholder="Ex.: São Paulo"
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Estado</label>
              <input
                type="text"
                value={form.estado}
                onChange={(e) => atualizarCampo("estado", e.target.value)}
                placeholder="Ex.: SP"
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-zinc-300">Observações</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => atualizarCampo("observacoes", e.target.value)}
                placeholder="Informações importantes sobre este cliente..."
                rows={5}
                className="w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-yellow-500/40"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-3 block text-sm text-zinc-300">Status do cliente</label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => atualizarCampo("ativo", true)}
                  className={[
                    "rounded-xl px-5 py-3 text-sm font-semibold transition",
                    form.ativo
                      ? "bg-yellow-500 text-black"
                      : "border border-zinc-700 bg-[#111111] text-white hover:border-yellow-500/30",
                  ].join(" ")}
                >
                  Ativo
                </button>

                <button
                  type="button"
                  onClick={() => atualizarCampo("ativo", false)}
                  className={[
                    "rounded-xl px-5 py-3 text-sm font-semibold transition",
                    !form.ativo
                      ? "bg-yellow-500 text-black"
                      : "border border-zinc-700 bg-[#111111] text-white hover:border-yellow-500/30",
                  ].join(" ")}
                >
                  Inativo
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-yellow-500 px-6 py-4 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {salvando ? "Salvando alterações..." : "Salvar alterações"}
            </button>

            <button
              type="button"
              onClick={excluirCliente}
              disabled={excluindo}
              className="rounded-xl border border-red-500/20 bg-[#111111] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#151515] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {excluindo ? "Excluindo..." : "Excluir cliente"}
            </button>

            <Link
              href="/clientes"
              className="rounded-xl border border-zinc-700 bg-[#111111] px-6 py-4 text-sm font-semibold text-white transition hover:border-yellow-500/30 hover:bg-[#151515]"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}