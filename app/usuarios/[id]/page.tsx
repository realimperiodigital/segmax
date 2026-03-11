"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

type Corretora = {
  id: string;
  nome_fantasia: string;
};

function isUuid(value: string) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export default function EditarUsuario() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("operador");
  const [corretoraId, setCorretoraId] = useState("");
  const [status, setStatus] = useState("ativo");
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [corretoras, setCorretoras] = useState<Corretora[]>([]);

  async function carregarCorretoras() {
    const { data, error } = await supabase
      .from("corretoras")
      .select("id, nome_fantasia")
      .order("nome_fantasia", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setCorretoras(data || []);
  }

  async function carregarUsuario() {
    if (!id || !isUuid(id)) {
      router.push("/usuarios/novo");
      return;
    }

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      router.push("/usuarios");
      return;
    }

    if (data) {
      setNome(data.nome || "");
      setEmail(data.email || "");
      setSenha(data.senha || "");
      setRole(data.role || "operador");
      setCorretoraId(data.corretora_id || "");
      setStatus(data.status || "ativo");
    }

    setCarregando(false);
  }

  useEffect(() => {
    if (id) {
      carregarCorretoras();
      carregarUsuario();
    }
  }, [id]);

  async function salvarAlteracoes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const atualizacao: {
      nome: string;
      email: string;
      senha: string;
      role: string;
      corretora_id: string | null;
      status: string;
      excluido?: boolean;
      motivo_exclusao?: string | null;
      data_exclusao?: string | null;
    } = {
      nome,
      email,
      senha,
      role,
      corretora_id: corretoraId || null,
      status,
    };

    if (status === "excluido") {
      const motivo = prompt("Motivo da exclusão do usuário:");
      if (!motivo) {
        setLoading(false);
        return;
      }

      atualizacao.excluido = true;
      atualizacao.motivo_exclusao = motivo;
      atualizacao.data_exclusao = new Date().toISOString();
    } else {
      atualizacao.excluido = false;
      atualizacao.motivo_exclusao = null;
      atualizacao.data_exclusao = null;
    }

    const { error } = await supabase
      .from("usuarios")
      .update(atualizacao)
      .eq("id", id);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    alert("Usuário atualizado com sucesso");
    router.push("/usuarios");
  }

  if (carregando) {
    return (
      <div>
        <h1>Carregando usuário...</h1>
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
        Editar Usuário
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
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={inputStyle}
          required
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          required
        />

        <input
          type="text"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={inputStyle}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={inputStyle}
        >
          <option value="operador">Operador</option>
          <option value="admin">Admin</option>
          <option value="master">Master</option>
        </select>

        <select
          value={corretoraId}
          onChange={(e) => setCorretoraId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Selecione a corretora</option>
          {corretoras.map((corretora) => (
            <option key={corretora.id} value={corretora.id}>
              {corretora.nome_fantasia}
            </option>
          ))}
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
            onClick={() => router.push("/usuarios")}
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