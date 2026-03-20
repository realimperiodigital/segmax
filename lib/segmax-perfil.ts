export type SegmaxRole =
  | "master"
  | "master_corretora"
  | "tecnico"
  | "financeiro"
  | "corretor"
  | "vendedor"
  | "usuario"

export function normalizarSegmaxRole(valor?: string | null): SegmaxRole {
  const v = (valor || "").toLowerCase().trim()

  if (v.includes("master_corretora")) return "master_corretora"
  if (v.includes("master")) return "master"
  if (v.includes("tecn")) return "tecnico"
  if (v.includes("finance")) return "financeiro"
  if (v.includes("corretor")) return "corretor"
  if (v.includes("vendedor")) return "vendedor"

  return "usuario"
}

export function getRedirectByRole(role: SegmaxRole) {
  if (role === "master") return "/dashboard/master"
  if (role === "master_corretora") return "/dashboard/corretora"
  if (role === "tecnico") return "/analise-tecnica"
  if (role === "financeiro") return "/financeiro"
  return "/clientes"
}