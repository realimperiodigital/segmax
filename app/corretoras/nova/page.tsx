"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type StatusCorretora = "ativa" | "inativa" | "suspensa" | "cancelada";

export default function NovaCorretoraPage() {
  const router = useRouter();

  const [nomeFantasia, setNomeFantasia] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [responsavelNome, setResponsavelNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [status, setStatus] = useState<StatusCorretora>("ativa");
  const [loading, setLoading] = useState(false);

  function limparCnpj(valor: string) {
    return valor.replace(/\D/g, "");
  }

  function limparTelefone(valor: string) {
    return valor.replace(/\D/g, "");
  }

  function formatarCnpj(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 14);

    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 5) return numeros.replace(/^(\d{2})(\d+)/, "$1.$2");
    if (numeros.length <= 8) return numeros.replace(/^(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
    if (numeros.length <= 12) {
      return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");
    }

    return numeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*$/,
      "$1.$2.$3/$4-$5"
    );
  }

  function formatarTelefone(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 7) return numeros.replace(/^(\d{2})(\d+)/, "($1) $2");
    if (numeros.length <= 10) {
      return numeros.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
    }

    return numeros.replace(/^(\d{2})(\d{5})(\d{4}).*$/, "($1) $2-$3");
  }

  async function salvarCorretora(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    const nomeFantasiaTratado = nomeFantasia.trim();
    const razaoSocialTratada = razaoSocial.trim();
    const cnpjTratado = limparCnpj(cnpj);
    const responsavelTratado = responsavelNome.trim();
    const telefoneTratado = limparTelefone(telefone);
    const emailTratado = email.trim().toLowerCase();
    const loginTratado = login.trim().toLowerCase();

    if (!nomeFantasiaTratado) {
      alert("Preencha o nome fantasia.");
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

    if (!["ativa", "inativa", "suspensa", "cancelada"].includes(status)) {
      alert("Status inválido.");
      return;
    }

    if (cnpjTratado && cnpjTratado.length !== 14) {
      alert("O CNPJ precisa ter 14 números.");
      return;
    }

    setLoading(true);

    try {
      const { data: corretoraEmailExistente, error: erroEmailExistente } = await supabase
        .from("corretoras")
        .select("id, nome_fantasia")
        .eq("email", emailTratado)
        .eq("excluido", false)
        .maybeSingle();

      if (erroEmailExistente) {
        alert(`Erro ao validar email: ${erroEmailExistente.message}`);
        return;
      }

      if (corretoraEmailExistente) {
        alert("Já existe uma corretora cadastrada com este email.");
        return;
      }

      const { data: corretoraLoginExistente, error: erroLoginExistente } = await supabase
        .from("corretoras")
        .select("id, nome_fantasia")
        .eq("login", loginTratado)
        .eq("excluido", false)
        .maybeSingle();

      if (erroLoginExistente) {
        alert(`Erro ao validar login: ${erroLoginExistente.message}`);
        return;
      }

      if (corretoraLoginExistente) {
        alert("Já existe uma corretora cadastrada com este login.");
        return;
      }

      if (cnpjTratado) {
        const { data: corretoraCnpjExistente, error: erroCnpjExistente } = await supabase
          .from("corretoras")
          .select("id, nome_fantasia, cnpj")
          .eq("cnpj", cnpjTratado)
          .eq("excluido", false)
          .maybeSingle();

        if (erroCnpjExistente) {
          alert(`Erro ao validar CNPJ: ${erroCnpjExistente.message}`);
          return;
        }

        if (corretoraCnpjExistente) {
          alert(
            `Já existe uma corretora cadastrada com este CNPJ.${corretoraCnpjExistente.nome_fantasia ? ` Corretora encontrada: ${corretoraCnpjExistente.nome_fantasia}.` : ""}`
          );
          return;
        }
      }

      const payload = {
        nome_fantasia: nomeFantasiaTratado,
        razao_social: razaoSocialTratada || null,
        cnpj: cnpjTratado || null,
        responsavel_nome: responsavelTratado || null,
        telefone: telefoneTratado || null,
        email: emailTratado,
        login: loginTratado,
        status,
        ativo: status === "ativa",
        excluido: false,
      };

      const { error } = await supabase.from("corretoras").insert([payload]);

      if (error) {
        if (error.message.toLowerCase().includes("corretoras_cnpj_key")) {
          alert("Já existe uma corretora cadastrada com este CNPJ.");
          return;
        }

        if (error.message.toLowerCase().includes("corretoras_email")) {
          alert("Já existe uma corretora cadastrada com este email.");
          return;
        }

        if (error.message.toLowerCase().includes("corretoras_login")) {
          alert("Já existe uma corretora cadastrada com este login.");
          return;
        }

        alert(`Erro ao salvar corretora: ${error.message}`);
        return;
      }

      alert("Corretora cadastrada com sucesso.");
      router.push("/corretoras");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado ao salvar corretora.";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={titleStyle}>Nova Corretora</h1>
        <p style={subtitleStyle}>
          Cadastre a corretora base para depois criar usuários, clientes e cotações.
        </p>
      </div>

      <form onSubmit={salvarCorretora} style={formCard}>
        <input
          type="text"
          placeholder="Nome fantasia"
          value={nomeFantasia}
          onChange={(e) => setNomeFantasia(e.target.value)}
          style={inputStyle}
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
          onChange={(e) => setCnpj(formatarCnpj(e.target.value))}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Nome do responsável"
          value={responsavelNome}
          onChange={(e) => setResponsavelNome(e.target.value)}
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
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusCorretora)}
          style={inputStyle}
        >
          <option value="ativa">Ativa</option>
          <option value="inativa">Inativa</option>
          <option value="suspensa">Suspensa</option>
          <option value="cancelada">Cancelada</option>
        </select>

        <div style={actionsRow}>
          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? "Salvando..." : "Salvar Corretora"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/corretoras")}
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