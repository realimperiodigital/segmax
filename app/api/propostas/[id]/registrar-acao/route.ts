import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const tipo = String(body?.tipo || "").trim();

    if (!id || !tipo) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const payload: Record<string, string> = {};

    if (tipo === "pdf") {
      payload.pdf_gerado_em = new Date().toISOString();
    } else if (tipo === "whatsapp") {
      payload.enviado_whatsapp_em = new Date().toISOString();
    } else if (tipo === "email") {
      payload.enviado_email_em = new Date().toISOString();
    } else {
      return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
    }

    const { error } = await supabase
      .from("propostas_executivas")
      .update(payload)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao registrar ação da proposta:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}