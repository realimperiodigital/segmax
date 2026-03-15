"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type ClienteForm = {
  nome: string;
  tipo_pessoa: "pf" | "pj";
  cpf_cnpj: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
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
  observacoes: "",
};

export default function NovoClientePage() {
  const router = useRouter();

  const [form, setForm] = useState<ClienteForm>(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);
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

  async function salvarCliente(e: React.FormEvent) {
    e.preventDefault();

    setErro("");
    setMensagem("");

    if (!form.nome.trim()) {
      setErro("Informe o nome do cliente.");
      return;
    }

    try {
      setSalvando(true);

      const { error } = await supabase.from("clientes").insert({
        nome: form.nome.trim(),
        tipo_pessoa: form.tipo_pessoa,
        cpf_cnpj: form.cpf_cnpj.trim() || null,
        email: form.email.trim() || null,
        telefone: form.telefone.trim() || null,
        cidade: form.cidade.trim() || null,
        estado: form.estado.trim() || null,
        observacoes: form.observacoes.trim() || null,
        ativo: true,
        excluido: false,
      });

      if (error) {
        setErro(error.message);
        return;
      }

      setMensagem("Cliente cadastrado com sucesso.");

      setForm(FORM_INICIAL);

      setTimeout(() => {
        router.push("/clientes");
      }, 1200);
    } catch (e) {
      console.error(e);
      setErro("Erro inesperado ao salvar o cliente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] px-5 py-5 text-white md:px-8">
      <div className="mx-auto max-w-[1200px] space-y-6">

        {/* HERO */}
        <section className="rounded-[30px] border border-yellow-600/15 bg-[#080808] p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">

            <div>
              <div className="mb-3 inline-flex rounded-full border border-yellow-600/20 bg-[#111111] px-4 py-2 text-sm font-semibold text-yellow-400">
                Novo cliente
              </div>

              <h1 className="text-5xl font-bold">
                Cadastro de cliente
              </h1>

              <p className="mt-4 text-zinc-400 max-w-xl">
                Cadastre um novo cliente na base da corretora para iniciar
                cotações, acompanhar histórico e gerar relatórios.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/clientes"
                className="rounded-xl border border-zinc-700 bg-[#111111] px-5 py-3 text-sm font-semibold text-white hover:border-yellow-500/30"
              >
                Voltar
              </Link>
            </div>

          </div>
        </section>

        {/* FORM */}
        <form
          onSubmit={salvarCliente}
          className="rounded-[30px] border border-yellow-600/15 bg-[#0a0a0a] p-8 space-y-6"
        >

          {erro && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-300">
              {erro}
            </div>
          )}

          {mensagem && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-green-300">
              {mensagem}
            </div>
          )}

          {/* NOME */}
          <div>
            <label className="text-sm text-zinc-400">
              Nome do cliente
            </label>

            <input
              value={form.nome}
              onChange={(e) => atualizarCampo("nome", e.target.value)}
              className="w-full mt-2 rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white"
              placeholder="Ex: Empresa Exemplo LTDA"
            />
          </div>

          {/* TIPO */}
          <div>
            <label className="text-sm text-zinc-400">
              Tipo de pessoa
            </label>

            <select
              value={form.tipo_pessoa}
              onChange={(e) =>
                atualizarCampo(
                  "tipo_pessoa",
                  e.target.value === "pj" ? "pj" : "pf"
                )
              }
              className="w-full mt-2 rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white"
            >
              <option value="pf">Pessoa Física</option>
              <option value="pj">Pessoa Jurídica</option>
            </select>
          </div>

          {/* DOCUMENTO */}
          <div>
            <label className="text-sm text-zinc-400">
              CPF / CNPJ
            </label>

            <input
              value={form.cpf_cnpj}
              onChange={(e) => atualizarCampo("cpf_cnpj", e.target.value)}
              className="w-full mt-2 rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm text-zinc-400">
              Email
            </label>

            <input
              value={form.email}
              onChange={(e) => atualizarCampo("email", e.target.value)}
              className="w-full mt-2 rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white"
            />
          </div>

          {/* TELEFONE */}
          <div>
            <label className="text-sm text-zinc-400">
              Telefone
            </label>

            <input
              value={form.telefone}
              onChange={(e) => atualizarCampo("telefone", e.target.value)}
              className="w-full mt-2 rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white"
            />
          </div>

          {/* CIDADE */}
          <div>
            <label className="text-sm text-zinc-400">
              Cidade
            </label>

            <input
              value={form.cidade}
              onChange={(e) => atualizarCampo("cidade", e.target.value)}
              className="w-full mt-2 rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white"
            />
          </div>

          {/* ESTADO */}
          <div>
            <label className="text-sm text-zinc-400">
              Estado
            </label>

            <input
              value={form.estado}
              onChange={(e) => atualizarCampo("estado", e.target.value)}
              className="w-full mt-2 rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white"
            />
          </div>

          {/* OBSERVACOES */}
          <div>
            <label className="text-sm text-zinc-400">
              Observações
            </label>

            <textarea
              rows={4}
              value={form.observacoes}
              onChange={(e) =>
                atualizarCampo("observacoes", e.target.value)
              }
              className="w-full mt-2 rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-white"
            />
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={salvando}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-4 rounded-xl"
          >
            {salvando ? "Salvando..." : "Cadastrar cliente"}
          </button>

        </form>
      </div>
    </div>
  );
}