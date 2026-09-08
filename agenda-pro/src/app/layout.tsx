import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export const viewport: Viewport = {
  themeColor: "#f43f5e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ZanettIA Agenda Pro | Gestão de Agendamentos & Caixa para Manicures",
  description: "Sistema inteligente de agendamentos, frente de caixa, clientes e anamnese digital.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 md:pb-0">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
