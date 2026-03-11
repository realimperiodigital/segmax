"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function EditarCorretora() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [nomeFantasia, setNomeFantasia] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [plano, setPlano] = useState("basic");
  const [status, setStatus] = useState("ativo");
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);

  async function carregarCorretora() {
    const { data, error } = await supabase
      .from("corretoras")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      router.push("/corretoras");
      return;
    }

    if (data) {
      setNomeFantasia(data.nome_fantasia || "");
      setRazaoSocial(data.razao_social || "");
      setCnpj(data.cnpj || "");
      setResponsavel(data.responsavel || "");
      setTelefone(data.telefone || "");
      setEmail(data.email || "");
      setPlano(data.plano || "basic");
      setStatus(data.status || "ativo");
    }

    setCarregando(false);
  }

  useEffect(() => {
    if (id) {
      carregarCorretora();
    }
  }, [id]);

  async function salvarAlteracoes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("corretoras")
      .update({
        nome_fantasia: nomeFantasia,
        razao_social: razaoSocial,
        cnpj,
        responsavel,
        telefone,
        email,
        plano,
        status,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    alert("Corretora atualizada com sucesso");
    router.push("/corretoras");
  }

  if (carregando) {
    return (
      <div>
        <h1>Carregando corretora...</h1>
      </div>
    );
  }

  return (
    <div>
      <h1
        style={{
          marginTop: 0,
          marginBottom: 20,
          fontSize: 32,
          color: "#111827",
        }}
      >
        Editar Corretora
      </h1>

      <form
        onSubmit={salvarAlteracoes}
        style={{
          background: "#ffffff",
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          maxWidth: 700,
          display: "grid",
          gap: 14,
        }}
      >
        <input
          type="text"
          placeholder="Nome fantasia"
          value={nomeFantasia}
          onChange={(e) => setNomeFantasia(e.target.value)}
          style={inputStyle}
          required
        />

        <input
          type="text"
          placeholder="Razão social"
          value={razaoSocial}
          onChange={(e) => setRazaoSocial(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="CNPJ"
          value={cnpj}
          onChange={(e) => setCnpj(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Responsável"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <select
          value={plano}
          onChange={(e) => setPlano(e.target.value)}
          style={inputStyle}
        >
          <option value="basic">Basic</option>
          <option value="padrao">Padrão</option>
          <option value="pro">Pro</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={inputStyle}
        >
          <option value="ativo">Ativo</option>
          <option value="suspenso">Suspenso</option>
          <option value="bloqueado">Bloqueado</option>
          <option value="excluido">Excluído</option>
        </select>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 16px",
              background: "#07163a",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/corretoras")}
            style={{
              padding: "12px 16px",
              background: "#e5e7eb",
              color: "#111827",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 12,
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 15,
  background: "#fff",
};