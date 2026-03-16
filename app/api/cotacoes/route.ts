import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("cotacoes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      cliente_id,
      corretora_id,
      tipo_seguro,
      seguradora,
      premio_estimado,
      cobertura_oferecida,
      observacoes,
      atividade_principal,
    } = body;

    const { data, error } = await supabase
      .from("cotacoes")
      .insert([
        {
          cliente_id,
          corretora_id,
          tipo_seguro,
          seguradora,
          premio_estimado,
          cobertura_oferecida,
          observacoes,
          atividade_principal,
          status: "Nova",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}