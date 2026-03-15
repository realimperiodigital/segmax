import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = String(body?.id || "").trim();

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório." }, { status: 400 });
    }

    const { error: erroTabela } = await supabaseAdmin
      .from("usuarios")
      .delete()
      .eq("id", id);

    if (erroTabela) {
      return NextResponse.json({ error: erroTabela.message }, { status: 400 });
    }

    const { error: erroAuth } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (erroAuth) {
      return NextResponse.json({ error: erroAuth.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "Usuário excluído com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir usuário." },
      { status: 500 }
    );
  }
}