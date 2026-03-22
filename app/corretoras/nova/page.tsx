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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "/api/corretoras",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao cadastrar");
      }

      alert("Corretora cadastrada com sucesso!");

      router.push("/corretoras");

    } catch (error) {
      console.error(error);
      alert("Erro ao salvar corretora.");
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#f5f5f5",
        padding: "32px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          border: "1px solid #27272a",
          borderRadius: "16px",
          padding: "24px",
          background: "#0a0a0a",
        }}
      >
        <h1
          style={{
            fontSize: "26px",
            marginBottom: "20px",
            color: "#facc15",
          }}
        >
          Nova corretora
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <Input
            label="Nome da corretora"
            name="nome"
            value={form.nome}
            onChange={handleChange}
          />

          <Input
            label="CNPJ"
            name="cnpj"
            value={form.cnpj}
            onChange={handleChange}
          />

          <Input
            label="E-mail"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label="Telefone"
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
          />

          <Input
            label="Cidade"
            name="cidade"
            value={form.cidade}
            onChange={handleChange}
          />

          <Input
            label="Estado"
            name="estado"
            value={form.estado}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "10px",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              fontSize: "15px",
              fontWeight: "bold",
              background: "#facc15",
              color: "#000",
              cursor: "pointer",
            }}
          >
            {loading
              ? "Salvando..."
              : "Cadastrar corretora"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <label
        style={{
          fontSize: "13px",
          color: "#a1a1aa",
        }}
      >
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        required
        style={{
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #27272a",
          background: "#000",
          color: "#fff",
          fontSize: "14px",
        }}
      />
    </div>
  );
}