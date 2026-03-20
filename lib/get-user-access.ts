import { createClient } from "@/lib/supabase/server";
import {
  hasPermission,
  type Permission,
  type UserRole,
} from "@/lib/access-control";

export type UserAccess = {
  userId: string;
  role: UserRole;
  corretora_id: string | null;
  can: (permission: Permission) => boolean;
};

export async function getUserAccess(): Promise<UserAccess | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("usuarios")
    .select("role, corretora_id")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data?.role) {
    return null;
  }

  const role = data.role as UserRole;
  const corretora_id = data.corretora_id ?? null;

  return {
    userId: user.id,
    role,
    corretora_id,
    can: (permission: Permission) => hasPermission(role, permission),
  };
}