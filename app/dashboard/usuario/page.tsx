import { redirect } from "next/navigation";
import { getUserAccess } from "@/lib/get-user-access";

export default async function UsuarioPage() {
  const access = await getUserAccess();

  if (!access) {
    redirect("/login");
  }

  redirect("/dashboard");
}