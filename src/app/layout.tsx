import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlex = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://buscanic.devschile.cl"),
  title: ".BuscaNic {}",
  description: "Consulta la disponibilidad de dominios .CL en tiempo real",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: ".BuscaNic {}",
    description: "Consulta la disponibilidad de dominios .CL en tiempo real",
    type: "website",
    locale: "es_CL",
    siteName: "BuscaNic",
    images: [
      {
        url: "/social.jpg",
        width: 1200,
        height: 630,
        alt: "BuscaNic",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ".BuscaNic {}",
    description: "Consulta la disponibilidad de dominios .CL en tiempo real",
  },
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