"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("segmaxconsultoria10@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "#07163a",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "#ffffff",
          padding: "40px",
          borderRadius: "12px",
          width: "340px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.20)",
        }}
      >
        <h2
          style={{
            marginBottom: "24px",
            fontSize: "32px",
            color: "#0f172a",
            textAlign: "center",
          }}
        >
          SEGMAX CRM
        </h2>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "16px",
            outline: "none",
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "16px",
            outline: "none",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#07163a",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}