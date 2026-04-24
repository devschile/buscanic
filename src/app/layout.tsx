import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlex = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "BUSCA NIC",
  description: "Consulta la disponibilidad de dominios .CL en tiempo real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={ibmPlex.variable}>{children}</body>
    </html>
  );
}