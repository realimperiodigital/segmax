"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  children: ReactNode;
};

export default function UsuariosLayout({ children }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validarAcesso() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      if (profile.status !== "ativo") {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      const role = profile.role;

      const rolesPermitidos = [
        "super_master",
        "master_tecnico",
        "master_financeiro",
      ];

      if (!rolesPermitidos.includes(role)) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      setLoading(false);
    }

    validarAcesso();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Validando acesso aos usuários...
      </main>
    );
  }

  return <>{children}</>;
}