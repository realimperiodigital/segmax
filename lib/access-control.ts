export type UserRole =
  | "master"
  | "financeiro"
  | "tecnico"
  | "corretora_geral"
  | "corretora_financeiro"
  | "corretora_gerente"
  | "corretora_supervisor"
  | "corretora_tecnico"
  | "corretora_corretor";

export type Permission =
  | "dashboard.master"
  | "dashboard.financeiro"
  | "dashboard.tecnico"
  | "dashboard.corretora"
  | "corretoras.create"
  | "usuarios.create.global"
  | "usuarios.create.local"
  | "usuarios.edit.global"
  | "usuarios.edit.local"
  | "clientes.create"
  | "clientes.view.all"
  | "clientes.view.own";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  master: [
    "dashboard.master",
    "dashboard.financeiro",
    "dashboard.tecnico",
    "dashboard.corretora",
    "corretoras.create",
    "usuarios.create.global",
    "usuarios.edit.global",
    "clientes.view.all",
  ],

  tecnico: [
    "dashboard.tecnico",
    "corretoras.create",
    "usuarios.create.global",
    "usuarios.edit.global",
    "clientes.view.all",
  ],

  financeiro: [
    "dashboard.financeiro",
    "corretoras.create",
    "usuarios.create.global",
    "usuarios.edit.global",
    "clientes.view.all",
  ],

  corretora_geral: [
    "dashboard.corretora",
    "usuarios.create.local",
    "usuarios.edit.local",
    "clientes.create",
    "clientes.view.all",
  ],

  corretora_financeiro: [
    "dashboard.corretora",
    "clientes.view.all",
  ],

  corretora_gerente: [
    "dashboard.corretora",
    "usuarios.create.local",
    "usuarios.edit.local",
    "clientes.create",
    "clientes.view.all",
  ],

  corretora_supervisor: [
    "dashboard.corretora",
    "clientes.view.all",
  ],

  corretora_tecnico: [
    "dashboard.corretora",
    "clientes.create",
    "clientes.view.own",
  ],

  corretora_corretor: [
    "dashboard.corretora",
    "clientes.create",
    "clientes.view.own",
  ],
};

export function hasPermission(
  role: UserRole | null,
  permission: Permission
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}