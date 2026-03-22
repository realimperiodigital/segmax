import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Variáveis do Supabase não configuradas.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("propostas_executivas")
      .select(`
        id,
        status,
        cliente_nome,
        seguradora_nome,
        premio_total,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      sucesso: true,
      propostas: data || [],
    });

  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao carregar propostas.";

    return NextResponse.json(
      {
        sucesso: false,
        error: "Falha ao carregar propostas.",
        details: message,
      },
      { status: 500 }
    );
  }
}