"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

type Seguradora = {
  id: string;
  nome: string | null;
};

export default function NovoPlanoSeguradoraPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const seguradoraIdUrl = searchParams.get("seguradora_id") || "";

  const [seguradoras, setSeguradoras] = useState<Seguradora[]>([]);
  const [seguradoraId, setSeguradoraId] = useState(seguradoraIdUrl);

  const [nomePlano, setNomePlano] = useState("");
  const [produto, setProduto] = useState("");
  const [taxaMin, setTaxaMin] = useState("");
  const [taxaMax, setTaxaMax] = useState("");
  const [comissao, setComissao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [loading, setLoading] = useState(false);
  const [carregandoSeguradoras, setCarregandoSeguradoras] = useState(true);

  async function carregarSeguradoras() {
    setCarregandoSeguradoras(true);

    const { data, error } = await supabase
      .from("seguradoras")
      .select("id, nome")
      .eq("excluido", false)
      .order("nome");

    if (error) {
      alert(`Erro ao carregar seguradoras: ${error.message}`);
      setSeguradoras([]);
      setCarregandoSeguradoras(false);
      return;
    }

    setSeguradoras(data || []);
    setCarregandoSeguradoras(false);
  }

  useEffect(() => {
    carregarSeguradoras();
  }, []);

  useEffect(() => {
    setSeguradoraId(seguradoraIdUrl);
  }, [seguradoraIdUrl]);

  const nomeSeguradoraSelecionada = useMemo(() => {
    if (!seguradoraId) return "";
    const seguradora = seguradoras.find((item) => item.id === seguradoraId);
    return seguradora?.nome || "";
  }, [seguradoras, seguradoraId]);

  function paraNumeroOuNull(valor: string) {
    const texto = valor.trim().replace(",", ".");
    if (!texto) return null;

    const numero = Number(texto);
    if (Number.isNaN(numero)) return "invalido";

    return numero;
  }

  async function salvarPlano(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    const nomePlanoTratado = nomePlano.trim();
    const produtoTratado = produto.trim().toLowerCase();
    const observacoesTratadas = observacoes.trim();

    if (!seguradoraId) {
      alert("Selecione a seguradora.");
      return;
    }

    if (!nomePlanoTratado) {
      alert("Preencha o nome do plano.");
      return;
    }

    if (!produtoTratado) {
      alert("Preencha o produto.");
      return;
    }

    const taxaMinNumero = paraNumeroOuNull(taxaMin);
    const taxaMaxNumero = paraNumeroOuNull(taxaMax);
    const comissaoNumero = paraNumeroOuNull(comissao);

    if (taxaMinNumero === "invalido") {
      alert("Preencha uma taxa mínima válida.");
      return;
    }

    if (taxaMaxNumero === "invalido") {
      alert("Preencha uma taxa máxima válida.");
      return;
    }

    if (comissaoNumero === "invalido") {
      alert("Preencha uma comissão válida.");
      return;
    }

    if (
      typeof taxaMinNumero === "number" &&
      typeof taxaMaxNumero === "number" &&
      taxaMinNumero > taxaMaxNumero
    ) {
      alert("A taxa mínima não pode ser maior que a taxa máxima.");
      return;
    }

    setLoading(true);

    try {
      const { data: seguradoraExiste, error: erroSeguradora } = await supabase
        .from("seguradoras")
        .select("id, nome")
        .eq("id", seguradoraId)
        .eq("excluido", false)
        .maybeSingle();

      if (erroSeguradora) {
        alert(`Erro ao validar seguradora: ${erroSeguradora.message}`);
        return;
      }

      if (!seguradoraExiste) {
        alert("A seguradora selecionada não foi encontrada.");
        return;
      }

      const { data: planoExistente, error: erroPlanoExistente } = await supabase
        .from("seguradora_planos")
        .select("id, nome_plano, produto")
        .eq("seguradora_id", seguradoraId)
        .eq("nome_plano", nomePlanoTratado)
        .eq("produto", produtoTratado)
        .eq("excluido", false)
        .maybeSingle();

      if (erroPlanoExistente) {
        alert(`Erro ao validar plano: ${erroPlanoExistente.message}`);
        return;
      }

      if (planoExistente) {
        alert("Já existe um plano com esse nome e produto para esta seguradora.");
        return;
      }

      const payload = {
        seguradora_id: seguradoraId,
        nome_plano: nomePlanoTratado,
        produto: produtoTratado,
        taxa_min: taxaMinNumero === null ? null : taxaMinNumero,
        taxa_max: taxaMaxNumero === null ? null : taxaMaxNumero,
        comissao: comissaoNumero === null ? null : comissaoNumero,
        observacoes: observacoesTratadas || null,
        ativo,
        excluido: false,
      };

      const { error } = await supabase.from("seguradora_planos").insert([payload]);

      if (error) {
        alert(`Erro ao salvar plano: ${error.message}`);
        return;
      }

      alert("Plano cadastrado com sucesso.");
      router.push(`/seguradoras/planos?seguradora_id=${seguradoraId}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado ao salvar plano.";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={titleStyle}>Novo Plano da Seguradora</h1>
        <p style={subtitleStyle}>
          {nomeSeguradoraSelecionada
            ? `Cadastre um novo plano para a seguradora ${nomeSeguradoraSelecionada}.`
            : "Cadastre um novo plano para alimentar o motor de cálculo."}
        </p>
      </div>

      <form onSubmit={salvarPlano} style={formCard}>
        <select
          value={seguradoraId}
          onChange={(e) => setSeguradoraId(e.target.value)}
          style={inputStyle}
          disabled={carregandoSeguradoras}
        >
          <option value="">
            {carregandoSeguradoras ? "Carregando seguradoras..." : "Selecione a seguradora"}
          </option>
          {seguradoras.map((seguradora) => (
            <option key={seguradora.id} value={seguradora.id}>
              {seguradora.nome || "Seguradora sem nome"}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Nome do plano"
          value={nomePlano}
          onChange={(e) => setNomePlano(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Produto (ex.: seguro_empresarial)"
          value={produto}
          onChange={(e) => setProduto(e.target.value)}
          style={inputStyle}
        />

        <div style={grid3}>
          <input
            type="text"
            placeholder="Taxa mínima"
            value={taxaMin}
            onChange={(e) => setTaxaMin(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Taxa máxima"
            value={taxaMax}
            onChange={(e) => setTaxaMax(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Comissão"
            value={comissao}
            onChange={(e) => setComissao(e.target.value)}
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
            {loading ? "Salvando..." : "Salvar Plano"}
          </button>

          <button
            type="button"
            onClick={() =>
              seguradoraId
                ? router.push(`/seguradoras/planos?seguradora_id=${seguradoraId}`)
                : router.push("/seguradoras")
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

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
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