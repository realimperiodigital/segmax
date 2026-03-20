import { getUserAccess } from "@/lib/get-user-access";
import { redirect } from "next/navigation";

export default async function CorretoraPage() {
  const access = await getUserAccess();

  if (!access) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <h1 className="text-3xl font-bold">Dashboard da Corretora</h1>

      <div className="mt-4 space-y-2 text-zinc-300">
        <p>Perfil atual: {access.role}</p>
        <p>Corretora ID: {access.corretora_id ?? "não vinculado"}</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {access.can("usuarios.create.local") && (
          <button className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-black">
            Novo Usuário da Corretora
          </button>
        )}

        {access.can("clientes.create") && (
          <button className="rounded-lg bg-white px-4 py-2 font-semibold text-black">
            Novo Cliente
          </button>
        )}
      </div>
    </main>
  );
}