export type SegmaxRole =
  | "master"
  | "master_corretora"
  | "financeiro"
  | "tecnico"
  | "corretor"
  | "vendedor"
  | "usuario"

export type SegmaxModulo =
  | "master"
  | "corretora"
  | "financeiro"
  | "analise-tecnica"
  | "corretoras"
  | "usuarios"
  | "clientes"
  | "cotacoes"
  | "seguradoras"
  | "simulacoes"

export type SegmaxAcao = "ver" | "criar" | "editar" | "excluir"

type PermissaoModulo = {
  [K in SegmaxModulo]?: SegmaxAcao[]
}

const permissoesPorRole: Record<SegmaxRole, PermissaoModulo> = {
  master: {
    master: ["ver", "criar", "editar", "excluir"],
    corretora: ["ver", "criar", "editar", "excluir"],
    financeiro: ["ver", "criar", "editar", "excluir"],
    "analise-tecnica": ["ver", "criar", "editar", "excluir"],
    corretoras: ["ver", "criar", "editar", "excluir"],
    usuarios: ["ver", "criar", "editar", "excluir"],
    clientes: ["ver", "criar", "editar", "excluir"],
    cotacoes: ["ver", "criar", "editar", "excluir"],
    seguradoras: ["ver", "criar", "editar", "excluir"],
    simulacoes: ["ver", "criar", "editar", "excluir"],
  },

  master_corretora: {
    corretora: ["ver", "criar", "editar"],
    usuarios: ["ver", "criar", "editar"],
    clientes: ["ver", "criar", "editar"],
    cotacoes: ["ver", "criar", "editar"],
    seguradoras: ["ver"],
  },

  tecnico: {
    "analise-tecnica": ["ver", "criar", "editar"],
    clientes: ["ver", "criar", "editar"],
    corretoras: ["ver"],
    usuarios: ["ver"],
    cotacoes: ["ver", "editar"],
    seguradoras: ["ver", "criar", "editar"],
  },

  financeiro: {
    financeiro: ["ver", "criar", "editar"],
    corretoras: ["ver", "criar", "editar"],
    usuarios: ["ver", "criar", "editar"],
    seguradoras: ["ver", "criar", "editar"],
  },

  corretor: {
    clientes: ["ver", "criar", "editar"],
    cotacoes: ["ver", "criar", "editar"],
  },

  vendedor: {
    clientes: ["ver", "criar", "editar"],
    cotacoes: ["ver", "criar", "editar"],
  },

  usuario: {
    clientes: ["ver"],
    cotacoes: ["ver"],
  },
}

export function normalizarRole(valor?: string | null): SegmaxRole {
  const v = (valor || "").toLowerCase().trim()

  if (v.includes("master_corretora")) return "master_corretora"
  if (v.includes("master")) return "master"
  if (v.includes("finance")) return "financeiro"
  if (v.includes("tecn")) return "tecnico"
  if (v.includes("corretor")) return "corretor"
  if (v.includes("vendedor")) return "vendedor"

  return "usuario"
}

export function podeAcessarModulo(
  role: SegmaxRole,
  modulo: SegmaxModulo
): boolean {
  return Boolean(permissoesPorRole[role]?.[modulo]?.includes("ver"))
}

export function podeExecutarAcao(
  role: SegmaxRole,
  modulo: SegmaxModulo,
  acao: SegmaxAcao
): boolean {
  return Boolean(permissoesPorRole[role]?.[modulo]?.includes(acao))
}

export function podeExcluir(
  role: SegmaxRole,
  modulo: SegmaxModulo
): boolean {
  if (role === "master") return true
  return false
}

export function rotaParaModulo(pathname: string): SegmaxModulo | null {
  if (pathname.startsWith("/dashboard/master")) return "master"
  if (pathname.startsWith("/dashboard/corretora")) return "corretora"
  if (pathname.startsWith("/financeiro")) return "financeiro"
  if (pathname.startsWith("/analise-tecnica")) return "analise-tecnica"
  if (pathname.startsWith("/corretoras")) return "corretoras"
  if (pathname.startsWith("/usuarios")) return "usuarios"
  if (pathname.startsWith("/clientes")) return "clientes"
  if (pathname.startsWith("/cotacoes")) return "cotacoes"
  if (pathname.startsWith("/seguradoras")) return "seguradoras"
  if (pathname.startsWith("/simulacoes")) return "simulacoes"

  return null
}