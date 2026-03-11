"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Corretora = {
  id: string;
  nome_fantasia: string | null;
};

type TipoPessoa = "pf" | "pj";

export default function NovoClientePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const corretoraIdUrl = searchParams.get("corretora_id") || "";

  const [corretoras, setCorretoras] = useState<Corretora[]>([]);
  const [corretoraId, setCorretoraId] = useState(corretoraIdUrl);

  const [nome, setNome] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>("pf");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [observacoes, setObservacoes] = useState("");
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

  function somenteNumeros(valor: string) {
    return valor.replace(/\D/g, "");
  }

  function formatarCpf(valor: string) {
    const numeros = somenteNumeros(valor).slice(0, 11);

    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 6) return numeros.replace(/^(\d{3})(\d+)/, "$1.$2");
    if (numeros.length <= 9) return numeros.replace(/^(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
    return numeros.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*$/, "$1.$2.$3-$4");
  }

  function formatarCnpj(valor: string) {
    const numeros = somenteNumeros(valor).slice(0, 14);

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

  function formatarCpfCnpj(valor: string, tipo: TipoPessoa) {
    return tipo === "pf" ? formatarCpf(valor) : formatarCnpj(valor);
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

  function formatarCep(valor: string) {
    const numeros = somenteNumeros(valor).slice(0, 8);

    if (numeros.length <= 5) return numeros;
    return numeros.replace(/^(\d{5})(\d+)/, "$1-$2");
  }

  async function salvarCliente(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    const nomeTratado = nome.trim();
    const documentoTratado = somenteNumeros(cpfCnpj);
    const emailTratado = email.trim().toLowerCase();
    const telefoneTratado = somenteNumeros(telefone);
    const cepTratado = somenteNumeros(cep);
    const enderecoTratado = endereco.trim();
    const numeroTratado = numero.trim();
    const complementoTratado = complemento.trim();
    const bairroTratado = bairro.trim();
    const cidadeTratada = cidade.trim();
    const estadoTratado = estado.trim().toUpperCase();
    const observacoesTratadas = observacoes.trim();

    if (!corretoraId) {
      alert("Selecione a corretora.");
      return;
    }

    if (!nomeTratado) {
      alert("Preencha o nome do cliente.");
      return;
    }

    if (!["pf", "pj"].includes(tipoPessoa)) {
      alert("Tipo de pessoa inválido.");
      return;
    }

    if (documentoTratado) {
      if (tipoPessoa === "pf" && documentoTratado.length !== 11) {
        alert("CPF precisa ter 11 números.");
        return;
      }

      if (tipoPessoa === "pj" && documentoTratado.length !== 14) {
        alert("CNPJ precisa ter 14 números.");
        return;
      }
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

      if (documentoTratado) {
        const { data: documentoExistente, error: erroDocumento } = await supabase
          .from("clientes")
          .select("id, nome")
          .eq("cpf_cnpj", documentoTratado)
          .eq("excluido", false)
          .maybeSingle();

        if (erroDocumento) {
          alert(`Erro ao validar documento: ${erroDocumento.message}`);
          return;
        }

        if (documentoExistente) {
          alert("Já existe um cliente cadastrado com este CPF/CNPJ.");
          return;
        }
      }

      const payload = {
        corretora_id: corretoraId,
        nome: nomeTratado,
        tipo_pessoa: tipoPessoa,
        cpf_cnpj: documentoTratado || null,
        email: emailTratado || null,
        telefone: telefoneTratado || null,
        cep: cepTratado || null,
        endereco: enderecoTratado || null,
        numero: numeroTratado || null,
        complemento: complementoTratado || null,
        bairro: bairroTratado || null,
        cidade: cidadeTratada || null,
        estado: estadoTratado || null,
        observacoes: observacoesTratadas || null,
        ativo,
        excluido: false,
      };

      const { error } = await supabase.from("clientes").insert([payload]);

      if (error) {
        alert(`Erro ao salvar cliente: ${error.message}`);
        return;
      }

      alert("Cliente cadastrado com sucesso.");
      router.push(`/clientes?corretora_id=${corretoraId}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado ao salvar cliente.";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={titleStyle}>Novo Cliente</h1>
        <p style={subtitleStyle}>
          {nomeCorretoraSelecionada
            ? `Cadastre um novo cliente para a corretora ${nomeCorretoraSelecionada}.`
            : "Cadastre um novo cliente e vincule à corretora correta."}
        </p>
      </div>

      <form onSubmit={salvarCliente} style={formCard}>
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
          placeholder="Nome do cliente"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={inputStyle}
        />

        <div style={grid2}>
          <select
            value={tipoPessoa}
            onChange={(e) => {
              const novoTipo = e.target.value as TipoPessoa;
              setTipoPessoa(novoTipo);
              setCpfCnpj("");
            }}
            style={inputStyle}
          >
            <option value="pf">Pessoa Física</option>
            <option value="pj">Pessoa Jurídica</option>
          </select>

          <input
            type="text"
            placeholder={tipoPessoa === "pf" ? "CPF" : "CNPJ"}
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(formatarCpfCnpj(e.target.value, tipoPessoa))}
            style={inputStyle}
          />
        </div>

        <div style={grid2}>
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
        </div>

        <div style={grid2}>
          <input
            type="text"
            placeholder="CEP"
            value={cep}
            onChange={(e) => setCep(formatarCep(e.target.value))}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value.toUpperCase())}
            style={inputStyle}
            maxLength={2}
          />
        </div>

        <input
          type="text"
          placeholder="Cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          style={inputStyle}
        />

        <div style={grid3}>
          <input
            type="text"
            placeholder="Número"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Complemento"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            style={inputStyle}
          />
        </div>

        <textarea
          placeholder="Observações"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          style={textareaStyle}
        />

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
            {loading ? "Salvando..." : "Salvar Cliente"}
          </button>

          <button
            type="button"
            onClick={() =>
              corretoraId
                ? router.push(`/clientes?corretora_id=${corretoraId}`)
                : router.push("/clientes")
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
  maxWidth: 860,
};

const inputStyle: React.CSSProperties = {
  padding: 12,
  border: "1px solid #d1d5db",
  borderRadius: 10,
  fontSize: 15,
  background: "#fff",
  width: "100%",
};

const textareaStyle: React.CSSProperties = {
  minHeight: 110,
  padding: 12,
  border: "1px solid #d1d5db",
  borderRadius: 10,
  fontSize: 15,
  background: "#fff",
  resize: "vertical",
  width: "100%",
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "0.6fr 1fr 1fr",
  gap: 12,
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