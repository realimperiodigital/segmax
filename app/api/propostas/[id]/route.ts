import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("propostas_executivas")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ proposta: data });
  } catch (error) {
    console.error("Erro ao buscar proposta:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}