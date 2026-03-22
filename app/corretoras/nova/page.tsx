"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function NovaCorretoraPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    cidade: "",
    estado: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/corretoras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar corretora");
      }

      alert("Corretora cadastrada com sucesso!");
      router.push("/corretoras");
    } catch (error) {
      console.error(error);
      alert("A API de corretoras ainda não está pronta. A tela já foi ativada.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[28px] border border-amber-500/20 bg-zinc-950 p-6 shadow-2xl">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-300">
              TESTE ONLINE 999
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-amber-400">
              NOVA CORRETORA TESTE 999
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
              Se este título aparecer no site online, significa que o deploy
              subiu corretamente e este arquivo é o que está sendo publicado.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field
              label="Nome da corretora"
              name="nome"
              value={form.nome}
              onChange={handleChange}
            />

            <Field
              label="CNPJ"
              name="cnpj"
              value={form.cnpj}
              onChange={handleChange}
            />

            <Field
              label="E-mail"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

            <Field
              label="Telefone"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
            />

            <Field
              label="Cidade"
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
            />

            <Field
              label="Estado"
              name="estado"
              value={form.estado}
              onChange={handleChange}
            />

            <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Salvando..." : "Cadastrar corretora"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/corretoras")}
                className="rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:border-zinc-500 hover:bg-zinc-800"
              >
                Voltar para corretoras
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
};

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
}: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="h-12 rounded-2xl border border-zinc-800 bg-black px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-400"
      />
    </div>
  );
}