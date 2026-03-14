import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEGMAX CRM",
  description: "Gestão profissional para corretoras de seguros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#06070a] text-white antialiased">{children}</body>
    </html>
  );
}