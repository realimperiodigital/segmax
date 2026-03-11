"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { calcularCotacao } from "@/lib/motorcotacao";

type ResultadoPlano = {
  seguradora_id: string
  plano_id: string
  nome_plano: string
  taxa: number
  comissao: number | null
  status: string
}

export default function ResultadoCotacaoPage() {

  const searchParams = useSearchParams()
  const cotacaoId = searchParams.get("cotacao_id") || ""

  const [resultados, setResultados] = useState<ResultadoPlano[]>([])
  const [loading, setLoading] = useState(true)

  async function carregarResultado() {

    if (!cotacaoId) {
      alert("cotacao nao informada")
      return
    }

    setLoading(true)

    try {

      const dados = await calcularCotacao(cotacaoId)

      setResultados(dados)

    } catch (erro: any) {

      alert(erro.message)

    }

    setLoading(false)
  }

  useEffect(() => {
    carregarResultado()
  }, [])

  return (
    <div style={pageStyle}>

      <div>
        <h1 style={titleStyle}>Resultado da Cotação</h1>
        <p style={subtitleStyle}>
          Ranking automático de seguradoras baseado nas regras cadastradas.
        </p>
      </div>

      <div style={card}>

        {loading ? (
          <div style={empty}>Calculando propostas...</div>
        ) : resultados.length === 0 ? (
          <div style={empty}>Nenhuma seguradora aceitou o risco.</div>
        ) : (

          <table style={table}>

            <thead>
              <tr>
                <th style={th}>Ranking</th>
                <th style={th}>Plano</th>
                <th style={th}>Taxa</th>
                <th style={th}>Comissão</th>
                <th style={th}>Status</th>
              </tr>
            </thead>

            <tbody>

              {resultados.map((r, index) => (

                <tr key={r.plano_id}>

                  <td style={td}>
                    <strong>#{index + 1}</strong>
                  </td>

                  <td style={td}>
                    {r.nome_plano}
                  </td>

                  <td style={td}>
                    {r.taxa.toFixed(2)}
                  </td>

                  <td style={td}>
                    {r.comissao ?? "-"}
                  </td>

                  <td style={td}>
                    {r.status}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  )
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: 16
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 32
}

const subtitleStyle: React.CSSProperties = {
  marginTop: 6,
  color: "#6b7280"
}

const card: React.CSSProperties = {
  background: "#fff",
  padding: 20,
  borderRadius: 12
}

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse"
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: 12,
  borderBottom: "1px solid #e5e7eb"
}

const td: React.CSSProperties = {
  padding: 12,
  borderBottom: "1px solid #f3f4f6"
}

const empty: React.CSSProperties = {
  textAlign: "center",
  padding: 30
}