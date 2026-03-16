"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type PermissaoSistema =
  | "master"
  | "diretora_tecnica"
  | "diretora_financeira"
  | "admin_corretora"
  | "corretor"
  | "usuario"
  | string;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  function redirecionarPorPermissao(permissao: PermissaoSistema) {
    const p = String(permissao || "").trim().toLowerCase();

    if (p === "master") {
      router.push("/dashboard");
      return;
    }

    if (p === "diretora_tecnica") {
      router.push("/analise-tecnica");
      return;
    }

    if (p === "diretora_financeira") {
      router.push("/financeiro");
      return;
    }

    if (p === "admin_corretora" || p === "corretor" || p === "usuario") {
      router.push("/entrada");
      return;
    }

    setErro(`Permissão não reconhecida: ${permissao}`);
    setLoading(false);
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        setErro("E-mail ou senha inválidos.");
        setLoading(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErro("Usuário não encontrado após o login.");
        setLoading(false);
        return;
      }

      const { data: usuarioBanco, error: usuarioError } = await supabase
        .from("usuarios")
        .select("id, permissao, status, ativo")
        .eq("id", user.id)
        .single();

      if (usuarioError || !usuarioBanco) {
        setErro("Seu acesso ainda não foi configurado na tabela usuarios.");
        setLoading(false);
        return;
      }

      if (usuarioBanco.status !== "ativo" || usuarioBanco.ativo !== true) {
        setErro("Seu acesso está inativo ou bloqueado.");
        setLoading(false);
        return;
      }

      if (!usuarioBanco.permissao) {
        setErro("Seu usuário está sem permissão definida.");
        setLoading(false);
        return;
      }

      redirecionarPorPermissao(usuarioBanco.permissao);
    } catch {
      setErro("Ocorreu um erro ao entrar no sistema.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "420px",
          padding: "40px",
          background: "rgba(0,0,0,0.85)",
          borderRadius: "14px",
          border: "1px solid rgba(255,215,0,0.2)",
          boxShadow: "0 0 30px rgba(255,215,0,0.15)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <img
            src="/segmax-logo.png"
            alt="SegMax"
            style={{
              width: "180px",
              margin: "0 auto",
              marginBottom: "20px",
              display: "block",
            }}
          />

          <h2
            style={{
              color: "#fff",
              fontSize: "22px",
              fontWeight: 600,
              margin: 0,
            }}
          >
            Acesso à Plataforma
          </h2>
        </div>

        <form onSubmit={login}>
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                color: "#d4af37",
                fontSize: "14px",
                display: "block",
                marginBottom: "6px",
              }}
            >
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@empresa.com"
              required
              style={{
                width: "100%",
                padding: "12px",
                background: "#0a0a0a",
                border: "1px solid #333",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                color: "#d4af37",
                fontSize: "14px",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Senha
            </label>

            <div style={{ position: "relative" }}>
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#0a0a0a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                }}
              />

              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "12px",
                  fontSize: "12px",
                  color: "#d4af37",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {erro && (
            <p
              style={{
                color: "#ff5c5c",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: "linear-gradient(90deg,#d4af37,#f6e27a)",
              border: "none",
              borderRadius: "8px",
              color: "#000",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "15px",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? "Entrando..." : "Entrar no sistema"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "25px",
            color: "#777",
            fontSize: "12px",
          }}
        >
          Plataforma SegMax CRM
        </p>
      </div>
    </div>
  );
}