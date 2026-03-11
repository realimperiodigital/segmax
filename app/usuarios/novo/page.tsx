"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Corretora = {
  id: string;
  nome_fantasia: string | null;
};

type Permissao =
  | "admin_corretora"
  | "gestor"
  | "vendedor"
  | "tecnico"
  | "financeiro";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const corretoraIdUrl = searchParams.get("corretora_id") || "";

  const [corretoras, setCorretoras] = useState<Corretora[]>([]);
  const [corretoraId, setCorretoraId] = useState(corretoraIdUrl);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [permissao, setPermissao] = useState<Permissao>("vendedor");
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [carregandoCorretoras, setCarregandoCorretoras] = useState(true);

  async function carregarCorretoras() {
    setCarregandoCorretoras(true);

    const { data, error } = await supabase
      .from("corretoras")
      .select("id, nome_fantasia")
      .eq("excluido", false)
      .order("nome_fantasia");

    if (error) {
      alert(`Erro ao carregar corretoras: ${error.message}`);
      setCorretoras([]);
      setCarregandoCorretoras(false);
      return;
    }

    setCorretoras(data || []);
    setCarregandoCorretoras(false);
  }

  useEffect(() => {
    carregarCorretoras();
  }, []);

  useEffect(() => {
    setCorretoraId(corretoraIdUrl);
  }, [corretoraIdUrl]);

  const nomeCorretoraSelecionada = useMemo(() => {
    if (!corretoraId) return "";
    const corretora = corretoras.find((item) => item.id === corretoraId);
    return corretora?.nome_fantasia || "";
  }, [corretoras, corretoraId]);

  async function salvarUsuario(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    const nomeTratado = nome.trim();
    const emailTratado = email.trim().toLowerCase();
    const loginTratado = login.trim().toLowerCase();

    if (!corretoraId) {
      alert("Selecione a corretora.");
      return;
    }

    if (!nomeTratado) {
      alert("Preencha o nome do usuário.");
      return;
    }

    if (!emailTratado) {
      alert("Preencha o email.");
      return;
    }

    if (!loginTratado) {
      alert("Preencha o login.");
      return;
    }

    if (
      !["admin_corretora", "gestor", "vendedor", "tecnico", "financeiro"].includes(
        permissao
      )
    ) {
      alert("Permissão inválida.");
      return;
    }

    setLoading(true);

    try {
      const { data: corretoraExiste, error: erroCorretora } = await supabase
        .from("corretoras")
        .select("id, nome_fantasia")
        .eq("id", corretoraId)
        .eq("excluido", false)
        .maybeSingle();

      if (erroCorretora) {
        alert(`Erro ao validar corretora: ${erroCorretora.message}`);
        return;
      }

      if (!corretoraExiste) {
        alert("A corretora selecionada não foi encontrada.");
        return;
      }

      const { data: emailExistente, error: erroEmail } = await supabase
        .from("usuarios")
        .select("id, nome")
        .eq("email", emailTratado)
        .eq("excluido", false)
        .maybeSingle();

      if (erroEmail) {
        alert(`Erro ao validar email: ${erroEmail.message}`);
        return;
      }

      if (emailExistente) {
        alert("Já existe um usuário cadastrado com este email.");
        return;
      }

      const { data: loginExistente, error: erroLogin } = await supabase
        .from("usuarios")
        .select("id, nome")
        .eq("login", loginTratado)
        .eq("excluido", false)
        .maybeSingle();

      if (erroLogin) {
        alert(`Erro ao validar login: ${erroLogin.message}`);
        return;
      }

      if (loginExistente) {
        alert("Já existe um usuário cadastrado com este login.");
        return;
      }

      const payload = {
        corretora_id: corretoraId,
        nome: nomeTratado,
        email: emailTratado,
        login: loginTratado,
        permissao,
        ativo,
        excluido: false,
      };

      const { error } = await supabase.from("usuarios").insert([payload]);

      if (error) {
        if (error.message.toLowerCase().includes("usuarios_email")) {
          alert("Já existe um usuário cadastrado com este email.");
          return;
        }

        if (error.message.toLowerCase().includes("usuarios_login")) {
          alert("Já existe um usuário cadastrado com este login.");
          return;
        }

        alert(`Erro ao salvar usuário: ${error.message}`);
        return;
      }

      alert("Usuário cadastrado com sucesso.");
      router.push(`/usuarios?corretora_id=${corretoraId}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado ao salvar usuário.";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={titleStyle}>Novo Usuário</h1>
        <p style={subtitleStyle}>
          {nomeCorretoraSelecionada
            ? `Cadastre um novo usuário para a corretora ${nomeCorretoraSelecionada}.`
            : "Cadastre um novo usuário e vincule à corretora correta."}
        </p>
      </div>

      <form onSubmit={salvarUsuario} style={formCard}>
        <select
          value={corretoraId}
          onChange={(e) => setCorretoraId(e.target.value)}
          style={inputStyle}
          disabled={carregandoCorretoras}
        >
          <option value="">
            {carregandoCorretoras ? "Carregando corretoras..." : "Selecione a corretora"}
          </option>
          {corretoras.map((corretora) => (
            <option key={corretora.id} value={corretora.id}>
              {corretora.nome_fantasia || "Corretora sem nome"}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Nome do usuário"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          style={inputStyle}
        />

        <select
          value={permissao}
          onChange={(e) => setPermissao(e.target.value as Permissao)}
          style={inputStyle}
        >
          <option value="admin_corretora">Admin Corretora</option>
          <option value="gestor">Gestor</option>
          <option value="vendedor">Vendedor</option>
          <option value="tecnico">Técnico</option>
          <option value="financeiro">Financeiro</option>
        </select>

        <select
          value={ativo ? "ativo" : "inativo"}
          onChange={(e) => setAtivo(e.target.value === "ativo")}
          style={inputStyle}
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>

        <div style={actionsRow}>
          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? "Salvando..." : "Salvar Usuário"}
          </button>

          <button
            type="button"
            onClick={() =>
              corretoraId
                ? router.push(`/usuarios?corretora_id=${corretoraId}`)
                : router.push("/usuarios")
            }
            style={secondaryButton}
          >
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 32,
  color: "#111827",
};

const subtitleStyle: React.CSSProperties = {
  margin: "6px 0 0 0",
  color: "#6b7280",
  fontSize: 15,
};

const formCard: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  border: "1px solid #eef2f7",
  display: "grid",
  gap: 14,
  maxWidth: 760,
};

const inputStyle: React.CSSProperties = {
  padding: 12,
  border: "1px solid #d1d5db",
  borderRadius: 10,
  fontSize: 15,
  background: "#fff",
  width: "100%",
};

const actionsRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 8,
};

const primaryButton: React.CSSProperties = {
  padding: "12px 16px",
  background: "#07163a",
  color: "#ffffff",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryButton: React.CSSProperties = {
  padding: "12px 16px",
  background: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
};