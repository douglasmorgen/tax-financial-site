import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://finance.dougmorgen.com"),
  title: {
    default: "Financial and Tax Planning | Doug Morgen",
    template: "%s | Doug Morgen",
  },
  description: "Tax, financial, and investment planning for technology professionals and startups.",
  openGraph: {
    title: "Financial and Tax Planning | Doug Morgen",
    description: "Tax, financial, and investment planning for technology professionals and startups.",
    type: "website",
  },
} satisfies Metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey =
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Missing Clerk publishable key");
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/portal/login">
          <Header />
          <main>{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
