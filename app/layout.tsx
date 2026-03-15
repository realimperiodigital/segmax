import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SegMax CRM",
  description: "CRM premium para corretoras de seguros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#050505] text-white antialiased">
        {children}
      </body>
    </html>
  );
}