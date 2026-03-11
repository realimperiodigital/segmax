"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type StatusSeguradora = "ativa" | "inativa" | "suspensa";

export default function NovaSeguradoraPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [site, setSite] = useState("");
  const [status, setStatus] = useState<StatusSeguradora>("ativa");
  const [loading, setLoading] = useState(false);

  function somenteNumeros(valor: string) {
    return valor.replace(/\D/g, "");
  }

  function formatarTelefone(valor: string) {
    const numeros = somenteNumeros(valor).slice(0, 11);

    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 7) return numeros.replace(/^(\d{2})(\d+)/, "($1) $2");
    if (numeros.length <= 10) {
      return numeros.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
    }

    return numeros.replace(/^(\d{2})(\d{5})(\d{4}).*$/, "($1) $2-$3");
  }

  function normalizarSite(valor: string) {
    const texto = valor.trim();
    if (!texto) return "";

    if (
      texto.startsWith("http://") ||
      texto.startsWith("https://")
    ) {
      return texto;
    }

    return `https://${texto}`;
  }

  async function salvarSeguradora(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    const nomeTratado = nome.trim();
    const codigoTratado = codigo.trim().toUpperCase();
    const emailTratado = email.trim().toLowerCase();
    const telefoneTratado = somenteNumeros(telefone);
    const siteTratado = normalizarSite(site);

    if (!nomeTratado) {
      alert("Preencha o nome da seguradora.");
      return;
    }

    if (!codigoTratado) {
      alert("Preencha o código da seguradora.");
      return;
    }

    if (!["ativa", "inativa", "suspensa"].includes(status)) {
      alert("Status inválido.");
      return;
    }

    setLoading(true);

    try {
      const { data: codigoExistente, error: erroCodigo } = await supabase
        .from("seguradoras")
        .select("id, nome")
        .eq("codigo", codigoTratado)
        .eq("excluido", false)
        .maybeSingle();

      if (erroCodigo) {
        alert(`Erro ao validar código: ${erroCodigo.message}`);
        return;
      }

      if (codigoExistente) {
        alert("Já existe uma seguradora cadastrada com este código.");
        return;
      }

      if (emailTratado) {
        const { data: emailExistente, error: erroEmail } = await supabase
          .from("seguradoras")
          .select("id, nome")
          .eq("email", emailTratado)
          .eq("excluido", false)
          .maybeSingle();

        if (erroEmail) {
          alert(`Erro ao validar email: ${erroEmail.message}`);
          return;
        }

        if (emailExistente) {
          alert("Já existe uma seguradora cadastrada com este email.");
          return;
        }
      }

      const payload = {
        nome: nomeTratado,
        codigo: codigoTratado,
        email: emailTratado || null,
        telefone: telefoneTratado || null,
        site: siteTratado || null,
        status,
        ativo: status === "ativa",
        excluido: false,
      };

      const { error } = await supabase.from("seguradoras").insert([payload]);

      if (error) {
        alert(`Erro ao salvar seguradora: ${error.message}`);
        return;
      }

      alert("Seguradora cadastrada com sucesso.");
      router.push("/seguradoras");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado ao salvar seguradora.";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={titleStyle}>Nova Seguradora</h1>
        <p style={subtitleStyle}>
          Cadastre a seguradora base para depois configurar planos, regras e cálculo.
        </p>
      </div>

      <form onSubmit={salvarSeguradora} style={formCard}>
        <input
          type="text"
          placeholder="Nome da seguradora"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Código da seguradora"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
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
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Site"
          value={site}
          onChange={(e) => setSite(e.target.value)}
          style={inputStyle}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusSeguradora)}
          style={inputStyle}
        >
          <option value="ativa">Ativa</option>
          <option value="inativa">Inativa</option>
          <option value="suspensa">Suspensa</option>
        </select>

        <div style={actionsRow}>
          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? "Salvando..." : "Salvar Seguradora"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/seguradoras")}
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