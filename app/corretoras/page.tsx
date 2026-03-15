"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Corretora = {
  id: string;
  nome_fantasia: string | null;
  razao_social: string | null;
  cnpj?: string | null;
  email: string | null;
  telefone: string | null;
  responsavel: string | null;
  plano: string | null;
  status: string | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  observacoes?: string | null;
  created_at: string | null;
  updated_at?: string | null;
};

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

function normalizarTexto(valor: unknown) {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function somenteNumeros(valor?: string | null) {
  return String(valor ?? "").replace(/\D/g, "");
}

function formatarData(data?: string | null) {
  if (!data) return "-";
  const dt = new Date(data);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("pt-BR");
}

function formatarCNPJ(valor?: string | null) {
  const numeros = somenteNumeros(valor).slice(0, 14);

  if (!numeros) return "-";

  return numeros
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatarTelefone(valor?: string | null) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  if (!numeros) return "-";

  if (numeros.length <= 10) {
    return numeros
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return numeros
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function formatarCEP(valor?: string | null) {
  const numeros = somenteNumeros(valor).slice(0, 8);
  if (!numeros) return "-";
  return numeros.replace(/^(\d{5})(\d)/, "$1-$2");
}

function obterStatusStyle(status?: string | null) {
  const valor = normalizarTexto(status);

  if (valor === "ativo") {
    return {
      backgroundColor: "rgba(212, 175, 55, 0.14)",
      color: "#f3d77b",
      border: "1px solid rgba(212, 175, 55, 0.32)",
    };
  }

  if (valor === "suspenso") {
    return {
      backgroundColor: "rgba(255,255,255,0.08)",
      color: "#ffffff",
      border: "1px solid rgba(255,255,255,0.14)",
    };
  }

  if (valor === "bloqueado") {
    return {
      backgroundColor: "rgba(255,255,255,0.05)",
      color: "#d1d5db",
      border: "1px solid rgba(255,255,255,0.10)",
    };
  }

  return {
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#e5e7eb",
    border: "1px solid rgba(255,255,255,0.10)",
  };
}

export default function CorretorasPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioSistema | null>(null);
  const [corretoras, setCorretoras] = useState<Corretora[]>([]);
  const [busca, setBusca] = useState("");
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [saindo, setSaindo] = useState(false);
  const [corretoraSelecionada, setCorretoraSelecionada] = useState<Corretora | null>(null);

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

  async function carregarTudo() {
    try {
      setLoading(true);
      setErro(null);
      setMensagem(null);

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
        setErro("Acesso não liberado para esta área.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("corretoras")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setErro(error.message || "Não foi possível carregar as corretoras.");
        setCorretoras([]);
      } else {
        setCorretoras((data as Corretora[]) || []);
      }
    } catch (e) {
      console.error("Erro ao carregar corretoras:", e);
      setErro("Erro inesperado ao carregar corretoras.");
      setCorretoras([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  async function atualizarStatus(
    corretoraId: string,
    novoStatus: "ativo" | "suspenso" | "bloqueado"
  ) {
    try {
      setProcessandoId(corretoraId);
      setErro(null);
      setMensagem(null);

      const confirmacao = window.confirm(
        `Deseja realmente alterar o status desta corretora para "${novoStatus}"?`
      );

      if (!confirmacao) return;

      const { error } = await supabase
        .from("corretoras")
        .update({
          status: novoStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", corretoraId);

      if (error) {
        setErro(error.message || "Não foi possível atualizar o status.");
        return;
      }

      setCorretoras((prev) =>
        prev.map((item) =>
          item.id === corretoraId
            ? {
                ...item,
                status: novoStatus,
                updated_at: new Date().toISOString(),
              }
            : item
        )
      );

      if (corretoraSelecionada?.id === corretoraId) {
        setCorretoraSelecionada((prev) =>
          prev
            ? {
                ...prev,
                status: novoStatus,
                updated_at: new Date().toISOString(),
              }
            : prev
        );
      }

      setMensagem(`Status alterado para ${novoStatus} com sucesso.`);
    } catch (e) {
      console.error("Erro ao atualizar status:", e);
      setErro("Erro inesperado ao atualizar o status.");
    } finally {
      setProcessandoId(null);
    }
  }

  async function sairDoSistema() {
    try {
      setSaindo(true);
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (e) {
      console.error("Erro ao sair do sistema:", e);
      setErro("Não foi possível sair do sistema.");
      setSaindo(false);
    }
  }

  function abrirDetalhes(corretora: Corretora) {
    setCorretoraSelecionada(corretora);
  }

  function fecharDetalhes() {
    setCorretoraSelecionada(null);
  }

  const corretorasFiltradas = useMemo(() => {
    const termo = normalizarTexto(busca);

    if (!termo) return corretoras;

    return corretoras.filter((item) => {
      const texto = [
        item.nome_fantasia,
        item.razao_social,
        item.cnpj,
        item.email,
        item.telefone,
        item.responsavel,
        item.plano,
        item.status,
        item.cidade,
        item.estado,
      ]
        .map((v) => normalizarTexto(v))
        .join(" ");

      return texto.includes(termo);
    });
  }, [busca, corretoras]);

  const totalAtivas = corretoras.filter(
    (item) => normalizarTexto(item.status) === "ativo"
  ).length;

  const totalSuspensas = corretoras.filter(
    (item) => normalizarTexto(item.status) === "suspenso"
  ).length;

  const totalBloqueadas = corretoras.filter(
    (item) => normalizarTexto(item.status) === "bloqueado"
  ).length;

  const cardBase: React.CSSProperties = {
    background:
      "linear-gradient(180deg, rgba(14,14,14,0.98) 0%, rgba(8,8,8,0.98) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
  };

  const dourado = "#d4af37";
  const douradoClaro = "#f3d77b";

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
            <div style={{ maxWidth: 820 }}>
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
                  fontSize: 52,
                  lineHeight: 1.05,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                Gestão de Corretoras
              </h1>

              <p
                style={{
                  marginTop: 16,
                  marginBottom: 0,
                  color: "rgba(255,255,255,0.72)",
                  fontSize: 19,
                  lineHeight: 1.7,
                }}
              >
                Visualize, acompanhe, filtre e controle as corretoras com ações reais
                de status, edição e consulta rápida.
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
              <button onClick={carregarTudo} style={botaoSecundario}>
                Atualizar
              </button>

              <Link href="/corretoras/nova" style={botaoPrimarioLink}>
                Nova corretora
              </Link>

              <button
                onClick={sairDoSistema}
                disabled={saindo}
                style={{
                  ...botaoSecundario,
                  opacity: saindo ? 0.7 : 1,
                  cursor: saindo ? "not-allowed" : "pointer",
                }}
              >
                {saindo ? "Saindo..." : "Sair do sistema"}
              </button>
            </div>
          </div>
        </section>

        {(erro || mensagem) && (
          <section
            style={{
              ...cardBase,
              padding: 18,
              marginBottom: 22,
              border: erro
                ? "1px solid rgba(255,255,255,0.12)"
                : "1px solid rgba(212,175,55,0.20)",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: erro ? "#ffffff" : douradoClaro,
              }}
            >
              {erro || mensagem}
            </div>
          </section>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
            marginBottom: 22,
          }}
        >
          <div style={{ ...cardBase, padding: 24 }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.62)" }}>
              Total de corretoras
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 42,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {corretoras.length}
            </div>
          </div>

          <div
            style={{
              ...cardBase,
              padding: 24,
              border: "1px solid rgba(212,175,55,0.20)",
            }}
          >
            <div style={{ fontSize: 14, color: dourado }}>Ativas</div>
            <div
              style={{
                marginTop: 14,
                fontSize: 42,
                fontWeight: 800,
                lineHeight: 1,
                color: douradoClaro,
              }}
            >
              {totalAtivas}
            </div>
          </div>

          <div style={{ ...cardBase, padding: 24 }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.62)" }}>
              Suspensas
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 42,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {totalSuspensas}
            </div>
          </div>

          <div style={{ ...cardBase, padding: 24 }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.62)" }}>
              Bloqueadas
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 42,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {totalBloqueadas}
            </div>
          </div>
        </section>

        <section
          style={{
            ...cardBase,
            padding: 24,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.62)" }}>
                Usuário logado
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {usuario?.nome || usuario?.email || "Super Master"}
              </div>
            </div>

            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar corretora, responsável, plano, status, cidade..."
              style={{
                width: "100%",
                maxWidth: 430,
                height: 50,
                borderRadius: 16,
                border: "1px solid rgba(212,175,55,0.16)",
                background: "#060606",
                color: "#ffffff",
                padding: "0 16px",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
        </section>

        {loading ? (
          <section
            style={{
              ...cardBase,
              padding: 40,
              textAlign: "center",
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
              Carregando corretoras...
            </h3>
            <p style={{ marginTop: 12, color: "rgba(255,255,255,0.62)" }}>
              Estamos organizando os dados para você.
            </p>
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
        ) : corretorasFiltradas.length === 0 ? (
          <section
            style={{
              ...cardBase,
              padding: 40,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                margin: "0 auto 16px",
                borderRadius: "50%",
                background: "#060606",
                border: "1px solid rgba(212,175,55,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: dourado,
                fontSize: 26,
              }}
            >
              ★
            </div>

            <h3 style={{ fontSize: 30, margin: 0, fontWeight: 800 }}>
              Nenhuma corretora encontrada
            </h3>

            <p
              style={{
                marginTop: 12,
                color: "rgba(255,255,255,0.62)",
                fontSize: 16,
              }}
            >
              Cadastre uma nova corretora para iniciar esta área.
            </p>

            <div style={{ marginTop: 24 }}>
              <Link href="/corretoras/nova" style={botaoPrimarioLink}>
                Cadastrar corretora
              </Link>
            </div>
          </section>
        ) : (
          <section
            style={{
              ...cardBase,
              overflow: "hidden",
              padding: 0,
            }}
          >
            <div
              style={{
                padding: "22px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                Lista de corretoras
              </h3>
              <p
                style={{
                  marginTop: 8,
                  marginBottom: 0,
                  color: "rgba(255,255,255,0.58)",
                  fontSize: 14,
                }}
              >
                Botões de ação funcionando direto na listagem.
              </p>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 1420,
                }}
              >
                <thead style={{ background: "#080808" }}>
                  <tr>
                    <th style={thStyle}>Corretora</th>
                    <th style={thStyle}>Responsável</th>
                    <th style={thStyle}>Contato</th>
                    <th style={thStyle}>Plano</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Cadastro</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {corretorasFiltradas.map((item) => {
                    const statusStyle = obterStatusStyle(item.status);
                    const processando = processandoId === item.id;
                    const statusAtual = normalizarTexto(item.status);

                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <td style={tdStyle}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 15,
                              color: "#ffffff",
                            }}
                          >
                            {item.nome_fantasia || item.razao_social || "Sem nome"}
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 13,
                              color: "rgba(255,255,255,0.44)",
                            }}
                          >
                            {item.razao_social || "-"}
                          </div>
                        </td>

                        <td style={tdStyle}>{item.responsavel || "-"}</td>

                        <td style={tdStyle}>
                          <div>{item.email || "-"}</div>
                          <div
                            style={{
                              marginTop: 6,
                              color: "rgba(255,255,255,0.44)",
                              fontSize: 13,
                            }}
                          >
                            {formatarTelefone(item.telefone)}
                          </div>
                        </td>

                        <td style={tdStyle}>{item.plano || "-"}</td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              ...statusStyle,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "7px 12px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 800,
                              textTransform: "capitalize",
                            }}
                          >
                            {item.status || "sem status"}
                          </span>
                        </td>

                        <td style={tdStyle}>{formatarData(item.created_at)}</td>

                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              onClick={() => abrirDetalhes(item)}
                              style={botaoLinhaEscuro}
                              disabled={processando}
                            >
                              Ver
                            </button>

                            <Link
                              href={`/corretoras/${item.id}/editar`}
                              style={botaoLinhaDouradoLink}
                            >
                              Editar
                            </Link>

                            {statusAtual !== "ativo" && (
                              <button
                                onClick={() => atualizarStatus(item.id, "ativo")}
                                style={botaoLinhaDourado}
                                disabled={processando}
                              >
                                Reativar
                              </button>
                            )}

                            {statusAtual !== "suspenso" && (
                              <button
                                onClick={() => atualizarStatus(item.id, "suspenso")}
                                style={botaoLinhaEscuro}
                                disabled={processando}
                              >
                                Suspender
                              </button>
                            )}

                            {statusAtual !== "bloqueado" && (
                              <button
                                onClick={() => atualizarStatus(item.id, "bloqueado")}
                                style={botaoLinhaEscuro}
                                disabled={processando}
                              >
                                Bloquear
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {corretoraSelecionada && (
        <div
          onClick={fecharDetalhes}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 920,
              maxHeight: "90vh",
              overflowY: "auto",
              background:
                "linear-gradient(180deg, rgba(14,14,14,0.99) 0%, rgba(8,8,8,0.99) 100%)",
              border: "1px solid rgba(212,175,55,0.20)",
              borderRadius: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
              padding: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 22,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: dourado,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    marginBottom: 10,
                  }}
                >
                  Detalhes da corretora
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 34,
                    fontWeight: 800,
                  }}
                >
                  {corretoraSelecionada.nome_fantasia ||
                    corretoraSelecionada.razao_social ||
                    "Sem nome"}
                </h2>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Link
                  href={`/corretoras/${corretoraSelecionada.id}/editar`}
                  style={botaoPrimarioLink}
                >
                  Editar
                </Link>

                <button onClick={fecharDetalhes} style={botaoSecundario}>
                  Fechar
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 18,
              }}
            >
              <div style={blocoModal}>
                <div style={labelModal}>Razão social</div>
                <div style={valorModal}>{corretoraSelecionada.razao_social || "-"}</div>
              </div>

              <div style={blocoModal}>
                <div style={labelModal}>CNPJ</div>
                <div style={valorModal}>{formatarCNPJ(corretoraSelecionada.cnpj)}</div>
              </div>

              <div style={blocoModal}>
                <div style={labelModal}>Responsável</div>
                <div style={valorModal}>{corretoraSelecionada.responsavel || "-"}</div>
              </div>

              <div style={blocoModal}>
                <div style={labelModal}>Plano</div>
                <div style={valorModal}>{corretoraSelecionada.plano || "-"}</div>
              </div>

              <div style={blocoModal}>
                <div style={labelModal}>Status</div>
                <div style={valorModal}>{corretoraSelecionada.status || "-"}</div>
              </div>

              <div style={blocoModal}>
                <div style={labelModal}>Cadastro</div>
                <div style={valorModal}>{formatarData(corretoraSelecionada.created_at)}</div>
              </div>

              <div style={blocoModal}>
                <div style={labelModal}>E-mail</div>
                <div style={valorModal}>{corretoraSelecionada.email || "-"}</div>
              </div>

              <div style={blocoModal}>
                <div style={labelModal}>Telefone</div>
                <div style={valorModal}>
                  {formatarTelefone(corretoraSelecionada.telefone)}
                </div>
              </div>

              <div style={{ ...blocoModal, gridColumn: "1 / -1" }}>
                <div style={labelModal}>Endereço</div>
                <div style={valorModal}>
                  {[
                    corretoraSelecionada.endereco,
                    corretoraSelecionada.numero,
                    corretoraSelecionada.complemento,
                    corretoraSelecionada.bairro,
                    corretoraSelecionada.cidade,
                    corretoraSelecionada.estado,
                    formatarCEP(corretoraSelecionada.cep),
                  ]
                    .filter(Boolean)
                    .join(" - ") || "-"}
                </div>
              </div>

              <div style={{ ...blocoModal, gridColumn: "1 / -1" }}>
                <div style={labelModal}>Observações</div>
                <div style={valorModal}>
                  {corretoraSelecionada.observacoes || "-"}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 24,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {normalizarTexto(corretoraSelecionada.status) !== "ativo" && (
                <button
                  onClick={() => atualizarStatus(corretoraSelecionada.id, "ativo")}
                  style={botaoPrimario}
                  disabled={processandoId === corretoraSelecionada.id}
                >
                  Reativar
                </button>
              )}

              {normalizarTexto(corretoraSelecionada.status) !== "suspenso" && (
                <button
                  onClick={() => atualizarStatus(corretoraSelecionada.id, "suspenso")}
                  style={botaoSecundario}
                  disabled={processandoId === corretoraSelecionada.id}
                >
                  Suspender
                </button>
              )}

              {normalizarTexto(corretoraSelecionada.status) !== "bloqueado" && (
                <button
                  onClick={() => atualizarStatus(corretoraSelecionada.id, "bloqueado")}
                  style={botaoSecundario}
                  disabled={processandoId === corretoraSelecionada.id}
                >
                  Bloquear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

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

const botaoPrimarioLink: React.CSSProperties = {
  height: 46,
  padding: "0 18px",
  borderRadius: 14,
  border: "1px solid rgba(212,175,55,0.42)",
  background: "#d4af37",
  color: "#050505",
  fontWeight: 800,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const botaoLinhaEscuro: React.CSSProperties = {
  height: 36,
  padding: "0 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#121212",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

const botaoLinhaDourado: React.CSSProperties = {
  height: 36,
  padding: "0 12px",
  borderRadius: 12,
  border: "1px solid rgba(212,175,55,0.28)",
  background: "rgba(212,175,55,0.12)",
  color: "#f3d77b",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

const botaoLinhaDouradoLink: React.CSSProperties = {
  height: 36,
  padding: "0 12px",
  borderRadius: 12,
  border: "1px solid rgba(212,175,55,0.28)",
  background: "rgba(212,175,55,0.12)",
  color: "#f3d77b",
  fontWeight: 700,
  fontSize: 13,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const thStyle: React.CSSProperties = {
  padding: "16px 20px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.44)",
};

const tdStyle: React.CSSProperties = {
  padding: "18px 20px",
  fontSize: 14,
  color: "rgba(255,255,255,0.82)",
  verticalAlign: "middle",
};

const blocoModal: React.CSSProperties = {
  background: "#090909",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 16,
};

const labelModal: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.42)",
  marginBottom: 10,
};

const valorModal: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.6,
  color: "#ffffff",
};