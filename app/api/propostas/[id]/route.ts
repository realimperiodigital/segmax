import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PropostaExecutivaPayload } from "@/types/proposta-executiva";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function normalizarTexto(valor: unknown) {
  if (typeof valor !== "string") return null;
  const limpo = valor.trim();
  return limpo.length ? limpo : null;
}

function normalizarNumero(valor: unknown) {
  if (valor === null || valor === undefined || valor === "") return 0;

  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : 0;
  }

  if (typeof valor === "string") {
    const convertido = Number(valor.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(convertido) ? convertido : 0;
  }

  return 0;
}

function normalizarData(valor: unknown) {
  if (typeof valor !== "string") return null;
  const limpo = valor.trim();
  return limpo.length ? limpo : null;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("vw_central_propostas")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Proposta não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno inesperado.";

    return NextResponse.json(
      {
        error: "Falha ao carregar proposta.",
        details: message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const body = (await request.json()) as Partial<PropostaExecutivaPayload>;

    if (!body?.titulo || !String(body.titulo).trim()) {
      return NextResponse.json(
        { error: "O campo título é obrigatório." },
        { status: 400 }
      );
    }

    if (!body?.cliente_nome || !String(body.cliente_nome).trim()) {
      return NextResponse.json(
        { error: "O campo cliente_nome é obrigatório." },
        { status: 400 }
      );
    }

    const updatePayload = {
      titulo: String(body.titulo).trim(),

      cliente_id: normalizarTexto(body.cliente_id),
      cliente_nome: String(body.cliente_nome).trim(),
      cliente_documento: normalizarTexto(body.cliente_documento),

      corretora_id: normalizarTexto(body.corretora_id),
      corretora_nome: normalizarTexto(body.corretora_nome),

      cotacao_id: normalizarTexto(body.cotacao_id),
      seguradora_id: normalizarTexto(body.seguradora_id),
      seguradora_nome: normalizarTexto(body.seguradora_nome),

      responsavel_id: normalizarTexto(body.responsavel_id),
      responsavel_nome: normalizarTexto(body.responsavel_nome),

      tipo_seguro: normalizarTexto(body.tipo_seguro),
      categoria: normalizarTexto(body.categoria),

      status: body.status ?? "rascunho",
      etapa: body.etapa ?? "criacao",

      valor_premio: normalizarNumero(body.valor_premio),
      valor_franquia: normalizarNumero(body.valor_franquia),
      valor_importancia_segurada: normalizarNumero(
        body.valor_importancia_segurada
      ),
      valor_comissao: normalizarNumero(body.valor_comissao),

      vigencia_inicio: normalizarData(body.vigencia_inicio),
      vigencia_fim: normalizarData(body.vigencia_fim),

      resumo_executivo: normalizarTexto(body.resumo_executivo),
      observacoes_internas: normalizarTexto(body.observacoes_internas),
      observacoes_cliente: normalizarTexto(body.observacoes_cliente),
      parecer_tecnico: normalizarTexto(body.parecer_tecnico),

      aprovado_por: normalizarTexto(body.aprovado_por),
      aprovado_em: normalizarData(body.aprovado_em),

      rejeitado_por: normalizarTexto(body.rejeitado_por),
      rejeitado_em: normalizarData(body.rejeitado_em),
      motivo_rejeicao: normalizarTexto(body.motivo_rejeicao),

      emitido_em: normalizarData(body.emitido_em),
      implantado_em: normalizarData(body.implantado_em),

      ativo: body.ativo ?? true,

      atualizado_por: normalizarTexto(body.atualizado_por),
      atualizado_por_nome: normalizarTexto(body.atualizado_por_nome) ?? "Sistema",
    };

    const { data, error } = await supabase
      .from("propostas")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          error: "Erro ao atualizar proposta.",
          details: error?.message || "Registro não encontrado.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Proposta atualizada com sucesso.",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno inesperado.";

    return NextResponse.json(
      {
        error: "Falha ao atualizar proposta.",
        details: message,
      },
      { status: 500 }
    );
  }
}