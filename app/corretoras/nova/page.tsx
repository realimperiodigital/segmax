"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SegmaxShell from "@/components/segmaxshell";

type FormState = {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  responsavel: string;
  status: string;
};

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-amber-500"
      />
    </div>
  );
}

export default function NovaCorretoraPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    responsavel: "",
    status: "ativa",
  });

  const [saving, setSaving] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await fetch("/api/corretoras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao criar corretora.");
      }

      alert("Corretora criada com sucesso.");
      router.push("/corretoras");
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar corretora:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erro interno ao criar corretora."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SegmaxShell role="master">
      <div className="min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 rounded-3xl border border-amber-500/20 bg-zinc-950 p-8">
            <div className="mb-3 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">
              Área Master
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-5xl font-bold tracking-tight text-white">
                  Nova Corretora
                </h1>
                <p className="mt-4 max-w-3xl text-xl leading-8 text-zinc-300">
                  Cadastre uma nova corretora no padrão visual premium do
                  SegMax, vinculando dados comerciais, responsável e status.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/corretoras")}
                  className="rounded-2xl border border-zinc-700 px-6 py-4 text-lg font-semibold text-white transition hover:bg-zinc-900"
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  form="form-nova-corretora"
                  disabled={saving}
                  className="rounded-2xl bg-amber-500 px-6 py-4 text-lg font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar corretora"}
                </button>
              </div>
            </div>
          </div>

          <form
            id="form-nova-corretora"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
              <h2 className="mb-6 text-3xl font-bold text-white">
                Dados principais
              </h2>

              <div className="space-y-5">
                <Field
                  label="Nome da corretora"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Digite o nome da corretora"
                />

                <Field
                  label="CNPJ"
                  name="cnpj"
                  value={form.cnpj}
                  onChange={handleChange}
                  placeholder="00.000.000/0000-00"
                />

                <Field
                  label="E-mail"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contato@corretora.com"
                  type="email"
                />

                <Field
                  label="Telefone"
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
              <h2 className="mb-6 text-3xl font-bold text-white">
                Responsável e status
              </h2>

              <div className="space-y-5">
                <Field
                  label="Responsável"
                  name="responsavel"
                  value={form.responsavel}
                  onChange={handleChange}
                  placeholder="Nome do responsável"
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-amber-500"
                  >
                    <option value="ativa">Ativa</option>
                    <option value="suspensa">Suspensa</option>
                    <option value="bloqueada">Bloqueada</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </SegmaxShell>
  );
}