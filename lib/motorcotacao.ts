import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Cotacao = {
  id: string
  produto: string
  cidade_risco?: string | null
  estado_risco?: string | null
  classe_construtiva?: string | null
  combustibilidade?: string | null
  hazard_grade?: string | null
  historico_sinistro?: number | null
}

type Plano = {
  id: string
  seguradora_id: string
  nome_plano: string
  produto: string
  taxa_min: number | null
  taxa_max: number | null
  comissao: number | null
}

type Regra = {
  id: string
  seguradora_id: string
  plano_id: string | null
  produto: string
  tipo_regra: string
  campo: string
  operador: string
  valor_texto: string | null
  valor_numero: number | null
  resultado: string
  prioridade: number
}

type ResultadoPlano = {
  seguradora_id: string
  plano_id: string
  nome_plano: string
  taxa: number
  comissao: number | null
  status: string
}

function comparar(valor: any, operador: string, regraValor: any) {

  if (operador === "=") return valor == regraValor
  if (operador === "!=") return valor != regraValor
  if (operador === ">") return valor > regraValor
  if (operador === ">=") return valor >= regraValor
  if (operador === "<") return valor < regraValor
  if (operador === "<=") return valor <= regraValor

  if (operador === "contains") {
    if (!valor) return false
    return String(valor).toLowerCase().includes(String(regraValor).toLowerCase())
  }

  if (operador === "not_contains") {
    if (!valor) return true
    return !String(valor).toLowerCase().includes(String(regraValor).toLowerCase())
  }

  return false
}

export async function calcularCotacao(cotacaoId: string) {

  const { data: cotacao } = await supabase
    .from("cotacoes")
    .select("*")
    .eq("id", cotacaoId)
    .maybeSingle()

  if (!cotacao) {
    throw new Error("cotacao nao encontrada")
  }

  const { data: planos } = await supabase
    .from("seguradora_planos")
    .select("*")
    .eq("produto", cotacao.produto)
    .eq("ativo", true)
    .eq("excluido", false)

  const { data: regras } = await supabase
    .from("seguradora_regras")
    .select("*")
    .eq("produto", cotacao.produto)
    .eq("ativo", true)
    .eq("excluido", false)
    .order("prioridade")

  if (!planos) return []

  const resultados: ResultadoPlano[] = []

  for (const plano of planos) {

    let taxa = plano.taxa_min || 0
    let status = "aceitar"

    const regrasPlano = regras?.filter(
      r =>
        r.seguradora_id === plano.seguradora_id &&
        (r.plano_id === null || r.plano_id === plano.id)
    )

    if (regrasPlano) {

      for (const regra of regrasPlano) {

        const valorCotacao = (cotacao as any)[regra.campo]

        const valorRegra =
          regra.valor_texto ??
          regra.valor_numero

        const passou = comparar(
          valorCotacao,
          regra.operador,
          valorRegra
        )

        if (!passou) continue

        if (regra.resultado === "recusar") {
          status = "recusado"
          break
        }

        if (regra.resultado === "ajustar_taxa") {
          if (regra.valor_numero) {
            taxa = taxa + regra.valor_numero
          }
        }

      }

    }

    if (status === "recusado") continue

    if (plano.taxa_max && taxa > plano.taxa_max) {
      taxa = plano.taxa_max
    }

    resultados.push({
      seguradora_id: plano.seguradora_id,
      plano_id: plano.id,
      nome_plano: plano.nome_plano,
      taxa,
      comissao: plano.comissao,
      status
    })

  }

  resultados.sort((a, b) => a.taxa - b.taxa)

  return resultados
}