import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Variáveis do Supabase não configuradas no servidor.");
  }

  return createClient(url, serviceRoleKey);
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("cotacoes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Erro ao buscar cotações." },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno no servidor.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const { data, error } = await supabase
      .from("cotacoes")
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Erro ao criar cotação." },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno no servidor.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}