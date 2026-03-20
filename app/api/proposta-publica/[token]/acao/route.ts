import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Params = {
  params: Promise<{
    token: string;
  }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    const body = await request.json();

    const acao = body?.acao as "aceitar" | "recusar" | undefined;
    const observacao = typeof body?.observacao === "string" ? body.observacao : "";

    if (!token || !acao) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const { data: proposta, error } = await supabaseAdmin
      .from("propostas_executivas")
      .select("*")
      .eq("public_token", token)
      .eq("link_publico_ativo", true)
      .single();

    if (error || !proposta) {
      return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });
    }

    const agora = new Date().toISOString();

    if (acao === "aceitar") {
      const { error: updateError } = await supabaseAdmin
        .from("propostas_executivas")
        .update({
          status: "aprovada",
          etapa_atual: "fechada_aprovada",
          aceite_publico_em: agora,
          aprovada_em: agora,
        })
        .eq("id", proposta.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      await supabaseAdmin.from("proposta_historico").insert({
        proposta_id: proposta.id,
        acao: "aceite_publico",
        descricao: observacao || "Proposta aprovada pela página pública.",
        status_anterior: proposta.status,
        status_novo: "aprovada",
        criado_por: null,
      });

      await supabaseAdmin.from("proposta_visualizacoes_publicas").insert({
        proposta_id: proposta.id,
        acao: "aceite_publico",
        origem: "pagina_publica",
        user_agent: request.headers.get("user-agent") || null,
        ip_info:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          null,
      });

      return NextResponse.json({ ok: true, mensagem: "Proposta aprovada com sucesso." });
    }

    const { error: updateError } = await supabaseAdmin
      .from("propostas_executivas")
      .update({
        status: "recusada",
        etapa_atual: "fechada_recusada",
        recusada_publico_em: agora,
        recusada_em: agora,
      })
      .eq("id", proposta.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabaseAdmin.from("proposta_historico").insert({
      proposta_id: proposta.id,
      acao: "recusa_publica",
      descricao: observacao || "Proposta recusada pela página pública.",
      status_anterior: proposta.status,
      status_novo: "recusada",
      criado_por: null,
    });

    await supabaseAdmin.from("proposta_visualizacoes_publicas").insert({
      proposta_id: proposta.id,
      acao: "recusa_publica",
      origem: "pagina_publica",
      user_agent: request.headers.get("user-agent") || null,
      ip_info:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        null,
    });

    return NextResponse.json({ ok: true, mensagem: "Proposta recusada com sucesso." });
  } catch {
    return NextResponse.json({ error: "Erro interno ao registrar ação." }, { status: 500 });
  }
}