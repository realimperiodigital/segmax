import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Params = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token inválido." }, { status: 400 });
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
    const totalAtual = Number(proposta.total_visualizacoes || 0) + 1;

    await supabaseAdmin
      .from("propostas_executivas")
      .update({
        total_visualizacoes: totalAtual,
        ultima_visualizacao_em: agora,
        primeira_visualizacao_em: proposta.primeira_visualizacao_em || agora,
      })
      .eq("id", proposta.id);

    await supabaseAdmin.from("proposta_visualizacoes_publicas").insert({
      proposta_id: proposta.id,
      acao: "visualizacao_publica",
      origem: request.headers.get("referer") || null,
      user_agent: request.headers.get("user-agent") || null,
      ip_info:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        null,
    });

    return NextResponse.json({
      proposta,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno ao carregar proposta." }, { status: 500 });
  }
}