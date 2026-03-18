"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      router.push("/master");
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

    router.push("/dashboard");
  }

  async function buscarPermissaoUsuario(userId: string) {
    const { data, error } = await supabase
      .from("usuarios")
      .select("permissao")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (!error && data?.permissao) {
      return data.permissao as PermissaoSistema;
    }

    const { data: perfil, error: perfilError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (!perfilError && perfil?.role) {
      return perfil.role as PermissaoSistema;
    }

    return "usuario";
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error || !data.user) {
        setErro(error?.message || "Não foi possível entrar no sistema.");
        setLoading(false);
        return;
      }

      const permissao = await buscarPermissaoUsuario(data.user.id);
      redirecionarPorPermissao(permissao);
    } catch {
      setErro("Ocorreu um erro inesperado ao tentar entrar.");
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 32,
          borderRadius: 20,
          border: "1px solid rgba(212,175,55,0.25)",
          background: "rgba(255,255,255,0.02)",
          boxShadow: "0 0 40px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              color: "#d4af37",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            SegMax CRM
          </h1>
          <p style={{ marginTop: 10, color: "#ddd", fontSize: 15 }}>
            Acesso à plataforma
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 14,
              color: "#d4af37",
            }}
          >
            E-mail
          </label>
          <input
            id="email"
            type="email"
            placeholder="seuemail@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              height: 52,
              padding: "0 16px",
              marginBottom: 18,
              borderRadius: 12,
              border: "1px solid rgba(212,175,55,0.2)",
              background: "#0d0d0d",
              color: "#fff",
              outline: "none",
              fontSize: 15,
              boxSizing: "border-box",
            }}
          />

          <label
            htmlFor="senha"
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 14,
              color: "#d4af37",
            }}
          >
            Senha
          </label>

          <div style={{ position: "relative", marginBottom: 18 }}>
            <input
              id="senha"
              type={mostrarSenha ? "text" : "password"}
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              style={{
                width: "100%",
                height: 52,
                padding: "0 90px 0 16px",
                borderRadius: 12,
                border: "1px solid rgba(212,175,55,0.2)",
                background: "#0d0d0d",
                color: "#fff",
                outline: "none",
                fontSize: 15,
                boxSizing: "border-box",
              }}
            />

            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              style={{
                position: "absolute",
                right: 12,
                top: 11,
                height: 30,
                padding: "0 10px",
                borderRadius: 8,
                border: "none",
                background: "transparent",
                color: "#d4af37",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {mostrarSenha ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {erro ? (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                background: "rgba(180,0,0,0.12)",
                border: "1px solid rgba(255,0,0,0.2)",
                color: "#ffb3b3",
                fontSize: 14,
              }}
            >
              {erro}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: 52,
              borderRadius: 12,
              border: "none",
              background: "#d4af37",
              color: "#111",
              fontWeight: 800,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Entrando..." : "Entrar no sistema"}
          </button>
        </form>
      </div>
    </main>
  );
}