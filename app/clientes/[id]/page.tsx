"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

type Corretora = {
  id: string;
  nome_fantasia: string;
};

type Usuario = {
  id: string;
  nome: string;
  corretora_id: string | null;
  excluido: boolean;
  status: string;
};

export default function EditarCliente() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("ativo");
  const [corretoraId, setCorretoraId] = useState("");
  const [usuarioId, setUsuarioId] = useState("");
  const [corretoras, setCorretoras] = useState<Corretora[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);

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

  async function carregarUsuarios() {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nome, corretora_id, excluido, status")
      .eq("excluido", false)
      .order("nome", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setUsuarios(data || []);
  }

  async function carregarCliente() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      router.push("/clientes");
      return;
    }

    if (data) {
      setNome(data.nome || "");
      setTelefone(data.telefone || "");
      setEmail(data.email || "");
      setStatus(data.status || "ativo");
      setCorretoraId(data.corretora_id || "");
      setUsuarioId(data.usuario_id || "");
    }

    setCarregando(false);
  }

  useEffect(() => {
    if (id) {
      carregarCorretoras();
      carregarUsuarios();
      carregarCliente();
    }
  }, [id]);

  const usuariosFiltrados = usuarios.filter((usuario) => {
    if (!corretoraId) return true;
    return usuario.corretora_id === corretoraId;
  });

  async function salvarAlteracoes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const atualizacao: {
      nome: string;
      telefone: string;
      email: string;
      status: string;
      corretora_id: string | null;
      usuario_id: string | null;
      excluido?: boolean;
      motivo_exclusao?: string | null;
      data_exclusao?: string | null;
    } = {
      nome,
      telefone,
      email,
      status,
      corretora_id: corretoraId || null,
      usuario_id: usuarioId || null,
    };

    if (status === "excluido") {
      const motivo = prompt("Motivo da exclusão:");
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
      .from("clients")
      .update(atualizacao)
      .eq("id", id);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    alert("Cliente atualizado com sucesso");
    router.push("/clientes");
  }

  if (carregando) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Carregando cliente...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 20 }}>Editar Cliente</h1>

      <form
        onSubmit={salvarAlteracoes}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 500,
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
          value={corretoraId}
          onChange={(e) => {
            setCorretoraId(e.target.value);
            setUsuarioId("");
          }}
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
          value={usuarioId}
          onChange={(e) => setUsuarioId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Selecione o usuário responsável</option>
          {usuariosFiltrados.map((usuario) => (
            <option key={usuario.id} value={usuario.id}>
              {usuario.nome}
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
            style={primaryButton}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/clientes")}
            style={secondaryButton}
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
  border: "1px solid #ccc",
  borderRadius: 8,
  background: "#fff",
};

const primaryButton: React.CSSProperties = {
  padding: "12px 16px",
  background: "#07163a",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  padding: "12px 16px",
  background: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};