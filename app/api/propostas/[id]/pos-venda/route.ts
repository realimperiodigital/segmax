import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { data: existente } = await supabase
      .from("propostas_pos_venda")
      .select("*")
      .eq("proposta_id", id)
      .maybeSingle();

    if (existente) {
      return NextResponse.json({ success: true, data: existente }, { status: 200 });
    }

    const { data: criado, error: createError } = await supabase
      .from("propostas_pos_venda")
      .insert({
        proposta_id: id,
        status: "implantacao",
      })
      .select("*")
      .single();

    if (createError || !criado) {
      return NextResponse.json(
        { error: "Erro ao criar registro de pós-venda." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: criado }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno inesperado.";

    return NextResponse.json(
      {
        error: "Falha ao carregar pós-venda.",
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
    const body = await request.json();

    const payload = {
      status: body?.status || "implantacao",
      responsavel_nome: body?.responsavel_nome || null,
      data_implantacao: body?.data_implantacao || null,
      data_primeiro_contato: body?.data_primeiro_contato || null,
      data_renovacao_prevista: body?.data_renovacao_prevista || null,
      pendencias: body?.pendencias || null,
      observacoes: body?.observacoes || null,
      retorno_cliente: body?.retorno_cliente || null,
      proxima_acao: body?.proxima_acao || null,
    };

    const { data, error } = await supabase
      .from("propostas_pos_venda")
      .update(payload)
      .eq("proposta_id", id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Erro ao atualizar pós-venda." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pós-venda atualizado com sucesso.",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno inesperado.";

    return NextResponse.json(
      {
        error: "Falha ao atualizar pós-venda.",
        details: message,
      },
      { status: 500 }
    );
  }
}