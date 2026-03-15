"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UsuarioSistema = {
  id?: string;
  nome?: string | null;
  email?: string | null;
  perfil?: string | null;
  permissao?: string | null;
  role?: string | null;
  cargo?: string | null;
  tipo?: string | null;
  nivel?: string | null;
  ativo?: boolean | null;
};

type Corretora = {
  id: string;
  nome_fantasia?: string | null;
  razao_social?: string | null;
};

type FormState = {
  nome: string;
  email: string;
  telefone: string;
  corretora_id: string;
  perfil: string;
  status: string;
};

function normalizarTexto(valor: unknown) {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function somenteNumeros(valor: string) {
  return valor.replace(/\D/g, "");
}

function formatarTelefone(valor: string) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  if (!numeros) return "";

  if (numeros.length <= 10) {
    return numeros
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return numeros
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export default function NovoUsuarioPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioSistema | null>(null);
  const [corretoras, setCorretoras] = useState<Corretora[]>([]);

  const [form, setForm] = useState<FormState>({
    nome: "",
    email: "",
    telefone: "",
    corretora_id: "",
    perfil: "corretor",
    status: "ativo",
  });

  const emailsDirecao = useMemo(
    () => [
      "segmaxconsultoria10@gmail.com",
      "tecmastersegmax@gmail.com",
      "alessandra.myryam26@gmail.com",
    ],
    []
  );

  async function buscarUsuarioSistema(email: string, authUserId?: string) {
    let usuarioSistema: UsuarioSistema | null = null;

    if (authUserId) {
      const tentativaUsuarios = await supabase
        .from("usuarios")
        .select("*")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      if (!tentativaUsuarios.error && tentativaUsuarios.data) {
        usuarioSistema = tentativaUsuarios.data as UsuarioSistema;
      }

      if (!usuarioSistema) {
        const tentativaProfiles = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUserId)
          .maybeSingle();

        if (!tentativaProfiles.error && tentativaProfiles.data) {
          usuarioSistema = tentativaProfiles.data as UsuarioSistema;
        }
      }
    }

    if (!usuarioSistema && email) {
      const tentativaUsuariosPorEmail = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (!tentativaUsuariosPorEmail.error && tentativaUsuariosPorEmail.data) {
        usuarioSistema = tentativaUsuariosPorEmail.data as UsuarioSistema;
      }

      if (!usuarioSistema) {
        const tentativaProfilesPorEmail = await supabase
          .from("profiles")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (!tentativaProfilesPorEmail.error && tentativaProfilesPorEmail.data) {
          usuarioSistema = tentativaProfilesPorEmail.data as UsuarioSistema;
        }
      }
    }

    return usuarioSistema;
  }

  function usuarioTemAcesso(email: string, usuarioSistema: UsuarioSistema | null) {
    const emailNormalizado = normalizarTexto(email);

    if (emailsDirecao.includes(emailNormalizado)) {
      return true;
    }

    const campos = [
      usuarioSistema?.perfil,
      usuarioSistema?.permissao,
      usuarioSistema?.role,
      usuarioSistema?.cargo,
      usuarioSistema?.tipo,
      usuarioSistema?.nivel,
    ]
      .map(normalizarTexto)
      .filter(Boolean);

    const perfisLiberados = [
      "master",
      "super_master",
      "supermaster",
      "admin_master",
      "diretora_tecnica",
      "diretora_financeira",
      "diretor_tecnico",
      "financeiro_master",
      "tecnico_master",
      "admin",
    ];

    return campos.some((campo) => perfisLiberados.includes(campo));
  }

  async function carregarDados() {
    try {
      setLoading(true);
      setErro(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.replace("/login");
        return;
      }

      const email = session.user.email ?? "";
      const authUserId = session.user.id;

      const usuarioSistema = await buscarUsuarioSistema(email, authUserId);
      setUsuario(usuarioSistema);

      const permitido = usuarioTemAcesso(email, usuarioSistema);

      if (!permitido) {
        setErro("Acesso não liberado para cadastrar usuários.");
        setLoading(false);
        return;
      }

      const { data: corretorasData, error: corretorasError } = await supabase
        .from("corretoras")
        .select("id, nome_fantasia, razao_social")
        .order("nome_fantasia", { ascending: true });

      if (corretorasError) {
        setErro(corretorasError.message || "Não foi possível carregar as corretoras.");
        setCorretoras([]);
      } else {
        setCorretoras((corretorasData as Corretora[]) || []);
      }
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
      setErro("Erro inesperado ao carregar a tela.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function atualizarCampo<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setSalvando(true);
      setErro(null);
      setSucesso(null);

      if (!form.nome.trim()) {
        setErro("Informe o nome do usuário.");
        return;
      }

      if (!form.email.trim()) {
        setErro("Informe o e-mail do usuário.");
        return;
      }

      const payload = {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        telefone: somenteNumeros(form.telefone) || null,
        corretora_id: form.corretora_id || null,
        permissao: form.perfil,
        role: form.perfil,
        status: form.status,
        ativo: form.status === "ativo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("usuarios").insert(payload);

      if (error) {
        setErro(error.message || "Não foi possível cadastrar o usuário.");
        return;
      }

      setSucesso("Usuário cadastrado com sucesso.");

      setForm({
        nome: "",
        email: "",
        telefone: "",
        corretora_id: "",
        perfil: "corretor",
        status: "ativo",
      });

      setTimeout(() => {
        router.push("/usuarios");
      }, 900);
    } catch (e) {
      console.error("Erro ao salvar usuário:", e);
      setErro("Erro inesperado ao cadastrar o usuário.");
    } finally {
      setSalvando(false);
    }
  }

  const cardBase: React.CSSProperties = {
    background:
      "linear-gradient(180deg, rgba(14,14,14,0.98) 0%, rgba(8,8,8,0.98) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
  };

  const dourado = "#d4af37";

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, rgba(40,40,40,0.18) 0%, rgba(6,6,6,1) 28%, rgba(3,3,3,1) 100%)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <section
          style={{
            ...cardBase,
            width: "100%",
            maxWidth: 560,
            padding: 40,
            textAlign: "center",
            border: "1px solid rgba(212,175,55,0.18)",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.10)",
              borderTop: `4px solid ${dourado}`,
              margin: "0 auto 16px",
              animation: "spin 0.9s linear infinite",
            }}
          />
          <h3 style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>
            Carregando área de usuários...
          </h3>
          <style jsx>{`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </section>
      </main>
    );
  }

  if (erro && !usuario) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, rgba(40,40,40,0.18) 0%, rgba(6,6,6,1) 28%, rgba(3,3,3,1) 100%)",
          color: "#ffffff",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", paddingTop: 48 }}>
          <section
            style={{
              ...cardBase,
              padding: 40,
              textAlign: "center",
              border: "1px solid rgba(212,175,55,0.18)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>
              Acesso não liberado
            </h2>
            <p
              style={{
                marginTop: 14,
                color: "rgba(255,255,255,0.72)",
                fontSize: 16,
              }}
            >
              {erro}
            </p>

            <div
              style={{
                marginTop: 24,
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => router.push("/dashboard")}
                style={botaoSecundario}
              >
                Voltar ao dashboard
              </button>

              <button
                onClick={() => router.push("/usuarios")}
                style={botaoPrimario}
              >
                Ir para usuários
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(40,40,40,0.18) 0%, rgba(6,6,6,1) 28%, rgba(3,3,3,1) 100%)",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          maxWidth: 1420,
          margin: "0 auto",
          padding: "32px 20px 48px",
        }}
      >
        <section
          style={{
            ...cardBase,
            padding: 32,
            marginBottom: 22,
            border: "1px solid rgba(212,175,55,0.20)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 860 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "rgba(212,175,55,0.10)",
                  border: "1px solid rgba(212,175,55,0.25)",
                  color: dourado,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  marginBottom: 18,
                }}
              >
                Área Master
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 48,
                  lineHeight: 1.05,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                Novo Usuário
              </h1>

              <p
                style={{
                  marginTop: 16,
                  marginBottom: 0,
                  color: "rgba(255,255,255,0.72)",
                  fontSize: 18,
                  lineHeight: 1.7,
                }}
              >
                Cadastre novos usuários no padrão visual premium do SegMax,
                vinculando perfil, status e corretora.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Link href="/usuarios" style={botaoSecundarioLink}>
                Voltar
              </Link>

              <button
                type="submit"
                form="form-novo-usuario"
                disabled={salvando}
                style={{
                  ...botaoPrimario,
                  opacity: salvando ? 0.7 : 1,
                  cursor: salvando ? "not-allowed" : "pointer",
                }}
              >
                {salvando ? "Salvando..." : "Salvar usuário"}
              </button>
            </div>
          </div>
        </section>

        {(erro || sucesso) && (
          <section
            style={{
              ...cardBase,
              padding: 20,
              marginBottom: 22,
              border: erro
                ? "1px solid rgba(255,255,255,0.12)"
                : "1px solid rgba(212,175,55,0.20)",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: erro ? "#ffffff" : "#f3d77b",
              }}
            >
              {erro || sucesso}
            </div>
          </section>
        )}

        <form id="form-novo-usuario" onSubmit={handleSubmit}>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gap: 22,
            }}
          >
            <div
              style={{
                ...cardBase,
                padding: 26,
              }}
            >
              <h2 style={tituloBloco}>Dados principais</h2>

              <div style={grid2}>
                <div style={campoFull}>
                  <label style={labelStyle}>Nome</label>
                  <input
                    value={form.nome}
                    onChange={(e) => atualizarCampo("nome", e.target.value)}
                    style={inputStyle}
                    placeholder="Digite o nome do usuário"
                  />
                </div>

                <div style={campoFull}>
                  <label style={labelStyle}>E-mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => atualizarCampo("email", e.target.value)}
                    style={inputStyle}
                    placeholder="usuario@empresa.com"
                  />
                </div>

                <div style={campoFull}>
                  <label style={labelStyle}>Telefone</label>
                  <input
                    value={form.telefone}
                    onChange={(e) =>
                      atualizarCampo("telefone", formatarTelefone(e.target.value))
                    }
                    style={inputStyle}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                ...cardBase,
                padding: 26,
              }}
            >
              <h2 style={tituloBloco}>Perfil e vínculo</h2>

              <div style={grid1}>
                <div>
                  <label style={labelStyle}>Corretora</label>
                  <select
                    value={form.corretora_id}
                    onChange={(e) => atualizarCampo("corretora_id", e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Selecione</option>
                    {corretoras.map((corretora) => (
                      <option key={corretora.id} value={corretora.id}>
                        {corretora.nome_fantasia || corretora.razao_social || "Sem nome"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Perfil</label>
                  <select
                    value={form.perfil}
                    onChange={(e) => atualizarCampo("perfil", e.target.value)}
                    style={inputStyle}
                  >
                    <option value="corretor">Corretor</option>
                    <option value="gerente">Gerente</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="tecnico">Técnico</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => atualizarCampo("status", e.target.value)}
                    style={inputStyle}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="suspenso">Suspenso</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Usuário logado</label>
                  <div style={infoBoxStyle}>
                    {usuario?.nome || usuario?.email || "Master"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 22,
            }}
          >
            <Link href="/usuarios" style={botaoSecundarioLink}>
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={salvando}
              style={{
                ...botaoPrimario,
                opacity: salvando ? 0.7 : 1,
                cursor: salvando ? "not-allowed" : "pointer",
              }}
            >
              {salvando ? "Salvando..." : "Salvar usuário"}
            </button>
          </section>
        </form>
      </div>
    </main>
  );
}

const tituloBloco: React.CSSProperties = {
  margin: "0 0 18px 0",
  fontSize: 24,
  fontWeight: 800,
  color: "#ffffff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "rgba(255,255,255,0.74)",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: 14,
  border: "1px solid rgba(212,175,55,0.16)",
  background: "#060606",
  color: "#ffffff",
  padding: "0 14px",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const infoBoxStyle: React.CSSProperties = {
  minHeight: 48,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#0b0b0b",
  color: "#ffffff",
  padding: "12px 14px",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  boxSizing: "border-box",
};

const botaoSecundario: React.CSSProperties = {
  height: 46,
  padding: "0 18px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#121212",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};

const botaoPrimario: React.CSSProperties = {
  height: 46,
  padding: "0 18px",
  borderRadius: 14,
  border: "1px solid rgba(212,175,55,0.42)",
  background: "#d4af37",
  color: "#050505",
  fontWeight: 800,
  cursor: "pointer",
};

const botaoSecundarioLink: React.CSSProperties = {
  height: 46,
  padding: "0 18px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#121212",
  color: "#ffffff",
  fontWeight: 700,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const grid1: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 16,
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const campoFull: React.CSSProperties = {
  gridColumn: "1 / -1",
};