import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getUserAccess } from "@/lib/get-user-access";

export default async function FinanceiroLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await getUserAccess();

  if (!access) {
    redirect("/login");
  }

  if (!access.can("dashboard.financeiro")) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}