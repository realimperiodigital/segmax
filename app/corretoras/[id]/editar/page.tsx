"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

type PlanoCorretora = "Prime" | "Elite" | "Executive" | "Full";
type StatusCorretora = "ativo" | "suspenso" | "bloqueado";

type Corretora = {
  id: string;
  nome_fantasia: string | null;
  razao_social: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  responsavel: string | null;
  plano: string | null;
  status: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  observacoes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type FormState = {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  telefone: string;
  responsavel: string;
  plano: PlanoCorretora;
  status: StatusCorretora;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  observacoes: string;
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

function formatarCNPJ(valor: string) {
  const numeros = somenteNumeros(valor).slice(0, 14);

  return numeros
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatarTelefone(valor: string) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  if (numeros.length <= 10) {
    return numeros
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return numeros
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function formatarCEP(valor: string) {
  const numeros = somenteNumeros(valor).slice(0, 8);
  return numeros.replace(/^(\d{5})(\d)/, "$1-$2");
}

export default function EditarCorretoraPage() {
  const router = useRouter();
  const params = useParams();

  const corretoraId = String(params?.id ?? "");

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioSistema | null>(null);

  const [form, setForm] = useState<FormState>({
    nomeFantasia: "",
    razaoSocial: "",
    cnpj: "",
    email: "",
    telefone: "",
    responsavel: "",
    plano: "Prime",
    status: "ativo",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    observacoes: "",
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

  async function carregarCorretora() {
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
        setErro("Acesso não liberado para editar corretoras.");
        setLoading(false);
        return;
      }

      if (!corretoraId) {
        setErro("ID da corretora não encontrado.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("corretoras")
        .select("*")
        .eq("id", corretoraId)
        .maybeSingle();

      if (error || !data) {
        setErro("Não foi possível localizar esta corretora.");
        setLoading(false);
        return;
      }

      const corretora = data as Corretora;

      setForm({
        nomeFantasia: corretora.nome_fantasia || "",
        razaoSocial: corretora.razao_social || "",
        cnpj: formatarCNPJ(corretora.cnpj || ""),
        email: corretora.email || "",
        telefone: formatarTelefone(corretora.telefone || ""),
        responsavel: corretora.responsavel || "",
        plano: (corretora.plano as PlanoCorretora) || "Prime",
        status: (corretora.status as StatusCorretora) || "ativo",
        cep: formatarCEP(corretora.cep || ""),
        endereco: corretora.endereco || "",
        numero: corretora.numero || "",
        complemento: corretora.complemento || "",
        bairro: corretora.bairro || "",
        cidade: corretora.cidade || "",
        estado: corretora.estado || "",
        observacoes: corretora.observacoes || "",
      });
    } catch (e) {
      console.error("Erro ao carregar corretora:", e);
      setErro("Erro inesperado ao carregar a corretora.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarCorretora();
  }, [corretoraId]);

  function atualizarCampo<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function buscarEnderecoPorCEP() {
    const cepLimpo = somenteNumeros(form.cep);

    if (cepLimpo.length !== 8) return;

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await resposta.json();

      if (data?.erro) return;

      setForm((prev) => ({
        ...prev,
        endereco: data.logradouro || prev.endereco,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
      }));
    } catch (e) {
      console.error("Erro ao buscar CEP:", e);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setSalvando(true);
      setErro(null);
      setSucesso(null);

      if (!form.nomeFantasia.trim()) {
        setErro("Informe o nome fantasia.");
        return;
      }

      if (!form.razaoSocial.trim()) {
        setErro("Informe a razão social.");
        return;
      }

      if (!form.email.trim()) {
        setErro("Informe o e-mail da corretora.");
        return;
      }

      if (!form.responsavel.trim()) {
        setErro("Informe o responsável.");
        return;
      }

      const payload = {
        nome_fantasia: form.nomeFantasia.trim(),
        razao_social: form.razaoSocial.trim(),
        cnpj: somenteNumeros(form.cnpj) || null,
        email: form.email.trim().toLowerCase(),
        telefone: somenteNumeros(form.telefone) || null,
        responsavel: form.responsavel.trim(),
        plano: form.plano,
        status: form.status,
        cep: somenteNumeros(form.cep) || null,
        endereco: form.endereco.trim() || null,
        numero: form.numero.trim() || null,
        complemento: form.complemento.trim() || null,
        bairro: form.bairro.trim() || null,
        cidade: form.cidade.trim() || null,
        estado: form.estado.trim() || null,
        observacoes: form.observacoes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("corretoras")
        .update(payload)
        .eq("id", corretoraId);

      if (error) {
        setErro(error.message || "Não foi possível atualizar a corretora.");
        return;
      }

      setSucesso("Corretora atualizada com sucesso.");

      setTimeout(() => {
        router.push("/corretoras");
      }, 900);
    } catch (e) {
      console.error("Erro ao atualizar corretora:", e);
      setErro("Erro inesperado ao atualizar a corretora.");
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
            Carregando corretora...
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
                onClick={() => router.push("/corretoras")}
                style={botaoPrimario}
              >
                Ir para corretoras
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
                Editar Corretora
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
                Atualize os dados da corretora com o mesmo padrão preto, branco e
                dourado do SegMax.
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
              <Link href="/corretoras" style={botaoSecundarioLink}>
                Voltar
              </Link>

              <button
                type="submit"
                form="form-editar-corretora"
                disabled={salvando}
                style={{
                  ...botaoPrimario,
                  opacity: salvando ? 0.7 : 1,
                  cursor: salvando ? "not-allowed" : "pointer",
                }}
              >
                {salvando ? "Salvando..." : "Salvar alterações"}
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

        <form id="form-editar-corretora" onSubmit={handleSubmit}>
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
                  <label style={labelStyle}>Nome fantasia</label>
                  <input
                    value={form.nomeFantasia}
                    onChange={(e) => atualizarCampo("nomeFantasia", e.target.value)}
                    style={inputStyle}
                    placeholder="Digite o nome fantasia"
                  />
                </div>

                <div style={campoFull}>
                  <label style={labelStyle}>Razão social</label>
                  <input
                    value={form.razaoSocial}
                    onChange={(e) => atualizarCampo("razaoSocial", e.target.value)}
                    style={inputStyle}
                    placeholder="Digite a razão social"
                  />
                </div>

                <div>
                  <label style={labelStyle}>CNPJ</label>
                  <input
                    value={form.cnpj}
                    onChange={(e) =>
                      atualizarCampo("cnpj", formatarCNPJ(e.target.value))
                    }
                    style={inputStyle}
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
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

                <div style={campoFull}>
                  <label style={labelStyle}>E-mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => atualizarCampo("email", e.target.value)}
                    style={inputStyle}
                    placeholder="contato@corretora.com"
                  />
                </div>

                <div style={campoFull}>
                  <label style={labelStyle}>Responsável</label>
                  <input
                    value={form.responsavel}
                    onChange={(e) => atualizarCampo("responsavel", e.target.value)}
                    style={inputStyle}
                    placeholder="Nome do responsável"
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
              <h2 style={tituloBloco}>Plano e status</h2>

              <div style={grid1}>
                <div>
                  <label style={labelStyle}>Plano</label>
                  <select
                    value={form.plano}
                    onChange={(e) =>
                      atualizarCampo("plano", e.target.value as PlanoCorretora)
                    }
                    style={inputStyle}
                  >
                    <option value="Prime">Prime</option>
                    <option value="Elite">Elite</option>
                    <option value="Executive">Executive</option>
                    <option value="Full">Full</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      atualizarCampo("status", e.target.value as StatusCorretora)
                    }
                    style={inputStyle}
                  >
                    <option value="ativo">ativo</option>
                    <option value="suspenso">suspenso</option>
                    <option value="bloqueado">bloqueado</option>
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
              ...cardBase,
              padding: 26,
              marginTop: 22,
            }}
          >
            <h2 style={tituloBloco}>Endereço</h2>

            <div style={grid3}>
              <div>
                <label style={labelStyle}>CEP</label>
                <input
                  value={form.cep}
                  onChange={(e) => atualizarCampo("cep", formatarCEP(e.target.value))}
                  onBlur={buscarEnderecoPorCEP}
                  style={inputStyle}
                  placeholder="00000-000"
                />
              </div>

              <div style={campo2}>
                <label style={labelStyle}>Endereço</label>
                <input
                  value={form.endereco}
                  onChange={(e) => atualizarCampo("endereco", e.target.value)}
                  style={inputStyle}
                  placeholder="Rua, avenida, etc."
                />
              </div>

              <div>
                <label style={labelStyle}>Número</label>
                <input
                  value={form.numero}
                  onChange={(e) => atualizarCampo("numero", e.target.value)}
                  style={inputStyle}
                  placeholder="123"
                />
              </div>

              <div>
                <label style={labelStyle}>Complemento</label>
                <input
                  value={form.complemento}
                  onChange={(e) => atualizarCampo("complemento", e.target.value)}
                  style={inputStyle}
                  placeholder="Sala, bloco, etc."
                />
              </div>

              <div>
                <label style={labelStyle}>Bairro</label>
                <input
                  value={form.bairro}
                  onChange={(e) => atualizarCampo("bairro", e.target.value)}
                  style={inputStyle}
                  placeholder="Bairro"
                />
              </div>

              <div>
                <label style={labelStyle}>Cidade</label>
                <input
                  value={form.cidade}
                  onChange={(e) => atualizarCampo("cidade", e.target.value)}
                  style={inputStyle}
                  placeholder="Cidade"
                />
              </div>

              <div>
                <label style={labelStyle}>Estado</label>
                <input
                  value={form.estado}
                  onChange={(e) => atualizarCampo("estado", e.target.value)}
                  style={inputStyle}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>
          </section>

          <section
            style={{
              ...cardBase,
              padding: 26,
              marginTop: 22,
            }}
          >
            <h2 style={tituloBloco}>Observações</h2>

            <div>
              <label style={labelStyle}>Anotações internas</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => atualizarCampo("observacoes", e.target.value)}
                style={{
                  ...inputStyle,
                  minHeight: 140,
                  paddingTop: 14,
                  resize: "vertical",
                }}
                placeholder="Digite observações importantes sobre a corretora"
              />
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
            <Link href="/corretoras" style={botaoSecundarioLink}>
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
              {salvando ? "Salvando..." : "Salvar alterações"}
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

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 2fr 1fr",
  gap: 16,
};

const campoFull: React.CSSProperties = {
  gridColumn: "1 / -1",
};

const campo2: React.CSSProperties = {
  gridColumn: "span 2",
};