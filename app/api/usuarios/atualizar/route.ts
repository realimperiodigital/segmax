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
    const nome = String(body?.nome || "").trim();
    const login = String(body?.login || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const telefone = String(body?.telefone || "").trim();
    const permissao = String(body?.permissao || "").trim();
    const status = String(body?.status || "").trim();
    const corretora = String(body?.corretora || "").trim();
    const senha = String(body?.senha || "").trim();

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório." }, { status: 400 });
    }

    if (!nome) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    if (!login) {
      return NextResponse.json({ error: "Login é obrigatório." }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
    }

    const { data: existenteLogin, error: erroLogin } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("login", login)
      .neq("id", id)
      .maybeSingle();

    if (erroLogin) {
      return NextResponse.json({ error: erroLogin.message }, { status: 400 });
    }

    if (existenteLogin) {
      return NextResponse.json({ error: "Este login já está em uso." }, { status: 400 });
    }

    const { data: existenteEmail, error: erroEmail } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .neq("id", id)
      .maybeSingle();

    if (erroEmail) {
      return NextResponse.json({ error: erroEmail.message }, { status: 400 });
    }

    if (existenteEmail) {
      return NextResponse.json({ error: "Este e-mail já está em uso." }, { status: 400 });
    }

    const { error: erroTabela } = await supabaseAdmin
      .from("usuarios")
      .update({
        nome,
        login,
        email,
        telefone: telefone || null,
        permissao,
        status,
        corretora: corretora || null,
      })
      .eq("id", id);

    if (erroTabela) {
      return NextResponse.json({ error: erroTabela.message }, { status: 400 });
    }

    const updatePayload: {
      email: string;
      password?: string;
      user_metadata: {
        nome: string;
        login: string;
        permissao: string;
        corretora: string;
        status: string;
      };
    } = {
      email,
      user_metadata: {
        nome,
        login,
        permissao,
        corretora,
        status,
      },
    };

    if (senha) {
      if (senha.length < 6) {
        return NextResponse.json(
          { error: "A nova senha precisa ter pelo menos 6 caracteres." },
          { status: 400 }
        );
      }

      updatePayload.password = senha;
    }

    const { error: erroAuth } = await supabaseAdmin.auth.admin.updateUserById(id, updatePayload);

    if (erroAuth) {
      return NextResponse.json({ error: erroAuth.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "Usuário atualizado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar usuário." },
      { status: 500 }
    );
  }
}