import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function TecnicoLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.role) {
    redirect("/dashboard")
  }

  const role = String(profile.role).trim().toLowerCase()

  if (role !== "master" && role !== "diretora_tecnica") {
    redirect("/dashboard")
  }

  return <>{children}</>
}