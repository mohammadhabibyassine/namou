import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Anton, Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { serverEnvironment } from "@/config/env.server";
import { LazyChatWidget } from "@/components/chat/lazy-chat-widget";
import { getSession } from "@/lib/auth/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(serverEnvironment.SITE_URL),
  title: {
    default: "Namou — Move Different",
    template: "%s — Namou",
  },
  description: "Technical fashion and modular objects for everyday movement.",
  applicationName: "Namou",
  keywords: ["technical fashion", "modular carry", "streetwear", "Namou"],
  openGraph: {
    type: "website",
    siteName: "Namou",
    title: "Namou — Move Different",
    description: "Technical fashion and modular objects for everyday movement.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Namou — Move Different",
    description: "Technical fashion and modular objects for everyday movement.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const initialUser = await getSession();
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppProviders initialUser={initialUser}>
          {children}
          <LazyChatWidget />
        </AppProviders>
      </body>
    </html>
  );
}
