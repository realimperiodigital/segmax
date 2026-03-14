"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: string;
  nome: string | null;
  tipo_pessoa: "pf" | "pj" | string | null;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  status: string | null;
};

function formatCpfCnpj(value: string | null) {
  if (!value) return "-";
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  if (digits.length === 14) {
    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return value;
}

function formatTelefone(value: string | null) {
  if (!value) return "-";
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  async function carregarClientes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("clientes")
      .select("id, nome, tipo_pessoa, cpf_cnpj, email, telefone, cidade, estado, status")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setClientes(data);
    }

    setLoading(false);
  }

  async function alterarStatus(id: string, status: string) {
    await supabase.from("clientes").update({ status }).eq("id", id);
    carregarClientes();
  }

  async function excluir(id: string) {
    if (!confirm("Deseja realmente excluir este cliente?")) return;

    await supabase.from("clientes").delete().eq("id", id);
    carregarClientes();
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((item) => {
      const texto = busca.trim().toLowerCase();

      const buscaOk =
        texto.length === 0 ||
        (item.nome ?? "").toLowerCase().includes(texto) ||
        (item.email ?? "").toLowerCase().includes(texto) ||
        (item.cpf_cnpj ?? "").toLowerCase().includes(texto) ||
        (item.cidade ?? "").toLowerCase().includes(texto);

      const statusOk =
        filtroStatus === "todos" || item.status === filtroStatus;

      return buscaOk && statusOk;
    });
  }, [clientes, busca, filtroStatus]);

  return (
    <main className="min-h-screen bg-[#0b0d12] p-10">
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Clientes</h1>
          <p className="mt-2 text-gray-400">
            Gestão completa dos clientes cadastrados no SegMax
          </p>
        </div>

        <Link
          href="/clientes/novo"
          className="rounded-xl bg-[#d4a63a] px-6 py-3 font-bold text-black"
        >
          Novo Cliente
        </Link>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm text-gray-400">Buscar</label>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Nome, CPF/CNPJ, email, cidade..."
            className="w-full rounded-xl bg-[#11141b] px-4 py-3 text-white outline-none border border-[#2a2e37]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">Status</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full rounded-xl bg-[#11141b] px-4 py-3 text-white outline-none border border-[#2a2e37]"
          >
            <option value="todos">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400">Carregando...</div>
      ) : (
        <div className="grid gap-5">
          {clientesFiltrados.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-[#2a2e37] bg-[#11141b] p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{c.nome}</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    {c.tipo_pessoa === "pj" ? "Pessoa Jurídica" : "Pessoa Física"}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Documento: {formatCpfCnpj(c.cpf_cnpj)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Email: {c.email || "-"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Telefone: {formatTelefone(c.telefone)}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-400">Localização</div>
                  <div className="font-semibold text-white">
                    {c.cidade || "-"} {c.estado ? `- ${c.estado}` : ""}
                  </div>

                  <div className="mt-4 text-sm text-gray-400">Status</div>
                  <div className="font-semibold text-white">{c.status}</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/clientes/novo?id=${c.id}`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                >
                  Editar
                </Link>

                <button
                  onClick={() => alterarStatus(c.id, "ativo")}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
                >
                  Ativar
                </button>

                <button
                  onClick={() => alterarStatus(c.id, "inativo")}
                  className="rounded-lg bg-yellow-600 px-4 py-2 text-white"
                >
                  Inativar
                </button>

                <button
                  onClick={() => alterarStatus(c.id, "bloqueado")}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white"
                >
                  Bloquear
                </button>

                <button
                  onClick={() => excluir(c.id)}
                  className="rounded-lg bg-gray-700 px-4 py-2 text-white"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}

          {clientesFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-[#2a2e37] bg-[#11141b] p-10 text-center text-gray-400">
              Nenhum cliente encontrado.
            </div>
          ) : null}
        </div>
      )}
    </main>
  );
}